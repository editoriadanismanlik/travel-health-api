import express from 'express';
import { createServer } from 'http';
import { configureMiddleware } from './middleware';
import { connectDatabase } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import { WebSocketManager } from './config/websocket';
import { redis } from './config/redis';
import { logger } from './utils/logger';

async function startServer() {
  try {
    const app = express();
    const server = createServer(app);
    
    // Initialize WebSocket
    const wsManager = new WebSocketManager(server);
    global.wsManager = wsManager;

    // Configure middleware
    await configureMiddleware(app);

    // Connect to database
    await connectDatabase();

    // Connect to Redis
    await redis.connect();

    // API routes
    app.use('/api/v1', require('./routes'));

    // Error handling
    app.use(errorHandler);

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
    });

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      logger.info('SIGTERM received. Shutting down gracefully...');
      await cleanup();
      process.exit(0);
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function cleanup() {
  try {
    await redis.disconnect();
    await mongoose.disconnect();
    logger.info('Cleanup completed');
  } catch (error) {
    logger.error('Cleanup error:', error);
  }
}

startServer(); 