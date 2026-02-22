import React from 'react';
import { Badge, Dropdown, List, Typography, Empty, Button } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface Notification {
  id: number;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationBellProps {
  notifications?: Notification[];
  onMarkRead?: (id: number) => void;
  onMarkAllRead?: () => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications = [],
  onMarkRead,
  onMarkAllRead,
}) => {
  const unreadCount = notifications.filter((n) => !n.read).length;

  const dropdownContent = (
    <div
      style={{
        width: 360,
        background: '#fff',
        borderRadius: 8,
        boxShadow: '0 6px 16px rgba(0,0,0,0.12)',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          padding: '12px 16px',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <Typography.Text strong style={{ fontSize: 15 }}>
          알림
        </Typography.Text>
        {unreadCount > 0 && (
          <Button
            type="text"
            size="small"
            icon={<CheckOutlined />}
            onClick={onMarkAllRead}
            style={{ color: '#1677FF', fontSize: 12 }}
          >
            모두 읽음
          </Button>
        )}
      </div>
      {notifications.length === 0 ? (
        <div style={{ padding: '32px 16px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Typography.Text type="secondary">알림이 없습니다</Typography.Text>
            }
          />
          <Typography.Text
            type="secondary"
            style={{ display: 'block', textAlign: 'center', fontSize: 12, marginTop: 8 }}
          >
            Phase 2에서 실시간 알림 기능이 추가될 예정입니다
          </Typography.Text>
        </div>
      ) : (
        <List
          style={{ maxHeight: 360, overflowY: 'auto' }}
          dataSource={notifications}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '12px 16px',
                background: item.read ? '#fff' : '#f0f7ff',
                cursor: 'pointer',
              }}
              onClick={() => onMarkRead?.(item.id)}
            >
              <List.Item.Meta
                title={
                  <Typography.Text
                    strong={!item.read}
                    style={{ fontSize: 13 }}
                  >
                    {item.title}
                  </Typography.Text>
                }
                description={
                  <div>
                    <Typography.Text style={{ fontSize: 12, color: '#595959' }}>
                      {item.message}
                    </Typography.Text>
                    <br />
                    <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                      {dayjs(item.createdAt).format('MM/DD HH:mm')}
                    </Typography.Text>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )}
    </div>
  );

  return (
    <Dropdown
      dropdownRender={() => dropdownContent}
      trigger={['click']}
      placement="bottomRight"
    >
      <Badge count={unreadCount} size="small">
        <Button
          type="text"
          icon={<BellOutlined style={{ fontSize: 20 }} />}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        />
      </Badge>
    </Dropdown>
  );
};

export default NotificationBell;
