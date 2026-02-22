import React from 'react';
import { Form, Input, Button, Typography, Divider, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { LoginRequest } from '../../types/user';
import { ROUTES } from '../../config/routes';

const LoginPage: React.FC = () => {
  const { login, isLoginLoading } = useAuth();
  const [form] = Form.useForm();

  const handleSubmit = (values: LoginRequest) => {
    login(values);
  };

  return (
    <AuthLayout>
      <Typography.Title level={4} style={{ marginBottom: 4, textAlign: 'center' }}>
        로그인
      </Typography.Title>
      <Typography.Text
        type="secondary"
        style={{ display: 'block', textAlign: 'center', marginBottom: 28, fontSize: 13 }}
      >
        계정에 로그인하여 동아리를 관리하세요
      </Typography.Text>

      <Alert
        message="테스트 계정"
        description={
          <div style={{ fontSize: 12 }}>
            <div>학생: student@test.com / password123</div>
            <div>팀장: leader@test.com / password123</div>
            <div>관리자: admin@test.com / password123</div>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 20, fontSize: 12 }}
      />

      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <Form.Item
          name="email"
          label="이메일"
          rules={[
            { required: true, message: '이메일을 입력해주세요.' },
            { type: 'email', message: '올바른 이메일 형식이 아닙니다.' },
          ]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="이메일 주소"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="비밀번호"
          rules={[{ required: true, message: '비밀번호를 입력해주세요.' }]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="비밀번호"
            size="large"
          />
        </Form.Item>

        <div style={{ textAlign: 'right', marginTop: -16, marginBottom: 20 }}>
          <Link to={ROUTES.FORGOT_PASSWORD} style={{ fontSize: 13, color: '#1677FF' }}>
            비밀번호 찾기
          </Link>
        </div>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isLoginLoading}
            style={{ borderRadius: 8, height: 44, fontWeight: 600 }}
          >
            로그인
          </Button>
        </Form.Item>
      </Form>

      <Divider style={{ margin: '16px 0' }}>
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          또는
        </Typography.Text>
      </Divider>

      <div style={{ textAlign: 'center' }}>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          계정이 없으신가요?{' '}
          <Link to={ROUTES.REGISTER} style={{ color: '#1677FF', fontWeight: 600 }}>
            회원가입
          </Link>
        </Typography.Text>
      </div>
    </AuthLayout>
  );
};

export default LoginPage;
