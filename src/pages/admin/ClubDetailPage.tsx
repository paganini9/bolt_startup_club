import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Tabs,
  Table,
  Tag,
  Button,
  Typography,
  Avatar,
  Skeleton,
  Alert,
  Empty,
  Image,
  Descriptions,
  Card,
  Row,
  Col,
  Progress,
  Space,
  Popconfirm,
  message,
  Statistic,
} from 'antd';
import {
  TeamOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TrophyOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PhoneOutlined,
  MailOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { clubApi } from '../../api/clubApi';
import { ClubMember } from '../../types/club';
import PageHeader from '../../components/common/PageHeader';
import { ROUTES } from '../../config/routes';
import dayjs from 'dayjs';

const phaseLabels: Record<string, { label: string; color: string }> = {
  RECRUITING: { label: '모집 중', color: 'blue' },
  SELECTED: { label: '선정됨', color: 'cyan' },
  OPERATING: { label: '운영 중', color: 'green' },
  COMPLETED: { label: '종료', color: 'default' },
};

const memberColumns: ColumnsType<ClubMember> = [
  {
    title: '이름',
    dataIndex: 'name',
    key: 'name',
    render: (name: string, record: ClubMember) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar size={28} icon={<UserOutlined />} style={{ background: '#1677FF', flexShrink: 0 }} />
        <div>
          <div style={{ fontWeight: 500 }}>{name}</div>
          <div style={{ fontSize: 11, color: '#8c8c8c' }}>{record.studentId}</div>
        </div>
      </div>
    ),
  },
  {
    title: '역할',
    dataIndex: 'role',
    key: 'role',
    render: (role: string) => (
      <Tag color={role === 'LEADER' ? 'gold' : 'blue'} icon={role === 'LEADER' ? <TrophyOutlined /> : <TeamOutlined />}>
        {role === 'LEADER' ? '팀장' : '팀원'}
      </Tag>
    ),
  },
  {
    title: '이메일',
    dataIndex: 'email',
    key: 'email',
    render: (email: string) => (
      <a href={`mailto:${email}`} style={{ color: '#1677FF' }}>
        <MailOutlined style={{ marginRight: 4 }} />{email}
      </a>
    ),
    responsive: ['md'] as never,
  },
  {
    title: '전화번호',
    dataIndex: 'phone',
    key: 'phone',
    render: (phone?: string) =>
      phone ? (
        <span><PhoneOutlined style={{ marginRight: 4 }} />{phone}</span>
      ) : (
        <Typography.Text type="secondary">-</Typography.Text>
      ),
    responsive: ['lg'] as never,
  },
  {
    title: '가입일',
    dataIndex: 'joinedAt',
    key: 'joinedAt',
    render: (date: string) => dayjs(date).format('YYYY.MM.DD'),
    responsive: ['lg'] as never,
  },
];

const placeholderTab = (phase: string) => (
  <div
    style={{
      textAlign: 'center',
      padding: '48px 24px',
      background: '#fafafa',
      borderRadius: 10,
      border: '2px dashed #d9d9d9',
    }}
  >
    <Typography.Title level={4} type="secondary" style={{ marginBottom: 8 }}>
      {phase}에서 추가 예정
    </Typography.Title>
    <Typography.Text type="secondary">
      해당 기능은 다음 개발 단계에서 추가될 예정입니다.
    </Typography.Text>
  </div>
);

const AdminClubDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const clubId = Number(id);

  const { data, isLoading, error } = useQuery({
    queryKey: ['club', clubId],
    queryFn: () => clubApi.getClubById(clubId),
    enabled: !!clubId,
  });

  const approveMutation = useMutation({
    mutationFn: () => clubApi.approveNameChange(clubId),
    onSuccess: () => {
      message.success('동아리명 변경 요청이 승인되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['club', clubId] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: () => clubApi.rejectNameChange(clubId),
    onSuccess: () => {
      message.success('동아리명 변경 요청이 반려되었습니다.');
      queryClient.invalidateQueries({ queryKey: ['club', clubId] });
    },
  });

  const club = data?.data;
  const phase = club ? phaseLabels[club.phase] : null;
  const leader = club?.members.find((m) => m.role === 'LEADER');

  const tabItems = [
    {
      key: 'info',
      label: (
        <span>
          <TeamOutlined />
          기본 정보
        </span>
      ),
      children: isLoading ? (
        <Skeleton active paragraph={{ rows: 8 }} />
      ) : club ? (
        <div>
          <div
            style={{
              display: 'flex',
              gap: 24,
              marginBottom: 24,
              flexWrap: 'wrap',
              padding: 20,
              background: '#f9fafb',
              borderRadius: 10,
            }}
          >
            {club.logoUrl ? (
              <Image
                src={club.logoUrl}
                alt={club.name}
                width={80}
                height={80}
                style={{ objectFit: 'cover', borderRadius: 10, border: '1px solid #e8e8e8' }}
                fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              />
            ) : (
              <Avatar
                size={80}
                icon={<TeamOutlined />}
                style={{ background: '#1677FF', borderRadius: 10, flexShrink: 0 }}
              />
            )}
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {club.name}
                </Typography.Title>
                {phase && <Tag color={phase.color}>{phase.label}</Tag>}
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                {club.description}
              </Typography.Text>
            </div>
          </div>

          <Row gutter={16} style={{ marginBottom: 24 }}>
            {club.budget && (
              <>
                <Col xs={24} sm={8}>
                  <Card style={{ borderRadius: 10, textAlign: 'center', background: '#f0f7ff', border: 'none' }} styles={{ body: { padding: 16 } }}>
                    <Statistic
                      title={<span style={{ fontSize: 12 }}>총 예산</span>}
                      value={club.budget.total}
                      suffix="원"
                      valueStyle={{ fontSize: 16, fontWeight: 700, color: '#1677FF' }}
                      formatter={(v) => Number(v).toLocaleString()}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card style={{ borderRadius: 10, textAlign: 'center', background: '#fff7e6', border: 'none' }} styles={{ body: { padding: 16 } }}>
                    <Statistic
                      title={<span style={{ fontSize: 12 }}>집행액</span>}
                      value={club.budget.spent}
                      suffix="원"
                      valueStyle={{ fontSize: 16, fontWeight: 700, color: '#fa8c16' }}
                      formatter={(v) => Number(v).toLocaleString()}
                    />
                  </Card>
                </Col>
                <Col xs={24} sm={8}>
                  <Card style={{ borderRadius: 10, textAlign: 'center', background: '#f6ffed', border: 'none' }} styles={{ body: { padding: 16 } }}>
                    <Statistic
                      title={<span style={{ fontSize: 12 }}>잔액</span>}
                      value={club.budget.remaining}
                      suffix="원"
                      valueStyle={{ fontSize: 16, fontWeight: 700, color: '#52C41A' }}
                      formatter={(v) => Number(v).toLocaleString()}
                    />
                  </Card>
                </Col>
              </>
            )}
          </Row>

          {club.budget && (
            <div style={{ marginBottom: 24 }}>
              <Typography.Text strong style={{ fontSize: 13 }}>사업비 집행률</Typography.Text>
              <Progress
                percent={club.budget.executionRate}
                strokeColor={club.budget.executionRate >= 80 ? '#52C41A' : '#1677FF'}
                style={{ marginTop: 8 }}
              />
            </div>
          )}

          <Descriptions
            title="동아리 상세 정보"
            bordered
            column={{ xs: 1, sm: 2 }}
            size="small"
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="동아리명">{club.name}</Descriptions.Item>
            <Descriptions.Item label="단계">
              {phase && <Tag color={phase.color}>{phase.label}</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="팀원 수">{club.members.length}명</Descriptions.Item>
            <Descriptions.Item label="등록일">
              {dayjs(club.createdAt).format('YYYY.MM.DD')}
            </Descriptions.Item>
            {leader && (
              <>
                <Descriptions.Item label="팀장 이름">{leader.name}</Descriptions.Item>
                <Descriptions.Item label="팀장 학번">{leader.studentId}</Descriptions.Item>
                <Descriptions.Item label="팀장 이메일">
                  <a href={`mailto:${leader.email}`}>{leader.email}</a>
                </Descriptions.Item>
                {leader.phone && (
                  <Descriptions.Item label="팀장 전화번호">{leader.phone}</Descriptions.Item>
                )}
              </>
            )}
          </Descriptions>

          <div
            style={{
              padding: 16,
              background: '#fff8f0',
              border: '1px solid #ffd591',
              borderRadius: 10,
              marginBottom: 24,
            }}
          >
            <Typography.Text strong style={{ display: 'block', marginBottom: 10 }}>
              동아리명 변경 요청 처리
            </Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 13, display: 'block', marginBottom: 12 }}>
              대기 중인 동아리명 변경 요청을 승인하거나 반려할 수 있습니다. (Phase 2에서 실제 요청 데이터와 연결)
            </Typography.Text>
            <Space>
              <Popconfirm
                title="변경 요청을 승인하시겠습니까?"
                onConfirm={() => approveMutation.mutate()}
                okText="승인"
                cancelText="취소"
              >
                <Button
                  type="primary"
                  icon={<CheckCircleOutlined />}
                  loading={approveMutation.isPending}
                  style={{ borderRadius: 8 }}
                >
                  승인
                </Button>
              </Popconfirm>
              <Popconfirm
                title="변경 요청을 반려하시겠습니까?"
                onConfirm={() => rejectMutation.mutate()}
                okText="반려"
                cancelText="취소"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  icon={<CloseCircleOutlined />}
                  loading={rejectMutation.isPending}
                  style={{ borderRadius: 8 }}
                >
                  반려
                </Button>
              </Popconfirm>
            </Space>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              팀원 목록
            </Typography.Title>
          </div>

          <Table
            columns={memberColumns}
            dataSource={club.members}
            rowKey="userId"
            pagination={false}
            size="middle"
            style={{ borderRadius: 8, overflow: 'hidden' }}
          />
        </div>
      ) : (
        <Empty description="동아리 정보를 불러올 수 없습니다." />
      ),
    },
    {
      key: 'budget',
      label: (
        <span>
          <DollarOutlined />
          사업비
        </span>
      ),
      disabled: true,
      children: placeholderTab('Phase 2'),
    },
    {
      key: 'activity',
      label: (
        <span>
          <CalendarOutlined />
          활동/행사
        </span>
      ),
      disabled: true,
      children: placeholderTab('Phase 4'),
    },
    {
      key: 'achievement',
      label: (
        <span>
          <TrophyOutlined />
          성과
        </span>
      ),
      disabled: true,
      children: placeholderTab('Phase 4'),
    },
    {
      key: 'report',
      label: (
        <span>
          <FileTextOutlined />
          보고서
        </span>
      ),
      disabled: true,
      children: placeholderTab('Phase 4'),
    },
  ];

  if (error) {
    return (
      <div>
        <PageHeader title="동아리 상세" breadcrumbs={[{ label: '대시보드', path: ROUTES.ADMIN_DASHBOARD }, { label: '동아리 관리', path: ROUTES.ADMIN_CLUBS }, { label: '상세' }]} />
        <Alert message="동아리 정보를 불러오는 데 실패했습니다." type="error" showIcon />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={club?.name ?? '동아리 상세'}
        breadcrumbs={[
          { label: '대시보드', path: ROUTES.ADMIN_DASHBOARD },
          { label: '동아리 관리', path: ROUTES.ADMIN_CLUBS },
          { label: club?.name ?? '상세' },
        ]}
        extra={
          <Button onClick={() => navigate(ROUTES.ADMIN_CLUBS)} style={{ borderRadius: 8 }}>
            목록으로
          </Button>
        }
      />

      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          padding: '0 24px 24px',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
        }}
      >
        <Tabs items={tabItems} style={{ paddingTop: 8 }} />
      </div>
    </div>
  );
};

export default AdminClubDetailPage;
