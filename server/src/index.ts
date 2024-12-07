import express from 'express';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { configureMiddleware } from './middleware';
import { initializeWebSocket } from './services/websocket';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Initialize WebSocket with custom handlers
initializeWebSocket(wss);

// Configure middleware (cors, compression, etc.)
configureMiddleware(app);

// API routes
app.use('/api/v1', require('./routes'));

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 