import request from 'supertest';
import { app } from '../index';
import Earnings from '../models/Earnings';
import Job from '../models/Job';
import User from '../models/User';
import jwt from 'jsonwebtoken';

describe('Earnings Routes', () => {
  let token: string;
  let userId: string;
  let jobId: string;

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

  const testEarnings = {
    amount: 500
  };

  beforeEach(async () => {
    await Earnings.deleteMany({});
    await Job.deleteMany({});
    await User.deleteMany({});

    // Create test user and get token
    await request(app).post('/api/auth/register').send(testUser);
    const loginResponse = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    token = loginResponse.body.token;
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    userId = decoded.userId;

    // Create a test job
    const jobResponse = await request(app)
      .post('/api/jobs')
      .set('Authorization', `Bearer ${token}`)
      .send(testJob);
    
    jobId = jobResponse.body._id;
  });

  describe('POST /api/earnings', () => {
    it('should create a new earnings record', async () => {
      const response = await request(app)
        .post('/api/earnings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...testEarnings,
          jobId
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('amount', testEarnings.amount);
      expect(response.body).toHaveProperty('jobId', jobId);
      expect(response.body).toHaveProperty('userId', userId);
    });

    it('should not create earnings without authentication', async () => {
      const response = await request(app)
        .post('/api/earnings')
        .send({
          ...testEarnings,
          jobId
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/earnings/my-earnings', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/earnings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...testEarnings,
          jobId
        });
    });

    it('should get user earnings', async () => {
      const response = await request(app)
        .get('/api/earnings/my-earnings')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('earnings');
      expect(response.body).toHaveProperty('totalEarnings');
      expect(Array.isArray(response.body.earnings)).toBeTruthy();
      expect(response.body.earnings.length).toBe(1);
      expect(response.body.earnings[0].amount).toBe(testEarnings.amount);
    });
  });

  describe('PATCH /api/earnings/:id', () => {
    let earningsId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/earnings')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...testEarnings,
          jobId
        });

      earningsId = response.body._id;
    });

    it('should update earnings status', async () => {
      const response = await request(app)
        .patch(`/api/earnings/${earningsId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'paid' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('paid');
      expect(response.body).toHaveProperty('paidAt');
    });
  });
});
