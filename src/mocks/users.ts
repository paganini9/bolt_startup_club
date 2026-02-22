import { User } from '../types/user';

export interface MockUser extends User {
  password: string;
}

export const mockUsers: MockUser[] = [
  {
    id: 1,
    name: '김학생',
    studentId: '20210001',
    email: 'student@test.com',
    password: 'password123',
    role: 'STUDENT',
    phone: '010-1111-2222',
    createdAt: '2024-03-01T09:00:00Z',
  },
  {
    id: 2,
    name: '이팀장',
    studentId: '20200005',
    email: 'leader@test.com',
    password: 'password123',
    role: 'LEADER',
    phone: '010-3333-4444',
    createdAt: '2024-03-01T09:00:00Z',
  },
  {
    id: 3,
    name: '박관리자',
    studentId: 'ADMIN001',
    email: 'admin@test.com',
    password: 'password123',
    role: 'ADMIN',
    phone: '02-000-0000',
    createdAt: '2024-01-01T09:00:00Z',
  },
];
