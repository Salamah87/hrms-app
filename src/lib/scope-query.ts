import { promises as fs } from 'fs';
import path from 'path';
import type { AuthUser } from './auth-middleware';

const DATA_DIR = path.join(process.cwd(), 'data');

export interface ScopeFilter {
  employeeId?: string | string[];
  companyId?: string;
  allAccess?: boolean;
}

export async function buildScope(user: AuthUser): Promise<ScopeFilter> {
  if (user.role === 'super_admin') {
    return { allAccess: true };
  }

  if (user.role === 'hr_admin' || user.role === 'company_admin') {
    return { companyId: user.companyId };
  }

  if (user.role === 'manager' || user.role === 'dept_manager') {
    const reports = await getDirectReports(user.id);
    return {
      companyId: user.companyId,
      employeeId: [user.id, ...reports],
    };
  }

  return {
    companyId: user.companyId,
    employeeId: user.id,
  };
}

export function canAccessEmployee(user: AuthUser, targetEmployeeId: string, scope: ScopeFilter): boolean {
  if (scope.allAccess) return true;
  if (typeof scope.employeeId === 'string') return scope.employeeId === targetEmployeeId;
  if (Array.isArray(scope.employeeId)) return scope.employeeId.includes(targetEmployeeId);
  return true;
}

export async function filterEmployeesByScope(user: AuthUser, employees: any[]): Promise<any[]> {
  const scope = await buildScope(user);
  if (scope.allAccess) return employees;
  return employees.filter((e) => canAccessEmployee(user, e.id, scope));
}

async function getDirectReports(managerId: string): Promise<string[]> {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, 'employees.json'), 'utf-8');
    const { employees } = JSON.parse(raw);
    return employees
      .filter((e: any) => e.managerId === managerId)
      .map((e: any) => e.id);
  } catch {
    return [];
  }
}