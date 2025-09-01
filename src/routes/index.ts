import express from 'express';
import authRoutes from './auth';

const router = express.Router();

// Todas las rutas de autenticación empiezan con /api/auth
router.use('/auth', authRoutes);

export default router;