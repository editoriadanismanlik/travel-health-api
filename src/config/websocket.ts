import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { verifyToken } from '../utils/auth';
import { logger } from '../utils/logger';
import { redis } from './redis';

interface WebSocketClient extends WebSocket {
  userId?: string;
  isAlive: boolean;
  sessionId?: string;
}

export class WebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, Set<WebSocketClient>>;

  constructor(server: HTTPServer) {
    this.wss = new WebSocketServer({ server });
    this.clients = new Map();
    this.initialize();
  }

  private initialize() {
    this.wss.on('connection', this.handleConnection.bind(this));
    this.setupHeartbeat();
  }

  private async handleConnection(ws: WebSocketClient, req: any) {
    try {
      const token = new URL(req.url, 'ws://localhost').searchParams.get('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const decoded = await verifyToken(token);
      ws.userId = decoded.userId;
      ws.sessionId = req.headers['sec-websocket-key'];
      ws.isAlive = true;

      this.registerClient(ws);
      this.setupMessageHandlers(ws);

      // Send initial data
      await this.sendInitialData(ws);

      logger.info(`WebSocket client connected: ${ws.userId}`);
    } catch (error) {
      logger.error('WebSocket connection error:', error);
      ws.close(1008, 'Authentication failed');
    }
  }

  private registerClient(ws: WebSocketClient) {
    if (!ws.userId) return;

    if (!this.clients.has(ws.userId)) {
      this.clients.set(ws.userId, new Set());
    }
    this.clients.get(ws.userId)!.add(ws);
  }

  private setupMessageHandlers(ws: WebSocketClient) {
    ws.on('message', async (data: string) => {
      try {
        const message = JSON.parse(data);
        await this.handleMessage(ws, message);
      } catch (error) {
        logger.error('Message handling error:', error);
      }
    });

    ws.on('close', () => {
      this.removeClient(ws);
    });

    ws.on('pong', () => {
      ws.isAlive = true;
    });
  }

  private async handleMessage(ws: WebSocketClient, message: any) {
    switch (message.type) {
      case 'TASK_UPDATE':
        await this.handleTaskUpdate(message);
        break;
      case 'JOB_STATUS':
        await this.handleJobStatus(message);
        break;
      case 'NOTIFICATION_READ':
        await this.handleNotificationRead(message);
        break;
      default:
        logger.warn(`Unknown message type: ${message.type}`);
    }
  }

  private async sendInitialData(ws: WebSocketClient) {
    if (!ws.userId) return;

    // Send pending notifications
    const notifications = await this.getPendingNotifications(ws.userId);
    this.sendToClient(ws, {
      type: 'INITIAL_DATA',
      notifications
    });
  }

  public broadcast(data: any) {
    const message = JSON.stringify(data);
    this.wss.clients.forEach((client: WebSocketClient) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  public sendToUser(userId: string, data: any) {
    const userClients = this.clients.get(userId);
    if (!userClients) return;

    const message = JSON.stringify(data);
    userClients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  }

  private setupHeartbeat() {
    const interval = setInterval(() => {
      this.wss.clients.forEach((ws: WebSocketClient) => {
        if (!ws.isAlive) {
          this.removeClient(ws);
          return ws.terminate();
        }
        ws.isAlive = false;
        ws.ping();
      });
    }, 30000);

    this.wss.on('close', () => {
      clearInterval(interval);
    });
  }

  private removeClient(ws: WebSocketClient) {
    if (!ws.userId) return;

    const userClients = this.clients.get(ws.userId);
    if (userClients) {
      userClients.delete(ws);
      if (userClients.size === 0) {
        this.clients.delete(ws.userId);
      }
    }
    logger.info(`WebSocket client disconnected: ${ws.userId}`);
  }

  private async getPendingNotifications(userId: string) {
    // Implement notification fetching logic
    return [];
  }
}
