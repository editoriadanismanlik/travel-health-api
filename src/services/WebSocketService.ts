import WebSocket from 'ws';
import { Server } from 'http';
import { verify } from 'jsonwebtoken';
import { User, Notification } from '../models';

interface WebSocketClient extends WebSocket {
  userId?: string;
  isAlive: boolean;
}

export class WebSocketService {
  private wss: WebSocket.Server;
  private clients: Map<string, WebSocketClient[]> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocket.Server({ server });
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', async (ws: WebSocketClient, req) => {
      try {
        // Extract token from query string
        const token = new URL(req.url!, 'ws://localhost').searchParams.get('token');
        if (!token) {
          ws.close(1008, 'Authentication required');
          return;
        }

        // Verify JWT token
        const decoded = verify(token, process.env.JWT_SECRET!) as { userId: string };
        ws.userId = decoded.userId;
        ws.isAlive = true;

        // Store client connection
        if (!this.clients.has(decoded.userId)) {
          this.clients.set(decoded.userId, []);
        }
        this.clients.get(decoded.userId)!.push(ws);

        // Setup ping-pong for connection health check
        ws.on('pong', () => {
          ws.isAlive = true;
        });

        // Handle incoming messages
        ws.on('message', async (message: string) => {
          await this.handleMessage(ws, message);
        });

        // Handle client disconnect
        ws.on('close', () => {
          this.removeClient(ws);
        });

        // Send pending notifications
        await this.sendPendingNotifications(decoded.userId);

      } catch (error) {
        console.error('WebSocket connection error:', error);
        ws.close(1008, 'Authentication failed');
      }
    });

    // Setup periodic health checks
    setInterval(() => {
      this.wss.clients.forEach((ws: WebSocketClient) => {
        if (!ws.isAlive) {
          this.removeClient(ws);
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);
  }

  private async handleMessage(ws: WebSocketClient, message: string) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'mark_read':
          await this.markNotificationAsRead(ws.userId!, data.notificationId);
          break;
        case 'get_notifications':
          await this.sendNotifications(ws.userId!);
          break;
        default:
          console.warn('Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('Message handling error:', error);
    }
  }

  private async markNotificationAsRead(userId: string, notificationId: string) {
    await Notification.findOneAndUpdate(
      { _id: notificationId, recipient: userId },
      { read: true, readAt: new Date() }
    );
  }

  private async sendPendingNotifications(userId: string) {
    const notifications = await Notification.find({
      recipient: userId,
      read: false
    }).sort({ createdAt: -1 }).limit(50);

    this.emitToUser(userId, 'notifications', notifications);
  }

  public emitToUser(userId: string, event: string, data: any) {
    const userClients = this.clients.get(userId);
    if (userClients) {
      const message = JSON.stringify({ event, data });
      userClients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(message);
        }
      });
    }
  }

  private removeClient(ws: WebSocketClient) {
    if (ws.userId) {
      const userClients = this.clients.get(ws.userId);
      if (userClients) {
        const index = userClients.indexOf(ws);
        if (index > -1) {
          userClients.splice(index, 1);
        }
        if (userClients.length === 0) {
          this.clients.delete(ws.userId);
        }
      }
    }
  }
}

