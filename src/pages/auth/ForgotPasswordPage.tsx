import React from 'react';
import { Form, Input, Button, Typography, Result } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import AuthLayout from '../../components/layout/AuthLayout';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../config/routes';

const ForgotPasswordPage: React.FC = () => {
  const { forgotPassword, isForgotPasswordLoading } = useAuth();
  const [form] = Form.useForm();
  const [submitted, setSubmitted] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState('');

  const handleSubmit = ({ email }: { email: string }) => {
    forgotPassword(email);
    setSubmittedEmail(email);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <AuthLayout>
        <Result
          status="success"
          title="이메일이 전송되었습니다"
          subTitle={
            <span>
              <strong>{submittedEmail}</strong>로 비밀번호 재설정 링크를 전송했습니다.
              <br />
              메일함을 확인해주세요.
            </span>
          }
          extra={
            <Link to={ROUTES.LOGIN}>
              <Button type="primary" icon={<ArrowLeftOutlined />}>
                로그인으로 돌아가기
              </Button>
            </Link>
          }
        />
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <Typography.Title level={4} style={{ marginBottom: 4, textAlign: 'center' }}>
        비밀번호 찾기
      </Typography.Title>
      <Typography.Text
        type="secondary"
        style={{ display: 'block', textAlign: 'center', marginBottom: 28, fontSize: 13 }}
      >
        가입한 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다
      </Typography.Text>

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
            prefix={<MailOutlined style={{ color: '#bfbfbf' }} />}
            placeholder="가입한 이메일 주소"
            size="large"
          />
        </Form.Item>

        <Form.Item style={{ marginBottom: 12 }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={isForgotPasswordLoading}
            style={{ borderRadius: 8, height: 44, fontWeight: 600 }}
          >
            재설정 링크 보내기
          </Button>
        </Form.Item>
      </Form>

      <div style={{ textAlign: 'center', marginTop: 8 }}>
        <Link to={ROUTES.LOGIN} style={{ color: '#1677FF', fontSize: 13 }}>
          <ArrowLeftOutlined style={{ marginRight: 4 }} />
          로그인으로 돌아가기
        </Link>
      </div>
    </AuthLayout>
  );
};

export default ForgotPasswordPage;
