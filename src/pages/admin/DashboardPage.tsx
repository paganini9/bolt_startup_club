import React from 'react';
import { Card, Col, Row, Typography, Progress, Statistic, Empty, Button, Table, Tag } from 'antd';
import {
  TeamOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  BellOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clubApi } from '../../api/clubApi';
import { Club } from '../../types/club';
import PageHeader from '../../components/common/PageHeader';
import { ROUTES, buildRoute } from '../../config/routes';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const phaseLabels: Record<string, { label: string; color: string }> = {
  RECRUITING: { label: '모집 중', color: 'blue' },
  SELECTED: { label: '선정됨', color: 'cyan' },
  OPERATING: { label: '운영 중', color: 'green' },
  COMPLETED: { label: '종료', color: 'default' },
};

const miniColumns: ColumnsType<Club> = [
  {
    title: '동아리명',
    dataIndex: 'name',
    key: 'name',
    render: (name: string) => <Typography.Text strong>{name}</Typography.Text>,
  },
  {
    title: '팀장',
    key: 'leader',
    render: (_: unknown, club: Club) => {
      const leader = club.members.find((m) => m.role === 'LEADER');
      return leader?.name ?? '-';
    },
    responsive: ['sm'] as never,
  },
  {
    title: '단계',
    dataIndex: 'phase',
    key: 'phase',
    render: (phase: string) => {
      const p = phaseLabels[phase];
      return <Tag color={p?.color}>{p?.label ?? phase}</Tag>;
    },
  },
  {
    title: '집행률',
    key: 'executionRate',
    render: (_: unknown, club: Club) => (
      <Progress percent={club.budget?.executionRate ?? 0} size="small" style={{ minWidth: 80 }} />
    ),
    responsive: ['md'] as never,
  },
];

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { data } = useQuery({
    queryKey: ['clubs', { page: 0, size: 5 }],
    queryFn: () => clubApi.getClubs({ page: 0, size: 5 }),
  });

  const { data: allData } = useQuery({
    queryKey: ['clubs-all'],
    queryFn: () => clubApi.getClubs({ page: 0, size: 100 }),
  });

  const clubs = data?.data.content ?? [];
  const totalClubs = allData?.data.totalElements ?? 0;

  const avgExecutionRate = allData?.data.content.length
    ? Math.round(
        allData.data.content.reduce((acc, c) => acc + (c.budget?.executionRate ?? 0), 0) /
          allData.data.content.length
      )
    : 65;

  const cardStyle = {
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    height: '100%',
  };

  return (
    <div>
      <PageHeader title="관리자 대시보드" subtitle="창업동아리 현황을 한눈에 확인하세요" />

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} xl={6}>
          <Card style={cardStyle} styles={{ body: { padding: 20 } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: '#e6f4ff',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TeamOutlined style={{ fontSize: 22, color: '#1677FF' }} />
              </div>
              <div>
                <Statistic
                  value={totalClubs}
                  suffix="개"
                  valueStyle={{ fontSize: 26, fontWeight: 700, color: '#1677FF' }}
                />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  전체 동아리
                </Typography.Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card style={cardStyle} styles={{ body: { padding: 20 } }}>
            <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
              전체 사업비 집행률
            </Typography.Text>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginBottom: 8 }}>
                <Typography.Title level={3} style={{ margin: 0, color: '#52C41A' }}>
                  {avgExecutionRate}%
                </Typography.Title>
              </div>
              <Progress
                percent={avgExecutionRate}
                strokeColor="#52C41A"
                trailColor="#f0f0f0"
                showInfo={false}
              />
              <Typography.Text type="secondary" style={{ fontSize: 11, marginTop: 4, display: 'block' }}>
                Phase 2에서 실제 데이터 연결 예정
              </Typography.Text>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card style={cardStyle} styles={{ body: { padding: 20 } }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: '#fff7e6',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CheckCircleOutlined style={{ fontSize: 22, color: '#fa8c16' }} />
              </div>
              <div>
                <Statistic
                  value={0}
                  suffix="건"
                  valueStyle={{ fontSize: 26, fontWeight: 700, color: '#fa8c16' }}
                />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  승인 대기
                </Typography.Text>
              </div>
            </div>
            <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
              Phase 2에서 연결 예정
            </Typography.Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card style={cardStyle} styles={{ body: { padding: 20 } }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 600 }}>
                최근 활동 로그
              </Typography.Text>
              <BellOutlined style={{ color: '#bfbfbf' }} />
            </div>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  활동 내역 없음
                </Typography.Text>
              }
              style={{ margin: '4px 0' }}
            />
            <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', textAlign: 'center' }}>
              Phase 2에서 연결 예정
            </Typography.Text>
          </Card>
        </Col>
      </Row>

      <Card
        style={{ ...cardStyle, marginTop: 20 }}
        styles={{ body: { padding: 24 } }}
        title={
          <Typography.Title level={5} style={{ margin: 0 }}>
            동아리 현황
          </Typography.Title>
        }
        extra={
          <Button
            type="link"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate(ROUTES.ADMIN_CLUBS)}
            style={{ fontWeight: 600 }}
          >
            전체 보기
          </Button>
        }
      >
        <Table
          columns={miniColumns}
          dataSource={clubs}
          rowKey="id"
          pagination={false}
          size="middle"
          onRow={(record) => ({
            onClick: () => navigate(buildRoute.adminClubDetail(record.id)),
            style: { cursor: 'pointer' },
          })}
          style={{ borderRadius: 8, overflow: 'hidden' }}
        />
      </Card>

      <Card
        style={{ ...cardStyle, marginTop: 20 }}
        styles={{ body: { padding: 20 } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <ClockCircleOutlined style={{ color: '#1677FF' }} />
          <Typography.Text strong>Phase 2 예정 기능</Typography.Text>
        </div>
        <Row gutter={12}>
          {['사업비 신청 승인/반려', '예산 배정 관리', '지출 내역 집계', '알림 발송'].map((f) => (
            <Col key={f} xs={24} sm={12} md={6} style={{ marginBottom: 8 }}>
              <div
                style={{
                  padding: '8px 12px',
                  background: '#f0f7ff',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#1677FF',
                  border: '1px solid #bae0ff',
                }}
              >
                {f}
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
