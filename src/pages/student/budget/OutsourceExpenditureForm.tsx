import React, { useState } from 'react';
import { Card, Form, InputNumber, Input, Button, message, Modal, Alert } from 'antd';
import { SaveOutlined, SendOutlined, ArrowLeftOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../../components/common/PageHeader';
import FileUploader from '../../../components/common/FileUploader';
import { budgetApi } from '../../../api/budgetApi';
import type { ExpenditureOutsourceRequest } from '../../../types/budget';
import type { UploadedFile } from '../../../types/file';

const { TextArea } = Input;

const OutsourceExpenditureForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const clubId = 1;

  const [proposalFiles, setProposalFiles] = useState<UploadedFile[]>([]);

  const createMutation = useMutation({
    mutationFn: (data: ExpenditureOutsourceRequest) => budgetApi.createExpenditure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenditures'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      message.success('외주 용역 요청이 제출되었습니다');
      navigate('/student/expenditures');
    },
    onError: () => {
      message.error('외주 용역 요청 제출에 실패했습니다');
    },
  });

  const handleSubmit = (isDraft: boolean) => {
    form.validateFields().then((values) => {
      if (!isDraft && proposalFiles.length === 0) {
        message.error('의뢰서 또는 견적서를 1개 이상 업로드해주세요');
        return;
      }

      const confirmMessage = isDraft
        ? '임시 저장하시겠습니까?'
        : '제출하면 관리자에게 승인 요청됩니다. 계속하시겠습니까?';

      Modal.confirm({
        title: isDraft ? '임시 저장' : '외주 용역 요청 제출',
        content: confirmMessage,
        okText: isDraft ? '저장' : '제출',
        cancelText: '취소',
        onOk: () => {
          const requestData: ExpenditureOutsourceRequest = {
            clubId,
            type: 'OUTSOURCE',
            amount: values.amount,
            description: values.description,
            proposalFileIds: proposalFiles.map((f) => f.id),
          };

          createMutation.mutate(requestData);
        },
      });
    });
  };

  const cardStyle = {
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  };

  return (
    <div>
      <PageHeader
        title="외주 용역 요청"
        subtitle="외부 업체에 의뢰할 용역 작업을 등록하세요"
        onBack={() => navigate('/student/expenditures')}
      />

      <Alert
        message="외주 용역 승인 절차"
        description={
          <div style={{ fontSize: 13 }}>
            <div style={{ marginBottom: 8, fontWeight: 600 }}>외주 용역은 2단계 승인 과정을 거칩니다:</div>
            <ol style={{ margin: 0, paddingLeft: 20 }}>
              <li>1차 승인: 의뢰서를 검토하여 용역 의뢰를 승인합니다</li>
              <li>용역 수행: 승인 후 외부 업체에서 작업을 진행합니다</li>
              <li>결과 보고: 작업 완료 후 결과 보고서를 제출합니다</li>
              <li>2차 승인: 결과물을 검토하여 최종 승인 및 사업비를 집행합니다</li>
            </ol>
          </div>
        }
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
        <Form form={form} layout="vertical" size="large">
          <Form.Item
            label="외주 업체명"
            name="vendorName"
            rules={[{ required: true, message: '외주 업체명을 입력해주세요' }]}
          >
            <Input placeholder="외주 업체 또는 프리랜서 이름" />
          </Form.Item>

          <Form.Item
            label="용역 금액"
            name="amount"
            rules={[
              { required: true, message: '용역 금액을 입력해주세요' },
              { type: 'number', min: 1, message: '1원 이상 입력해주세요' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="용역 금액을 입력하세요"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              addonAfter="원"
            />
          </Form.Item>

          <Form.Item
            label="용역 내용 설명"
            name="description"
            rules={[
              { required: true, message: '용역 내용을 입력해주세요' },
              { min: 20, message: '최소 20자 이상 입력해주세요' },
            ]}
            extra="어떤 작업을 의뢰하는지 구체적으로 설명해주세요"
          >
            <TextArea
              rows={6}
              placeholder="예시: 동아리 홍보 영상 제작 - 3분 분량의 홍보 영상 촬영 및 편집"
              showCount
              maxLength={1000}
            />
          </Form.Item>

          <Form.Item label="의뢰서 / 견적서">
            <FileUploader
              category="GENERAL"
              maxFiles={5}
              onUploadSuccess={(files) => setProposalFiles(files)}
              helpText="외주 의뢰서, 견적서, 계약서 등을 업로드하세요 (최대 5개)"
            />
          </Form.Item>

          <div
            style={{
              marginTop: 32,
              padding: 16,
              background: '#fff7e6',
              borderRadius: 8,
              border: '1px solid #ffd591',
            }}
          >
            <div style={{ fontSize: 13, color: '#d46b08', marginBottom: 8, fontWeight: 600 }}>
              외주 용역 제출 시 주의사항
            </div>
            <ul style={{ fontSize: 13, color: '#595959', margin: 0, paddingLeft: 20 }}>
              <li>외주 업체의 견적서 또는 제안서를 반드시 첨부해주세요</li>
              <li>용역 내용과 범위를 명확히 작성해주세요</li>
              <li>1차 승인 후에는 외주 업체와 작업을 진행할 수 있습니다</li>
              <li>작업 완료 후 반드시 결과 보고서를 제출해야 합니다</li>
              <li>결과물 검토 후 2차 승인이 완료되어야 사업비가 집행됩니다</li>
            </ul>
          </div>

          <div style={{ marginTop: 24, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/student/expenditures')}
              size="large"
            >
              취소
            </Button>
            <Button
              icon={<SaveOutlined />}
              onClick={() => handleSubmit(true)}
              loading={createMutation.isPending}
              size="large"
            >
              임시 저장
            </Button>
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={() => handleSubmit(false)}
              loading={createMutation.isPending}
              size="large"
            >
              제출
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default OutsourceExpenditureForm;
