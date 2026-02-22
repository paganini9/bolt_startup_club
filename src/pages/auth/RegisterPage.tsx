import React from 'react';
import { Form, Input, Button, Typography, Radio, Space } from 'antd';
import {
  UserOutlined,
  MailOutlined,
  LockOutlined,
  IdcardOutlined,
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { RegisterRequest } from '../../types/user';
import { ROUTES } from '../../config/routes';

const RegisterPage: React.FC = () => {
  const { register, isRegisterLoading } = useAuth();
  const [form] = Form.useForm();

  const handleSubmit = (values: RegisterRequest & { passwordConfirm: string }) => {
    const { passwordConfirm: _, ...registerData } = values;
    register(registerData);
  };

  return (
    <AuthLayout>
      <Typography.Title level={4} style={{ marginBottom: 4, textAlign: 'center' }}>
        회원가입
      </Typography.Title>
      <Typography.Text
        type="secondary"
        style={{ display: 'block', textAlign: 'center', marginBottom: 24, fontSize: 13 }}
      >
        새 계정을 만들고 창업동아리에 참여하세요
      </Typography.Text>

      <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false}>
        <Form.Item
          name="name"
          label="이름"
          rules={[{ required: true, message: '이름을 입력해주세요.' }]}
        >
          <Input
            prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="이름"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="studentId"
          label="학번"
          rules={[{ required: true, message: '학번을 입력해주세요.' }]}
        >
          <Input
            prefix={<IdcardOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="학번 (예: 20210001)"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="email"
          label="이메일"
          rules={[
            { required: true, message: '이메일을 입력해주세요.' },
            { type: 'email', message: '올바른 이메일 형식이 아닙니다.' },
          ]}
        >
          <Input
            prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="이메일 주소"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="password"
          label="비밀번호"
          rules={[
            { required: true, message: '비밀번호를 입력해주세요.' },
            { min: 8, message: '비밀번호는 최소 8자 이상이어야 합니다.' },
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="비밀번호 (최소 8자)"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="passwordConfirm"
          label="비밀번호 확인"
          dependencies={['password']}
          rules={[
            { required: true, message: '비밀번호를 다시 입력해주세요.' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('비밀번호가 일치하지 않습니다.'));
              },
            }),
          ]}
        >
          <Input.Password
            prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="비밀번호 확인"
            size="large"
          />
        </Form.Item>

        <Form.Item
          name="role"
          label="역할"
          initialValue="STUDENT"
          rules={[{ required: true, message: '역할을 선택해주세요.' }]}
        >
          <Radio.Group>
            <Space direction="vertical" size={4}>
              <Radio value="STUDENT">
                <Space direction="vertical" size={0} style={{ lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 500 }}>학생</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    창업동아리 팀원으로 참여
                  </Typography.Text>
                </Space>
              </Radio>
              <Radio value="ADMIN">
                <Space direction="vertical" size={0} style={{ lineHeight: 1.4 }}>
                  <span style={{ fontWeight: 500 }}>관리자</span>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    창업동아리 행정 담당자
                  </Typography.Text>
                </Space>
              </Radio>
            </Space>
          </Radio.Group>
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isRegisterLoading}
            style={{ borderRadius: 8, height: 44, fontWeight: 600 }}
          >
            회원가입
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <Typography.Text type="secondary" style={{ fontSize: 13 }}>
          이미 계정이 있으신가요?{' '}
          <Link to={ROUTES.LOGIN} style={{ color: '#1677FF', fontWeight: 600 }}>
            로그인
          </Link>
        </Typography.Text>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;
