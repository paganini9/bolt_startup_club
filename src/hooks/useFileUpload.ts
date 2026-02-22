import { useState } from 'react';
import { message } from 'antd';
import { fileApi } from '../api/fileApi';
import { FileCategory, UploadedFile } from '../types/file';

interface UseFileUploadOptions {
  category?: FileCategory;
  maxSizeMB?: number;
  allowedTypes?: string[];
  onSuccess?: (file: UploadedFile) => void;
  onError?: (error: Error) => void;
}

export const useFileUpload = (options: UseFileUploadOptions = {}) => {
  const {
    category = 'GENERAL',
    maxSizeMB = 10,
    onSuccess,
    onError,
  } = options;

  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const uploadFile = async (file: File): Promise<UploadedFile | null> => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      message.error(`파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`);
      return null;
    }

    setUploading(true);
    try {
      const result = await fileApi.uploadFile(file, category);
      const uploaded = result.data;
      setUploadedFiles((prev) => [...prev, uploaded]);
      onSuccess?.(uploaded);
      message.success(`${file.name} 업로드 완료`);
      return uploaded;
    } catch (error) {
      const err = error instanceof Error ? error : new Error('업로드 실패');
      onError?.(err);
      message.error(`${file.name} 업로드에 실패했습니다.`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (fileId: number) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  return { uploading, uploadedFiles, uploadFile, removeFile };
};
