import React, { useState } from 'react';
import { Card, Form, Input, Button, message, Modal, Table, InputNumber, Space, Typography } from 'antd';
import { SaveOutlined, SendOutlined, ArrowLeftOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../../components/common/PageHeader';
import FileUploader from '../../../components/common/FileUploader';
import { budgetApi } from '../../../api/budgetApi';
import type { ExpenditureCardRequest, PurchaseItem } from '../../../types/budget';
import type { UploadedFile } from '../../../types/file';
import type { ColumnsType } from 'antd/es/table';

const { TextArea } = Input;

const CardExpenditureForm: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const queryClient = useQueryClient();
  const clubId = 1;

  const [captureFiles, setCaptureFiles] = useState<UploadedFile[]>([]);
  const [items, setItems] = useState<PurchaseItem[]>([]);
  const [editingItem, setEditingItem] = useState<Partial<PurchaseItem>>({});

  const createMutation = useMutation({
    mutationFn: (data: ExpenditureCardRequest) => budgetApi.createExpenditure(data),
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

  const handleAddItem = () => {
    if (!editingItem.name || !editingItem.quantity || !editingItem.unitPrice) {
      message.error('품목 정보를 모두 입력해주세요');
      return;
    }

    const newItem: PurchaseItem = {
      name: editingItem.name,
      quantity: editingItem.quantity,
      unitPrice: editingItem.unitPrice,
      totalPrice: editingItem.quantity * editingItem.unitPrice,
    };

    setItems([...items, newItem]);
    setEditingItem({});
  };

  const handleDeleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const itemColumns: ColumnsType<PurchaseItem> = [
    {
      title: '품목명',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
    },
    {
      title: '단가',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right',
      render: (price: number) => `${price.toLocaleString()}원`,
    },
    {
      title: '소계',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      align: 'right',
      render: (price: number) => `${price.toLocaleString()}원`,
    },
    {
      title: '작업',
      key: 'action',
      width: 80,
      align: 'center',
      render: (_, __, index) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDeleteItem(index)}
          size="small"
        />
      ),
    },
  ];

  const handleSubmit = (isDraft: boolean) => {
    form.validateFields().then((values) => {
      if (!isDraft) {
        if (captureFiles.length === 0) {
          message.error('화면 캡처 이미지를 업로드해주세요');
          return;
        }
        if (items.length === 0) {
          message.error('품목을 1개 이상 추가해주세요');
          return;
        }
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
          const requestData: ExpenditureCardRequest = {
            clubId,
            type: 'CARD',
            amount: totalAmount,
            description: values.description,
            purchaseUrl: values.purchaseUrl,
            captureFileIds: captureFiles.map((f) => f.id),
            itemList: items,
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
        title="카드/물품 구매 요청"
        subtitle="온라인 구매 또는 카드 결제 내역을 등록하세요"
        onBack={() => navigate('/student/expenditures')}
      />

      <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
        <Form form={form} layout="vertical" size="large">
          <Form.Item
            label="구매 URL"
            name="purchaseUrl"
            rules={[
              { required: true, message: '구매 URL을 입력해주세요' },
              { type: 'url', message: '올바른 URL 형식을 입력해주세요' },
            ]}
          >
            <Input placeholder="https://example.com/product/12345" />
          </Form.Item>

          <Form.Item label="화면 캡처 이미지">
            <FileUploader
              category="GENERAL"
              maxFiles={3}
              accept="image/*"
              onUploadSuccess={(files) => setCaptureFiles(files)}
              helpText="구매 화면 캡처 이미지를 업로드하세요 (최대 3장)"
            />
          </Form.Item>

          <Form.Item label="품목 리스트">
            <Card
              size="small"
              style={{
                background: '#fafafa',
                border: '1px solid #d9d9d9',
                marginBottom: 16,
              }}
            >
              <Space.Compact style={{ width: '100%', marginBottom: 12 }}>
                <Input
                  placeholder="품목명"
                  value={editingItem.name || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                  style={{ width: '40%' }}
                />
                <InputNumber
                  placeholder="수량"
                  min={1}
                  value={editingItem.quantity}
                  onChange={(val) => setEditingItem({ ...editingItem, quantity: val || 0 })}
                  style={{ width: '20%' }}
                />
                <InputNumber
                  placeholder="단가"
                  min={0}
                  value={editingItem.unitPrice}
                  onChange={(val) => setEditingItem({ ...editingItem, unitPrice: val || 0 })}
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  style={{ width: '30%' }}
                />
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddItem}
                  style={{ width: '10%' }}
                >
                  추가
                </Button>
              </Space.Compact>

              {items.length > 0 ? (
                <>
                  <Table
                    columns={itemColumns}
                    dataSource={items}
                    pagination={false}
                    size="small"
                    rowKey={(_, index) => index!}
                    style={{ marginBottom: 12 }}
                  />
                  <div
                    style={{
                      textAlign: 'right',
                      padding: '12px 16px',
                      background: '#fff',
                      borderRadius: 8,
                      border: '2px solid #1677FF',
                    }}
                  >
                    <Typography.Text strong style={{ fontSize: 16, color: '#1677FF' }}>
                      합계: {totalAmount.toLocaleString()}원
                    </Typography.Text>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px 0', color: '#8c8c8c' }}>
                  품목을 추가해주세요
                </div>
              )}
            </Card>
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
              placeholder="구매 용도를 자세히 입력해주세요 (최소 10자)"
              showCount
              maxLength={500}
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
              <li>구매 내역이 확인 가능한 화면을 캡처하여 첨부해주세요</li>
              <li>품목별 가격과 수량을 정확히 입력해주세요</li>
              <li>승인 후 물품 검수 사진을 추가로 제출해야 합니다</li>
              <li>임시 저장한 내용은 나중에 수정하여 제출할 수 있습니다</li>
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

export default CardExpenditureForm;
