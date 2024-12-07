import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import { createServer } from 'http';
import { WebSocketService } from './services/websocket';
import { config } from './config/config';

// Import routes
import authRoutes from './routes/auth';
import jobsRoutes from './routes/jobs';
import tasksRoutes from './routes/tasks';
import earningsRoutes from './routes/earnings';
import analyticsRoutes from './routes/analytics';
import userPreferencesRoutes from './routes/userPreferences';
import healthRoutes from './routes/health';

// Middleware
import {
  rateLimiter,
  corsOptions,
  cspConfig,
  requestLogger,
  errorLogger
} from './middleware/security';
import { paginationMiddleware } from './middleware/pagination';

// Load environment variables
dotenv.config();

const app = express();
const server = createServer(app);

// Security middleware
app.use(helmet());
app.use(express.json());
app.use(cors(corsOptions));
app.use(cspConfig);
app.use(rateLimiter);
app.use(requestLogger);

// Global middleware
app.use('/api', paginationMiddleware);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/tasks', tasksRoutes);
app.use('/api/earnings', earningsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/user/preferences', userPreferencesRoutes);
app.use('/api', healthRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Travel Health API' });
});

// Error handling
app.use(errorLogger);
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(500).json({
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Initialize WebSocket service
WebSocketService.getInstance(server);

// Connect to MongoDB
mongoose.connect(config.mongodb.uri)
  .then(() => {
    console.log('Connected to MongoDB');
    server.listen(config.server.port, () => {
      console.log(`Server is running on port ${config.server.port}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  });
