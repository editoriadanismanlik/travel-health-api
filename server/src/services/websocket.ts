import WebSocket from 'ws';
import { verifyToken } from '../utils/auth';
import redisClient from '../config/redis';

export class WebSocketService {
  private wss: WebSocket.Server;

  constructor() {
    this.wss = new WebSocket.Server({ noServer: true });
  }

  handleUpgrade(request: any, socket: any, head: any) {
    this.wss.handleUpgrade(request, socket, head, (ws) => {
      this.wss.emit('connection', ws, request);
    });
  }

  handleConnection(ws: WebSocket) {
    ws.on('message', (message: string) => {
      console.log('received: %s', message);
    });

    ws.on('close', () => {
      console.log('client disconnected');
    });
  }
}

export default new WebSocketService();
