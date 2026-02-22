export interface MenuItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  children?: MenuItem[];
  disabled?: boolean;
  badge?: string;
}

export const studentMenuItems: MenuItem[] = [
  {
    key: 'student-dashboard',
    label: '대시보드',
    icon: 'DashboardOutlined',
    path: '/student/dashboard',
  },
  {
    key: 'student-club',
    label: '내 동아리',
    icon: 'TeamOutlined',
    path: '/student/club/1',
  },
  {
    key: 'student-budget',
    label: '사업비 관리',
    icon: 'DollarOutlined',
    path: '/student/expenditures',
    disabled: false,
  },
  {
    key: 'student-activity',
    label: '활동/행사',
    icon: 'CalendarOutlined',
    path: '/student/activity',
    disabled: true,
    badge: 'Phase 4',
  },
  {
    key: 'student-report',
    label: '보고서',
    icon: 'FileTextOutlined',
    path: '/student/report',
    disabled: true,
    badge: 'Phase 4',
  },
];

export const adminMenuItems: MenuItem[] = [
  {
    key: 'admin-dashboard',
    label: '대시보드',
    icon: 'DashboardOutlined',
    path: '/admin/dashboard',
  },
  {
    key: 'admin-clubs',
    label: '동아리 관리',
    icon: 'TeamOutlined',
    path: '/admin/clubs',
  },
  {
    key: 'admin-budget',
    label: '사업비 관리',
    icon: 'AuditOutlined',
    path: '/admin/approvals',
    disabled: false,
    children: [
      {
        key: 'admin-approvals',
        label: '승인 관리',
        icon: 'CheckCircleOutlined',
        path: '/admin/approvals',
      },
      {
        key: 'admin-budgets',
        label: '예산 관리',
        icon: 'DollarOutlined',
        path: '/admin/budgets',
      },
    ],
  },
  {
    key: 'admin-event',
    label: '행사 관리',
    icon: 'CalendarOutlined',
    path: '/admin/event',
    disabled: true,
    badge: 'Phase 4',
  },
  {
    key: 'admin-achievement',
    label: '성과 관리',
    icon: 'TrophyOutlined',
    path: '/admin/achievement',
    disabled: true,
    badge: 'Phase 4',
  },
  {
    key: 'admin-reporting',
    label: '리포팅',
    icon: 'BarChartOutlined',
    path: '/admin/reporting',
    disabled: true,
    badge: 'Phase 4',
  },
  {
    key: 'admin-recruitment',
    label: '모집/선정',
    icon: 'SolutionOutlined',
    path: '/admin/recruitment',
    disabled: true,
    badge: 'Phase 5',
  },
  {
    key: 'admin-archive',
    label: '파일 아카이브',
    icon: 'FolderOutlined',
    path: '/admin/archive',
    disabled: true,
    badge: 'Phase 5',
  },
];
