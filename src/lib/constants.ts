import {
  LayoutDashboard,
  Users,
  Clock,
  CalendarDays,
  Banknote,
  Briefcase,
  Building2,
  FileText,
  Settings,
  UserCog,
  ListTree,
  Send,
  Wallet,
  PlusCircle,
  CheckCircle,
  BarChart3,
  ClipboardList,
  Bell,
  Target,
  Star,
  ClipboardCheck,
  MessageSquare,
  Layers,
  Timer,
  type LucideIcon,
} from 'lucide-react';

export const ROLES = {
  SYSTEM_OWNER: 'system_owner',
  COMPANY_ADMIN: 'company_admin',
  HR_MANAGER: 'hr_manager',
  HR_OFFICER: 'hr_officer',
  PAYROLL_OFFICER: 'payroll_officer',
  DEPT_MANAGER: 'dept_manager',
  TEAM_LEADER: 'team_leader',
  EMPLOYEE: 'employee',
  RECRUITER: 'recruiter',
  FINANCE_MANAGER: 'finance_manager',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const LEAVE_TYPES = [
  { code: 'annual', label: 'Annual Leave', labelAr: 'إجازة سنوية', days: 30, paid: true },
  { code: 'sick', label: 'Sick Leave', labelAr: 'إجازة مرضية', days: 14, paid: true },
  { code: 'personal', label: 'Personal Leave', labelAr: 'إجازة شخصية', days: 5, paid: true },
  { code: 'emergency', label: 'Emergency Leave', labelAr: 'إجازة طارئة', days: 3, paid: true },
  { code: 'maternity', label: 'Maternity Leave', labelAr: 'إجازة أمومة', days: 90, paid: true },
  { code: 'paternity', label: 'Paternity Leave', labelAr: 'إجازة أبوة', days: 3, paid: true },
  { code: 'hajj', label: 'Hajj Leave', labelAr: 'إجازة حج', days: 15, paid: true },
  { code: 'unpaid', label: 'Unpaid Leave', labelAr: 'إجازة بدون راتب', days: 30, paid: false },
] as const;

export const ATTENDANCE_STATUS_OPTIONS = [
  { value: 'present', label: 'Present', labelAr: 'حاضر', color: 'bg-green-500' },
  { value: 'absent', label: 'Absent', labelAr: 'غائب', color: 'bg-red-500' },
  { value: 'late', label: 'Late', labelAr: 'متأخر', color: 'bg-yellow-500' },
  { value: 'half_day', label: 'Half Day', labelAr: 'نصف يوم', color: 'bg-orange-500' },
  { value: 'overtime', label: 'Overtime', labelAr: 'إضافي', color: 'bg-blue-500' },
  { value: 'weekend', label: 'Weekend', labelAr: 'عطلة نهاية الأسبوع', color: 'bg-purple-500' },
  { value: 'holiday', label: 'Holiday', labelAr: 'إجازة رسمية', color: 'bg-indigo-500' },
] as const;

export const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time', labelAr: 'دوام كامل' },
  { value: 'part_time', label: 'Part Time', labelAr: 'دوام جزئي' },
  { value: 'contract', label: 'Contract', labelAr: 'عقد' },
  { value: 'intern', label: 'Intern', labelAr: 'متدرب' },
  { value: 'temporary', label: 'Temporary', labelAr: 'مؤقت' },
  { value: 'freelance', label: 'Freelance', labelAr: 'عمل حر' },
] as const;

export interface NavItem {
  label: string;
  labelAr: string;
  href: string;
  icon: LucideIcon;
  children?: NavItem[];
  roles?: Role[];
}

export const NAV_ITEMS: NavItem[] = [
  {
    label: 'Dashboard',
    labelAr: 'لوحة التحكم',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Notifications',
    labelAr: 'الإشعارات',
    href: '/notifications',
    icon: Bell,
  },
  {
    label: 'Employees',
    labelAr: 'الموظفين',
    href: '/employees',
    icon: Users,
    children: [
      { label: 'All Employees', labelAr: 'جميع الموظفين', href: '/employees', icon: Users },
      { label: 'Import Employees', labelAr: 'استيراد موظفين', href: '/employees/import', icon: PlusCircle },
      { label: 'Departments', labelAr: 'الأقسام', href: '/organization', icon: Building2 },
      {
        label: 'Organization',
        labelAr: 'الهيكل التنظيمي',
        href: '/employees/org-structure',
        icon: ListTree,
        children: [
          { label: 'Org Structure', labelAr: 'الهيكل التنظيمي', href: '/employees/org-structure', icon: ListTree },
        ],
      },
    ],
  },
  {
    label: 'Attendance',
    labelAr: 'الحضور',
    href: '/attendance',
    icon: Clock,
    children: [
      { label: 'Dashboard', labelAr: 'لوحة الحضور', href: '/attendance', icon: Clock },
      { label: 'Overtime', labelAr: 'الإضافي', href: '/attendance/overtime', icon: Timer },
      { label: 'Overtime Policies', labelAr: 'سياسات الإضافي', href: '/attendance/overtime/policies', icon: Timer },
    ],
  },
  {
    label: 'Leave',
    labelAr: 'الإجازات',
    href: '/leave',
    icon: CalendarDays,
    children: [
      { label: 'My Leave', labelAr: 'إجازاتي', href: '/leave/my', icon: CalendarDays },
      { label: 'Team Leave', labelAr: 'إجازات الفريق', href: '/leave/team', icon: Users },
      { label: 'Leave Requests', labelAr: 'طلبات الإجازات', href: '/leave/requests', icon: FileText },
    ],
  },
  {
    label: 'Payroll',
    labelAr: 'الرواتب',
    href: '/payroll',
    icon: Banknote,
    children: [
      { label: 'Dashboard', labelAr: 'لوحة الرواتب', href: '/payroll', icon: Banknote },
      { label: 'Payroll Processing', labelAr: 'معالجة الرواتب', href: '/payroll/processing', icon: Send },
      { label: 'Employee Profiles', labelAr: 'ملفات الموظفين', href: '/payroll/profiles', icon: Users },
      { label: 'Payslips', labelAr: 'قسائم الرواتب', href: '/payroll/payslips', icon: FileText },
      { label: 'Salary Components', labelAr: 'مكونات الراتب', href: '/payroll/components', icon: Wallet },
      { label: 'Adjustments', labelAr: 'التسويات', href: '/payroll/adjustments', icon: PlusCircle },
      { label: 'Approval Workflow', labelAr: 'سير الموافقات', href: '/payroll/approvals', icon: CheckCircle },
      { label: 'Reports', labelAr: 'التقارير', href: '/payroll/reports', icon: BarChart3 },
    ],
  },
  {
    label: 'Recruitment',
    labelAr: 'التوظيف',
    href: '/recruitment',
    icon: UserCog,
    children: [
      { label: 'Dashboard', labelAr: 'لوحة التوظيف', href: '/recruitment', icon: Briefcase },
      { label: 'Job Requisitions', labelAr: 'طلبات التوظيف', href: '/recruitment/requisitions', icon: Briefcase },
      { label: 'Pipeline Board', labelAr: 'لوحة التدفق', href: '/recruitment/pipeline', icon: ListTree },
      { label: 'Offers', labelAr: 'العروض', href: '/recruitment/offers', icon: Send },
      { label: 'Onboarding', labelAr: 'الانضمام', href: '/recruitment/onboarding', icon: ClipboardList },
      { label: 'Candidates', labelAr: 'المرشحين', href: '/recruitment/candidates', icon: Users },
      { label: 'Interviews', labelAr: 'المقابلات', href: '/recruitment/interviews', icon: Clock },
      { label: 'Careers Page', labelAr: 'صفحة التوظيف', href: '/careers', icon: Send },
    ],
  },
  {
    label: 'Performance',
    labelAr: 'الأداء',
    href: '/performance',
    icon: BarChart3,
    children: [
      { label: 'Dashboard', labelAr: 'لوحة الأداء', href: '/performance', icon: BarChart3 },
      { label: 'Review Cycles', labelAr: 'دورات التقييم', href: '/performance/cycles', icon: Layers },
      { label: 'Goals & OKRs', labelAr: 'الأهداف', href: '/performance/goals', icon: Target },
      { label: 'Reviews', labelAr: 'التقييمات', href: '/performance/reviews', icon: ClipboardCheck },
      { label: 'Competencies', labelAr: 'الكفاءات', href: '/performance/competencies', icon: Star },
    ],
  },
  {
    label: 'Reports',
    labelAr: 'التقارير',
    href: '/reports',
    icon: FileText,
  },
  {
    label: 'Settings',
    labelAr: 'الإعدادات',
    href: '/settings',
    icon: Settings,
  },
];

export const PERMISSIONS_MATRIX: Record<Role, string[]> = {
  system_owner: ['*'],
  company_admin: [
    'employees:read', 'employees:create', 'employees:update', 'employees:delete',
    'departments:read', 'departments:create', 'departments:update', 'departments:delete',
    'attendance:read', 'attendance:create', 'attendance:update',
    'leave:read', 'leave:create', 'leave:update', 'leave:approve',
    'payroll:read', 'payroll:create', 'payroll:update',
    'reports:read', 'reports:export',
    'settings:read', 'settings:update',
  ],
  hr_manager: [
    'employees:read', 'employees:create', 'employees:update',
    'departments:read',
    'attendance:read', 'attendance:update',
    'leave:read', 'leave:update', 'leave:approve',
    'payroll:read',
    'reports:read', 'reports:export',
  ],
  hr_officer: [
    'employees:read', 'employees:create', 'employees:update',
    'attendance:read', 'attendance:create', 'attendance:update',
    'leave:read', 'leave:create', 'leave:update',
  ],
  payroll_officer: [
    'payroll:read', 'payroll:create', 'payroll:update',
    'employees:read',
    'reports:read', 'reports:export',
  ],
  dept_manager: [
    'employees:read',
    'attendance:read',
    'leave:read', 'leave:approve',
    'reports:read',
  ],
  team_leader: [
    'employees:read',
    'attendance:read',
    'leave:read', 'leave:approve',
  ],
  employee: [
    'attendance:read',
    'leave:read', 'leave:create',
  ],
  recruiter: [
    'employees:read', 'employees:create',
    'reports:read',
  ],
  finance_manager: [
    'payroll:read',
    'reports:read', 'reports:export',
    'employees:read',
  ],
};
