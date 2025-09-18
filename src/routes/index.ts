import express from 'express';
import authRoutes from './auth';
import taskRoutes from './tasks'; 

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes); 

export default router;