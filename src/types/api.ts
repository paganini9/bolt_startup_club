export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: { code: string; detail: string };
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}
