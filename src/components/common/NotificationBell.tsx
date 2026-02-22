import React from 'react';
import { Badge, Dropdown, List, Typography, Empty, Button, Spin } from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationApi } from '../../api/notificationApi';
import type { Notification } from '../../types/notification';
import dayjs from 'dayjs';

const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(),
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => notificationApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const notifications = data?.data || [];
  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const recentNotifications = notifications.slice(0, 10);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
      markReadMutation.mutate(notification.id);
    }
    if (notification.link) {
      navigate(notification.link);
    }
  };

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
          알림 {unreadCount > 0 && `(${unreadCount})`}
        </Typography.Text>
        {unreadCount > 0 && (
          <Button
            type="text"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => markAllReadMutation.mutate()}
            loading={markAllReadMutation.isPending}
            style={{ color: '#1677FF', fontSize: 12 }}
          >
            모두 읽음
          </Button>
        )}
      </div>
      {isLoading ? (
        <div style={{ padding: '32px 16px', textAlign: 'center' }}>
          <Spin />
        </div>
      ) : recentNotifications.length === 0 ? (
        <div style={{ padding: '32px 16px' }}>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Typography.Text type="secondary">알림이 없습니다</Typography.Text>
            }
          />
        </div>
      ) : (
        <List
          style={{ maxHeight: 400, overflowY: 'auto' }}
          dataSource={recentNotifications}
          renderItem={(item) => (
            <List.Item
              style={{
                padding: '12px 16px',
                background: item.isRead ? '#fff' : '#f0f7ff',
                cursor: 'pointer',
                borderBottom: '1px solid #f0f0f0',
              }}
              onClick={() => handleNotificationClick(item)}
            >
              <div style={{ width: '100%' }}>
                <Typography.Text
                  strong={!item.isRead}
                  style={{ fontSize: 13, display: 'block', marginBottom: 4 }}
                >
                  {item.message}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: 11 }}>
                  {dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}
                </Typography.Text>
              </div>
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
