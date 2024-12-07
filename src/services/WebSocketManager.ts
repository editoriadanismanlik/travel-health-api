import { Server } from 'socket.io';
import { WebSocketLoadBalancer, LoadBalancerStats } from './WebSocketLoadBalancer';
import logger from '../utils/logger';
import { config } from '../config/config';

export class WebSocketManager {
  private static instance: WebSocketManager;
  private io: Server;
  private loadBalancer: WebSocketLoadBalancer;

  private constructor(server: any) {
    this.io = new Server(server, {
      cors: {
        origin: config.cors.origin,
        methods: ['GET', 'POST'],
        credentials: true
      },
      pingTimeout: 60000,
      pingInterval: 25000
    });

    // Initialize load balancer
    this.loadBalancer = WebSocketLoadBalancer.getInstance(this.io, {
      redisUrl: config.redis.url,
      maxConnectionsPerClient: config.websocket.maxConnectionsPerClient,
      windowMs: config.websocket.rateLimitWindowMs,
      maxRequestsPerWindow: config.websocket.maxRequestsPerWindow
    });

    this.setupEventHandlers();
  }

  public static getInstance(server?: any): WebSocketManager {
    if (!WebSocketManager.instance && server) {
      WebSocketManager.instance = new WebSocketManager(server);
    }
    return WebSocketManager.instance;
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      logger.info(`Client connected: ${socket.id}`);

      // Handle job updates
      socket.on('joinJob', (jobId: string) => {
        socket.join(`job:${jobId}`);
        logger.info(`Client ${socket.id} joined job room: ${jobId}`);
      });

      socket.on('leaveJob', (jobId: string) => {
        socket.leave(`job:${jobId}`);
        logger.info(`Client ${socket.id} left job room: ${jobId}`);
      });

      // Handle task updates
      socket.on('joinTask', (taskId: string) => {
        socket.join(`task:${taskId}`);
        logger.info(`Client ${socket.id} joined task room: ${taskId}`);
      });

      socket.on('leaveTask', (taskId: string) => {
        socket.leave(`task:${taskId}`);
        logger.info(`Client ${socket.id} left task room: ${taskId}`);
      });

      socket.on('disconnect', () => {
        logger.info(`Client disconnected: ${socket.id}`);
      });
    });
  }

  public emitJobUpdate(jobId: string, data: any) {
    this.io.to(`job:${jobId}`).emit('jobUpdate', data);
    logger.info(`Emitted job update for job: ${jobId}`);
  }

  public emitTaskUpdate(taskId: string, data: any) {
    this.io.to(`task:${taskId}`).emit('taskUpdate', data);
    logger.info(`Emitted task update for task: ${taskId}`);
  }

  public broadcastSystemMessage(message: string) {
    this.io.emit('systemMessage', { message, timestamp: new Date() });
    logger.info(`Broadcasted system message: ${message}`);
  }

  public getStats(): LoadBalancerStats {
    return this.loadBalancer.getStats();
  }

  public async close() {
    await this.loadBalancer.close();
    await new Promise<void>((resolve) => {
      this.io.close(() => {
        logger.info('WebSocket server closed');
        resolve();
      });
    });
  }
}
