import { Router } from 'express';
import authRoutes from './auth';
import jobRoutes from './jobs';
import taskRoutes from './tasks';
import earningRoutes from './earnings';
import analyticsRoutes from './analytics';

const router = Router();

router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/tasks', taskRoutes);
router.use('/earnings', earningRoutes);
router.use('/analytics', analyticsRoutes);

export default router;
