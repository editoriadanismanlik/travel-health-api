import { Request, Response, NextFunction } from 'express';
import { logger, apiMetrics } from '../config/monitoring';
import { Sentry } from '@sentry/node';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('API Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get('user-agent')
    });

    // Update metrics
    apiMetrics.requestCounter.add(1, {
      method: req.method,
      path: req.path,
      status: res.statusCode.toString()
    });

    apiMetrics.responseTime.record(duration / 1000, {
      method: req.method,
      path: req.path
    });
  });

  next();
};

export const errorMonitoring = (err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Error', {
    error: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method
  });

  // Send error to Sentry
  Sentry.captureException(err);

  next(err);
}; 