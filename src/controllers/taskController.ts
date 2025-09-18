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

// Esquema para actualización completa
const UpdateTaskSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  due_date: z.string().optional().transform(val => val ? new Date(val) : undefined),
  priority: z.enum(['low', 'medium', 'high']),
  is_completed: z.boolean()
});

// Esquema para actualización parcial  
const PartialUpdateTaskSchema = z.object({
  title: z.string().min(1, "El título es requerido").optional(),
  description: z.string().optional(),
  due_date: z.string().optional().transform(val => val ? new Date(val) : undefined),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  is_completed: z.boolean().optional()
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


export const getTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const taskRepository = AppDataSource.getRepository(Task);
    
    const task = await taskRepository.findOne({
      where: { id, user_id: userId }
    });

    if (!task) {
      res.status(404).json({ message: "Tarea no encontrada" });
      return;
    }

    res.json(task);
  } catch (error) {
    console.error('Error obteniendo tarea:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Actualizar tarea completa (PUT)
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = UpdateTaskSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(err => err.message);
      res.status(400).json({ 
        message: "Datos de entrada inválidos",
        errors: errorMessages 
      });
      return;
    }

    const { id } = req.params;
    const userId = (req as any).user.userId;
    const updateData = validationResult.data;

    const taskRepository = AppDataSource.getRepository(Task);
    
    // Verificar que la tarea existe y pertenece al usuario
    const existingTask = await taskRepository.findOne({
      where: { id, user_id: userId }
    });

    if (!existingTask) {
      res.status(404).json({ message: "Tarea no encontrada" });
      return;
    }

    // Actualizar la tarea
    await taskRepository.update(id, {
      ...updateData,
      updated_at: new Date()
    });

    const updatedTask = await taskRepository.findOneBy({ id });

    res.json({
      message: "Tarea actualizada exitosamente",
      task: updatedTask
    });
  } catch (error) {
    console.error('Error actualizando tarea:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};


// Actualización parcial (PATCH)
export const partialUpdateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const validationResult = PartialUpdateTaskSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      const errorMessages = validationResult.error.issues.map(err => err.message);
      res.status(400).json({ 
        message: "Datos de entrada inválidos",
        errors: errorMessages 
      });
      return;
    }

    const { id } = req.params;
    const userId = (req as any).user.userId;
    const updateData = validationResult.data;

    const taskRepository = AppDataSource.getRepository(Task);
    
    // Verificar que la tarea existe y pertenece al usuario
    const existingTask = await taskRepository.findOne({
      where: { id, user_id: userId }
    });

    if (!existingTask) {
      res.status(404).json({ message: "Tarea no encontrada" });
      return;
    }

    // Actualizar solo los campos proporcionados
    await taskRepository.update(id, {
      ...updateData,
      updated_at: new Date()
    });

    const updatedTask = await taskRepository.findOneBy({ id });

    res.json({
      message: "Tarea actualizada exitosamente",
      task: updatedTask
    });
  } catch (error) {
    console.error('Error actualizando tarea:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Eliminar tarea (DELETE)
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const taskRepository = AppDataSource.getRepository(Task);
    
    // Verificar que la tarea existe y pertenece al usuario
    const task = await taskRepository.findOne({
      where: { id, user_id: userId }
    });

    if (!task) {
      res.status(404).json({ message: "Tarea no encontrada" });
      return;
    }

    await taskRepository.delete(id);

    res.json({ message: "Tarea eliminada exitosamente" });
  } catch (error) {
    console.error('Error eliminando tarea:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

// Cambiar estado de completado (TOGGLE)
export const toggleTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.userId;

    const taskRepository = AppDataSource.getRepository(Task);
    
    // Verificar que la tarea existe y pertenece al usuario
    const task = await taskRepository.findOne({
      where: { id, user_id: userId }
    });

    if (!task) {
      res.status(404).json({ message: "Tarea no encontrada" });
      return;
    }

    // Cambiar el estado
    await taskRepository.update(id, {
      is_completed: !task.is_completed,
      updated_at: new Date()
    });

    const updatedTask = await taskRepository.findOneBy({ id });

    res.json({
      message: `Tarea ${updatedTask?.is_completed ? 'completada' : 'pendiente'}`,
      task: updatedTask
    });
  } catch (error) {
    console.error('Error cambiando estado de tarea:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};