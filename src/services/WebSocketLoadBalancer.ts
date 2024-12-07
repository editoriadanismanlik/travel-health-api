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

export interface LoadBalancerStats {
  activeConnections: number;
  rateLimitedConnections: number;
  lastResetTime: Date;
}

export class WebSocketLoadBalancer {
  private static instance: WebSocketLoadBalancer;
  private io: Server;
  private redisClient!: ReturnType<typeof createClient>;
  private pubClient!: ReturnType<typeof createClient>;
  private subClient!: ReturnType<typeof createClient>;
  private rateLimiter!: RateLimiterRedis;
  private readonly config: LoadBalancerConfig;
  private stats: LoadBalancerStats;

  private constructor(io: Server, config: LoadBalancerConfig) {
    this.io = io;
    this.config = config;
    this.stats = {
      activeConnections: 0,
      rateLimitedConnections: 0,
      lastResetTime: new Date()
    };
    this.initialize().catch(error => {
      logger.error('Failed to initialize WebSocket Load Balancer:', error);
      throw error;
    });
  }

  public static getInstance(io?: Server, config?: LoadBalancerConfig): WebSocketLoadBalancer {
    if (!WebSocketLoadBalancer.instance && io && config) {
      WebSocketLoadBalancer.instance = new WebSocketLoadBalancer(io, config);
    }
    return WebSocketLoadBalancer.instance;
  }

  private async initialize() {
    try {
      // Initialize Redis clients
      this.redisClient = createClient({ url: this.config.redisUrl });
      this.pubClient = this.redisClient.duplicate();
      this.subClient = this.redisClient.duplicate();

      // Connect Redis clients
      await Promise.all([
        this.redisClient.connect(),
        this.pubClient.connect(),
        this.subClient.connect()
      ]);

      // Initialize rate limiter
      this.rateLimiter = new RateLimiterRedis({
        storeClient: this.redisClient,
        points: this.config.maxRequestsPerWindow,
        duration: this.config.windowMs / 1000,
        blockDuration: 60 * 2 // Block for 2 minutes
      });

      // Set up Redis adapter
      this.io.adapter(createAdapter(this.pubClient, this.subClient));

      // Set up connection handling
      this.io.on('connection', this.handleConnection.bind(this));

      logger.info('WebSocket Load Balancer initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize WebSocket Load Balancer:', error);
      throw error;
    }
  }

  private async handleConnection(socket: any) {
    try {
      // Check rate limit
      await this.rateLimiter.consume(socket.handshake.address);
      
      // Update stats
      this.stats.activeConnections++;
      
      socket.on('disconnect', () => {
        this.stats.activeConnections--;
      });

      logger.info(`New WebSocket connection: ${socket.id}`);
    } catch (error) {
      this.stats.rateLimitedConnections++;
      socket.disconnect(true);
      logger.warn(`Rate limited connection from ${socket.handshake.address}`);
    }
  }

  public getStats(): LoadBalancerStats {
    return { ...this.stats };
  }

  public async close() {
    try {
      await Promise.all([
        this.redisClient.quit(),
        this.pubClient.quit(),
        this.subClient.quit()
      ]);
      logger.info('WebSocket Load Balancer closed successfully');
    } catch (error) {
      logger.error('Error closing WebSocket Load Balancer:', error);
      throw error;
    }
  }
}
