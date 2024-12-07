import { WebSocketServer, WebSocket } from 'ws';
import { verifyToken } from '../utils/auth';
import { redis } from '../config/redis';

interface WebSocketClient extends WebSocket {
  userId?: string;
  isAlive: boolean;
}

export const initializeWebSocket = (wss: WebSocketServer) => {
  wss.on('connection', async (ws: WebSocketClient, req) => {
    try {
      // Verify token from query params
      const token = new URL(req.url!, 'ws://localhost').searchParams.get('token');
      if (!token) throw new Error('Authentication required');
      
      const decoded = await verifyToken(token);
      ws.userId = decoded.userId;
      ws.isAlive = true;

      // Handle incoming messages
      ws.on('message', async (data: string) => {
        const message = JSON.parse(data);
        // Handle different message types
        switch (message.type) {
          case 'TASK_UPDATE':
            await handleTaskUpdate(message, ws);
            break;
          // Add more message handlers
        }
      });

      // Handle client disconnect
      ws.on('close', () => {
        // Cleanup
      });

    } catch (error) {
      ws.close();
    }
  });

  // Implement heartbeat
  const interval = setInterval(() => {
    wss.clients.forEach((ws: WebSocketClient) => {
      if (!ws.isAlive) return ws.terminate();
      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);
}; 