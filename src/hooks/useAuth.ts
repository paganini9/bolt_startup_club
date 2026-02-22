import { useNavigate } from 'react-router-dom';
import { message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../stores/authStore';
import { authApi } from '../api/authApi';
import { LoginRequest, RegisterRequest } from '../types/user';
import { tokenUtils } from '../utils/token';
import { ROUTES } from '../config/routes';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, setUser, logout: storeLogout } = useAuthStore();

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authApi.login(data),
    onSuccess: (response) => {
      const { accessToken, refreshToken, user: userData } = response.data;
      tokenUtils.setTokens(accessToken, refreshToken);
      setUser(userData);
      message.success(`${userData.name}님, 환영합니다!`);
      if (userData.role === 'ADMIN') {
        navigate(ROUTES.ADMIN_DASHBOARD);
      } else {
        navigate(ROUTES.STUDENT_DASHBOARD);
      }
    },
    onError: () => {
      message.error('이메일 또는 비밀번호가 올바르지 않습니다.');
    },
  });

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authApi.register(data),
    onSuccess: () => {
      message.success('가입이 완료되었습니다! 로그인해주세요.');
      navigate(ROUTES.LOGIN);
    },
    onError: () => {
      message.error('회원가입에 실패했습니다. 다시 시도해주세요.');
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: (email: string) => authApi.forgotPassword(email),
    onSuccess: () => {
      message.success('비밀번호 재설정 링크가 이메일로 전송되었습니다.');
    },
    onError: () => {
      message.error('이메일 전송에 실패했습니다. 다시 시도해주세요.');
    },
  });

  const logout = () => {
    storeLogout();
    navigate(ROUTES.LOGIN);
    message.info('로그아웃되었습니다.');
  };

  return {
    user,
    isAuthenticated,
    login: loginMutation.mutate,
    isLoginLoading: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegisterLoading: registerMutation.isPending,
    forgotPassword: forgotPasswordMutation.mutate,
    isForgotPasswordLoading: forgotPasswordMutation.isPending,
    logout,
  };
};
