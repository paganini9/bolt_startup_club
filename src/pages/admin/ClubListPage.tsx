import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Table,
  Input,
  Button,
  Tag,
  Progress,
  Typography,
  Card,
  Modal,
  Form,
  message,
  Avatar,
  Row,
  Col,
  Statistic,
} from 'antd';
import {
  SearchOutlined,
  PlusOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { clubApi } from '../../api/clubApi';
import { Club } from '../../types/club';
import PageHeader from '../../components/common/PageHeader';
import { ROUTES, buildRoute } from '../../config/routes';
import dayjs from 'dayjs';

const phaseLabels: Record<string, { label: string; color: string }> = {
  RECRUITING: { label: '모집 중', color: 'blue' },
  SELECTED: { label: '선정됨', color: 'cyan' },
  OPERATING: { label: '운영 중', color: 'green' },
  COMPLETED: { label: '종료', color: 'default' },
};

const AdminClubListPage: React.FC = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const { data, isLoading } = useQuery({
    queryKey: ['clubs', { page, keyword }],
    queryFn: () => clubApi.getClubs({ page, size: 10, keyword: keyword || undefined }),
  });

  const clubs = data?.data.content ?? [];
  const total = data?.data.totalElements ?? 0;

  const handleSearch = (value: string) => {
    setKeyword(value);
    setPage(0);
  };

  const handleRegister = () => {
    form.validateFields().then((values) => {
      message.success(`'${values.name}' 동아리가 등록 요청되었습니다. (Phase 2에서 완전 구현 예정)`);
      form.resetFields();
      setIsModalOpen(false);
    });
  };

  const columns: ColumnsType<Club> = [
    {
      title: '동아리명',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, club: Club) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {club.logoUrl ? (
            <Avatar src={club.logoUrl} size={36} shape="square" style={{ borderRadius: 6 }} />
          ) : (
            <Avatar
              size={36}
              shape="square"
              icon={<TeamOutlined />}
              style={{ background: '#1677FF', borderRadius: 6 }}
            />
          )}
          <Typography.Text strong>{name}</Typography.Text>
        </div>
      ),
    },
    {
      title: '팀장',
      key: 'leader',
      render: (_: unknown, club: Club) => {
        const leader = club.members.find((m) => m.role === 'LEADER');
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <TrophyOutlined style={{ color: '#faad14', fontSize: 12 }} />
            {leader?.name ?? '-'}
          </div>
        );
      },
      responsive: ['sm'] as never,
    },
    {
      title: '팀원 수',
      key: 'memberCount',
      render: (_: unknown, club: Club) => `${club.members.length}명`,
      align: 'center',
      responsive: ['md'] as never,
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
          style={{ minWidth: 80 }}
        />
      ),
      responsive: ['lg'] as never,
    },
    {
      title: '등록일',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY.MM.DD'),
      responsive: ['lg'] as never,
    },
  ];

  return (
    <div>
      <PageHeader
        title="동아리 관리"
        subtitle="전체 창업동아리 목록을 관리합니다"
        breadcrumbs={[{ label: '대시보드', path: ROUTES.ADMIN_DASHBOARD }, { label: '동아리 관리' }]}
      />

      <Row gutter={[16, 16]} style={{ marginBottom: 20 }}>
        {[
          { label: '전체', value: total, color: '#1677FF' },
          { label: '운영 중', value: clubs.filter((c) => c.phase === 'OPERATING').length, color: '#52C41A' },
          { label: '선정됨', value: clubs.filter((c) => c.phase === 'SELECTED').length, color: '#13c2c2' },
          { label: '모집 중', value: clubs.filter((c) => c.phase === 'RECRUITING').length, color: '#1677FF' },
        ].map((stat) => (
          <Col xs={12} sm={6} key={stat.label}>
            <Card
              style={{ borderRadius: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.06)', textAlign: 'center' }}
              styles={{ body: { padding: 16 } }}
            >
              <Statistic
                value={stat.value}
                suffix="개"
                valueStyle={{ fontSize: 20, fontWeight: 700, color: stat.color }}
              />
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {stat.label}
              </Typography.Text>
            </Card>
          </Col>
        ))}
      </Row>

      <Card
        style={{ borderRadius: 12, boxShadow: '0 2px 12px rgba(0,0,0,0.07)' }}
        styles={{ body: { padding: '20px 24px' } }}
      >
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginBottom: 20,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Input.Search
            placeholder="동아리명 검색"
            allowClear
            enterButton={<SearchOutlined />}
            size="large"
            onSearch={handleSearch}
            style={{ maxWidth: 320 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            size="large"
            onClick={() => setIsModalOpen(true)}
            style={{ borderRadius: 8, fontWeight: 600 }}
          >
            동아리 등록
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={clubs}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total,
            pageSize: 10,
            current: page + 1,
            onChange: (p) => setPage(p - 1),
            showTotal: (tot) => `총 ${tot}개`,
            showSizeChanger: false,
          }}
          onRow={(record) => ({
            onClick: () => navigate(buildRoute.adminClubDetail(record.id)),
            style: { cursor: 'pointer' },
          })}
          rowHoverable
          size="middle"
          style={{ borderRadius: 8, overflow: 'hidden' }}
        />
      </Card>

      <Modal
        title="동아리 등록"
        open={isModalOpen}
        onOk={handleRegister}
        onCancel={() => { setIsModalOpen(false); form.resetFields(); }}
        okText="등록 요청"
        cancelText="취소"
        okButtonProps={{ style: { borderRadius: 8 } }}
        cancelButtonProps={{ style: { borderRadius: 8 } }}
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="동아리명"
            rules={[{ required: true, message: '동아리명을 입력해주세요.' }]}
          >
            <Input placeholder="동아리명을 입력하세요" />
          </Form.Item>
          <Form.Item
            name="description"
            label="동아리 소개"
            rules={[{ required: true, message: '동아리 소개를 입력해주세요.' }]}
          >
            <Input.TextArea rows={4} placeholder="동아리를 소개해주세요" />
          </Form.Item>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            * 전체 동아리 등록 기능은 Phase 2에서 완전히 구현될 예정입니다.
          </Typography.Text>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminClubListPage;
