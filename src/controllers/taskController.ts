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


const UpdateTaskSchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  description: z.string().optional(),
  due_date: z.string().optional().transform(val => val ? new Date(val) : undefined),
  priority: z.enum(['low', 'medium', 'high']),
  is_completed: z.boolean()
});

 
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
    const { status, search, priority, due_date } = req.query;
    
    const taskRepository = AppDataSource.getRepository(Task);
    
    let query = taskRepository
      .createQueryBuilder('task')
      .where('task.user_id = :userId', { userId });

    if (status === 'completed') {
      query = query.andWhere('task.is_completed = :isCompleted', { isCompleted: true });
    } else if (status === 'pending') {
      query = query.andWhere('task.is_completed = :isCompleted', { isCompleted: false });
    }

    if (search && typeof search === 'string') {
      query = query.andWhere(
        '(task.title LIKE :search OR task.description LIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (priority && typeof priority === 'string' && ['low', 'medium', 'high'].includes(priority)) {
      query = query.andWhere('task.priority = :priority', { priority });
    }

    if (due_date && typeof due_date === 'string') {
      const dueDate = new Date(due_date);
      if (!isNaN(dueDate.getTime())) {
        query = query.andWhere('DATE(task.due_date) = DATE(:dueDate)', { dueDate });
      }
    }

    query = query.orderBy('task.created_at', 'DESC');

    const tasks = await query.getMany();

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
    
    const existingTask = await taskRepository.findOne({
      where: { id, user_id: userId }
    });

    if (!existingTask) {
      res.status(404).json({ message: "Tarea no encontrada" });
      return;
    }

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
    
    const existingTask = await taskRepository.findOne({
      where: { id, user_id: userId }
    });

    if (!existingTask) {
      res.status(404).json({ message: "Tarea no encontrada" });
      return;
    }

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

export const deleteTask = async (req: Request, res: Response): Promise<void> => {
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

    await taskRepository.delete(id);

    res.json({ message: "Tarea eliminada exitosamente" });
  } catch (error) {
    console.error('Error eliminando tarea:', error);
    res.status(500).json({ message: 'Error interno del servidor' });
  }
};

export const toggleTask = async (req: Request, res: Response): Promise<void> => {
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