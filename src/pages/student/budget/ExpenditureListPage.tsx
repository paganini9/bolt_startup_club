import React, { useState } from 'react';
import { Card, Table, Tag, Button, Select, Radio, Row, Col, Statistic, Progress, Dropdown, type MenuProps } from 'antd';
import { PlusOutlined, FilterOutlined, DownOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../../components/common/PageHeader';
import { budgetApi } from '../../../api/budgetApi';
import type { Expenditure, ExpenditureStatus, ExpenditureType } from '../../../types/budget';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const ExpenditureListPage: React.FC = () => {
  const navigate = useNavigate();
  const clubId = 1;

  const [statusFilter, setStatusFilter] = useState<ExpenditureStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<ExpenditureType | 'ALL'>('ALL');

  const { data: budgetData, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget', clubId],
    queryFn: () => budgetApi.getBudgetByClub(clubId),
  });

  const { data: expendituresData, isLoading: expendituresLoading } = useQuery({
    queryKey: ['expenditures', clubId, statusFilter, typeFilter],
    queryFn: () => {
      const filters: any = { clubId };
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (typeFilter !== 'ALL') filters.type = typeFilter;
      return budgetApi.getExpenditures(filters);
    },
  });

  const budget = budgetData?.data;
  const expenditures = expendituresData?.data || [];

  const getStatusTag = (status: ExpenditureStatus) => {
    const statusMap: Record<ExpenditureStatus, { color: string; text: string }> = {
      DRAFT: { color: '#d9d9d9', text: '임시저장' },
      PENDING: { color: '#fa8c16', text: '대기중' },
      APPROVED: { color: '#52C41A', text: '승인' },
      REJECTED: { color: '#FF4D4F', text: '반려' },
    };
    const config = statusMap[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTypeText = (type: ExpenditureType) => {
    const typeMap: Record<ExpenditureType, string> = {
      CASH: '현금',
      CARD: '카드',
      OUTSOURCE: '외주',
    };
    return typeMap[type];
  };

  const columns: ColumnsType<Expenditure> = [
    {
      title: '날짜',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      width: 120,
    },
    {
      title: '유형',
      dataIndex: 'type',
      key: 'type',
      render: (type: ExpenditureType) => getTypeText(type),
      width: 80,
    },
    {
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '금액',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: number) => `${amount.toLocaleString()}원`,
      width: 120,
      align: 'right',
    },
    {
      title: '요청자',
      dataIndex: 'requestedBy',
      key: 'requestedBy',
      render: (requestedBy: any) => requestedBy.name,
      width: 100,
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: ExpenditureStatus) => getStatusTag(status),
      width: 100,
    },
  ];

  const menuItems: MenuProps['items'] = [
    {
      key: 'cash',
      label: '현금 집행',
      onClick: () => navigate('/student/expenditures/new/cash'),
    },
    {
      key: 'card',
      label: '카드/물품 구매',
      onClick: () => navigate('/student/expenditures/new/card'),
    },
    {
      key: 'outsource',
      label: '외주 용역',
      onClick: () => navigate('/student/expenditures/new/outsource'),
    },
  ];

  const cardStyle = {
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  };

  return (
    <div>
      <PageHeader
        title="사업비 집행 내역"
        subtitle="사업비 집행 요청과 내역을 관리하세요"
        extra={
          <Dropdown menu={{ items: menuItems }} placement="bottomRight">
            <Button type="primary" icon={<PlusOutlined />} style={{ borderRadius: 8 }}>
              집행 요청 <DownOutlined />
            </Button>
          </Dropdown>
        }
      />

      {budget && (
        <Card style={{ ...cardStyle, marginBottom: 20 }} styles={{ body: { padding: 20 } }}>
          <Row gutter={24}>
            <Col xs={24} sm={6}>
              <Statistic
                title="총 배정액"
                value={budget.totalAmount}
                suffix="원"
                valueStyle={{ fontSize: 20, fontWeight: 600 }}
                formatter={(val) => Number(val).toLocaleString()}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="집행액"
                value={budget.spentAmount}
                suffix="원"
                valueStyle={{ fontSize: 20, fontWeight: 600, color: '#1677FF' }}
                formatter={(val) => Number(val).toLocaleString()}
              />
            </Col>
            <Col xs={24} sm={6}>
              <Statistic
                title="잔액"
                value={budget.remaining}
                suffix="원"
                valueStyle={{ fontSize: 20, fontWeight: 600, color: '#52C41A' }}
                formatter={(val) => Number(val).toLocaleString()}
              />
            </Col>
            <Col xs={24} sm={6}>
              <div>
                <div style={{ marginBottom: 8, fontSize: 14, color: '#8c8c8c' }}>집행률</div>
                <Progress
                  percent={budget.executionRate}
                  strokeColor="#1677FF"
                  trailColor="#f0f0f0"
                  style={{ marginBottom: 4 }}
                />
                <div style={{ fontSize: 20, fontWeight: 600 }}>{budget.executionRate}%</div>
              </div>
            </Col>
          </Row>
        </Card>
      )}

      <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
        <div style={{ marginBottom: 20 }}>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                <FilterOutlined style={{ marginRight: 6 }} />
                상태 필터
              </div>
              <Radio.Group
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                buttonStyle="solid"
                style={{ width: '100%' }}
              >
                <Radio.Button value="ALL" style={{ flex: 1, textAlign: 'center' }}>
                  전체
                </Radio.Button>
                <Radio.Button value="PENDING">대기</Radio.Button>
                <Radio.Button value="APPROVED">승인</Radio.Button>
                <Radio.Button value="REJECTED">반려</Radio.Button>
              </Radio.Group>
            </Col>
            <Col xs={24} sm={12} md={8}>
              <div style={{ marginBottom: 8, fontSize: 14, fontWeight: 500 }}>유형 필터</div>
              <Select
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ width: '100%' }}
                options={[
                  { label: '전체', value: 'ALL' },
                  { label: '현금', value: 'CASH' },
                  { label: '카드', value: 'CARD' },
                  { label: '외주', value: 'OUTSOURCE' },
                ]}
              />
            </Col>
          </Row>
        </div>

        <Table
          columns={columns}
          dataSource={expenditures}
          loading={expendituresLoading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}건`,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/student/expenditures/${record.id}`),
            style: { cursor: 'pointer' },
          })}
        />
      </Card>
    </div>
  );
};

export default ExpenditureListPage;
