import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Form,
  Input,
  Button,
  Card,
  Alert,
  Skeleton,
  message,
  Space,
  Typography,
} from 'antd';
import { SaveOutlined, ArrowLeftOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { clubApi } from '../../api/clubApi';
import { ClubUpdateRequest } from '../../types/club';
import PageHeader from '../../components/common/PageHeader';
import FileUploader from '../../components/common/FileUploader';
import { ROUTES, buildRoute } from '../../config/routes';

const StudentClubEditPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clubId = Number(id);
  const [form] = Form.useForm();
  const [nameChanged, setNameChanged] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string | undefined>();

  const { data, isLoading } = useQuery({
    queryKey: ['club', clubId],
    queryFn: () => clubApi.getClubById(clubId),
    enabled: !!clubId,
  });

  const club = data?.data;

  useEffect(() => {
    if (club) {
      form.setFieldsValue({ name: club.name, description: club.description });
      setLogoUrl(club.logoUrl);
    }
  }, [club, form]);

  const updateMutation = useMutation({
    mutationFn: (updateData: ClubUpdateRequest) => clubApi.updateClub(clubId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['club', clubId] });
      message.success('동아리 정보가 저장되었습니다.');
      navigate(buildRoute.studentClubDetail(clubId));
    },
    onError: () => {
      message.error('저장에 실패했습니다. 다시 시도해주세요.');
    },
  });

  const handleSubmit = (values: { name: string; description: string }) => {
    updateMutation.mutate({
      name: values.name,
      description: values.description,
      logoUrl,
    });
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameChanged(e.target.value !== club?.name);
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="동아리 정보 수정" />
        <Card style={{ borderRadius: 12 }}>
          <Skeleton active paragraph={{ rows: 6 }} />
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="동아리 정보 수정"
        breadcrumbs={[
          { label: '대시보드', path: ROUTES.STUDENT_DASHBOARD },
          { label: club?.name ?? '동아리', path: buildRoute.studentClubDetail(clubId) },
          { label: '정보 수정' },
        ]}
      />

      <Card
        style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)', maxWidth: 680 }}
        styles={{ body: { padding: 32 } }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            name="name"
            label="동아리명"
            rules={[{ required: true, message: '동아리명을 입력해주세요.' }]}
          >
            <Input size="large" placeholder="동아리명" onChange={handleNameChange} />
          </Form.Item>

          {nameChanged && (
            <Alert
              icon={<InfoCircleOutlined />}
              message="동아리명 변경은 관리자 승인이 필요합니다"
              description="동아리명을 변경하면 관리자의 승인 후에 적용됩니다. 승인 전까지는 기존 이름이 유지됩니다."
              type="warning"
              showIcon
              style={{ marginBottom: 20 }}
            />
          )}

          <Form.Item
            name="description"
            label="동아리 소개"
            rules={[{ required: true, message: '동아리 소개를 입력해주세요.' }]}
          >
            <Input.TextArea
              rows={5}
              placeholder="동아리를 소개해주세요"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item label="대표 로고 이미지">
            <Typography.Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
              동아리를 대표하는 이미지를 업로드하세요 (PNG, JPG, WEBP — 최대 10MB)
            </Typography.Text>
            <FileUploader
              category="GENERAL"
              multiple={false}
              maxSizeMB={10}
              accept=".jpg,.jpeg,.png,.webp"
              maxCount={1}
              hint="PNG, JPG, WEBP 형식 (최대 10MB)"
              onUploadSuccess={(file) => setLogoUrl(file.url)}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 8, marginBottom: 0 }}>
            <Space size={12}>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SaveOutlined />}
                loading={updateMutation.isPending}
                size="large"
                style={{ borderRadius: 8, minWidth: 120 }}
              >
                저장
              </Button>
              <Button
                size="large"
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate(buildRoute.studentClubDetail(clubId))}
                style={{ borderRadius: 8 }}
              >
                취소
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default StudentClubEditPage;
