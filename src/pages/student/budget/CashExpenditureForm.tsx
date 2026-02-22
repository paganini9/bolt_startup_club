import React, { useState } from 'react';
import { Card, Form, InputNumber, Input, DatePicker, Button, message, Modal, Space } from 'antd';
import { SaveOutlined, SendOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../../components/common/PageHeader';
import FileUploader from '../../../components/common/FileUploader';
import { budgetApi } from '../../../api/budgetApi';
import type { ExpenditureCashRequest } from '../../../types/budget';
import type { UploadedFile } from '../../../types/file';

const { TextArea } = Input;

const CashExpenditureForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const clubId = 1;

  const [receiptFiles, setReceiptFiles] = useState<UploadedFile[]>([]);

  const createMutation = useMutation({
    mutationFn: (data: ExpenditureCashRequest) => budgetApi.createExpenditure(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenditures'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      message.success('집행 요청이 제출되었습니다');
      navigate('/student/expenditures');
    },
    onError: () => {
      message.error('집행 요청 제출에 실패했습니다');
    },
  });

  const handleSubmit = (isDraft: boolean) => {
    form.validateFields().then((values) => {
      if (!isDraft && receiptFiles.length === 0) {
        message.error('영수증 사진을 1장 이상 업로드해주세요');
        return;
      }

      const confirmMessage = isDraft
        ? '임시 저장하시겠습니까?'
        : '제출하면 관리자에게 승인 요청됩니다. 계속하시겠습니까?';

      Modal.confirm({
        title: isDraft ? '임시 저장' : '집행 요청 제출',
        content: confirmMessage,
        okText: isDraft ? '저장' : '제출',
        cancelText: '취소',
        onOk: () => {
          const requestData: ExpenditureCashRequest = {
            clubId,
            type: 'CASH',
            amount: values.amount,
            description: values.description,
            receiptFileIds: receiptFiles.map((f) => f.id),
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
        title="현금 집행 요청"
        subtitle="현금 사용 후 영수증을 첨부하여 집행을 요청하세요"
        onBack={() => navigate('/student/expenditures')}
      />

      <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
        <Form form={form} layout="vertical" size="large">
          <Form.Item
            label="금액"
            name="amount"
            rules={[
              { required: true, message: '금액을 입력해주세요' },
              { type: 'number', min: 1, message: '1원 이상 입력해주세요' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="집행 금액을 입력하세요"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              addonAfter="원"
            />
          </Form.Item>

          <Form.Item
            label="사용 일자"
            name="usageDate"
            rules={[{ required: true, message: '사용 일자를 선택해주세요' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="사용 일자 선택" />
          </Form.Item>

          <Form.Item
            label="사용 용도 / 설명"
            name="description"
            rules={[
              { required: true, message: '사용 용도를 입력해주세요' },
              { min: 10, message: '최소 10자 이상 입력해주세요' },
            ]}
          >
            <TextArea
              rows={4}
              placeholder="사용 용도를 자세히 입력해주세요 (최소 10자)"
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Form.Item label="영수증 사진">
            <FileUploader
              category="RECEIPT"
              maxFiles={5}
              accept="image/*"
              onUploadSuccess={(files) => setReceiptFiles(files)}
              helpText="영수증 사진을 업로드하세요 (최대 5장)"
            />
          </Form.Item>

          <div
            style={{
              marginTop: 32,
              padding: 16,
              background: '#f0f7ff',
              borderRadius: 8,
              border: '1px solid #bae0ff',
            }}
          >
            <div style={{ fontSize: 13, color: '#1677FF', marginBottom: 8, fontWeight: 600 }}>
              안내사항
            </div>
            <ul style={{ fontSize: 13, color: '#595959', margin: 0, paddingLeft: 20 }}>
              <li>영수증 사진은 선명하게 촬영해주세요</li>
              <li>영수증에 날짜, 금액, 사용처가 명확히 표시되어야 합니다</li>
              <li>임시 저장한 내용은 나중에 수정하여 제출할 수 있습니다</li>
              <li>제출 후에는 수정할 수 없으며, 관리자 승인을 기다려야 합니다</li>
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

export default CashExpenditureForm;
