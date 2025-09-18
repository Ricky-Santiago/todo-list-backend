import express from 'express';
import { getTasks, createTask,getTask  } from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();


router.use(authenticateToken);
router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', createTask);


export default router;