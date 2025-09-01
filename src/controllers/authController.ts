import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../database/config';
import { RegisterRequest, LoginRequest } from '../types';

// Registrar nuevo usuario
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, first_name, last_name }: RegisterRequest = req.body;

    // 1. Validar que todos los campos estén presentes
    if (!email || !password || !first_name || !last_name) {
      res.status(400).json({ message: 'Todos los campos son requeridos' });
      return;
    }

    // 2. Verificar si el usuario ya existe
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      res.status(400).json({ message: 'El usuario ya existe' });
      return;
    }

    // 3. Hashear la contraseña
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 4. Insertar usuario en la base de datos
    const result: any = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
      [email, password_hash, first_name, last_name]
    );

    // 5. VERIFICACIÓN Y GENERACIÓN DE TOKEN (VERSIÓN SEGURA)
    const jwtSecret = process.env.JWT_SECRET ?? '';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '';

    // Validar que las variables de entorno existan
    if (!jwtSecret || !jwtExpiresIn) {
      console.error('Error: Variables JWT no configuradas en .env');
      res.status(500).json({ message: 'Error de configuración del servidor' });
      return;
    }

    // Crear payload seguro
    const jwtPayload = {
      userId: Number(result.insertId), // Aseguramos que sea número
      email: email
    };

    // Generar token
    const token = jwt.sign(jwtPayload, jwtSecret as jwt.Secret, { expiresIn: jwtExpiresIn as jwt.SignOptions['expiresIn'] });

    // 6. Responder con éxito
    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        id: result.insertId,
        email,
        first_name,
        last_name
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Login de usuario
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    // 1. Validar campos
    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son requeridos' });
      return;
    }

    // 2. Buscar usuario en la base de datos
    const users: any[] = await query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    const user = users[0];

    // 3. Verificar contraseña
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    // 4. VERIFICACIÓN Y GENERACIÓN DE TOKEN PARA LOGIN
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

    if (!jwtSecret || !jwtExpiresIn) {
      console.error('Error: Variables JWT no configuradas en .env');
      res.status(500).json({ message: 'Error de configuración del servidor' });
      return;
    }

    const jwtPayload = {
      userId: Number(user.id), // Aseguramos que sea número
      email: user.email
    };

    const token = jwt.sign(jwtPayload, jwtSecret as jwt.Secret, { expiresIn: jwtExpiresIn as jwt.SignOptions['expiresIn'] });

    // 5. Eliminar password_hash de la respuesta
    const { password_hash: _, ...userWithoutPassword } = user;

    // 6. Responder con éxito
    res.json({
      message: 'Login exitoso',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};