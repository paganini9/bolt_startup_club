import React, { useState } from 'react';
import { Card, Table, Tag, Select, DatePicker, Row, Col, Badge, Statistic, Button } from 'antd';
import { FilterOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import PageHeader from '../../../components/common/PageHeader';
import { budgetApi } from '../../../api/budgetApi';
import type { Expenditure, ExpenditureStatus, ExpenditureType } from '../../../types/budget';
import type { ColumnsType } from 'antd/es/table';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

const ApprovalListPage: React.FC = () => {
  const navigate = useNavigate();

  const [clubFilter, setClubFilter] = useState<number | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<ExpenditureStatus | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<ExpenditureType | 'ALL'>('ALL');
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null);

  const { data: expendituresData, isLoading } = useQuery({
    queryKey: ['expenditures', 'admin', clubFilter, statusFilter, typeFilter, dateRange],
    queryFn: () => {
      const filters: any = {};
      if (clubFilter !== 'ALL') filters.clubId = clubFilter;
      if (statusFilter !== 'ALL') filters.status = statusFilter;
      if (typeFilter !== 'ALL') filters.type = typeFilter;
      if (dateRange && dateRange[0] && dateRange[1]) {
        filters.startDate = dateRange[0].format('YYYY-MM-DD');
        filters.endDate = dateRange[1].format('YYYY-MM-DD');
      }
      return budgetApi.getExpenditures(filters);
    },
  });

  const expenditures = expendituresData?.data || [];
  const pendingCount = expenditures.filter((e) => e.status === 'PENDING').length;

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
      title: '동아리',
      dataIndex: 'clubName',
      key: 'clubName',
      width: 150,
    },
    {
      title: '요청자',
      dataIndex: 'requestedBy',
      key: 'requestedBy',
      render: (requestedBy: any) => `${requestedBy.name} (${requestedBy.studentId})`,
      width: 150,
    },
    {
      title: '유형',
      dataIndex: 'type',
      key: 'type',
      render: (type: ExpenditureType) => getTypeText(type),
      width: 80,
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
      title: '설명',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '요청일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      width: 150,
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: (status: ExpenditureStatus) => getStatusTag(status),
      width: 100,
      filters: [
        { text: '대기중', value: 'PENDING' },
        { text: '승인', value: 'APPROVED' },
        { text: '반려', value: 'REJECTED' },
      ],
      onFilter: (value, record) => record.status === value,
    },
  ];

  const sortedExpenditures = [...expenditures].sort((a, b) => {
    if (a.status === 'PENDING' && b.status !== 'PENDING') return -1;
    if (a.status !== 'PENDING' && b.status === 'PENDING') return 1;
    return dayjs(b.createdAt).unix() - dayjs(a.createdAt).unix();
  });

  const cardStyle = {
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
  };

  return (
    <div>
      <PageHeader title="사업비 승인 관리" subtitle="사업비 집행 요청을 검토하고 승인/반려 처리하세요" />

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        <Col xs={24} sm={12}>
          <Card style={cardStyle} styles={{ body: { padding: 20 } }}>
            <Statistic
              title={
                <span>
                  <ClockCircleOutlined style={{ marginRight: 8, color: '#fa8c16' }} />
                  승인 대기 건수
                </span>
              }
              value={pendingCount}
              suffix="건"
              valueStyle={{ color: '#fa8c16', fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card style={cardStyle} styles={{ body: { padding: 20 } }}>
            <Statistic
              title={
                <span>
                  <CheckCircleOutlined style={{ marginRight: 8, color: '#52C41A' }} />
                  총 요청 건수
                </span>
              }
              value={expenditures.length}
              suffix="건"
              valueStyle={{ color: '#52C41A', fontSize: 28, fontWeight: 700 }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ marginBottom: 12, fontSize: 14, fontWeight: 600 }}>
            <FilterOutlined style={{ marginRight: 6 }} />
            필터
          </div>
          <Row gutter={16}>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="동아리 선택"
                value={clubFilter}
                onChange={setClubFilter}
                style={{ width: '100%' }}
                options={[
                  { label: '전체 동아리', value: 'ALL' },
                  { label: 'AI 연구회', value: 1 },
                  { label: '로봇 공학 동아리', value: 2 },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="상태 선택"
                value={statusFilter}
                onChange={setStatusFilter}
                style={{ width: '100%' }}
                options={[
                  { label: '전체 상태', value: 'ALL' },
                  { label: '대기중', value: 'PENDING' },
                  { label: '승인', value: 'APPROVED' },
                  { label: '반려', value: 'REJECTED' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Select
                placeholder="유형 선택"
                value={typeFilter}
                onChange={setTypeFilter}
                style={{ width: '100%' }}
                options={[
                  { label: '전체 유형', value: 'ALL' },
                  { label: '현금', value: 'CASH' },
                  { label: '카드', value: 'CARD' },
                  { label: '외주', value: 'OUTSOURCE' },
                ]}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <RangePicker
                style={{ width: '100%' }}
                placeholder={['시작일', '종료일']}
                value={dateRange}
                onChange={(dates) => setDateRange(dates)}
              />
            </Col>
          </Row>
        </div>

        {pendingCount > 0 && (
          <div
            style={{
              marginBottom: 16,
              padding: '12px 16px',
              background: '#fff7e6',
              borderRadius: 8,
              border: '1px solid #ffd591',
            }}
          >
            <Badge count={pendingCount} style={{ marginRight: 8 }} />
            <span style={{ fontSize: 14, color: '#d46b08' }}>
              <strong>{pendingCount}건</strong>의 승인 대기 요청이 있습니다
            </span>
          </div>
        )}

        <Table
          columns={columns}
          dataSource={sortedExpenditures}
          loading={isLoading}
          rowKey="id"
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showTotal: (total) => `총 ${total}건`,
          }}
          onRow={(record) => ({
            onClick: () => navigate(`/admin/approvals/${record.id}`),
            style: {
              cursor: 'pointer',
              background: record.status === 'PENDING' ? '#fffbe6' : undefined,
            },
          })}
          rowClassName={(record) => (record.status === 'PENDING' ? 'pending-row' : '')}
        />
      </Card>
    </div>
  );
};

export default ApprovalListPage;
