import dotenv from 'dotenv';

dotenv.config();

export const config = {
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb+srv://editoriadanismanlik:fpa7kuHO3RJpO3gR@cluster0.u0oyr.mongodb.net/editoriadanismanlik'
  },
  server: {
    port: process.env.PORT || 5000
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: '24h'
  },
  cors: {
    origin: process.env.FRONTEND_URL || 'https://travel-healths.netlify.app',
    credentials: true
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    options: {
      retryStrategy: (times: number) => Math.min(times * 50, 2000)
    }
  },
  websocket: {
    maxConnectionsPerClient: parseInt(process.env.WS_MAX_CONNECTIONS_PER_CLIENT || '10', 10),
    rateLimitWindowMs: parseInt(process.env.WS_RATE_LIMIT_WINDOW_MS || '60000', 10),
    maxRequestsPerWindow: parseInt(process.env.WS_MAX_REQUESTS_PER_WINDOW || '1000', 10)
  }
};
