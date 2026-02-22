import { ApiResponse, PageResponse } from '../types/api';
import { Club, ClubUpdateRequest } from '../types/club';
import apiClient from './client';

export const clubApi = {
  getClubs: async (params?: {
    page?: number;
    size?: number;
    keyword?: string;
  }): Promise<ApiResponse<PageResponse<Club>>> => {
    // Frontend uses 0-based pages; backend pagination is 1-based.
    const requestParams: Record<string, any> = { ...(params || {}) };
    if (typeof params?.page === 'number') {
      requestParams.page = params!.page + 1;
    }
    const response = await apiClient.get<ApiResponse<PageResponse<Club>>>('/clubs/', { params: requestParams });
    return response.data;
  },

  getClubById: async (id: number): Promise<ApiResponse<Club>> => {
    const response = await apiClient.get<ApiResponse<Club>>(`/clubs/${id}/`);
    return response.data;
  },

  updateClub: async (id: number, data: ClubUpdateRequest): Promise<ApiResponse<Club>> => {
    const response = await apiClient.put<ApiResponse<Club>>(`/clubs/${id}/`, data);
    return response.data;
  },

  approveNameChange: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/clubs/${id}/approve-name/`);
    return response.data;
  },

  rejectNameChange: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.post<ApiResponse<{ message: string }>>(`/clubs/${id}/reject-name/`);
    return response.data;
  },
};
