import { ApiResponse } from '../types/api';
import { LoginRequest, LoginResponse, RegisterRequest } from '../types/user';
import apiClient from './client';

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    const response = await apiClient.post<ApiResponse<LoginResponse>>('/accounts/login/', data);
    return response.data;
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/accounts/register/', data);
    return response.data;
  },

  forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>('/accounts/forgot-password/', { email });
    return response.data;
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> => {
    const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/accounts/token/refresh/', { refreshToken });
    return response.data;
  },
};
