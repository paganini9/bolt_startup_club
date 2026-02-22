import { ApiResponse } from '../types/api';
import { FileCategory, PresignedUrlResponse, UploadedFile } from '../types/file';
import apiClient from './client';

export const fileApi = {
  getPresignedUrl: async (
    fileName: string,
    category: FileCategory
  ): Promise<ApiResponse<PresignedUrlResponse>> => {
    const response = await apiClient.post<ApiResponse<PresignedUrlResponse>>('/files/presigned-url/', { fileName, category });
    return response.data;
  },

  uploadFile: async (file: File, category: FileCategory): Promise<ApiResponse<UploadedFile>> => {
    const presigned = await fileApi.getPresignedUrl(file.name, category);
    // Upload to the storage (presigned URL)
    await fetch(presigned.data.uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });

    const response = await apiClient.post<ApiResponse<UploadedFile>>('/files/confirm/', {
      fileKey: presigned.data.fileKey,
      originalName: file.name,
      size: file.size,
      mimeType: file.type,
      category,
    });

    return response.data;
  },

  deleteFile: async (fileId: number): Promise<ApiResponse<{ message: string }>> => {
    const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/files/${fileId}/`);
    return response.data;
  },
};
