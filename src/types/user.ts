export type UserRole = 'STUDENT' | 'LEADER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  studentId: string;
  email: string;
  role: UserRole;
  phone?: string;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RegisterRequest {
  name: string;
  studentId: string;
  email: string;
  password: string;
  role: 'STUDENT' | 'ADMIN';
}
