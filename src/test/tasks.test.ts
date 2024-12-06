import request from 'supertest';
import { app } from '../index';
import Task from '../models/Task';
import Job from '../models/Job';
import User from '../models/User';
import jwt from 'jsonwebtoken';

describe('Tasks Routes', () => {
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

  const testTask = {
    title: 'Test Task',
    description: 'Test task description'
  };

  beforeEach(async () => {
    await Task.deleteMany({});
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

  describe('POST /api/tasks', () => {
    it('should create a new task', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...testTask,
          jobId,
          assignedTo: userId
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('title', testTask.title);
      expect(response.body).toHaveProperty('jobId', jobId);
    });

    it('should not create task without authentication', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .send({
          ...testTask,
          jobId,
          assignedTo: userId
        });

      expect(response.status).toBe(401);
    });
  });

  describe('GET /api/tasks/job/:jobId', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...testTask,
          jobId,
          assignedTo: userId
        });
    });

    it('should get all tasks for a job', async () => {
      const response = await request(app)
        .get(`/api/tasks/job/${jobId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTruthy();
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe(testTask.title);
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    let taskId: string;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          ...testTask,
          jobId,
          assignedTo: userId
        });

      taskId = response.body._id;
    });

    it('should update task status', async () => {
      const response = await request(app)
        .patch(`/api/tasks/${taskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'completed' });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('completed');
      expect(response.body).toHaveProperty('completedAt');
    });
  });
});
