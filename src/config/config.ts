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
  }
};
