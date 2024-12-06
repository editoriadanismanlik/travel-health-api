import { Server } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { EventEmitter } from 'events';

export class WebSocketService {
  private static instance: WebSocketService;
  private io: Server;
  private eventEmitter: EventEmitter;

  private constructor(server: HTTPServer) {
    this.io = new Server(server, {
      cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        methods: ['GET', 'POST'],
      },
    });

    this.eventEmitter = new EventEmitter();
    this.setupSocketHandlers();
  }

  static getInstance(server?: HTTPServer): WebSocketService {
    if (!WebSocketService.instance && server) {
      WebSocketService.instance = new WebSocketService(server);
    }
    return WebSocketService.instance;
  }

  private setupSocketHandlers() {
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication error'));
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        socket.data.user = decoded;
        next();
      } catch (error) {
        next(new Error('Authentication error'));
      }
    });

    this.io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      // Subscribe to real-time updates
      socket.on('subscribe', (channels: string[]) => {
        channels.forEach(channel => {
          socket.join(channel);
        });
      });

      // Unsubscribe from updates
      socket.on('unsubscribe', (channels: string[]) => {
        channels.forEach(channel => {
          socket.leave(channel);
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    // Listen for events from the application
    this.eventEmitter.on('broadcast', (event) => {
      this.io.emit('event', event);
    });
  }

  // Broadcast an event to all connected clients
  broadcast(event: {
    type: string;
    action: 'create' | 'update' | 'delete';
    data: any;
    message: string;
  }) {
    this.eventEmitter.emit('broadcast', event);
  }

  // Broadcast to specific room/channel
  broadcastToRoom(room: string, event: any) {
    this.io.to(room).emit('event', event);
  }

  // Send to specific client
  sendToClient(clientId: string, event: any) {
    this.io.to(clientId).emit('event', event);
  }
}

export default WebSocketService;
