const User = require('../models/User');
const jwt = require('jsonwebtoken');
const db = require('../database/db');

// Generar token JWT
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { 
    expiresIn: process.env.JWT_EXPIRES_IN || '7d' 
  });
};

// Registrar nuevo usuario
const register = async (req, res) => {
  try {
    const { email, password, first_name, last_name } = req.body;

    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({ error: 'Todos los campos son requeridos' });
    }

    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const result = await User.create({ email, password, first_name, last_name });
    const newUser = await User.findByEmail(email);

    const token = generateToken(newUser.id);

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son requeridos' });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const isValidPassword = await User.verifyPassword(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Login exitoso',
      token,
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name
      }
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Logout - Invalidar token (simplificado)
const logout = (req, res) => {
  // En una implementación real, podrías agregar el token a una blacklist
  // Para este proyecto, el frontend simplemente eliminará el token
  res.json({ message: 'Logout exitoso' });
};

// Obtener perfil del usuario
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // No devolver la contraseña
    const { password_hash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);

  } catch (error) {
    console.error('Error obteniendo perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};



// Actualizar perfil del usuario - USANDO EL MODELO USER
const updateProfile = async (req, res) => {
  try {
    const { first_name, last_name } = req.body;
    
    if (!first_name || !last_name) {
      return res.status(400).json({ error: 'Nombre y apellido son requeridos' });
    }

    // Actualizar usando una query directa (más simple)
    const query = 'UPDATE users SET first_name = ?, last_name = ? WHERE id = ?';
    
    db.execute(query, [first_name, last_name, req.user.userId], (error, results) => {
      if (error) {
        console.error('Error actualizando perfil:', error);
        return res.status(500).json({ error: 'Error al actualizar en base de datos' });
      }

      // Obtener el usuario actualizado usando el modelo User
      User.findById(req.user.userId)
        .then(updatedUser => {
          if (!updatedUser) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
          }

          const { password_hash, ...userWithoutPassword } = updatedUser;
          res.json({
            message: 'Perfil actualizado exitosamente',
            user: userWithoutPassword
          });
        })
        .catch(err => {
          console.error('Error obteniendo usuario actualizado:', err);
          res.status(500).json({ error: 'Error al obtener datos actualizados' });
        });
    });

  } catch (error) {
    console.error('Error en updateProfile:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { 
  register, 
  login, 
  logout, 
  getProfile, 
  updateProfile 
};