import { Router } from 'express';
import userRoutes from './userRoutes';
import healthRoutes from './healthRoutes';

const router = Router();

router.use('/users', userRoutes);
router.use('/health', healthRoutes);

export default router; 