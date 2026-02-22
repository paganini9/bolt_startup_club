import { ApiResponse } from '../types/api';
import { LoginRequest, LoginResponse, RegisterRequest } from '../types/user';
import { mockUsers } from '../mocks/users';
import { delay } from '../mocks/delay';

// TODO: 실제 API 연결 시 아래 코드로 교체
// import apiClient from './client';

export const authApi = {
  login: async (data: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
    await delay(600);

    // TODO: 실제 API 연결 시 아래 코드로 교체
    // const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
    // return response.data;

    const user = mockUsers.find(
      (u) => u.email === data.email && u.password === data.password
    );

    if (!user) {
      throw new Error('이메일 또는 비밀번호가 올바르지 않습니다.');
    }

    const { password: _password, ...userWithoutPassword } = user;

    return {
      success: true,
      data: {
        accessToken: `mock-access-token-${user.id}-${Date.now()}`,
        refreshToken: `mock-refresh-token-${user.id}-${Date.now()}`,
        user: userWithoutPassword,
      },
    };
  },

  register: async (data: RegisterRequest): Promise<ApiResponse<{ message: string }>> => {
    await delay(700);

    // TODO: 실제 API 연결 시 아래 코드로 교체
    // const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/register', data);
    // return response.data;

    const exists = mockUsers.find((u) => u.email === data.email);
    if (exists) {
      throw new Error('이미 사용 중인 이메일입니다.');
    }

    return {
      success: true,
      data: { message: '회원가입이 완료되었습니다.' },
    };
  },

  forgotPassword: async (email: string): Promise<ApiResponse<{ message: string }>> => {
    await delay(500);

    // TODO: 실제 API 연결 시 아래 코드로 교체
    // const response = await apiClient.post<ApiResponse<{ message: string }>>('/auth/forgot-password', { email });
    // return response.data;

    return {
      success: true,
      data: { message: `${email}로 비밀번호 재설정 링크를 전송했습니다.` },
    };
  },

  refreshToken: async (refreshToken: string): Promise<ApiResponse<{ accessToken: string }>> => {
    await delay(300);

    // TODO: 실제 API 연결 시 아래 코드로 교체
    // const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', { refreshToken });
    // return response.data;

    return {
      success: true,
      data: { accessToken: `mock-refreshed-token-${Date.now()}` },
    };
  },
};
