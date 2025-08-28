const Task = require('../models/Task');

// Obtener todas las tareas del usuario
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.findByUserId(req.user.userId);
    res.json(tasks);
  } catch (error) {
    console.error('Error obteniendo tareas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener tareas con filtros
const getTasksWithFilters = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      priority: req.query.priority,
      due_date: req.query.due_date,
      search: req.query.search
    };

    const tasks = await Task.findWithFilters(req.user.userId, filters);
    res.json(tasks);
  } catch (error) {
    console.error('Error obteniendo tareas con filtros:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Crear nueva tarea
const createTask = async (req, res) => {
  try {
    const { title, description, due_date, priority } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'El título es requerido' });
    }

    const taskData = {
      user_id: req.user.userId,
      title,
      description: description || '',
      due_date: due_date || null,
      priority: priority || 'medium'
    };

    const result = await Task.create(taskData);
    const newTask = await Task.findById(result.insertId);

    res.status(201).json(newTask);
  } catch (error) {
    console.error('Error creando tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener tarea específica
const getTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const task = await Task.findById(taskId);

    if (!task) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }

    // Verificar que la tarea pertenece al usuario
    if (task.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'No tienes permiso para acceder a esta tarea' });
    }

    res.json(task);
  } catch (error) {
    console.error('Error obteniendo tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Actualizar tarea
const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;

    // Verificar que la tarea existe y pertenece al usuario
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    if (existingTask.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta tarea' });
    }

    await Task.update(taskId, updates);
    const updatedTask = await Task.findById(taskId);

    res.json(updatedTask);
  } catch (error) {
    console.error('Error actualizando tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Eliminar tarea
const deleteTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    // Verificar que la tarea existe y pertenece al usuario
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    if (existingTask.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'No tienes permiso para eliminar esta tarea' });
    }

    await Task.delete(taskId);
    res.json({ message: 'Tarea eliminada exitosamente' });
  } catch (error) {
    console.error('Error eliminando tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Cambiar estado de completado
const toggleTask = async (req, res) => {
  try {
    const taskId = req.params.id;

    // Verificar que la tarea existe y pertenece al usuario
    const existingTask = await Task.findById(taskId);
    if (!existingTask) {
      return res.status(404).json({ error: 'Tarea no encontrada' });
    }
    if (existingTask.user_id !== req.user.userId) {
      return res.status(403).json({ error: 'No tienes permiso para editar esta tarea' });
    }

    await Task.toggleComplete(taskId);
    const updatedTask = await Task.findById(taskId);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error cambiando estado de tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Obtener estadísticas de tareas
const getStats = async (req, res) => {
  try {
    const stats = await Task.getStats(req.user.userId);
    res.json(stats);
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getTasks,
  getTasksWithFilters, // ← FUNCIÓN NUEVA AGREGADA
  createTask,
  getTask,
  updateTask,
  deleteTask,
  toggleTask,
  getStats
};