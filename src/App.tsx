import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, App as AntApp } from 'antd';
import koKR from 'antd/locale/ko_KR';
import dayjs from 'dayjs';
import 'dayjs/locale/ko';

import { ROUTES } from './config/routes';

import StudentLayout from './components/layout/StudentLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/guards/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';

import StudentDashboardPage from './pages/student/DashboardPage';
import StudentClubDetailPage from './pages/student/ClubDetailPage';
import StudentClubEditPage from './pages/student/ClubEditPage';

import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminClubListPage from './pages/admin/ClubListPage';
import AdminClubDetailPage from './pages/admin/ClubDetailPage';

dayjs.locale('ko');

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

const theme = {
  token: {
    colorPrimary: '#1677FF',
    colorSuccess: '#52C41A',
    colorError: '#FF4D4F',
    colorWarning: '#FAAD14',
    borderRadius: 8,
    fontFamily:
      "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  },
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider locale={koKR} theme={theme}>
        <AntApp>
          <BrowserRouter>
            <Routes>
              <Route path={ROUTES.LOGIN} element={<LoginPage />} />
              <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
              <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />

              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRoles={['STUDENT', 'LEADER']}>
                    <StudentLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<StudentDashboardPage />} />
                <Route path="club/:id" element={<StudentClubDetailPage />} />
                <Route path="club/:id/edit" element={<StudentClubEditPage />} />
              </Route>

              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['ADMIN']}>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="dashboard" element={<AdminDashboardPage />} />
                <Route path="clubs" element={<AdminClubListPage />} />
                <Route path="clubs/:id" element={<AdminClubDetailPage />} />
              </Route>

              <Route path="/" element={<Navigate to={ROUTES.LOGIN} replace />} />
              <Route path="*" element={<Navigate to={ROUTES.LOGIN} replace />} />
            </Routes>
          </BrowserRouter>
        </AntApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
