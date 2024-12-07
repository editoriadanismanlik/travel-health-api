import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { expressCspHeader, INLINE, NONE, SELF } from 'express-csp-header';
import rateLimit from 'express-rate-limit';
import healthRoutes from './routes/health';
import { config } from './config/config';

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CSP Headers
app.use(expressCspHeader({
  directives: {
    'default-src': [SELF],
    'script-src': [SELF, INLINE],
    'style-src': [SELF, INLINE],
    'img-src': [SELF, 'data:', 'https:'],
    'worker-src': [NONE],
    'connect-src': [SELF]
  }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// Routes
app.use('/api', healthRoutes);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Something went wrong!'
  });
});

export default app;
