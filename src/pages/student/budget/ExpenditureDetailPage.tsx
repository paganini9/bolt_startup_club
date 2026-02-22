import React, { useState } from 'react';
import {
  Card,
  Descriptions,
  Tag,
  Button,
  Alert,
  Timeline,
  Image,
  Table,
  Space,
  Typography,
  message,
  Spin,
  Modal,
} from 'antd';
import {
  ArrowLeftOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  EditOutlined,
  CameraOutlined,
} from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PageHeader from '../../../components/common/PageHeader';
import FileUploader from '../../../components/common/FileUploader';
import { budgetApi } from '../../../api/budgetApi';
import type { ExpenditureStatus, PurchaseItem } from '../../../types/budget';
import type { UploadedFile } from '../../../types/file';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const ExpenditureDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const [inspectionFiles, setInspectionFiles] = useState<UploadedFile[]>([]);
  const [showInspectionUpload, setShowInspectionUpload] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['expenditure', id],
    queryFn: () => budgetApi.getExpenditureById(Number(id)),
    enabled: !!id,
  });

  const inspectionMutation = useMutation({
    mutationFn: (fileIds: number[]) =>
      budgetApi.submitInspection(Number(id), { inspectionFileIds: fileIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenditure', id] });
      message.success('검수 사진이 제출되었습니다');
      setShowInspectionUpload(false);
    },
    onError: () => {
      message.error('검수 사진 제출에 실패했습니다');
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
        <PageHeader title="집행 내역" onBack={() => navigate('/student/expenditures')} />
        <Card>
          <Alert message="집행 내역을 찾을 수 없습니다" type="error" />
        </Card>
      </div>
    );
  }

  const getStatusConfig = (status: ExpenditureStatus) => {
    const statusMap: Record<ExpenditureStatus, { color: string; text: string; icon: React.ReactNode }> = {
      DRAFT: {
        color: '#d9d9d9',
        text: '임시저장',
        icon: <ClockCircleOutlined />,
      },
      PENDING: {
        color: '#fa8c16',
        text: '승인 대기중',
        icon: <ClockCircleOutlined />,
      },
      APPROVED: {
        color: '#52C41A',
        text: '승인 완료',
        icon: <CheckCircleOutlined />,
      },
      REJECTED: {
        color: '#FF4D4F',
        text: '반려됨',
        icon: <CloseCircleOutlined />,
      },
    };
    return statusMap[status];
  };

  const statusConfig = getStatusConfig(expenditure.status);

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

  const handleSubmitInspection = () => {
    if (inspectionFiles.length === 0) {
      message.error('검수 사진을 1장 이상 업로드해주세요');
      return;
    }

    Modal.confirm({
      title: '검수 사진 제출',
      content: '검수 사진을 제출하시겠습니까?',
      onOk: () => {
        inspectionMutation.mutate(inspectionFiles.map((f) => f.id));
      },
    });
  };

  const cardStyle = {
    borderRadius: 12,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    marginBottom: 20,
  };

  return (
    <div>
      <PageHeader
        title="집행 내역 상세"
        onBack={() => navigate('/student/expenditures')}
        extra={
          <Space>
            {expenditure.status === 'REJECTED' && (
              <Button icon={<EditOutlined />} onClick={() => message.info('수정 기능은 추후 구현 예정입니다')}>
                수정 후 재제출
              </Button>
            )}
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/student/expenditures')}>
              목록으로
            </Button>
          </Space>
        }
      />

      <Card style={cardStyle} styles={{ body: { padding: 24 } }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
          <Tag
            color={statusConfig.color}
            icon={statusConfig.icon}
            style={{ fontSize: 16, padding: '6px 16px', margin: 0 }}
          >
            {statusConfig.text}
          </Tag>
          <Typography.Text type="secondary">
            요청일: {dayjs(expenditure.createdAt).format('YYYY-MM-DD HH:mm')}
          </Typography.Text>
        </div>

        {expenditure.status === 'REJECTED' && expenditure.rejectionReason && (
          <Alert
            message="반려 사유"
            description={expenditure.rejectionReason}
            type="error"
            showIcon
            style={{ marginBottom: 24 }}
            action={
              <Button size="small" danger onClick={() => message.info('수정 기능은 추후 구현 예정입니다')}>
                수정하기
              </Button>
            }
          />
        )}

        <Descriptions bordered column={2}>
          <Descriptions.Item label="유형" span={1}>
            {getTypeText(expenditure.type)}
          </Descriptions.Item>
          <Descriptions.Item label="금액" span={1}>
            <Typography.Text strong style={{ fontSize: 16, color: '#1677FF' }}>
              {expenditure.amount.toLocaleString()}원
            </Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="동아리" span={1}>
            {expenditure.clubName}
          </Descriptions.Item>
          <Descriptions.Item label="요청자" span={1}>
            {expenditure.requestedBy.name} ({expenditure.requestedBy.studentId})
          </Descriptions.Item>
          {expenditure.approvedBy && (
            <>
              <Descriptions.Item label="승인자" span={1}>
                {expenditure.approvedBy.name}
              </Descriptions.Item>
              <Descriptions.Item label="승인일" span={1}>
                {dayjs(expenditure.approvedAt).format('YYYY-MM-DD HH:mm')}
              </Descriptions.Item>
            </>
          )}
          <Descriptions.Item label="사용 용도" span={2}>
            {expenditure.description}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {expenditure.type === 'CASH' && expenditure.receiptFiles && expenditure.receiptFiles.length > 0 && (
        <Card title="영수증 사진" style={cardStyle} styles={{ body: { padding: 24 } }}>
          <Image.PreviewGroup>
            <Space wrap>
              {expenditure.receiptFiles.map((file) => (
                <Image
                  key={file.id}
                  src={file.fileUrl}
                  alt={file.originalName}
                  width={200}
                  style={{ borderRadius: 8, objectFit: 'cover' }}
                />
              ))}
            </Space>
          </Image.PreviewGroup>
        </Card>
      )}

      {expenditure.type === 'CARD' && (
        <>
          {expenditure.purchaseUrl && (
            <Card title="구매 정보" style={cardStyle} styles={{ body: { padding: 24 } }}>
              <div style={{ marginBottom: 16 }}>
                <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                  구매 URL
                </Typography.Text>
                <a href={expenditure.purchaseUrl} target="_blank" rel="noopener noreferrer">
                  {expenditure.purchaseUrl}
                </a>
              </div>

              {expenditure.captureFiles && expenditure.captureFiles.length > 0 && (
                <div>
                  <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 8 }}>
                    화면 캡처
                  </Typography.Text>
                  <Image.PreviewGroup>
                    <Space wrap>
                      {expenditure.captureFiles.map((file) => (
                        <Image
                          key={file.id}
                          src={file.fileUrl}
                          alt={file.originalName}
                          width={200}
                          style={{ borderRadius: 8, objectFit: 'cover' }}
                        />
                      ))}
                    </Space>
                  </Image.PreviewGroup>
                </div>
              )}
            </Card>
          )}

          {expenditure.itemList && expenditure.itemList.length > 0 && (
            <Card title="품목 리스트" style={cardStyle} styles={{ body: { padding: 24 } }}>
              <Table
                columns={itemColumns}
                dataSource={expenditure.itemList}
                pagination={false}
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
            </Card>
          )}

          {expenditure.status === 'APPROVED' && expenditure.inspectionStatus !== 'COMPLETED' && (
            <Card
              title={
                <Space>
                  <CameraOutlined />
                  물품 검수 사진 등록
                </Space>
              }
              style={cardStyle}
              styles={{ body: { padding: 24 } }}
            >
              <Alert
                message="물품 검수 필요"
                description="구매한 물품을 수령한 후 검수 사진을 제출해주세요"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
              {!showInspectionUpload ? (
                <Button
                  type="primary"
                  icon={<CameraOutlined />}
                  onClick={() => setShowInspectionUpload(true)}
                >
                  검수 사진 업로드
                </Button>
              ) : (
                <>
                  <FileUploader
                    category="GENERAL"
                    maxFiles={5}
                    accept="image/*"
                    onUploadSuccess={(files) => setInspectionFiles(files)}
                    helpText="구매한 물품 사진을 업로드하세요 (최대 5장)"
                  />
                  <div style={{ marginTop: 16, display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <Button onClick={() => setShowInspectionUpload(false)}>취소</Button>
                    <Button
                      type="primary"
                      onClick={handleSubmitInspection}
                      loading={inspectionMutation.isPending}
                    >
                      제출
                    </Button>
                  </div>
                </>
              )}
            </Card>
          )}

          {expenditure.inspectionFiles && expenditure.inspectionFiles.length > 0 && (
            <Card title="검수 사진" style={cardStyle} styles={{ body: { padding: 24 } }}>
              <Image.PreviewGroup>
                <Space wrap>
                  {expenditure.inspectionFiles.map((file) => (
                    <Image
                      key={file.id}
                      src={file.fileUrl}
                      alt={file.originalName}
                      width={200}
                      style={{ borderRadius: 8, objectFit: 'cover' }}
                    />
                  ))}
                </Space>
              </Image.PreviewGroup>
            </Card>
          )}
        </>
      )}

      {expenditure.type === 'OUTSOURCE' && (
        <>
          {expenditure.proposalFiles && expenditure.proposalFiles.length > 0 && (
            <Card title="의뢰서 / 견적서" style={cardStyle} styles={{ body: { padding: 24 } }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {expenditure.proposalFiles.map((file) => (
                  <Button key={file.id} icon={<DownloadOutlined />} block>
                    {file.originalName}
                  </Button>
                ))}
              </Space>
            </Card>
          )}

          {expenditure.outsourceReportFiles && expenditure.outsourceReportFiles.length > 0 && (
            <Card title="결과 보고서" style={cardStyle} styles={{ body: { padding: 24 } }}>
              <Space direction="vertical" style={{ width: '100%' }}>
                {expenditure.outsourceReportFiles.map((file) => (
                  <Button key={file.id} icon={<DownloadOutlined />} block>
                    {file.originalName}
                  </Button>
                ))}
              </Space>
            </Card>
          )}
        </>
      )}

      <Card title="처리 이력" style={cardStyle} styles={{ body: { padding: 24 } }}>
        <Timeline
          items={[
            {
              color: 'blue',
              children: (
                <div>
                  <Typography.Text strong>집행 요청</Typography.Text>
                  <br />
                  <Typography.Text type="secondary">
                    {dayjs(expenditure.createdAt).format('YYYY-MM-DD HH:mm')}
                  </Typography.Text>
                  <br />
                  <Typography.Text type="secondary">
                    {expenditure.requestedBy.name} ({expenditure.requestedBy.studentId})
                  </Typography.Text>
                </div>
              ),
            },
            ...(expenditure.status === 'APPROVED' && expenditure.approvedBy
              ? [
                  {
                    color: 'green',
                    children: (
                      <div>
                        <Typography.Text strong>승인 완료</Typography.Text>
                        <br />
                        <Typography.Text type="secondary">
                          {dayjs(expenditure.approvedAt).format('YYYY-MM-DD HH:mm')}
                        </Typography.Text>
                        <br />
                        <Typography.Text type="secondary">{expenditure.approvedBy.name}</Typography.Text>
                      </div>
                    ),
                  },
                ]
              : []),
            ...(expenditure.status === 'REJECTED'
              ? [
                  {
                    color: 'red',
                    children: (
                      <div>
                        <Typography.Text strong>반려됨</Typography.Text>
                        <br />
                        <Typography.Text type="secondary">
                          {dayjs(expenditure.updatedAt).format('YYYY-MM-DD HH:mm')}
                        </Typography.Text>
                        <br />
                        <Typography.Text type="secondary">{expenditure.rejectionReason}</Typography.Text>
                      </div>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </Card>
    </div>
  );
};

export default ExpenditureDetailPage;
