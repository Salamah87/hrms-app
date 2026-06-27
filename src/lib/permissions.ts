import { PERMISSIONS_MATRIX, type Role } from './constants';

export const PERMISSIONS = {
  EMPLOYEES: {
    READ: 'employees:read',
    CREATE: 'employees:create',
    UPDATE: 'employees:update',
    DELETE: 'employees:delete',
  },
  DEPARTMENTS: {
    READ: 'departments:read',
    CREATE: 'departments:create',
    UPDATE: 'departments:update',
    DELETE: 'departments:delete',
  },
  ATTENDANCE: {
    READ: 'attendance:read',
    CREATE: 'attendance:create',
    UPDATE: 'attendance:update',
  },
  LEAVE: {
    READ: 'leave:read',
    CREATE: 'leave:create',
    UPDATE: 'leave:update',
    APPROVE: 'leave:approve',
  },
  PAYROLL: {
    READ: 'payroll:read',
    CREATE: 'payroll:create',
    UPDATE: 'payroll:update',
  },
  REPORTS: {
    READ: 'reports:read',
    EXPORT: 'reports:export',
  },
  SETTINGS: {
    READ: 'settings:read',
    UPDATE: 'settings:update',
  },
} as const;

export function hasRole(user: { role?: Role } | null, role: Role): boolean {
  if (!user?.role) return false;
  return user.role === role;
}

export function can(
  user: { role?: Role } | null,
  action: string,
  _resource?: string
): boolean {
  if (!user?.role) return false;

  const permissions = PERMISSIONS_MATRIX[user.role];
  if (!permissions) return false;

  if (permissions.includes('*')) return true;

  return permissions.includes(action);
}

export function usePermissions(user: { role?: Role } | null) {
  return {
    can: (action: string, resource?: string) => can(user, action, resource),
    isOwner: user?.role === 'system_owner',
    isAdmin: user?.role === 'company_admin',
    isHr: user?.role === 'hr_manager' || user?.role === 'hr_officer',
    isManager: user?.role === 'dept_manager' || user?.role === 'team_leader',
    isEmployee: user?.role === 'employee',
    role: user?.role,
  };
}
