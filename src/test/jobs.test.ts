import request from 'supertest';
import { app } from '../index';
import Job from '../models/Job';
import User from '../models/User';
import jwt from 'jsonwebtoken';

describe('Jobs Routes', () => {
  let token: string;
  let userId: string;

  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123'
  };

  const testJob = {
    title: 'Test Job',
    description: 'Test job description',
    location: 'Test Location',
    salary: 1000
  };

  beforeEach(async () => {
    await Job.deleteMany({});
    await User.deleteMany({});

    // Create test user and get token
    const userResponse = await request(app)
      .post('/api/auth/register')
      .send(testUser);
    
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    token = loginResponse.body.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    userId = decoded.userId;
  });

  describe('POST /api/jobs', () => {
    it('should create a new job', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${token}`)
        .send(testJob);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('title', testJob.title);
      expect(response.body).toHaveProperty('createdBy', userId);
    });

    it('should not create job without authentication', async () => {
      const response = await request(app)
        .post('/api/jobs')
        .send(testJob);

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/jobs', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/jobs')
        .set('Authorization', `Bearer ${token}`)
        .send(testJob);
    });

    it('should get all jobs', async () => {
      const response = await request(app)
        .get('/api/jobs')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe(testJob.title);
    });
  });
});
