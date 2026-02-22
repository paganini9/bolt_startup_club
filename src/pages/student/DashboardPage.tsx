import React from 'react';
import { Card, Col, Row, Steps, Typography, Button, Empty, Tag, Statistic, Progress } from 'antd';
import {
  ArrowRightOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BellOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import PageHeader from '../../components/common/PageHeader';
import { buildRoute } from '../../config/routes';

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

  const cardStyle = {
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    height: '100%',
  };

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
            <div style={{ marginTop: 12 }}>
              <Statistic
                value={2500000}
                suffix="원"
                valueStyle={{ fontSize: 22, fontWeight: 700, color: '#1677FF' }}
                formatter={(val) => Number(val).toLocaleString()}
              />
              <div
                style={{
                  marginTop: 12,
                  padding: '10px 14px',
                  background: '#f0f7ff',
                  borderRadius: 8,
                  textAlign: 'center',
                }}
              >
                <DollarOutlined style={{ color: '#1677FF', marginRight: 6 }} />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  Phase 2에서 연결 예정
                </Typography.Text>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} xl={6}>
          <Card style={cardStyle} styles={{ body: { padding: 20 } }}>
            <Typography.Text type="secondary" style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.5 }}>
              승인 대기 건수
            </Typography.Text>
            <div style={{ marginTop: 12 }}>
              <Statistic
                value={0}
                suffix="건"
                valueStyle={{ fontSize: 28, fontWeight: 700, color: '#52C41A' }}
              />
              <div style={{ marginTop: 8 }}>
                <CheckCircleOutlined style={{ color: '#52C41A', marginRight: 6 }} />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  대기 중인 항목 없음
                </Typography.Text>
              </div>
              <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', marginTop: 8 }}>
                Phase 2에서 실제 데이터 연결 예정
              </Typography.Text>
            </div>
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
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  알림이 없습니다
                </Typography.Text>
              }
              style={{ margin: '8px 0' }}
            />
            <Typography.Text type="secondary" style={{ fontSize: 11, display: 'block', textAlign: 'center', marginTop: 4 }}>
              Phase 2에서 실시간 알림 연결 예정
            </Typography.Text>
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
        styles={{ body: { padding: 20 } }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <ClockCircleOutlined style={{ color: '#1677FF' }} />
          <Typography.Text strong>Phase 2 예정 기능</Typography.Text>
        </div>
        <Row gutter={12} style={{ marginTop: 12 }}>
          {[
            '사업비 신청 및 영수증 업로드',
            '지출 내역 조회',
            '승인/반려 알림',
            '예산 집행 현황 차트',
          ].map((feature) => (
            <Col key={feature} xs={24} sm={12} md={6} style={{ marginBottom: 8 }}>
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
                {feature}
              </div>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default StudentDashboardPage;
