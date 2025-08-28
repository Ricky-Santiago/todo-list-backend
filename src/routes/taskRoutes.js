const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask
} = require('../controllers/taskController');

const router = express.Router();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// Rutas de tareas
router.get('/', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.patch('/:id/toggle', toggleTask);

module.exports = router;