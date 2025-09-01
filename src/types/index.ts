// Tipos para Usuario
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
}

// Tipos para Tarea
export interface Task {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  is_completed: boolean;
  due_date?: Date;
  priority: 'low' | 'medium' | 'high';
  created_at: Date;
  updated_at: Date;
}

// Tipos para Registro de usuario
export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}

// Tipos para Login de usuario
export interface LoginRequest {
  email: string;
  password: string;
}

// Tipos para Respuesta de autenticación
export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}