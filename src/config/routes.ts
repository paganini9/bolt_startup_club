export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_CLUB_DETAIL: '/student/club/:id',
  STUDENT_CLUB_EDIT: '/student/club/:id/edit',

  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_CLUBS: '/admin/clubs',
  ADMIN_CLUB_DETAIL: '/admin/clubs/:id',
};

export const buildRoute = {
  studentClubDetail: (id: number | string) => `/student/club/${id}`,
  studentClubEdit: (id: number | string) => `/student/club/${id}/edit`,
  adminClubDetail: (id: number | string) => `/admin/clubs/${id}`,
};
