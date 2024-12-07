import { createServer } from 'http';
import { Server } from 'socket.io';
import { io as Client } from 'socket.io-client';
import { WebSocketManager } from '../services/WebSocketManager';
import { config } from '../config/config';

jest.setTimeout(30000); // Increase timeout to 30 seconds

describe('WebSocket Tests', () => {
  let httpServer: any;
  let wsManager: WebSocketManager;
  let clientSocket: any;

  beforeAll((done) => {
    httpServer = createServer();
    wsManager = WebSocketManager.getInstance(httpServer);
    httpServer.listen(() => {
      const port = (httpServer.address() as any).port;
      clientSocket = Client(`http://localhost:${port}`, {
        reconnectionDelay: 0,
        forceNew: true,
        transports: ['websocket']
      });
      clientSocket.on('connect', done);
    });
  });

  afterAll(async () => {
    await wsManager.close();
    clientSocket.close();
    httpServer.close();
  });

  test('should connect and join a job room', (done) => {
    const jobId = '12345';
    
    // Set up event listener before emitting
    clientSocket.once('jobUpdate', (data: any) => {
      try {
        expect(data).toEqual({ status: 'updated' });
        done();
      } catch (error) {
        done(error);
      }
    });
    
    clientSocket.emit('joinJob', jobId);
    
    // Wait a bit to ensure the join operation is complete
    setTimeout(() => {
      wsManager.emitJobUpdate(jobId, { status: 'updated' });
    }, 1000);
  });

  test('should handle task updates', (done) => {
    const taskId = '67890';
    
    // Set up event listener before emitting
    clientSocket.once('taskUpdate', (data: any) => {
      try {
        expect(data).toEqual({ progress: 50 });
        done();
      } catch (error) {
        done(error);
      }
    });
    
    clientSocket.emit('joinTask', taskId);
    
    setTimeout(() => {
      wsManager.emitTaskUpdate(taskId, { progress: 50 });
    }, 1000);
  });

  test('should receive system messages', (done) => {
    const testMessage = 'System maintenance in 5 minutes';
    
    // Set up event listener before broadcasting
    clientSocket.once('systemMessage', (data: any) => {
      try {
        expect(data.message).toBe(testMessage);
        expect(data.timestamp).toBeDefined();
        done();
      } catch (error) {
        done(error);
      }
    });
    
    setTimeout(() => {
      wsManager.broadcastSystemMessage(testMessage);
    }, 1000);
  });
});
