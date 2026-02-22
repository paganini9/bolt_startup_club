import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Image,
  Descriptions,
  Button,
  Modal,
  Input,
  message,
  Tag,
  Typography,
  Table,
  Space,
  Spin,
  Alert,
} from 'antd';
import {
  CheckOutlined,
  CloseOutlined,
  ArrowLeftOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  RotateRightOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../../components/common/PageHeader';
import { budgetApi } from '../../../api/budgetApi';
import type { ExpenditureStatus, PurchaseItem } from '../../../types/budget';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { TextArea } = Input;

const ApprovalDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['expenditure', id],
    queryFn: () => budgetApi.getExpenditureById(Number(id)),
    enabled: !!id,
  });

  const approvalMutation = useMutation({
    mutationFn: ({ action, reason }: { action: 'APPROVE' | 'REJECT'; reason?: string }) =>
      budgetApi.approveExpenditure(Number(id), { action, rejectionReason: reason }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['expenditure', id] });
      queryClient.invalidateQueries({ queryKey: ['expenditures'] });
      queryClient.invalidateQueries({ queryKey: ['budget'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });

      if (variables.action === 'APPROVE') {
        message.success('집행 요청이 승인되었습니다');
      } else {
        message.success('집행 요청이 반려되었습니다');
      }
      navigate('/admin/approvals');
    },
    onError: () => {
      message.error('처리 중 오류가 발생했습니다');
    },
  });

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" />
      </div>
    );
  }

  const expenditure = data?.data;

  if (!expenditure) {
    return (
      <div>
        <PageHeader title="승인 상세" onBack={() => navigate('/admin/approvals')} />
        <Card>
          <Alert message="집행 내역을 찾을 수 없습니다" type="error" />
        </Card>
      </div>
    );
  }

  const handleApprove = () => {
    Modal.confirm({
      title: '집행 요청 승인',
      content: '이 집행 요청을 승인하시겠습니까?',
      okText: '승인',
      cancelText: '취소',
      okType: 'primary',
      onOk: () => {
        approvalMutation.mutate({ action: 'APPROVE' });
      },
    });
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      message.error('반려 사유를 입력해주세요');
      return;
    }

    approvalMutation.mutate({ action: 'REJECT', reason: rejectionReason });
    setRejectModalVisible(false);
  };

  const getStatusTag = (status: ExpenditureStatus) => {
    const statusMap: Record<ExpenditureStatus, { color: string; text: string }> = {
      DRAFT: { color: '#d9d9d9', text: '임시저장' },
      PENDING: { color: '#fa8c16', text: '승인 대기중' },
      APPROVED: { color: '#52C41A', text: '승인 완료' },
      REJECTED: { color: '#FF4D4F', text: '반려됨' },
    };
    const config = statusMap[status];
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getTypeText = (type: string) => {
    const typeMap: Record<string, string> = {
      CASH: '현금 집행',
      CARD: '카드/물품 구매',
      OUTSOURCE: '외주 용역',
    };
    return typeMap[type] || type;
  };

  const itemColumns: ColumnsType<PurchaseItem> = [
    {
      title: '품목명',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '수량',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 100,
      align: 'center',
    },
    {
      title: '단가',
      dataIndex: 'unitPrice',
      key: 'unitPrice',
      width: 120,
      align: 'right',
      render: (price: number) => `${price.toLocaleString()}원`,
    },
    {
      title: '소계',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      width: 120,
      align: 'right',
      render: (price: number) => `${price.toLocaleString()}원`,
    },
  ];

  const cardStyle = {
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    height: '100%',
  };

  const isPending = expenditure.status === 'PENDING';

  return (
    <div>
      <PageHeader
        title="승인 상세"
        onBack={() => navigate('/admin/approvals')}
        extra={
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/approvals')}>
            목록으로
          </Button>
        }
      />

      <Row gutter={[20, 20]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ZoomInOutlined />
                증빙 자료
              </Space>
            }
            style={{ ...cardStyle, minHeight: 600 }}
            styles={{ body: { padding: 24 } }}
          >
            {expenditure.type === 'CASH' && expenditure.receiptFiles && expenditure.receiptFiles.length > 0 && (
              <div>
                <Typography.Text strong style={{ display: 'block', marginBottom: 12 }}>
                  영수증 사진
                </Typography.Text>
                <Image.PreviewGroup>
                  <Space wrap size="large">
                    {expenditure.receiptFiles.map((file) => (
                      <Image
                        key={file.id}
                        src={file.fileUrl}
                        alt={file.originalName}
                        width="100%"
                        style={{ borderRadius: 8, maxWidth: 400 }}
                        preview={{
                          toolbarRender: (
                            _,
                            {
                              transform: { scale },
                              actions: { onZoomOut, onZoomIn, onRotateRight },
                            }
                          ) => (
                            <Space size={12} style={{ padding: '0 24px' }}>
                              <ZoomOutOutlined onClick={onZoomOut} style={{ fontSize: 20 }} />
                              <ZoomInOutlined onClick={onZoomIn} style={{ fontSize: 20 }} />
                              <RotateRightOutlined onClick={onRotateRight} style={{ fontSize: 20 }} />
                            </Space>
                          ),
                        }}
                      />
                    ))}
                  </Space>
                </Image.PreviewGroup>
              </div>
            )}

            {expenditure.type === 'CARD' && (
              <div>
                {expenditure.captureFiles && expenditure.captureFiles.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <Typography.Text strong style={{ display: 'block', marginBottom: 12 }}>
                      구매 화면 캡처
                    </Typography.Text>
                    <Image.PreviewGroup>
                      <Space wrap size="large">
                        {expenditure.captureFiles.map((file) => (
                          <Image
                            key={file.id}
                            src={file.fileUrl}
                            alt={file.originalName}
                            width="100%"
                            style={{ borderRadius: 8, maxWidth: 400 }}
                          />
                        ))}
                      </Space>
                    </Image.PreviewGroup>
                  </div>
                )}
              </div>
            )}

            {expenditure.type === 'OUTSOURCE' && (
              <div>
                {expenditure.proposalFiles && expenditure.proposalFiles.length > 0 && (
                  <div>
                    <Typography.Text strong style={{ display: 'block', marginBottom: 12 }}>
                      의뢰서 / 견적서
                    </Typography.Text>
                    <Space direction="vertical" style={{ width: '100%' }}>
                      {expenditure.proposalFiles.map((file) => (
                        <Button key={file.id} icon={<DownloadOutlined />} block size="large">
                          {file.originalName}
                        </Button>
                      ))}
                    </Space>
                  </div>
                )}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card title="요청 정보" style={cardStyle} styles={{ body: { padding: 24 } }}>
            <div style={{ marginBottom: 24 }}>
              {getStatusTag(expenditure.status)}
              <Typography.Text type="secondary" style={{ marginLeft: 12 }}>
                요청일: {dayjs(expenditure.createdAt).format('YYYY-MM-DD HH:mm')}
              </Typography.Text>
            </div>

            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="유형">{getTypeText(expenditure.type)}</Descriptions.Item>
              <Descriptions.Item label="금액">
                <Typography.Text strong style={{ fontSize: 18, color: '#1677FF' }}>
                  {expenditure.amount.toLocaleString()}원
                </Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="동아리">{expenditure.clubName}</Descriptions.Item>
              <Descriptions.Item label="요청자">
                {expenditure.requestedBy.name} ({expenditure.requestedBy.studentId})
              </Descriptions.Item>
              <Descriptions.Item label="사용 용도">{expenditure.description}</Descriptions.Item>

              {expenditure.type === 'CARD' && expenditure.purchaseUrl && (
                <Descriptions.Item label="구매 URL">
                  <a href={expenditure.purchaseUrl} target="_blank" rel="noopener noreferrer">
                    {expenditure.purchaseUrl}
                  </a>
                </Descriptions.Item>
              )}

              {expenditure.approvedBy && (
                <>
                  <Descriptions.Item label="승인자">{expenditure.approvedBy.name}</Descriptions.Item>
                  <Descriptions.Item label="승인일">
                    {dayjs(expenditure.approvedAt).format('YYYY-MM-DD HH:mm')}
                  </Descriptions.Item>
                </>
              )}

              {expenditure.status === 'REJECTED' && expenditure.rejectionReason && (
                <Descriptions.Item label="반려 사유">
                  <Typography.Text type="danger">{expenditure.rejectionReason}</Typography.Text>
                </Descriptions.Item>
              )}
            </Descriptions>

            {expenditure.type === 'CARD' && expenditure.itemList && expenditure.itemList.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Typography.Text strong style={{ display: 'block', marginBottom: 12 }}>
                  품목 리스트
                </Typography.Text>
                <Table
                  columns={itemColumns}
                  dataSource={expenditure.itemList}
                  pagination={false}
                  size="small"
                  rowKey={(_, index) => index!}
                  summary={(data) => (
                    <Table.Summary>
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3} align="right">
                          <Typography.Text strong>합계</Typography.Text>
                        </Table.Summary.Cell>
                        <Table.Summary.Cell index={1} align="right">
                          <Typography.Text strong style={{ fontSize: 16, color: '#1677FF' }}>
                            {data.reduce((sum, item) => sum + item.totalPrice, 0).toLocaleString()}원
                          </Typography.Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    </Table.Summary>
                  )}
                />
              </div>
            )}

            {isPending && (
              <div style={{ marginTop: 32 }}>
                <Space size="large" style={{ width: '100%', justifyContent: 'center' }}>
                  <Button
                    type="primary"
                    size="large"
                    icon={<CheckOutlined />}
                    onClick={handleApprove}
                    loading={approvalMutation.isPending}
                    style={{ minWidth: 140, height: 48, fontSize: 16 }}
                  >
                    승인
                  </Button>
                  <Button
                    danger
                    size="large"
                    icon={<CloseOutlined />}
                    onClick={() => setRejectModalVisible(true)}
                    loading={approvalMutation.isPending}
                    style={{ minWidth: 140, height: 48, fontSize: 16 }}
                  >
                    반려
                  </Button>
                </Space>
              </div>
            )}

            {!isPending && (
              <Alert
                message="처리 완료"
                description={`이 요청은 이미 ${expenditure.status === 'APPROVED' ? '승인' : '반려'}되었습니다.`}
                type={expenditure.status === 'APPROVED' ? 'success' : 'error'}
                showIcon
                style={{ marginTop: 24 }}
              />
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title="집행 요청 반려"
        open={rejectModalVisible}
        onOk={handleReject}
        onCancel={() => setRejectModalVisible(false)}
        okText="반려"
        cancelText="취소"
        okButtonProps={{ danger: true, loading: approvalMutation.isPending }}
      >
        <div style={{ marginBottom: 16 }}>
          <Typography.Text type="secondary">
            반려 사유를 입력해주세요. 요청자에게 전달됩니다.
          </Typography.Text>
        </div>
        <TextArea
          rows={4}
          placeholder="반려 사유를 구체적으로 입력해주세요"
          value={rejectionReason}
          onChange={(e) => setRejectionReason(e.target.value)}
          showCount
          maxLength={500}
        />
      </Modal>
    </div>
  );
};

export default ApprovalDetailPage;
