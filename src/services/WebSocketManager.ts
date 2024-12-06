import { Server } from 'socket.io';
import { Server as HttpServer } from 'http';
import { verifyToken } from '../middleware/auth';
import logger from '../utils/logger';

interface Client {
  id: string;
  userId: string;
  lastHeartbeat: number;
  messageQueue: any[];
}

export class WebSocketManager {
  private static instance: WebSocketManager;
  private io: Server;
  private clients: Map<string, Client> = new Map();
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly CLIENT_TIMEOUT = 35000; // 35 seconds
  private readonly MAX_RECONNECTION_ATTEMPTS = 5;
  private readonly RECONNECTION_DELAY = 1000; // 1 second

  private constructor(server: HttpServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 10000,
      pingInterval: 5000,
    });

    this.setupMiddleware();
    this.setupEventHandlers();
    this.startHeartbeatCheck();
  }

  public static getInstance(server?: HttpServer): WebSocketManager {
    if (!WebSocketManager.instance && server) {
      WebSocketManager.instance = new WebSocketManager(server);
    }
    return WebSocketManager.instance;
  }

  private setupMiddleware() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          throw new Error('Authentication token missing');
        }

        const decoded = await verifyToken(token);
        socket.data.userId = decoded.userId;
        next();
      } catch (error) {
        logger.error('WebSocket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
  }

  private setupEventHandlers() {
    this.io.on('connection', (socket) => {
      const userId = socket.data.userId;
      
      // Initialize client
      this.clients.set(socket.id, {
        id: socket.id,
        userId,
        lastHeartbeat: Date.now(),
        messageQueue: [],
      });

      logger.info(`Client connected: ${socket.id}, User: ${userId}`);

      // Handle heartbeat
      socket.on('heartbeat', () => {
        const client = this.clients.get(socket.id);
        if (client) {
          client.lastHeartbeat = Date.now();
          this.clients.set(socket.id, client);
          socket.emit('heartbeat_ack');
        }
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        logger.info(`Client disconnected: ${socket.id}, Reason: ${reason}`);
        this.handleDisconnect(socket.id, reason);
      });

      // Handle errors
      socket.on('error', (error) => {
        logger.error(`Socket error for client ${socket.id}:`, error);
        this.handleError(socket.id, error);
      });

      // Send any queued messages
      this.sendQueuedMessages(socket.id);
    });
  }

  private startHeartbeatCheck() {
    setInterval(() => {
      const now = Date.now();
      this.clients.forEach((client, socketId) => {
        if (now - client.lastHeartbeat > this.CLIENT_TIMEOUT) {
          logger.warn(`Client ${socketId} timed out`);
          this.handleTimeout(socketId);
        }
      });
    }, this.HEARTBEAT_INTERVAL);
  }

  private handleDisconnect(socketId: string, reason: string) {
    const client = this.clients.get(socketId);
    if (client) {
      // Keep the client's message queue for potential reconnection
      setTimeout(() => {
        if (!this.isClientConnected(socketId)) {
          this.clients.delete(socketId);
          logger.info(`Client ${socketId} removed after disconnect timeout`);
        }
      }, this.RECONNECTION_DELAY * this.MAX_RECONNECTION_ATTEMPTS);
    }
  }

  private handleTimeout(socketId: string) {
    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.disconnect(true);
    }
    this.clients.delete(socketId);
  }

  private handleError(socketId: string, error: any) {
    const client = this.clients.get(socketId);
    if (client) {
      logger.error(`Error for client ${socketId}:`, error);
      // Implement error-specific handling here
    }
  }

  private isClientConnected(socketId: string): boolean {
    return this.io.sockets.sockets.has(socketId);
  }

  private async sendQueuedMessages(socketId: string) {
    const client = this.clients.get(socketId);
    if (client && client.messageQueue.length > 0) {
      const socket = this.io.sockets.sockets.get(socketId);
      if (socket) {
        while (client.messageQueue.length > 0) {
          const message = client.messageQueue.shift();
          try {
            await socket.emit(message.event, message.data);
            logger.info(`Queued message sent to client ${socketId}`);
          } catch (error) {
            logger.error(`Error sending queued message to client ${socketId}:`, error);
            // Re-queue the message if sending fails
            client.messageQueue.unshift(message);
            break;
          }
        }
      }
    }
  }

  public broadcast(event: string, data: any, room?: string) {
    try {
      if (room) {
        this.io.to(room).emit(event, data);
        logger.info(`Broadcast to room ${room}: ${event}`);
      } else {
        this.io.emit(event, data);
        logger.info(`Broadcast to all: ${event}`);
      }
    } catch (error) {
      logger.error('Broadcast error:', error);
      // Queue messages for disconnected clients
      this.queueMessageForOfflineClients(event, data);
    }
  }

  private queueMessageForOfflineClients(event: string, data: any) {
    this.clients.forEach((client) => {
      if (!this.isClientConnected(client.id)) {
        client.messageQueue.push({ event, data });
        logger.info(`Message queued for offline client ${client.id}`);
      }
    });
  }

  public getConnectedClients(): number {
    return this.io.sockets.sockets.size;
  }

  public getClientsByUser(userId: string): string[] {
    const clientIds: string[] = [];
    this.clients.forEach((client) => {
      if (client.userId === userId) {
        clientIds.push(client.id);
      }
    });
    return clientIds;
  }
}
