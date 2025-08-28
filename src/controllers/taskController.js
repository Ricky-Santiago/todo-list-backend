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

// Actualizar tarea
const updateTask = async (req, res) => {
  try {
    const taskId = req.params.id;
    const updates = req.body;

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
    await Task.toggleComplete(taskId);
    const updatedTask = await Task.findById(taskId);
    res.json(updatedTask);
  } catch (error) {
    console.error('Error cambiando estado de tarea:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTask
};