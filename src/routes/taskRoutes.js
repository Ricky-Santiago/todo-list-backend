const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getTasks,
  createTask,
  getTask,
  updateTask,
  deleteTask,
  toggleTask,
  getStats
} = require('../controllers/taskController');

const router = express.Router();

// TODAS las rutas requieren autenticación JWT
router.use(authenticateToken);

// GET /api/tasks - Listar todas las tareas del usuario
router.get('/', getTasks);

// POST /api/tasks - Crear nueva tarea
router.post('/', createTask);

// GET /api/tasks/:id - Obtener tarea específica
router.get('/:id', getTask);

// PUT /api/tasks/:id - Actualizar tarea completa
router.put('/:id', updateTask);

// DELETE /api/tasks/:id - Eliminar tarea
router.delete('/:id', deleteTask);

// PATCH /api/tasks/:id/toggle - Cambiar estado completado
router.patch('/:id/toggle', toggleTask);

// GET /api/tasks/stats - Obtener estadísticas (EXTRA útil)
router.get('/stats/stats', getStats);

module.exports = router;