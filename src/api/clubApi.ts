import { ApiResponse, PageResponse } from '../types/api';
import { Club, ClubUpdateRequest } from '../types/club';
import { mockClubs } from '../mocks/clubs';
import { delay } from '../mocks/delay';

// TODO: 실제 API 연결 시 아래 코드로 교체
// import apiClient from './client';

let clubsData = [...mockClubs];

export const clubApi = {
  getClubs: async (params?: {
    page?: number;
    size?: number;
    keyword?: string;
  }): Promise<ApiResponse<PageResponse<Club>>> => {
    await delay(400);

    // TODO: 실제 API 연결 시 아래 코드로 교체
    // const response = await apiClient.get<ApiResponse<PageResponse<Club>>>('/clubs', { params });
    // return response.data;

    let filtered = [...clubsData];
    if (params?.keyword) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(params.keyword!.toLowerCase())
      );
    }

    const page = params?.page ?? 0;
    const size = params?.size ?? 10;
    const start = page * size;
    const content = filtered.slice(start, start + size);

    return {
      success: true,
      data: {
        content,
        totalElements: filtered.length,
        totalPages: Math.ceil(filtered.length / size),
        page,
        size,
      },
    };
  },

  getClubById: async (id: number): Promise<ApiResponse<Club>> => {
    await delay(300);

    // TODO: 실제 API 연결 시 아래 코드로 교체
    // const response = await apiClient.get<ApiResponse<Club>>(`/clubs/${id}`);
    // return response.data;

    const club = clubsData.find((c) => c.id === id);
    if (!club) throw new Error('동아리를 찾을 수 없습니다.');

    return { success: true, data: club };
  },

  updateClub: async (id: number, data: ClubUpdateRequest): Promise<ApiResponse<Club>> => {
    await delay(500);

    // TODO: 실제 API 연결 시 아래 코드로 교체
    // const response = await apiClient.put<ApiResponse<Club>>(`/clubs/${id}`, data);
    // return response.data;

    const index = clubsData.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('동아리를 찾을 수 없습니다.');

    clubsData[index] = { ...clubsData[index], ...data };
    return { success: true, data: clubsData[index] };
  },

  approveNameChange: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    await delay(400);

    // TODO: 실제 API 연결 시 아래 코드로 교체
    // const response = await apiClient.post<ApiResponse<{ message: string }>>(`/clubs/${id}/approve-name`);
    // return response.data;

    return { success: true, data: { message: '동아리명 변경이 승인되었습니다.' } };
  },

  rejectNameChange: async (id: number): Promise<ApiResponse<{ message: string }>> => {
    await delay(400);

    // TODO: 실제 API 연결 시 아래 코드로 교체
    // const response = await apiClient.post<ApiResponse<{ message: string }>>(`/clubs/${id}/reject-name`);
    // return response.data;

    return { success: true, data: { message: '동아리명 변경이 반려되었습니다.' } };
  },
};
