import React from 'react';
import { Layout, Menu, Typography, Tag, Tooltip } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  TeamOutlined,
  DollarOutlined,
  CalendarOutlined,
  FileTextOutlined,
  AuditOutlined,
  TrophyOutlined,
  BarChartOutlined,
  SolutionOutlined,
  FolderOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { MenuItem } from '../../config/menuConfig';

const { Sider } = Layout;

const iconMap: Record<string, React.ReactNode> = {
  DashboardOutlined: <DashboardOutlined />,
  TeamOutlined: <TeamOutlined />,
  DollarOutlined: <DollarOutlined />,
  CalendarOutlined: <CalendarOutlined />,
  FileTextOutlined: <FileTextOutlined />,
  AuditOutlined: <AuditOutlined />,
  TrophyOutlined: <TrophyOutlined />,
  BarChartOutlined: <BarChartOutlined />,
  SolutionOutlined: <SolutionOutlined />,
  FolderOutlined: <FolderOutlined />,
};

interface AppSidebarProps {
  collapsed: boolean;
  menuItems: MenuItem[];
  onBreakpoint?: (broken: boolean) => void;
  onCollapse?: (collapsed: boolean) => void;
}

const AppSidebar: React.FC<AppSidebarProps> = ({
  collapsed,
  menuItems,
  onBreakpoint,
  onCollapse,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const selectedKey = menuItems.find(
    (item) =>
      location.pathname === item.path ||
      location.pathname.startsWith(item.path + '/')
  )?.key ?? menuItems[0]?.key;

  const antMenuItems = menuItems.map((item) => ({
    key: item.key,
    icon: iconMap[item.icon],
    label: item.disabled ? (
      <Tooltip title={`${item.badge}에서 추가 예정`} placement="right">
        <span style={{ opacity: 0.5, cursor: 'not-allowed' }}>
          {item.label}
          {!collapsed && item.badge && (
            <Tag
              color="default"
              style={{ marginLeft: 6, fontSize: 10, lineHeight: '16px', height: 16 }}
            >
              {item.badge}
            </Tag>
          )}
        </span>
      </Tooltip>
    ) : (
      <span>
        {item.label}
      </span>
    ),
    disabled: item.disabled,
    onClick: item.disabled ? undefined : () => navigate(item.path),
  }));

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      onBreakpoint={onBreakpoint}
      theme="dark"
      width={240}
      collapsedWidth={80}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          padding: collapsed ? '0' : '0 20px',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          overflow: 'hidden',
          transition: 'all 0.2s',
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            background: '#1677FF',
            borderRadius: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <RocketOutlined style={{ color: '#fff', fontSize: 16 }} />
        </div>
        {!collapsed && (
          <Typography.Text
            style={{
              color: '#fff',
              marginLeft: 10,
              fontWeight: 600,
              fontSize: 13,
              whiteSpace: 'nowrap',
            }}
          >
            창업동아리 관리
          </Typography.Text>
        )}
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[selectedKey]}
        items={antMenuItems}
        style={{ borderRight: 0, marginTop: 8 }}
      />
    </Sider>
  );
};

export default AppSidebar;
