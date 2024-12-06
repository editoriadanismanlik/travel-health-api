import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import cors from 'cors';
import { expressCspHeader, INLINE, NONE, SELF } from 'express-csp-header';

// Rate limiting configuration
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

// CORS configuration
export const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 600 // 10 minutes
};

// CSP configuration
export const cspConfig = expressCspHeader({
  directives: {
    'default-src': [SELF],
    'script-src': [SELF, INLINE],
    'style-src': [SELF, INLINE],
    'img-src': [SELF, 'data:', 'https:'],
    'font-src': [SELF, 'https:', 'data:'],
    'connect-src': [SELF],
    'frame-ancestors': [NONE],
    'form-action': [SELF]
  }
});

// Request logging middleware
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(
      JSON.stringify({
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.url,
        status: res.statusCode,
        duration,
        ip: req.ip,
        userAgent: req.get('user-agent')
      })
    );
  });
  next();
};

// Error logging middleware
export const errorLogger = (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    error: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    ip: req.ip
  }));
  next(err);
};

// Role-based access control middleware
export const checkRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = (req as any).user?.role;
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({
        message: 'Access forbidden: Insufficient permissions'
      });
    }
    next();
  };
};
