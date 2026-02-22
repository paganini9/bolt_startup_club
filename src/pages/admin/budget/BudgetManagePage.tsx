import React, { useState } from 'react';
import { Card, Table, Progress, Button, Modal, Form, InputNumber, Select, message } from 'antd';
import { PlusOutlined, DownloadOutlined, WarningOutlined } from '@ant-design/icons';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../../components/common/PageHeader';
import { budgetApi } from '../../../api/budgetApi';
import type { Budget, BudgetAssignRequest } from '../../../types/budget';
import type { ColumnsType } from 'antd/es/table';

const BudgetManagePage: React.FC = () => {
  const [form] = Form.useForm();
  const queryClient = useQueryClient();

  const [assignModalVisible, setAssignModalVisible] = useState(false);

  const { data: budgetsData, isLoading } = useQuery({
    queryKey: ['budgets', 'all'],
    queryFn: () => budgetApi.getAllBudgets(),
  });

  const assignMutation = useMutation({
    mutationFn: (data: BudgetAssignRequest) => budgetApi.assignBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['budgets'] });
      message.success('예산이 배정되었습니다');
      setAssignModalVisible(false);
      form.resetFields();
    },
    onError: () => {
      message.error('예산 배정에 실패했습니다');
    },
  });

  const budgets = budgetsData?.data || [];

  const handleAssign = () => {
    form.validateFields().then((values) => {
      assignMutation.mutate(values);
    });
  };

  const handleExportExcel = async () => {
    try {
      const blob = await budgetApi.exportToExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expenditure_report_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('엑셀 파일이 다운로드되었습니다');
    } catch (error) {
      message.error('엑셀 다운로드에 실패했습니다');
    }
  };

  const columns: ColumnsType<Budget> = [
    {
      title: '동아리명',
      dataIndex: 'clubName',
      key: 'clubName',
      width: 200,
    },
    {
      title: '배정액',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => `${amount.toLocaleString()}원`,
      width: 150,
      align: 'right',
    },
    {
      title: '집행액',
      dataIndex: 'spentAmount',
      key: 'spentAmount',
      render: (amount: number) => `${amount.toLocaleString()}원`,
      width: 150,
      align: 'right',
    },
    {
      title: '잔액',
      dataIndex: 'remaining',
      key: 'remaining',
      render: (amount: number) => (
        <span style={{ color: amount < 500000 ? '#FF4D4F' : '#52C41A', fontWeight: 600 }}>
          {amount.toLocaleString()}원
        </span>
      ),
      width: 150,
      align: 'right',
    },
    {
      title: '집행률',
      dataIndex: 'executionRate',
      key: 'executionRate',
      render: (rate: number) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Progress
            percent={rate}
            strokeColor={rate < 30 ? '#FF4D4F' : rate < 70 ? '#1677FF' : '#52C41A'}
            trailColor="#f0f0f0"
            style={{ flex: 1, margin: 0 }}
          />
          {rate < 30 && <WarningOutlined style={{ color: '#FF4D4F' }} />}
        </div>
      ),
      width: 200,
      sorter: (a, b) => a.executionRate - b.executionRate,
    },
    {
      title: '배정일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('ko-KR'),
      width: 120,
    },
  ];

  const totalBudget = budgets.reduce((sum, b) => sum + b.totalAmount, 0);
  const totalSpent = budgets.reduce((sum, b) => sum + b.spentAmount, 0);
  const totalRemaining = budgets.reduce((sum, b) => sum + b.remaining, 0);
  const avgExecutionRate = budgets.length > 0
    ? Math.round(budgets.reduce((sum, b) => sum + b.executionRate, 0) / budgets.length)
    : 0;

  const lowExecutionClubs = budgets.filter((b) => b.executionRate < 30);

  const cardStyle = {
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  };

  return (
    <div>
      <PageHeader
        title="예산 관리"
        subtitle="동아리별 예산 배정 및 집행 현황을 관리하세요"
        extra={
          <>
            <Button
              icon={<DownloadOutlined />}
              onClick={handleExportExcel}
              style={{ marginRight: 12, borderRadius: 8 }}
            >
              엑셀 다운로드
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setAssignModalVisible(true)}
              style={{ borderRadius: 8 }}
            >
              예산 배정
            </Button>
          </>
        }
      />

      <Card style={{ ...cardStyle, marginBottom: 20 }} styles={{ body: { padding: 24 } }}>
        <div style={{ display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 24 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#8c8c8c', marginBottom: 8 }}>총 배정액</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#1677FF' }}>
              {totalBudget.toLocaleString()}원
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#8c8c8c', marginBottom: 8 }}>총 집행액</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#52C41A' }}>
              {totalSpent.toLocaleString()}원
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#8c8c8c', marginBottom: 8 }}>총 잔액</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: '#fa8c16' }}>
              {totalRemaining.toLocaleString()}원
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#8c8c8c', marginBottom: 8 }}>평균 집행률</div>
            <div style={{ fontSize: 24, fontWeight: 700 }}>{avgExecutionRate}%</div>
          </div>
        </div>
      </Card>

      {lowExecutionClubs.length > 0 && (
        <Card
          style={{ ...cardStyle, marginBottom: 20, borderColor: '#FF4D4F' }}
          styles={{ body: { padding: 16 } }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <WarningOutlined style={{ fontSize: 20, color: '#FF4D4F' }} />
            <div>
              <div style={{ fontWeight: 600, color: '#FF4D4F' }}>집행률 저조 동아리 ({lowExecutionClubs.length}개)</div>
              <div style={{ fontSize: 13, color: '#8c8c8c', marginTop: 4 }}>
                {lowExecutionClubs.map((c) => c.clubName).join(', ')} - 집행률 30% 미만
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
        <Table
          columns={columns}
          dataSource={budgets}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}개 동아리`,
          }}
        />
      </Card>

      <Modal
        title="예산 배정"
        open={assignModalVisible}
        onOk={handleAssign}
        onCancel={() => {
          setAssignModalVisible(false);
          form.resetFields();
        }}
        okText="배정"
        cancelText="취소"
        okButtonProps={{ loading: assignMutation.isPending }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 24 }}>
          <Form.Item
            label="동아리"
            name="clubId"
            rules={[{ required: true, message: '동아리를 선택해주세요' }]}
          >
            <Select
              placeholder="동아리 선택"
              options={[
                { label: 'AI 연구회', value: 1 },
                { label: '로봇 공학 동아리', value: 2 },
                { label: '웹 개발 동아리', value: 3 },
                { label: '게임 제작 동아리', value: 4 },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="배정 금액"
            name="totalAmount"
            rules={[
              { required: true, message: '배정 금액을 입력해주세요' },
              { type: 'number', min: 100000, message: '최소 10만원 이상 배정해주세요' },
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="배정 금액"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              addonAfter="원"
            />
          </Form.Item>

          <div
            style={{
              padding: 12,
              background: '#f0f7ff',
              borderRadius: 8,
              border: '1px solid #bae0ff',
              fontSize: 13,
            }}
          >
            <div style={{ fontWeight: 600, color: '#1677FF', marginBottom: 8 }}>안내사항</div>
            <ul style={{ margin: 0, paddingLeft: 20, color: '#595959' }}>
              <li>예산은 동아리당 1회 배정됩니다</li>
              <li>배정 후 수정은 별도 절차가 필요합니다</li>
              <li>집행 현황을 주기적으로 모니터링해주세요</li>
            </ul>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default BudgetManagePage;
