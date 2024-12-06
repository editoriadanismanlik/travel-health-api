import { io, Socket } from 'socket.io-client';
import { EventEmitter } from 'events';

interface QueuedMessage {
  event: string;
  data: any;
  timestamp: number;
}

export class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private eventEmitter: EventEmitter;
  private messageQueue: QueuedMessage[] = [];
  private reconnectAttempts = 0;
  private isConnecting = false;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private readonly MAX_RECONNECTION_ATTEMPTS = 5;
  private readonly RECONNECTION_DELAY = 1000;
  private readonly HEARTBEAT_INTERVAL = 30000;
  private readonly MESSAGE_QUEUE_LIMIT = 1000;
  private readonly OFFLINE_STORAGE_KEY = 'ws_message_queue';

  private constructor() {
    this.eventEmitter = new EventEmitter();
    this.loadQueuedMessages();
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public async connect(token: string): Promise<void> {
    if (this.isConnecting || this.socket?.connected) return;

    this.isConnecting = true;

    try {
      this.socket = io(process.env.VITE_WS_URL || 'http://localhost:3000', {
        auth: { token },
        reconnection: false, // We'll handle reconnection ourselves
        timeout: 10000,
      });

      this.setupEventHandlers();
      this.startHeartbeat();

      return new Promise((resolve, reject) => {
        if (!this.socket) return reject(new Error('Socket not initialized'));

        this.socket.on('connect', () => {
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.processMessageQueue();
          resolve();
        });

        this.socket.on('connect_error', (error) => {
          this.isConnecting = false;
          reject(error);
        });
      });
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  private setupEventHandlers() {
    if (!this.socket) return;

    this.socket.on('disconnect', (reason) => {
      console.warn('WebSocket disconnected:', reason);
      this.handleDisconnect(reason);
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      this.eventEmitter.emit('error', error);
    });

    this.socket.on('heartbeat_ack', () => {
      this.eventEmitter.emit('heartbeat_ack');
    });

    // Handle custom events
    this.socket.onAny((event, ...args) => {
      this.eventEmitter.emit(event, ...args);
    });
  }

  private startHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit('heartbeat');
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  private async handleDisconnect(reason: string) {
    if (reason === 'io server disconnect') {
      // The server has forcefully disconnected the socket
      console.warn('Server forcefully disconnected the socket');
      return;
    }

    if (this.reconnectAttempts < this.MAX_RECONNECTION_ATTEMPTS) {
      this.reconnectAttempts++;
      const delay = this.RECONNECTION_DELAY * this.reconnectAttempts;
      
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.MAX_RECONNECTION_ATTEMPTS}) in ${delay}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      try {
        await this.connect(this.socket?.auth?.token);
      } catch (error) {
        console.error('Reconnection attempt failed:', error);
      }
    } else {
      console.error('Max reconnection attempts reached');
      this.eventEmitter.emit('max_reconnection_attempts');
    }
  }

  public emit(event: string, data: any): void {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    } else {
      this.queueMessage(event, data);
    }
  }

  private queueMessage(event: string, data: any): void {
    if (this.messageQueue.length >= this.MESSAGE_QUEUE_LIMIT) {
      this.messageQueue.shift(); // Remove oldest message if queue is full
    }

    const message: QueuedMessage = {
      event,
      data,
      timestamp: Date.now(),
    };

    this.messageQueue.push(message);
    this.saveQueuedMessages();
  }

  private async processMessageQueue(): Promise<void> {
    if (!this.socket?.connected) return;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue[0];
      try {
        await new Promise<void>((resolve, reject) => {
          if (!this.socket) return reject(new Error('Socket not initialized'));
          
          this.socket.emit(message.event, message.data, (error: any) => {
            if (error) reject(error);
            else resolve();
          });
        });
        
        this.messageQueue.shift(); // Remove the message after successful send
        this.saveQueuedMessages();
      } catch (error) {
        console.error('Error processing queued message:', error);
        break; // Stop processing on error
      }
    }
  }

  private saveQueuedMessages(): void {
    try {
      localStorage.setItem(this.OFFLINE_STORAGE_KEY, JSON.stringify(this.messageQueue));
    } catch (error) {
      console.error('Error saving queued messages:', error);
    }
  }

  private loadQueuedMessages(): void {
    try {
      const saved = localStorage.getItem(this.OFFLINE_STORAGE_KEY);
      if (saved) {
        this.messageQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading queued messages:', error);
    }
  }

  public on(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.on(event, listener);
  }

  public off(event: string, listener: (...args: any[]) => void): void {
    this.eventEmitter.off(event, listener);
  }

  public disconnect(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    this.socket?.disconnect();
    this.socket = null;
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }

  public getQueueLength(): number {
    return this.messageQueue.length;
  }
}
