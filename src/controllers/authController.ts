import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt, { Secret } from "jsonwebtoken";
import { AppDataSource } from "../database/config";
import { User } from "../models/User";
import { RegisterRequest, LoginRequest } from "../types";


export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, first_name, last_name }: RegisterRequest =
      req.body;

    if (!email || !password || !first_name || !last_name) {
      res.status(400).json({ message: "Todos los campos son requeridos" });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);

    
    const existingUser = await userRepository.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "El usuario ya existe" });
      return;
    }

    
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    
    const newUser = userRepository.create({
      email,
      password_hash,
      first_name,
      last_name,
    });

    const savedUser = await userRepository.save(newUser);

    
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

    if (!jwtSecret) {
      console.error("Error: JWT_SECRET no configurado en .env");
      res.status(500).json({ message: "Error de configuración del servidor" });
      return;
    }

    if (!jwtExpiresIn) {
      console.error("Error: JWT_EXPIRES_IN no configurado en .env");
      res.status(500).json({ message: "Error de configuración del servidor" });
      return;
    }

    const jwtPayload = {
      userId: savedUser.id,
      email: savedUser.email,
    };

    const token = jwt.sign(
      jwtPayload as object,
      jwtSecret as Secret,
      { expiresIn: jwtExpiresIn } as jwt.SignOptions
    );

    res.status(201).json({
      message: "Usuario registrado exitosamente",
      token,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        first_name: savedUser.first_name,
        last_name: savedUser.last_name,
      },
    });
  } catch (error) {
    console.error("Error en registro:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginRequest = req.body;

    if (!email || !password) {
      res.status(400).json({ message: "Email y contraseña son requeridos" });
      return;
    }

    const userRepository = AppDataSource.getRepository(User);

    
    const user = await userRepository.findOne({
      where: { email },
      select: ["id", "email", "password_hash", "first_name", "last_name"],
    });

    if (!user) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

    
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      res.status(401).json({ message: "Credenciales inválidas" });
      return;
    }

   
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN;

    if (!jwtSecret) {
      console.error("Error: JWT_SECRET no configurado en .env");
      res.status(500).json({ message: "Error de configuración del servidor" });
      return;
    }

    if (!jwtExpiresIn) {
      console.error("Error: JWT_EXPIRES_IN no configurado en .env");
      res.status(500).json({ message: "Error de configuración del servidor" });
      return;
    }

    const jwtPayload = {
      userId: user.id,
      email: user.email,
    };

    const token = jwt.sign(
      jwtPayload as object,
      jwtSecret as Secret,
      { expiresIn: jwtExpiresIn } as jwt.SignOptions
    );

    
    const { password_hash: _, ...userWithoutPassword } = user;

    res.json({
      message: "Login exitoso",
      token,
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Error en login:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const logout = (req: Request, res: Response): void => {
  res.status(200).json({ message: "Logout exitoso" });
};


export const getProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: (req as any).user.userId },
      select: ["id", "email", "first_name", "last_name", "created_at"],
    });

    if (!user) {
      res.status(404).json({ message: "Usuario no encontrado" });
      return;
    }

    res.json(user);
  } catch (error) {
    console.error("Error obteniendo perfil:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};


export const updateProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { first_name, last_name } = req.body;
    const userId = (req as any).user.userId;

    const userRepository = AppDataSource.getRepository(User);
    await userRepository.update(userId, {
      first_name,
      last_name,
    });

    const updatedUser = await userRepository.findOne({
      where: { id: userId },
      select: ["id", "email", "first_name", "last_name", "created_at"],
    });

    res.json({
      message: "Perfil actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error actualizando perfil:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};
