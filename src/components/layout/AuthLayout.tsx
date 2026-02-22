import React from 'react';
import { Layout, Typography } from 'antd';
import { RocketOutlined } from '@ant-design/icons';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e6f0ff 0%, #f0f5ff 50%, #e8f5e9 100%)' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '24px 16px',
        }}
      >
        <div style={{ marginBottom: 32, textAlign: 'center' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 56,
              height: 56,
              background: '#1677FF',
              borderRadius: 14,
              marginBottom: 12,
              boxShadow: '0 4px 14px rgba(22,119,255,0.35)',
            }}
          >
            <RocketOutlined style={{ fontSize: 28, color: '#fff' }} />
          </div>
          <Typography.Title level={4} style={{ margin: 0, color: '#1677FF' }}>
            창업동아리 관리 시스템
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            대학교 창업동아리 통합 관리 플랫폼
          </Typography.Text>
        </div>

        <div
          style={{
            width: '100%',
            maxWidth: 420,
            background: '#fff',
            borderRadius: 16,
            padding: '36px 40px',
            boxShadow: '0 8px 40px rgba(0,0,0,0.10)',
          }}
        >
          {children}
        </div>
      </div>
    </Layout>
  );
};

export default AuthLayout;
