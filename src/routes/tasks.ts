import express from 'express';
import { getTasks, createTask } from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();


router.use(authenticateToken);


router.get('/', getTasks);


router.post('/', createTask);

export default router;