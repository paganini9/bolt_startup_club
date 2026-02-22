import React, { useState } from 'react';
import { Upload, message, Typography, Image } from 'antd';
import { InboxOutlined, FileOutlined, DeleteOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import { FileCategory, UploadedFile } from '../../types/file';
import { fileApi } from '../../api/fileApi';

const { Dragger } = Upload;

interface FileUploaderProps {
  category?: FileCategory;
  multiple?: boolean;
  maxSizeMB?: number;
  accept?: string;
  maxCount?: number;
  onUploadSuccess?: (file: UploadedFile) => void;
  onUploadError?: (error: Error) => void;
  onRemove?: (fileId: number) => void;
  hint?: string;
}

interface UploadedPreview extends UploadedFile {
  previewUrl?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  category = 'GENERAL',
  multiple = true,
  maxSizeMB = 10,
  accept,
  maxCount,
  onUploadSuccess,
  onUploadError,
  hint,
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedPreview[]>([]);
  const [uploading, setUploading] = useState(false);

  const beforeUpload = (file: RcFile): boolean => {
    const maxBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxBytes) {
      message.error(`파일 크기는 ${maxSizeMB}MB를 초과할 수 없습니다.`);
      return false;
    }
    if (maxCount && uploadedFiles.length >= maxCount) {
      message.error(`최대 ${maxCount}개의 파일만 업로드할 수 있습니다.`);
      return false;
    }
    return true;
  };

  const customRequest = async ({ file }: { file: RcFile | string | Blob }) => {
    if (!(file instanceof File)) return;
    setUploading(true);
    try {
      const result = await fileApi.uploadFile(file as File, category);
      const uploaded = result.data;
      const isImage = file.type.startsWith('image/');
      const previewUrl = isImage ? URL.createObjectURL(file as File) : undefined;
      setUploadedFiles((prev) => [...prev, { ...uploaded, previewUrl }]);
      onUploadSuccess?.(uploaded);
      message.success(`${file.name} 업로드 완료`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('업로드 실패');
      onUploadError?.(err);
      message.error(`${(file as File).name} 업로드에 실패했습니다.`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (fileId: number) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  const dummyFileList: UploadFile[] = [];

  return (
    <div>
      <Dragger
        name="file"
        multiple={multiple}
        accept={accept}
        fileList={dummyFileList}
        beforeUpload={beforeUpload}
        customRequest={customRequest as never}
        showUploadList={false}
        disabled={uploading}
        style={{ padding: '16px 0' }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: 40, color: '#1677FF' }} />
        </p>
        <p className="ant-upload-text" style={{ fontSize: 15, fontWeight: 500 }}>
          파일을 이곳에 드래그하거나 클릭하여 업로드하세요
        </p>
        <p className="ant-upload-hint" style={{ color: '#8c8c8c' }}>
          {hint || `최대 ${maxSizeMB}MB ${multiple ? '• 다중 파일 지원' : ''}`}
        </p>
      </Dragger>

      {uploadedFiles.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Typography.Text strong style={{ fontSize: 13, marginBottom: 8, display: 'block' }}>
            업로드된 파일 ({uploadedFiles.length}개)
          </Typography.Text>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {uploadedFiles.map((file) => (
              <div
                key={file.id}
                style={{
                  position: 'relative',
                  border: '1px solid #d9d9d9',
                  borderRadius: 8,
                  overflow: 'hidden',
                  background: '#fafafa',
                }}
              >
                {file.previewUrl ? (
                  <div style={{ width: 100, height: 100 }}>
                    <Image
                      src={file.previewUrl}
                      alt={file.originalName}
                      width={100}
                      height={100}
                      style={{ objectFit: 'cover' }}
                      preview={{ src: file.previewUrl }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      width: 100,
                      height: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                    }}
                  >
                    <FileOutlined style={{ fontSize: 28, color: '#1677FF' }} />
                    <Typography.Text
                      style={{
                        fontSize: 11,
                        textAlign: 'center',
                        padding: '0 6px',
                        wordBreak: 'break-all',
                        maxWidth: 90,
                        color: '#595959',
                      }}
                      ellipsis
                    >
                      {file.originalName}
                    </Typography.Text>
                  </div>
                )}
                <button
                  onClick={() => handleRemove(file.id)}
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    background: 'rgba(0,0,0,0.55)',
                    border: 'none',
                    borderRadius: '50%',
                    width: 22,
                    height: 22,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff',
                  }}
                >
                  <DeleteOutlined style={{ fontSize: 11 }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
