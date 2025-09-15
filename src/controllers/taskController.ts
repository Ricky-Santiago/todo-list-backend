import { Request, Response } from "express";
import { z } from "zod";
import { AppDataSource } from "../database/config";
import { Task } from "../models/Task";


const CreateTaskSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  due_date: z.string().optional().transform(val => val ? new Date(val) : undefined),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});


export const getTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user.userId;
    const taskRepository = AppDataSource.getRepository(Task);
    
    const tasks = await taskRepository.find({
      where: { user_id: userId },
      order: { created_at: 'DESC' }
    });

    res.json(tasks);
  } catch (error) {
    console.error('Error obteniendo tareas:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = CreateTaskSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(err => err.message); 
      res.status(400).json({ 
        message: "Datos de entrada inválidos",
        errors: errorMessages 
      });
      return;
    }

    const { title, description, due_date, priority } = validationResult.data;
    const userId = (req as any).user.userId;

    const taskRepository = AppDataSource.getRepository(Task);
    
    const newTask = taskRepository.create({
      title,
      description,
      due_date,
      priority,
      user_id: userId
    });

    const savedTask = await taskRepository.save(newTask);

    res.status(201).json({
      message: "Tarea creada exitosamente",
      task: savedTask
    });
  } catch (error) {
    console.error('Error creando tarea:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};