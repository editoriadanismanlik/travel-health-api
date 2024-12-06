import { Express } from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { User } from '../../models/User';

export const createTestUser = async () => {
  const user = await User.create({
    email: 'test@example.com',
    password: 'Password123!',
    firstName: 'Test',
    lastName: 'User',
    role: 'ambassador'
  });
  return user;
};

export const generateTestToken = (userId: string) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
};

export const apiRequest = (app: Express) => {
  return {
    get: (url: string, token?: string) => {
      const req = request(app).get(url);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    },
    post: (url: string, body: any, token?: string) => {
      const req = request(app).post(url).send(body);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    },
    put: (url: string, body: any, token?: string) => {
      const req = request(app).put(url).send(body);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    },
    delete: (url: string, token?: string) => {
      const req = request(app).delete(url);
      if (token) req.set('Authorization', `Bearer ${token}`);
      return req;
    }
  };
};
