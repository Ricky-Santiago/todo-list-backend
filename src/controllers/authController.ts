import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../database/config';
import { RegisterRequest, LoginRequest } from '../types';

// Registrar nuevo usuario
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, first_name, last_name }: RegisterRequest = req.body;

    
    if (!email || !password || !first_name || !last_name) {
      res.status(400).json({ message: 'Todos los campos son requeridos' });
      return;
    }

    
    const existingUsers = await query('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUsers.length > 0) {
      res.status(400).json({ message: 'El usuario ya existe' });
      return;
    }

    
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    
    const result: any = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES (?, ?, ?, ?)',
      [email, password_hash, first_name, last_name]
    );

    
    const jwtSecret = process.env.JWT_SECRET ?? '';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN ?? '';

    
    if (!jwtSecret || !jwtExpiresIn) {
      console.error('Error: Variables JWT no configuradas en .env');
      res.status(500).json({ message: 'Error de configuración del servidor' });
      return;
    }

    
    const jwtPayload = {
      userId: Number(result.insertId), 
      email: email
    };

    
    const token = jwt.sign(jwtPayload, jwtSecret as jwt.Secret, { expiresIn: jwtExpiresIn as jwt.SignOptions['expiresIn'] });

    
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

    
    if (!email || !password) {
      res.status(400).json({ message: 'Email y contraseña son requeridos' });
      return;
    }

    
    const users: any[] = await query('SELECT * FROM users WHERE email = ?', [email]);
    
    if (users.length === 0) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    const user = users[0];

    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ message: 'Credenciales inválidas' });
      return;
    }

    
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

    if (!jwtSecret || !jwtExpiresIn) {
      console.error('Error: Variables JWT no configuradas en .env');
      res.status(500).json({ message: 'Error de configuración del servidor' });
      return;
    }

    const jwtPayload = {
      userId: Number(user.id), 
      email: user.email
    };

    const token = jwt.sign(jwtPayload, jwtSecret as jwt.Secret, { expiresIn: jwtExpiresIn as jwt.SignOptions['expiresIn'] });

    
    const { password_hash: _, ...userWithoutPassword } = user;

    
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