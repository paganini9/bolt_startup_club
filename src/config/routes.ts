export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',

  STUDENT_DASHBOARD: '/student/dashboard',
  STUDENT_CLUB_DETAIL: '/student/club/:id',
  STUDENT_CLUB_EDIT: '/student/club/:id/edit',
  STUDENT_EXPENDITURES: '/student/expenditures',
  STUDENT_EXPENDITURE_DETAIL: '/student/expenditures/:id',
  STUDENT_EXPENDITURE_NEW_CASH: '/student/expenditures/new/cash',
  STUDENT_EXPENDITURE_NEW_CARD: '/student/expenditures/new/card',
  STUDENT_EXPENDITURE_NEW_OUTSOURCE: '/student/expenditures/new/outsource',

  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_CLUBS: '/admin/clubs',
  ADMIN_CLUB_DETAIL: '/admin/clubs/:id',
  ADMIN_APPROVALS: '/admin/approvals',
  ADMIN_APPROVAL_DETAIL: '/admin/approvals/:id',
  ADMIN_BUDGETS: '/admin/budgets',
};

export const buildRoute = {
  studentClubDetail: (id: number | string) => `/student/club/${id}`,
  studentClubEdit: (id: number | string) => `/student/club/${id}/edit`,
  studentExpenditureDetail: (id: number | string) => `/student/expenditures/${id}`,
  adminClubDetail: (id: number | string) => `/admin/clubs/${id}`,
  adminApprovalDetail: (id: number | string) => `/admin/approvals/${id}`,
};
