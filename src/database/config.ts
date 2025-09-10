import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Task } from '../models/Task';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'todolist',
  synchronize: false, 
  logging: true,
  entities: [User, Task],
  migrations: [],
  subscribers: [],
});


export const testConnection = async (): Promise<void> => {
  try {
    await AppDataSource.initialize();
    console.log('✅ TypeORM conectado a MySQL correctamente');
  } catch (error) {
    console.error('❌ Error conectando TypeORM a MySQL:', error);
    throw error;
  }
};