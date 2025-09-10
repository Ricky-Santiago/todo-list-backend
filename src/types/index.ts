export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  created_at: Date;
  updated_at: Date;
}


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


export interface RegisterRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
}


export interface LoginRequest {
  email: string;
  password: string;
}


export interface AuthResponse {
  user: Omit<User, 'password_hash'>;
  token: string;
}
export interface JwtPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}