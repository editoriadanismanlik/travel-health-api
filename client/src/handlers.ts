import { rest } from 'msw';

const baseUrl = import.meta.env.VITE_API_URL;

export const handlers = [
  rest.post(`${baseUrl}/auth/login`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: 'mock-jwt-token',
        user: {
          _id: '1',
          name: 'Test User',
          email: 'test@example.com',
          role: 'ambassador'
        }
      })
    );
  }),

  rest.get(`${baseUrl}/jobs`, (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json([
        {
          _id: '1',
          title: 'Test Job',
          description: 'Test Description',
          status: 'active',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          location: 'Test Location',
          priority: 'medium'
        }
      ])
    );
  })
];
