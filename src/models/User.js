const db = require('../database/db');
const bcrypt = require('bcryptjs');

class User {
  // Crear nuevo usuario
  static async create(userData) {
    const { email, password, first_name, last_name } = userData;
    
    // Hash de la contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    const query = `
      INSERT INTO users (email, password_hash, first_name, last_name) 
      VALUES (?, ?, ?, ?)
    `;
    
    return new Promise((resolve, reject) => {
      db.execute(query, [email, password_hash, first_name, last_name], 
        (error, results) => {
          if (error) reject(error);
          resolve(results);
        }
      );
    });
  }

  // Buscar usuario por email
  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    
    return new Promise((resolve, reject) => {
      db.execute(query, [email], (error, results) => {
        if (error) reject(error);
        resolve(results[0]); // Devuelve el primer usuario encontrado
      });
    });
  }

  // Buscar usuario por ID
  static async findById(id) {
    const query = 'SELECT * FROM users WHERE id = ?';
    
    return new Promise((resolve, reject) => {
      db.execute(query, [id], (error, results) => {
        if (error) reject(error);
        resolve(results[0]);
      });
    });
  }

  // Verificar contraseña
  static async verifyPassword(plainPassword, hashedPassword) {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}

module.exports = User;