import React from 'react';
import { Card, Col, Row, Steps, Typography, Button, Empty, Tag, Statistic, Progress, List, Spin, Table } from 'antd';
import {
  ArrowRightOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BellOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/authStore';
import PageHeader from '../../components/common/PageHeader';
import { buildRoute } from '../../config/routes';
import { budgetApi } from '../../api/budgetApi';
import { notificationApi } from '../../api/notificationApi';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import dayjs from 'dayjs';
import type { ColumnsType } from 'antd/es/table';

const phaseSteps = [
  { title: '모집', description: '팀 구성' },
  { title: '선정', description: '심사 통과' },
  { title: '운영', description: '활동 중' },
  { title: '종료', description: '완료' },
];

const phaseStepMap: Record<string, number> = {
  RECRUITING: 0,
  SELECTED: 1,
  OPERATING: 2,
  COMPLETED: 3,
};

const StudentDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const currentPhase = 'OPERATING';
  const currentStep = phaseStepMap[currentPhase];
  const clubId = 1;

  const { data: budgetData, isLoading: budgetLoading } = useQuery({
    queryKey: ['budget', clubId],
    queryFn: () => budgetApi.getBudgetByClub(clubId),
  });

  const { data: expendituresData, isLoading: expendituresLoading } = useQuery({
    queryKey: ['expenditures', clubId],
    queryFn: () => budgetApi.getExpenditures({ clubId }),
  });

  const { data: notificationsData, isLoading: notificationsLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
  });

  const budget = budgetData?.data;
  const expenditures = expendituresData?.data || [];
  const notifications = notificationsData?.data || [];

  const pendingCount = expenditures.filter(e => e.status === 'PENDING').length;
  const recentExpenditures = expenditures.slice(0, 5);
  const recentNotifications = notifications.slice(0, 5);

  const budgetChartData = budget ? [
    { name: '집행액', value: budget.spentAmount, color: '#1677FF' },
    { name: '잔액', value: budget.remaining, color: '#52C41A' },
  ] : [];

  const cardStyle = {
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    height: '100%',
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      DRAFT: { color: '#d9d9d9', text: '임시저장' },
      PENDING: { color: '#fa8c16', text: '대기중' },
      APPROVED: { color: '#52C41A', text: '승인' },
      REJECTED: { color: '#FF4D4F', text: '반려' },
    };
    const config = statusMap[status] || { color: '#d9d9d9', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const columns: ColumnsType<any> = [
    {
      title: '날짜',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD'),
      width: 110,
    },
    {
      title: '유형',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => {
        const typeMap: Record<string, string> = {
          CASH: '현금',
          CARD: '카드',
          OUTSOURCE: '외주',
        };
        return typeMap[type] || type;
      },
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
      title: '상태',
      dataIndex: 'status',
      key: 'status',
      render: getStatusTag,
      width: 90,
    },
  ];

  return (
    <div>
      <PageHeader
        title={`안녕하세요, ${user?.name ?? ''}님!`}
        subtitle="창업동아리 관리 시스템에 오신 것을 환영합니다"
      />

      <Row gutter={[20, 20]}>
        <Col xs={24} sm={12} xl={6}>
          <Card style={cardStyle} styles={{ body: { padding: 20 } }}>
            <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
              현재 진행 단계
            </Typography.Text>
            <div style={{ marginTop: 16 }}>
              <Tag color="blue" style={{ fontSize: 13, padding: '2px 10px' }}>
                운영 중
              </Tag>
              <div style={{ marginTop: 16 }}>
                <Steps
                  size="small"
                  current={currentStep}
                  items={phaseSteps.map((s) => ({ title: s.title }))}
                  style={{ fontSize: 11 }}
                />
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card style={cardStyle} styles={{ body: { padding: 20 } }}>
            <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
              사업비 잔액
            </Typography.Text>
            {budgetLoading ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Spin />
              </div>
            ) : budget ? (
              <div style={{ marginTop: 12 }}>
                <Statistic
                  value={budget.remaining}
                  suffix="원"
                  valueStyle={{ fontSize: 22, fontWeight: 700, color: '#1677FF' }}
                  formatter={(val) => Number(val).toLocaleString()}
                />
                <div style={{ marginTop: 12 }}>
                  <ResponsiveContainer width="100%" height={100}>
                    <PieChart>
                      <Pie
                        data={budgetChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={25}
                        outerRadius={40}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {budgetChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `${value.toLocaleString()}원`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ textAlign: 'center', fontSize: 11, color: '#8c8c8c', marginTop: 4 }}>
                    집행률 {budget.executionRate}%
                  </div>
                </div>
              </div>
            ) : (
              <Empty description="예산 정보 없음" style={{ margin: '20px 0' }} />
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card style={cardStyle} styles={{ body: { padding: 20 } }}>
            <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
              승인 대기 건수
            </Typography.Text>
            {expendituresLoading ? (
              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <Spin />
              </div>
            ) : (
              <div style={{ marginTop: 12 }}>
                <Statistic
                  value={pendingCount}
                  suffix="건"
                  valueStyle={{ fontSize: 28, fontWeight: 700, color: pendingCount > 0 ? '#fa8c16' : '#52C41A' }}
                />
                <div style={{ marginTop: 8 }}>
                  <CheckCircleOutlined style={{ color: pendingCount > 0 ? '#fa8c16' : '#52C41A', marginRight: 6 }} />
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {pendingCount > 0 ? `${pendingCount}건 승인 대기중` : '대기 중인 항목 없음'}
                  </Typography.Text>
                </div>
                {pendingCount > 0 && (
                  <Button
                    type="link"
                    size="small"
                    onClick={() => navigate('/student/expenditures')}
                    style={{ padding: 0, marginTop: 8, fontSize: 12 }}
                  >
                    자세히 보기 →
                  </Button>
                )}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card style={cardStyle} styles={{ body: { padding: 20 } }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
                최근 알림
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
                    알림이 없습니다
                  </Typography.Text>
                }
                style={{ margin: '8px 0' }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Card
        style={{ ...cardStyle, marginTop: 20 }}
        styles={{ body: { padding: 24 } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <Typography.Title level={5} style={{ margin: 0, marginBottom: 4 }}>
              내 동아리
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              동아리 정보를 확인하고 관리하세요
            </Typography.Text>
          </div>
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate(buildRoute.studentClubDetail(1))}
            style={{ borderRadius: 8 }}
          >
            내 동아리 바로가기
          </Button>
        </div>

        <div style={{ marginTop: 20, padding: 20, background: '#f5f6fa', borderRadius: 10 }}>
          <Row gutter={24}>
            <Col xs={24} sm={8}>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  동아리명
                </Typography.Text>
                <div style={{ marginTop: 4, fontWeight: 600, fontSize: 15 }}>테크스타트업</div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  팀원 수
                </Typography.Text>
                <div style={{ marginTop: 4, fontWeight: 600, fontSize: 15 }}>3명</div>
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  사업비 집행률
                </Typography.Text>
                <div style={{ marginTop: 4 }}>
                  <Progress percent={50} size="small" strokeColor="#1677FF" />
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      <Card
        style={{ ...cardStyle, marginTop: 20 }}
        styles={{ body: { padding: 24 } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div>
            <Typography.Title level={5} style={{ margin: 0, marginBottom: 4 }}>
              최근 집행 내역
            </Typography.Title>
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              최근 5건의 사업비 집행 내역
            </Typography.Text>
          </div>
          <Button
            type="primary"
            icon={<ArrowRightOutlined />}
            onClick={() => navigate('/student/expenditures')}
            style={{ borderRadius: 8 }}
          >
            전체 보기
          </Button>
        </div>

        {expendituresLoading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Spin />
          </div>
        ) : recentExpenditures.length > 0 ? (
          <Table
            columns={columns}
            dataSource={recentExpenditures}
            pagination={false}
            rowKey="id"
            size="small"
            onRow={(record) => ({
              onClick: () => navigate(`/student/expenditures/${record.id}`),
              style: { cursor: 'pointer' },
            })}
          />
        ) : (
          <Empty description="집행 내역이 없습니다" style={{ padding: '40px 0' }} />
        )}
      </Card>
    </div>
  );
};

export default StudentDashboardPage;
