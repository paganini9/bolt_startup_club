export type FileCategory = 'RECEIPT' | 'REPORT' | 'INSPECTION' | 'ACHIEVEMENT' | 'GENERAL';

export interface UploadedFile {
  id: number;
  originalName: string;
  s3Key: string;
  url: string;
  size: number;
  mimeType: string;
  category: FileCategory;
  uploadedAt: string;
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  fileKey: string;
}
