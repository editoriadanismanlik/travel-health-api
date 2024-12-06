import request from 'supertest';
import { app } from '../../index';
import User from '../../models/User';
import Job from '../../models/Job';
import Task from '../../models/Task';
import Earnings from '../../models/Earnings';
import jwt from 'jsonwebtoken';

export interface TestUser {
  username: string;
  email: string;
  password: string;
  token?: string;
  _id?: string;
}

export interface TestJob {
  title: string;
  description: string;
  location: string;
  salary: number;
  _id?: string;
}

export const createTestUser = async (userData?: Partial<TestUser>): Promise<TestUser> => {
  const defaultUser = {
    username: `testuser_${Date.now()}`,
    email: `test_${Date.now()}@example.com`,
    password: 'password123'
  };

  const testUser = { ...defaultUser, ...userData };

  await request(app).post('/api/auth/register').send(testUser);
  const loginResponse = await request(app)
    .post('/api/auth/login')
    .send({
      email: testUser.email,
      password: testUser.password
    });

  testUser.token = loginResponse.body.token;
  const decoded = jwt.verify(testUser.token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
  testUser._id = decoded.userId;

  return testUser;
};

export const createTestJob = async (token: string, jobData?: Partial<TestJob>): Promise<TestJob> => {
  const defaultJob = {
    title: `Test Job ${Date.now()}`,
    description: 'Test job description',
    location: 'Test Location',
    salary: 1000
  };

  const testJob = { ...defaultJob, ...jobData };

  const response = await request(app)
    .post('/api/jobs')
    .set('Authorization', `Bearer ${token}`)
    .send(testJob);

  return { ...testJob, _id: response.body._id };
};

export const clearDatabase = async (): Promise<void> => {
  await User.deleteMany({});
  await Job.deleteMany({});
  await Task.deleteMany({});
  await Earnings.deleteMany({});
};

export const getAuthHeader = (token: string) => ({
  Authorization: `Bearer ${token}`
});

export const createTestTask = async (token: string, jobId: string, userId: string, data?: any) => {
  const defaultTask = {
    title: `Test Task ${Date.now()}`,
    description: 'Test task description',
    jobId,
    assignedTo: userId
  };

  const taskData = { ...defaultTask, ...data };

  const response = await request(app)
    .post('/api/tasks')
    .set('Authorization', `Bearer ${token}`)
    .send(taskData);

  return response.body;
};

export const createTestEarnings = async (token: string, jobId: string, data?: any) => {
  const defaultEarnings = {
    amount: 500,
    jobId
  };

  const earningsData = { ...defaultEarnings, ...data };

  const response = await request(app)
    .post('/api/earnings')
    .set('Authorization', `Bearer ${token}`)
    .send(earningsData);

  return response.body;
};
