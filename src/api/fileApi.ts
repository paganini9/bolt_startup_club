import { ApiResponse } from '../types/api';
import { FileCategory, PresignedUrlResponse, UploadedFile } from '../types/file';
import { delay } from '../mocks/delay';

// TODO: 실제 API 연결 시 아래 코드로 교체
// import apiClient from './client';

let fileIdCounter = 1;

export const fileApi = {
  getPresignedUrl: async (
    fileName: string,
    _category: FileCategory
  ): Promise<ApiResponse<PresignedUrlResponse>> => {
    await delay(200);

    // TODO: 실제 API 연결 시 아래 코드로 교체
    // const response = await apiClient.post<ApiResponse<PresignedUrlResponse>>('/files/presigned-url', { fileName, category });
    // return response.data;

    return {
      success: true,
      data: {
        uploadUrl: `https://mock-s3.example.com/upload/${fileName}`,
        fileKey: `uploads/${Date.now()}/${fileName}`,
      },
    };
  },

  uploadFile: async (file: File, category: FileCategory): Promise<ApiResponse<UploadedFile>> => {
    await delay(800);

    // TODO: 실제 API 연결 시 아래 코드로 교체
    // const presigned = await fileApi.getPresignedUrl(file.name, category);
    // await fetch(presigned.data.uploadUrl, { method: 'PUT', body: file });
    // const response = await apiClient.post<ApiResponse<UploadedFile>>('/files/confirm', { fileKey: presigned.data.fileKey, originalName: file.name, ... });
    // return response.data;

    const isImage = file.type.startsWith('image/');
    const mockUrl = isImage
      ? URL.createObjectURL(file)
      : `https://mock-storage.example.com/${file.name}`;

    const uploaded: UploadedFile = {
      id: fileIdCounter++,
      originalName: file.name,
      s3Key: `uploads/${Date.now()}/${file.name}`,
      url: mockUrl,
      size: file.size,
      mimeType: file.type,
      category,
      uploadedAt: new Date().toISOString(),
    };

    return { success: true, data: uploaded };
  },

  deleteFile: async (fileId: number): Promise<ApiResponse<{ message: string }>> => {
    await delay(300);

    // TODO: 실제 API 연결 시 아래 코드로 교체
    // const response = await apiClient.delete<ApiResponse<{ message: string }>>(`/files/${fileId}`);
    // return response.data;

    return { success: true, data: { message: '파일이 삭제되었습니다.' } };
  },
};
