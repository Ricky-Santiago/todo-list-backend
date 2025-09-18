import express from 'express';
import { getTasks, createTask,getTask,updateTask,partialUpdateTask,deleteTask,toggleTask  } from '../controllers/taskController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();


router.use(authenticateToken);

router.get('/', getTasks);
router.get('/:id', getTask);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id', partialUpdateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTask);


export default router;