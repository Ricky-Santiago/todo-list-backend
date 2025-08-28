const express = require('express');
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  getTasks,
  getTasksWithFilters, // ← AGREGAR ESTA IMPORTACIÓN
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

// GET /api/tasks - Con soporte para filtros
router.get('/', (req, res) => {
  if (req.query.status || req.query.search || req.query.priority || req.query.due_date) {
    getTasksWithFilters(req, res); // ← Usar filtros si hay query parameters
  } else {
    getTasks(req, res); // ← Obtener todas si no hay filtros
  }
});

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