import client from './client';
import type { Notification } from '../types/notification';
import type { ApiResponse } from '../types/api';

const mockNotifications: Notification[] = [
  {
    id: 1,
    message: '사업비 집행 요청이 승인되었습니다.',
    link: '/student/expenditures/2',
    isRead: false,
    createdAt: '2024-03-10T14:30:00Z'
  },
  {
    id: 2,
    message: '사업비 집행 요청이 반려되었습니다. 사유를 확인해주세요.',
    link: '/student/expenditures/3',
    isRead: false,
    createdAt: '2024-03-09T16:00:00Z'
  },
  {
    id: 3,
    message: '새로운 동아리 가입 신청이 있습니다.',
    link: '/admin/clubs/1',
    isRead: true,
    createdAt: '2024-03-08T11:20:00Z'
  },
  {
    id: 4,
    message: '2024년 1분기 예산이 배정되었습니다.',
    link: '/student/expenditures',
    isRead: true,
    createdAt: '2024-03-01T09:00:00Z'
  },
  {
    id: 5,
    message: '동아리 정보가 업데이트되었습니다.',
    link: '/student/club/edit',
    isRead: true,
    createdAt: '2024-02-28T13:45:00Z'
  }
];

export const notificationApi = {
  getNotifications: async (): Promise<ApiResponse<Notification[]>> => {
    try {
      const response = await client.get<ApiResponse<Notification[]>>('/api/notifications/');
      return response.data;
    } catch (error) {
      console.warn('API not connected, using mock data');
      return {
        success: true,
        data: mockNotifications,
        message: 'Mock data'
      };
    }
  },

  markAsRead: async (id: number): Promise<ApiResponse<Notification>> => {
    try {
      const response = await client.patch<ApiResponse<Notification>>(`/api/notifications/${id}/read/`);
      return response.data;
    } catch (error) {
      console.warn('API not connected, simulating success');
      return {
        success: true,
        message: 'Mock mark as read'
      };
    }
  },

  markAllAsRead: async (): Promise<ApiResponse<void>> => {
    try {
      const response = await client.post<ApiResponse<void>>('/api/notifications/read-all/');
      return response.data;
    } catch (error) {
      console.warn('API not connected, simulating success');
      return {
        success: true,
        message: 'Mock mark all as read'
      };
    }
  },

  getUnreadCount: async (): Promise<ApiResponse<{ count: number }>> => {
    try {
      const response = await client.get<ApiResponse<{ count: number }>>('/api/notifications/unread-count/');
      return response.data;
    } catch (error) {
      console.warn('API not connected, using mock data');
      const unreadCount = mockNotifications.filter(n => !n.isRead).length;
      return {
        success: true,
        data: { count: unreadCount },
        message: 'Mock data'
      };
    }
  }
};
