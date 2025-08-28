const db = require('../database/db');

class Task {
  // Crear nueva tarea
  static async create(taskData) {
    const { user_id, title, description, due_date, priority } = taskData;
    
    const query = `
      INSERT INTO tasks (user_id, title, description, due_date, priority) 
      VALUES (?, ?, ?, ?, ?)
    `;
    
    return new Promise((resolve, reject) => {
      db.execute(query, [user_id, title, description, due_date, priority], 
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  // Obtener todas las tareas de un usuario
  static async findByUserId(userId) {
    const query = 'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC';
    
    return new Promise((resolve, reject) => {
      db.execute(query, [userId], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });
  }

  // Obtener tarea por ID
  static async findById(taskId) {
    const query = 'SELECT * FROM tasks WHERE id = ?';
    
    return new Promise((resolve, reject) => {
      db.execute(query, [taskId], (error, results) => {
        if (error) reject(error);
        resolve(results[0]);
      });
    });
  }

  // Actualizar tarea
  static async update(taskId, updates) {
    const { title, description, is_completed, due_date, priority } = updates;
    
    const query = `
      UPDATE tasks 
      SET title = ?, description = ?, is_completed = ?, due_date = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `;
    
    return new Promise((resolve, reject) => {
      db.execute(query, [title, description, is_completed, due_date, priority, taskId], 
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  // Eliminar tarea
  static async delete(taskId) {
    const query = 'DELETE FROM tasks WHERE id = ?';
    
    return new Promise((resolve, reject) => {
      db.execute(query, [taskId], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });
  }

  // Cambiar estado de completado
  static async toggleComplete(taskId) {
    const query = 'UPDATE tasks SET is_completed = NOT is_completed WHERE id = ?';
    
    return new Promise((resolve, reject) => {
      db.execute(query, [taskId], (error, results) => {
        if (error) reject(error);
        resolve(results);
      });
    });
  }
}

module.exports = Task;