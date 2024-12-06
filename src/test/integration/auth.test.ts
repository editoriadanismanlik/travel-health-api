import { Express } from 'express';
import { createServer } from '../../index';
import { connectTestDb, closeTestDb, clearTestDb } from '../utils/testDb';
import { apiRequest, createTestUser } from '../utils/testHelper';

let app: Express;
let api: ReturnType<typeof apiRequest>;

beforeAll(async () => {
  await connectTestDb();
  app = await createServer();
  api = apiRequest(app);
});

afterAll(async () => {
  await closeTestDb();
});

beforeEach(async () => {
  await clearTestDb();
});

describe('Authentication API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const response = await api.post('/api/auth/register', {
        email: 'newuser@example.com',
        password: 'Password123!',
        firstName: 'New',
        lastName: 'User',
      });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'newuser@example.com');
    });

    it('should return validation error for invalid input', async () => {
      const response = await api.post('/api/auth/register', {
        email: 'invalid-email',
        password: '123', // Too short
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await createTestUser();
    });

    it('should login successfully with correct credentials', async () => {
      const response = await api.post('/api/auth/login', {
        email: 'test@example.com',
        password: 'Password123!',
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', 'test@example.com');
    });

    it('should return error for incorrect password', async () => {
      const response = await api.post('/api/auth/login', {
        email: 'test@example.com',
        password: 'WrongPassword123!',
      });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty('message', 'Invalid credentials');
    });
  });
});
