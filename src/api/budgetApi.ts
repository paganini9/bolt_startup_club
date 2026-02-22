import client from './client';
import type {
  Budget,
  BudgetAssignRequest,
  Expenditure,
  ExpenditureRequest,
  ExpenditureFilters,
  ApprovalRequest,
  InspectionRequest
} from '../types/budget';
import type { ApiResponse } from '../types/api';

const mockBudgets: Budget[] = [
  {
    id: 1,
    clubId: 1,
    clubName: 'AI 연구회',
    totalAmount: 5000000,
    spentAmount: 2500000,
    remaining: 2500000,
    executionRate: 50,
    createdAt: '2024-01-15T00:00:00Z'
  },
  {
    id: 2,
    clubId: 2,
    clubName: '로봇 공학 동아리',
    totalAmount: 8000000,
    spentAmount: 3200000,
    remaining: 4800000,
    executionRate: 40,
    createdAt: '2024-01-15T00:00:00Z'
  }
];

const mockExpenditures: Expenditure[] = [
  {
    id: 1,
    clubId: 1,
    clubName: 'AI 연구회',
    type: 'CASH',
    status: 'PENDING',
    amount: 150000,
    description: 'AI 컨퍼런스 참가비',
    requestedBy: {
      id: 2,
      name: '김철수',
      studentId: '2020001'
    },
    receiptFiles: [
      {
        id: 1,
        originalName: 'receipt.jpg',
        fileUrl: 'https://via.placeholder.com/400x600/4CAF50/FFFFFF?text=Receipt',
        fileSize: 256000,
        mimeType: 'image/jpeg',
        category: 'RECEIPT',
        uploadedAt: '2024-03-10T10:00:00Z'
      }
    ],
    createdAt: '2024-03-10T10:00:00Z',
    updatedAt: '2024-03-10T10:00:00Z'
  },
  {
    id: 2,
    clubId: 1,
    clubName: 'AI 연구회',
    type: 'CARD',
    status: 'APPROVED',
    amount: 450000,
    description: 'GPU 서버 부품 구매',
    purchaseUrl: 'https://example.com/product/12345',
    itemList: [
      { name: 'GTX 3060', quantity: 1, unitPrice: 400000, totalPrice: 400000 },
      { name: '케이블', quantity: 2, unitPrice: 25000, totalPrice: 50000 }
    ],
    inspectionStatus: 'COMPLETED',
    requestedBy: {
      id: 2,
      name: '김철수',
      studentId: '2020001'
    },
    approvedBy: {
      id: 1,
      name: '관리자'
    },
    approvedAt: '2024-03-08T14:30:00Z',
    createdAt: '2024-03-05T09:00:00Z',
    updatedAt: '2024-03-08T14:30:00Z'
  },
  {
    id: 3,
    clubId: 2,
    clubName: '로봇 공학 동아리',
    type: 'OUTSOURCE',
    status: 'REJECTED',
    amount: 800000,
    description: '로봇 외장 제작 의뢰',
    rejectionReason: '예산 초과로 인해 반려되었습니다. 금액 조정 후 재신청 바랍니다.',
    requestedBy: {
      id: 3,
      name: '이영희',
      studentId: '2020002'
    },
    createdAt: '2024-03-01T11:00:00Z',
    updatedAt: '2024-03-02T16:00:00Z'
  }
];

export const budgetApi = {
  getAllBudgets: async (): Promise<ApiResponse<Budget[]>> => {
    try {
      const response = await client.get<ApiResponse<Budget[]>>('/api/budgets/');
      return response.data;
    } catch (error) {
      console.warn('API not connected, using mock data');
      return {
        success: true,
        data: mockBudgets,
        message: 'Mock data'
      };
    }
  },

  getBudgetByClub: async (clubId: number): Promise<ApiResponse<Budget>> => {
    try {
      const response = await client.get<ApiResponse<Budget>>(`/api/budgets/club/${clubId}/`);
      return response.data;
    } catch (error) {
      console.warn('API not connected, using mock data');
      const budget = mockBudgets.find(b => b.clubId === clubId);
      if (!budget) {
        return {
          success: false,
          message: 'Budget not found'
        };
      }
      return {
        success: true,
        data: budget,
        message: 'Mock data'
      };
    }
  },

  assignBudget: async (data: BudgetAssignRequest): Promise<ApiResponse<Budget>> => {
    try {
      const response = await client.post<ApiResponse<Budget>>('/api/budgets/', data);
      return response.data;
    } catch (error) {
      console.warn('API not connected, simulating success');
      return {
        success: true,
        data: {
          id: Date.now(),
          clubId: data.clubId,
          clubName: '동아리',
          totalAmount: data.totalAmount,
          spentAmount: 0,
          remaining: data.totalAmount,
          executionRate: 0,
          createdAt: new Date().toISOString()
        },
        message: 'Mock creation'
      };
    }
  },

  updateBudget: async (id: number, data: Partial<BudgetAssignRequest>): Promise<ApiResponse<Budget>> => {
    try {
      const response = await client.patch<ApiResponse<Budget>>(`/api/budgets/${id}/`, data);
      return response.data;
    } catch (error) {
      console.warn('API not connected, simulating success');
      return {
        success: true,
        message: 'Mock update'
      };
    }
  },

  getExpenditures: async (filters?: ExpenditureFilters): Promise<ApiResponse<Expenditure[]>> => {
    try {
      const response = await client.get<ApiResponse<Expenditure[]>>('/api/expenditures/', {
        params: filters
      });
      return response.data;
    } catch (error) {
      console.warn('API not connected, using mock data');
      let filtered = [...mockExpenditures];

      if (filters?.clubId) {
        filtered = filtered.filter(e => e.clubId === filters.clubId);
      }
      if (filters?.status) {
        filtered = filtered.filter(e => e.status === filters.status);
      }
      if (filters?.type) {
        filtered = filtered.filter(e => e.type === filters.type);
      }

      return {
        success: true,
        data: filtered,
        message: 'Mock data'
      };
    }
  },

  getExpenditureById: async (id: number): Promise<ApiResponse<Expenditure>> => {
    try {
      const response = await client.get<ApiResponse<Expenditure>>(`/api/expenditures/${id}/`);
      return response.data;
    } catch (error) {
      console.warn('API not connected, using mock data');
      const expenditure = mockExpenditures.find(e => e.id === id);
      if (!expenditure) {
        return {
          success: false,
          message: 'Expenditure not found'
        };
      }
      return {
        success: true,
        data: expenditure,
        message: 'Mock data'
      };
    }
  },

  createExpenditure: async (data: ExpenditureRequest): Promise<ApiResponse<Expenditure>> => {
    try {
      const response = await client.post<ApiResponse<Expenditure>>('/api/expenditures/', data);
      return response.data;
    } catch (error) {
      console.warn('API not connected, simulating success');
      return {
        success: true,
        data: {
          id: Date.now(),
          clubId: data.clubId,
          clubName: '동아리',
          type: data.type,
          status: 'PENDING',
          amount: data.amount,
          description: data.description,
          requestedBy: {
            id: 1,
            name: '사용자',
            studentId: '2020001'
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        message: 'Mock creation'
      };
    }
  },

  updateExpenditure: async (id: number, data: Partial<ExpenditureRequest>): Promise<ApiResponse<Expenditure>> => {
    try {
      const response = await client.patch<ApiResponse<Expenditure>>(`/api/expenditures/${id}/`, data);
      return response.data;
    } catch (error) {
      console.warn('API not connected, simulating success');
      return {
        success: true,
        message: 'Mock update'
      };
    }
  },

  approveExpenditure: async (id: number, data: ApprovalRequest): Promise<ApiResponse<Expenditure>> => {
    try {
      const response = await client.post<ApiResponse<Expenditure>>(`/api/expenditures/${id}/approve/`, data);
      return response.data;
    } catch (error) {
      console.warn('API not connected, simulating success');
      return {
        success: true,
        message: 'Mock approval'
      };
    }
  },

  submitInspection: async (id: number, data: InspectionRequest): Promise<ApiResponse<Expenditure>> => {
    try {
      const response = await client.post<ApiResponse<Expenditure>>(`/api/expenditures/${id}/inspect/`, data);
      return response.data;
    } catch (error) {
      console.warn('API not connected, simulating success');
      return {
        success: true,
        message: 'Mock inspection'
      };
    }
  },

  exportToExcel: async (filters?: ExpenditureFilters): Promise<Blob> => {
    try {
      const response = await client.get('/api/expenditures/export/excel/', {
        params: filters,
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      console.warn('API not connected, returning empty blob');
      return new Blob(['Mock Excel Data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }
  }
};
