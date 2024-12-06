import { io, Socket } from 'socket.io-client';
import { useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotification } from '../contexts/NotificationContext';

interface WebSocketEvent {
  type: 'job' | 'task' | 'earning' | 'system';
  action: 'create' | 'update' | 'delete';
  data: any;
  message: string;
}

class WebSocketService {
  private static instance: WebSocketService;
  private socket: Socket | null = null;
  private listeners: Map<string, Set<(data: any) => void>> = new Map();

  private constructor() {}

  static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(import.meta.env.VITE_WS_URL || 'ws://localhost:3001', {
      auth: { token },
      transports: ['websocket'],
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    this.socket.on('disconnect', () => {
      console.log('WebSocket disconnected');
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket error:', error);
    });

    this.socket.on('event', (event: WebSocketEvent) => {
      const listeners = this.listeners.get(event.type);
      if (listeners) {
        listeners.forEach((listener) => listener(event));
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(type: string, callback: (data: any) => void) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)?.add(callback);
  }

  unsubscribe(type: string, callback: (data: any) => void) {
    this.listeners.get(type)?.delete(callback);
  }

  emit(event: string, data: any) {
    if (this.socket?.connected) {
      this.socket.emit(event, data);
    }
  }
}

export const useWebSocket = () => {
  const { token } = useAuth();
  const { showNotification } = useNotification();
  const ws = useRef(WebSocketService.getInstance());

  useEffect(() => {
    if (token) {
      ws.current.connect(token);
    }
    return () => {
      ws.current.disconnect();
    };
  }, [token]);

  const subscribe = (type: string, callback: (data: any) => void) => {
    ws.current.subscribe(type, callback);
    return () => ws.current.unsubscribe(type, callback);
  };

  const handleNotification = (event: WebSocketEvent) => {
    let severity: 'success' | 'info' | 'warning' | 'error' = 'info';
    switch (event.action) {
      case 'create':
        severity = 'success';
        break;
      case 'update':
        severity = 'info';
        break;
      case 'delete':
        severity = 'warning';
        break;
    }
    showNotification(event.message, severity);
  };

  useEffect(() => {
    const unsubscribe = subscribe('notification', handleNotification);
    return unsubscribe;
  }, []);

  return {
    subscribe,
    emit: (event: string, data: any) => ws.current.emit(event, data),
  };
};

export default WebSocketService;
