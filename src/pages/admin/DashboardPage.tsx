import React from 'react';
import { Card, Col, Row, Typography, Progress, Statistic, Empty, Button, Table, Tag, List, Spin } from 'antd';
import {
  TeamOutlined,
  CheckCircleOutlined,
  BellOutlined,
  ArrowRightOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { clubApi } from '../../api/clubApi';
import { budgetApi } from '../../api/budgetApi';
import { notificationApi } from '../../api/notificationApi';
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
      const leader = (club as any)?.members?.find?.((m: any) => m.role === 'LEADER');
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
      <Progress
        percent={club.budget?.executionRate ?? 0}
        size="small"
        strokeColor={
          (club.budget?.executionRate ?? 0) >= 80
            ? '#52C41A'
            : (club.budget?.executionRate ?? 0) >= 50
            ? '#1677FF'
            : '#fa8c16'
        }
        showInfo={false}
        style={{ minWidth: 80 }}
      />
    ),
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

  const { data: budgetsData, isLoading: budgetsLoading } = useQuery({
    queryKey: ['budgets', 'all'],
    queryFn: () => budgetApi.getAllBudgets(),
  });

  const { data: expendituresData, isLoading: expendituresLoading } = useQuery({
    queryKey: ['expenditures', 'admin'],
    queryFn: () => budgetApi.getExpenditures(),
  });

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
  });

  const clubs = data?.data.content ?? [];
  const totalClubs = allData?.data.totalElements ?? 0;
  const budgets = budgetsData?.data || [];
  const expenditures = expendituresData?.data || [];
  const notifications = notificationsData?.data || [];

  const pendingCount = expenditures.filter((e) => e.status === 'PENDING').length;
  const recentNotifications = notifications.slice(0, 5);

  const avgExecutionRate = budgets.length > 0
    ? Math.round(budgets.reduce((sum, b) => sum + b.executionRate, 0) / budgets.length)
    : 0;

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
            {budgetsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Spin />
              </div>
            ) : (
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
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card style={cardStyle} styles={{ body: { padding: 20 } }}>
            {expendituresLoading ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Spin />
              </div>
            ) : (
              <>
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
                      value={pendingCount}
                      suffix="건"
                      valueStyle={{ fontSize: 26, fontWeight: 700, color: '#fa8c16' }}
                    />
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      승인 대기
                    </Typography.Text>
                  </div>
                </div>
                {pendingCount > 0 && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => navigate('/admin/approvals')}
                    style={{ padding: 0, marginTop: 8, fontSize: 12 }}
                  >
                    승인 페이지로 이동 →
                  </Button>
                )}
              </>
            )}
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
            {notificationsLoading ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Spin />
              </div>
            ) : recentNotifications.length > 0 ? (
              <List
                size="small"
                dataSource={recentNotifications}
                renderItem={(item) => (
                  <List.Item
                    style={{
                      padding: '6px 0',
                      cursor: item.link ? 'pointer' : 'default',
                      borderBottom: 'none',
                    }}
                    onClick={() => item.link && navigate(item.link)}
                  >
                    <div style={{ width: '100%' }}>
                      <Typography.Text
                        style={{
                          fontSize: 12,
                          display: 'block',
                          fontWeight: item.isRead ? 400 : 600,
                          color: item.isRead ? '#8c8c8c' : '#262626',
                        }}
                        ellipsis={{ tooltip: item.message }}
                      >
                        {item.message}
                      </Typography.Text>
                      <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                        {dayjs(item.createdAt).format('MM-DD HH:mm')}
                      </Typography.Text>
                    </div>
                  </List.Item>
                )}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    활동 내역 없음
                  </Typography.Text>
                }
                style={{ margin: '4px 0' }}
              />
            )}
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

    </div>
  );
};

export default AdminDashboardPage;
