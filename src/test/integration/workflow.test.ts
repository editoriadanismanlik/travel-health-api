import request from 'supertest';
import { app } from '../../index';
import {
  clearDatabase,
  createTestUser,
  createTestJob,
  getAuthHeader,
  TestUser,
  TestJob
} from '../utils/test-utils';

describe('Complete Workflow Integration Tests', () => {
  let user: TestUser;
  let job: TestJob;

  beforeEach(async () => {
    await clearDatabase();
    user = await createTestUser();
    job = await createTestJob(user.token!);
  });

  describe('Complete Job Workflow', () => {
    it('should handle a complete job workflow', async () => {
      // 1. Create tasks for the job
      const task1Response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeader(user.token!))
        .send({
          title: 'Task 1',
          description: 'First task',
          jobId: job._id,
          assignedTo: user._id
        });

      const task2Response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeader(user.token!))
        .send({
          title: 'Task 2',
          description: 'Second task',
          jobId: job._id,
          assignedTo: user._id
        });

      expect(task1Response.status).toBe(201);
      expect(task2Response.status).toBe(201);

      // 2. Complete tasks
      await request(app)
        .patch(`/api/tasks/${task1Response.body._id}`)
        .set(getAuthHeader(user.token!))
        .send({ status: 'completed' });

      await request(app)
        .patch(`/api/tasks/${task2Response.body._id}`)
        .set(getAuthHeader(user.token!))
        .send({ status: 'completed' });

      // 3. Create earnings record
      const earningsResponse = await request(app)
        .post('/api/earnings')
        .set(getAuthHeader(user.token!))
        .send({
          jobId: job._id,
          amount: job.salary
        });

      expect(earningsResponse.status).toBe(201);

      // 4. Mark earnings as paid
      const updatedEarnings = await request(app)
        .patch(`/api/earnings/${earningsResponse.body._id}`)
        .set(getAuthHeader(user.token!))
        .send({ status: 'paid' });

      expect(updatedEarnings.status).toBe(200);
      expect(updatedEarnings.body.status).toBe('paid');

      // 5. Verify final state
      const jobTasks = await request(app)
        .get(`/api/tasks/job/${job._id}`)
        .set(getAuthHeader(user.token!));

      const userEarnings = await request(app)
        .get('/api/earnings/my-earnings')
        .set(getAuthHeader(user.token!));

      expect(jobTasks.body.every((task: any) => task.status === 'completed')).toBe(true);
      expect(userEarnings.body.earnings.length).toBe(1);
      expect(userEarnings.body.totalEarnings).toBe(job.salary);
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid job ID', async () => {
      const response = await request(app)
        .post('/api/tasks')
        .set(getAuthHeader(user.token!))
        .send({
          title: 'Task 1',
          description: 'First task',
          jobId: 'invalid-id',
          assignedTo: user._id
        });

      expect(response.status).toBe(400);
    });

    it('should handle unauthorized access', async () => {
      const unauthorizedUser = await createTestUser({
        email: 'unauthorized@example.com'
      });

      const response = await request(app)
        .patch(`/api/jobs/${job._id}`)
        .set(getAuthHeader(unauthorizedUser.token!))
        .send({ status: 'completed' });

      expect(response.status).toBe(403);
    });
  });
});
