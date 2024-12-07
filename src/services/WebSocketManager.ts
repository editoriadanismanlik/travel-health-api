import { Server, Socket } from 'socket.io';
import { verifyToken } from '../middleware/auth';
import logger from '../utils/logger';

interface QueuedMessage {
  event: string;
  data: any;
  timestamp: number;
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private io: Server;
  private connectedClients: Map<string, Socket>;
  private messageQueue: QueuedMessage[];
  private readonly maxQueueSize: number;

  private constructor(io: Server) {
    this.io = io;
    this.connectedClients = new Map();
    this.messageQueue = [];
    this.maxQueueSize = 1000;
    this.initialize();
  }

  public static getInstance(io?: Server): WebSocketManager {
    if (!WebSocketManager.instance && io) {
      WebSocketManager.instance = new WebSocketManager(io);
    }
    return WebSocketManager.instance;
  }

  private initialize(): void {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('Authentication token required');
        }

        const decoded = await verifyToken(token);
        socket.data.user = decoded;
        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });

    this.io.on('connection', (socket) => {
      this.handleConnection(socket);
    });
  }

  private handleConnection(socket: Socket): void {
    const userId = socket.data.user.id;
    this.connectedClients.set(userId, socket);
    logger.info(`Client connected: ${userId}`);

    socket.on('disconnect', () => {
      this.connectedClients.delete(userId);
      logger.info(`Client disconnected: ${userId}`);
    });

    // Handle custom events
    socket.on('message', (data) => this.handleMessage(socket, data));
    socket.on('error', (error) => this.handleError(socket, error));
  }

  private handleMessage(socket: Socket, data: any): void {
    try {
      const message: QueuedMessage = {
        event: 'message',
        data,
        timestamp: Date.now()
      };

      if (this.messageQueue.length >= this.maxQueueSize) {
        this.messageQueue.shift(); // Remove oldest message
      }
      this.messageQueue.push(message);

      // Broadcast to all connected clients except sender
      socket.broadcast.emit('message', data);
    } catch (error) {
      logger.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to process message' });
    }
  }

  private handleError(socket: Socket, error: any): void {
    logger.error('WebSocket error:', error);
    socket.emit('error', { message: 'Internal server error' });
  }

  public getConnectedClients(): number {
    return this.connectedClients.size;
  }

  public getQueueSize(): number {
    return this.messageQueue.length;
  }

  public broadcastMessage(event: string, data: any): void {
    this.io.emit(event, data);
  }

  public sendToUser(userId: string, event: string, data: any): boolean {
    const socket = this.connectedClients.get(userId);
    if (socket) {
      socket.emit(event, data);
      return true;
    }
    return false;
  }
}
