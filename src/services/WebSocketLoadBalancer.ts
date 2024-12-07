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

interface LoadBalancerStats {
  activeConnections: number;
  rateLimitedConnections: number;
  lastResetTime: Date;
}

export class WebSocketLoadBalancer {
  private static instance: WebSocketLoadBalancer;
  private io: Server;
  private redisClient: any;
  private rateLimiter: RateLimiterRedis;
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
        points: this.config.maxRequestsPerWindow,
        duration: this.config.windowMs / 1000, // convert ms to seconds
        blockDuration: 60 * 15 // Block for 15 minutes
      });

      logger.info('WebSocket Load Balancer initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize WebSocket Load Balancer:', error);
      throw error;
    }
  }

  public async getStats(): Promise<LoadBalancerStats> {
    return this.stats;
  }

  public updateStats(type: 'connect' | 'disconnect' | 'rateLimit'): void {
    switch (type) {
      case 'connect':
        this.stats.activeConnections++;
        break;
      case 'disconnect':
        this.stats.activeConnections = Math.max(0, this.stats.activeConnections - 1);
        break;
      case 'rateLimit':
        this.stats.rateLimitedConnections++;
        break;
    }
  }

  public resetStats(): void {
    this.stats = {
      activeConnections: 0,
      rateLimitedConnections: 0,
      lastResetTime: new Date()
    };
  }
}
