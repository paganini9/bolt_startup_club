import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
} from 'antd';
import {
  EditOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { clubApi } from '../../api/clubApi';
import { ClubMember } from '../../types/club';
import { useAuthStore } from '../../stores/authStore';
import PageHeader from '../../components/common/PageHeader';
import { buildRoute, ROUTES } from '../../config/routes';
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
    render: (name: string) => (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Avatar size={28} icon={<UserOutlined />} style={{ background: '#1677FF', flexShrink: 0 }} />
        <span style={{ fontWeight: 500 }}>{name}</span>
      </div>
    ),
  },
  {
    title: '학번',
    dataIndex: 'studentId',
    key: 'studentId',
    responsive: ['sm'] as never,
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
    responsive: ['md'] as never,
  },
  {
    title: '가입일',
    dataIndex: 'joinedAt',
    key: 'joinedAt',
    responsive: ['lg'] as never,
    render: (date: string) => dayjs(date).format('YYYY.MM.DD'),
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

const StudentClubDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const clubId = Number(id);

  const { data, isLoading, error } = useQuery({
    queryKey: ['club', clubId],
    queryFn: () => clubApi.getClubById(clubId),
    enabled: !!clubId,
  });

  const club = data?.data;
  const isLeader = user?.role === 'LEADER';
  const phase = club ? phaseLabels[club.phase] : null;

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
        <Skeleton active paragraph={{ rows: 6 }} />
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
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {club.name}
                </Typography.Title>
                {phase && <Tag color={phase.color}>{phase.label}</Tag>}
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 13 }}>
                {club.description}
              </Typography.Text>
              <div style={{ marginTop: 8 }}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  등록일: {dayjs(club.createdAt).format('YYYY년 MM월 DD일')}
                </Typography.Text>
              </div>
            </div>
          </div>

          <Descriptions
            title="상세 정보"
            bordered
            column={{ xs: 1, sm: 2 }}
            size="small"
            style={{ marginBottom: 24 }}
          >
            <Descriptions.Item label="동아리명">{club.name}</Descriptions.Item>
            <Descriptions.Item label="진행 단계">
              {phase && <Tag color={phase.color}>{phase.label}</Tag>}
            </Descriptions.Item>
            <Descriptions.Item label="팀원 수">{club.members.length}명</Descriptions.Item>
            <Descriptions.Item label="등록일">
              {dayjs(club.createdAt).format('YYYY.MM.DD')}
            </Descriptions.Item>
            {club.budget && (
              <>
                <Descriptions.Item label="총 예산">
                  {club.budget.total.toLocaleString()}원
                </Descriptions.Item>
                <Descriptions.Item label="집행률">
                  {club.budget.executionRate}%
                </Descriptions.Item>
              </>
            )}
          </Descriptions>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <Typography.Title level={5} style={{ margin: 0 }}>
              팀원 목록
            </Typography.Title>
            {isLeader && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={() => navigate(buildRoute.studentClubEdit(clubId))}
                style={{ borderRadius: 8 }}
              >
                동아리 정보 수정
              </Button>
            )}
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
        <PageHeader title="동아리 상세" breadcrumbs={[{ label: '대시보드', path: ROUTES.STUDENT_DASHBOARD }, { label: '동아리 상세' }]} />
        <Alert message="동아리 정보를 불러오는 데 실패했습니다." type="error" showIcon />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={club?.name ?? '동아리 상세'}
        breadcrumbs={[
          { label: '대시보드', path: ROUTES.STUDENT_DASHBOARD },
          { label: '내 동아리' },
        ]}
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

export default StudentClubDetailPage;
