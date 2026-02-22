import React from 'react';
import { Layout, Dropdown, Typography, Avatar, Button, Space } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import NotificationBell from '../common/NotificationBell';

const { Header } = Layout;

interface AppHeaderProps {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
  siderWidth: number;
}

const AppHeader: React.FC<AppHeaderProps> = ({ collapsed, onToggle, onLogout, siderWidth }) => {
  const { user, notifications, markNotificationRead, setNotifications } = useAuthStore();

  const handleMarkAllRead = () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);
  };

  const userMenuItems = [
    {
      key: 'profile',
      label: (
        <div style={{ padding: '4px 0' }}>
          <div style={{ fontWeight: 600 }}>{user?.name}</div>
          <div style={{ fontSize: 12, color: '#8c8c8c' }}>{user?.email}</div>
        </div>
      ),
      disabled: true,
    },
    { type: 'divider' as const },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '설정',
      disabled: true,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '로그아웃',
      danger: true,
      onClick: onLogout,
    },
  ];

  return (
    <Header
      style={{
        background: '#fff',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 99,
        width: `calc(100% - ${collapsed ? 80 : siderWidth}px)`,
        marginLeft: collapsed ? 80 : siderWidth,
        transition: 'width 0.2s, margin-left 0.2s',
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={onToggle}
        style={{ fontSize: 16 }}
      />

      <Space size={8}>
        <NotificationBell
          notifications={notifications}
          onMarkRead={markNotificationRead}
          onMarkAllRead={handleMarkAllRead}
        />

        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              cursor: 'pointer',
              padding: '4px 8px',
              borderRadius: 8,
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#f5f5f5')}
            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
          >
            <Avatar
              size={32}
              icon={<UserOutlined />}
              style={{ background: '#1677FF', flexShrink: 0 }}
            />
            <Typography.Text style={{ fontSize: 14, fontWeight: 500, whiteSpace: 'nowrap' }}>
              {user?.name}
            </Typography.Text>
          </div>
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;
