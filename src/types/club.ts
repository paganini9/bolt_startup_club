export type ClubPhase = 'RECRUITING' | 'SELECTED' | 'OPERATING' | 'COMPLETED';
export type MemberRole = 'LEADER' | 'MEMBER';

export interface ClubMember {
  userId: number;
  name: string;
  studentId: string;
  email: string;
  phone?: string;
  role: MemberRole;
  joinedAt: string;
}

export interface BudgetSummary {
  total: number;
  spent: number;
  remaining: number;
  executionRate: number;
}

export interface Club {
  id: number;
  name: string;
  description: string;
  logoUrl?: string;
  phase: ClubPhase;
  members: ClubMember[];
  budget?: BudgetSummary;
  createdAt: string;
}

export interface ClubUpdateRequest {
  name?: string;
  description?: string;
  logoUrl?: string;
}
