import { WebSocket } from 'ws';
import { redis } from '../config/redis';
import { logger } from '../utils/logger';

interface NotificationPayload {
  type: string;
  message: string;
  data?: any;
  userId: string;
}

export class NotificationService {
  private static instance: NotificationService;
  private clients: Map<string, WebSocket[]>;

  private constructor() {
    this.clients = new Map();
    this.initializeRedisSubscriber();
  }

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private async initializeRedisSubscriber() {
    const subscriber = redis.duplicate();
    await subscriber.connect();

    await subscriber.subscribe('notifications', (message) => {
      try {
        const notification: NotificationPayload = JSON.parse(message);
        this.sendNotificationToUser(notification);
      } catch (error) {
        logger.error('Error processing notification:', error);
      }
    });
  }

  public addClient(userId: string, ws: WebSocket) {
    const userClients = this.clients.get(userId) || [];
    userClients.push(ws);
    this.clients.set(userId, userClients);
  }

  public removeClient(userId: string, ws: WebSocket) {
    const userClients = this.clients.get(userId) || [];
    this.clients.set(
      userId,
      userClients.filter((client) => client !== ws)
    );
  }

  private sendNotificationToUser(notification: NotificationPayload) {
    const userClients = this.clients.get(notification.userId) || [];
    const payload = JSON.stringify(notification);

    userClients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  }

  public async sendNotification(notification: NotificationPayload) {
    try {
      const publisher = redis.duplicate();
      await publisher.publish('notifications', JSON.stringify(notification));
    } catch (error) {
      logger.error('Error publishing notification:', error);
      throw error;
    }
  }
} 