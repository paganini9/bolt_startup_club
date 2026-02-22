import { UploadedFile } from './file';

export type ExpenditureType = 'CASH' | 'CARD' | 'OUTSOURCE';
export type ExpenditureStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED';
export type InspectionStatus = 'NOT_REQUIRED' | 'PENDING' | 'COMPLETED';

export interface Budget {
  id: number;
  clubId: number;
  clubName: string;
  totalAmount: number;
  spentAmount: number;
  remaining: number;
  executionRate: number;
  createdAt: string;
}

export interface BudgetAssignRequest {
  clubId: number;
  totalAmount: number;
}

export interface PurchaseItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Expenditure {
  id: number;
  clubId: number;
  clubName: string;
  type: ExpenditureType;
  status: ExpenditureStatus;
  amount: number;
  description: string;
  requestedBy: {
    id: number;
    name: string;
    studentId: string;
  };
  receiptFiles?: UploadedFile[];
  purchaseUrl?: string;
  captureFiles?: UploadedFile[];
  itemList?: PurchaseItem[];
  inspectionStatus?: InspectionStatus;
  inspectionFiles?: UploadedFile[];
  proposalFiles?: UploadedFile[];
  outsourceReportFiles?: UploadedFile[];
  rejectionReason?: string;
  approvedBy?: { id: number; name: string };
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenditureCashRequest {
  clubId: number;
  type: 'CASH';
  amount: number;
  description: string;
  receiptFileIds: number[];
}

export interface ExpenditureCardRequest {
  clubId: number;
  type: 'CARD';
  amount: number;
  description: string;
  purchaseUrl: string;
  captureFileIds: number[];
  itemList: PurchaseItem[];
}

export interface ExpenditureOutsourceRequest {
  clubId: number;
  type: 'OUTSOURCE';
  amount: number;
  description: string;
  proposalFileIds: number[];
}

export type ExpenditureRequest = ExpenditureCashRequest | ExpenditureCardRequest | ExpenditureOutsourceRequest;

export interface ApprovalRequest {
  action: 'APPROVE' | 'REJECT';
  rejectionReason?: string;
}

export interface InspectionRequest {
  inspectionFileIds: number[];
}

export interface ExpenditureFilters {
  clubId?: number;
  status?: ExpenditureStatus;
  type?: ExpenditureType;
  startDate?: string;
  endDate?: string;
}
