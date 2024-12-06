import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { RateLimiterRedis } from 'rate-limiter-flexible';
import logger from '../utils/logger';

interface LoadBalancerConfig {
  redisUrl: string;
  maxConnectionsPerClient: number;
  windowMs: number;
  maxRequestsPerWindow: number;
}

export class WebSocketLoadBalancer {
  private static instance: WebSocketLoadBalancer;
  private io: Server;
  private redisClient: any;
  private rateLimiter: RateLimiterRedis;
  private readonly config: LoadBalancerConfig;

  private constructor(io: Server, config: LoadBalancerConfig) {
    this.io = io;
    this.config = config;
    this.initialize();
  }

  public static getInstance(io?: Server, config?: LoadBalancerConfig): WebSocketLoadBalancer {
    if (!WebSocketLoadBalancer.instance && io && config) {
      WebSocketLoadBalancer.instance = new WebSocketLoadBalancer(io, config);
    }
    return WebSocketLoadBalancer.instance;
  }

  private async initialize() {
    try {
      // Initialize Redis client
      this.redisClient = createClient({
        url: this.config.redisUrl
      });

      await this.redisClient.connect();

      // Initialize Redis adapter for Socket.IO
      const pubClient = this.redisClient.duplicate();
      const subClient = this.redisClient.duplicate();

      await Promise.all([pubClient.connect(), subClient.connect()]);

      this.io.adapter(createAdapter(pubClient, subClient));

      // Initialize rate limiter
      this.rateLimiter = new RateLimiterRedis({
        storeClient: this.redisClient,
        keyPrefix: 'wslimit',
        points: this.config.maxRequestsPerWindow,
        duration: this.config.windowMs / 1000, // convert ms to seconds
      });

      // Set up connection handling
      this.setupConnectionHandling();

      logger.info('WebSocket Load Balancer initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize WebSocket Load Balancer:', error);
      throw error;
    }
  }

  private setupConnectionHandling() {
    this.io.use(async (socket, next) => {
      try {
        const clientId = socket.handshake.auth.clientId || socket.id;

        // Check connection limit per client
        const clientConnections = await this.getClientConnections(clientId);
        if (clientConnections >= this.config.maxConnectionsPerClient) {
          logger.warn(`Client ${clientId} exceeded maximum connections`);
          return next(new Error('Maximum connections exceeded'));
        }

        // Apply rate limiting
        try {
          await this.rateLimiter.consume(clientId);
        } catch (error) {
          logger.warn(`Rate limit exceeded for client ${clientId}`);
          return next(new Error('Rate limit exceeded'));
        }

        // Track the new connection
        await this.trackConnection(clientId);

        next();
      } catch (error) {
        logger.error('Error in connection middleware:', error);
        next(new Error('Internal server error'));
      }
    });

    // Handle disconnections
    this.io.on('connection', (socket) => {
      socket.on('disconnect', async () => {
        const clientId = socket.handshake.auth.clientId || socket.id;
        await this.removeConnection(clientId);
      });
    });
  }

  private async getClientConnections(clientId: string): Promise<number> {
    const connections = await this.redisClient.get(`connections:${clientId}`);
    return parseInt(connections) || 0;
  }

  private async trackConnection(clientId: string): Promise<void> {
    await this.redisClient.incr(`connections:${clientId}`);
    await this.redisClient.expire(`connections:${clientId}`, 3600); // 1 hour TTL
  }

  private async removeConnection(clientId: string): Promise<void> {
    const connections = await this.getClientConnections(clientId);
    if (connections > 0) {
      await this.redisClient.decr(`connections:${clientId}`);
    }
  }

  public async getStats() {
    const stats = {
      totalConnections: this.io.engine.clientsCount,
      uniqueClients: 0,
      rateLimit: {
        remaining: 0,
        reset: 0
      }
    };

    try {
      // Get unique clients count
      const keys = await this.redisClient.keys('connections:*');
      stats.uniqueClients = keys.length;

      // Get rate limit info
      const rateLimitInfo = await this.rateLimiter.get('global');
      if (rateLimitInfo) {
        stats.rateLimit = {
          remaining: this.config.maxRequestsPerWindow - rateLimitInfo.consumedPoints,
          reset: new Date(Date.now() + rateLimitInfo.msBeforeNext)
        };
      }
    } catch (error) {
      logger.error('Error getting WebSocket stats:', error);
    }

    return stats;
  }

  public async cleanup() {
    try {
      await this.redisClient.quit();
      logger.info('WebSocket Load Balancer cleaned up successfully');
    } catch (error) {
      logger.error('Error cleaning up WebSocket Load Balancer:', error);
    }
  }
}
