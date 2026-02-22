import React, { useState } from 'react';
import { Layout } from 'antd';
import { Outlet } from 'react-router-dom';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import { studentMenuItems } from '../../config/menuConfig';
import { useAuth } from '../../hooks/useAuth';

const { Content } = Layout;

const SIDER_WIDTH = 240;

const StudentLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppSidebar
        collapsed={collapsed}
        menuItems={studentMenuItems}
        onCollapse={setCollapsed}
        onBreakpoint={(broken) => setCollapsed(broken)}
      />
      <Layout
        style={{
          marginLeft: collapsed ? 80 : SIDER_WIDTH,
          transition: 'margin-left 0.2s',
        }}
      >
        <AppHeader
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
          onLogout={logout}
          siderWidth={SIDER_WIDTH}
        />
        <Content
          style={{
            padding: '28px 28px',
            background: '#f5f6fa',
            minHeight: 'calc(100vh - 64px)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default StudentLayout;
