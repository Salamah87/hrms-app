'use client';

import { useState } from 'react';
import {
  Shield,
  Check,
  X,
  Info,
  Users,
  Building2,
  Clock,
  CalendarDays,
  Banknote,
  FileText,
  Settings,
  UserCog,
  Briefcase,
  Target,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { CardSkeleton } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

const modules = [
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'departments', label: 'Departments', icon: Building2 },
  { id: 'attendance', label: 'Attendance', icon: Clock },
  { id: 'leave', label: 'Leave', icon: CalendarDays },
  { id: 'payroll', label: 'Payroll', icon: Banknote },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'recruitment', label: 'Recruitment', icon: UserCog },
  { id: 'performance', label: 'Performance', icon: Target },
  { id: 'documents', label: 'Documents', icon: FileText },
];

const roles = [
  { id: 'company_admin', label: 'Admin', color: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  { id: 'hr_manager', label: 'HR Manager', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' },
  { id: 'hr_officer', label: 'HR Officer', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300' },
  { id: 'payroll_officer', label: 'Payroll Officer', color: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' },
  { id: 'dept_manager', label: 'Dept Manager', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' },
  { id: 'team_leader', label: 'Team Leader', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' },
  { id: 'employee', label: 'Employee', color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' },
  { id: 'recruiter', label: 'Recruiter', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-300' },
  { id: 'finance_manager', label: 'Finance Mgr', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300' },
];

const crudActions = ['read', 'create', 'update', 'delete'];

// Define permissions by role and module (read-only view)
const permissionData: Record<string, Record<string, string[]>> = {
  company_admin: {
    employees: ['read', 'create', 'update', 'delete'],
    departments: ['read', 'create', 'update', 'delete'],
    attendance: ['read', 'create', 'update'],
    leave: ['read', 'create', 'update', 'approve'],
    payroll: ['read', 'create', 'update', 'delete'],
    reports: ['read', 'export'],
    settings: ['read', 'update'],
    recruitment: ['read', 'create', 'update', 'delete'],
    performance: ['read', 'create', 'update', 'delete'],
    documents: ['read', 'create', 'update', 'delete'],
  },
  hr_manager: {
    employees: ['read', 'create', 'update'],
    departments: ['read'],
    attendance: ['read', 'update'],
    leave: ['read', 'update', 'approve'],
    payroll: ['read'],
    reports: ['read', 'export'],
    settings: [],
    recruitment: ['read', 'create', 'update'],
    performance: ['read', 'create', 'update'],
    documents: ['read', 'create', 'update'],
  },
  hr_officer: {
    employees: ['read', 'create', 'update'],
    departments: ['read'],
    attendance: ['read', 'create', 'update'],
    leave: ['read', 'create', 'update'],
    payroll: [],
    reports: ['read'],
    settings: [],
    recruitment: [],
    performance: [],
    documents: ['read', 'create'],
  },
  payroll_officer: {
    employees: ['read'],
    departments: [],
    attendance: ['read'],
    leave: ['read'],
    payroll: ['read', 'create', 'update'],
    reports: ['read', 'export'],
    settings: [],
    recruitment: [],
    performance: [],
    documents: ['read'],
  },
  dept_manager: {
    employees: ['read'],
    departments: ['read'],
    attendance: ['read'],
    leave: ['read', 'approve'],
    payroll: [],
    reports: ['read'],
    settings: [],
    recruitment: [],
    performance: ['read', 'update'],
    documents: ['read'],
  },
  team_leader: {
    employees: ['read'],
    departments: [],
    attendance: ['read'],
    leave: ['read', 'approve'],
    payroll: [],
    reports: [],
    settings: [],
    recruitment: [],
    performance: ['read'],
    documents: [],
  },
  employee: {
    employees: ['read'],
    departments: [],
    attendance: ['read'],
    leave: ['read', 'create'],
    payroll: ['read'],
    reports: [],
    settings: [],
    recruitment: [],
    performance: ['read'],
    documents: [],
  },
  recruiter: {
    employees: ['read', 'create'],
    departments: ['read'],
    attendance: [],
    leave: [],
    payroll: [],
    reports: ['read'],
    settings: [],
    recruitment: ['read', 'create', 'update'],
    performance: [],
    documents: ['read'],
  },
  finance_manager: {
    employees: ['read'],
    departments: ['read'],
    attendance: [],
    leave: [],
    payroll: ['read', 'approve'],
    reports: ['read', 'export'],
    settings: [],
    recruitment: [],
    performance: [],
    documents: ['read'],
  },
};

export default function RolesPage() {
  const [isLoading] = useState(false);
  const [searchModule, setSearchModule] = useState('');

  const filteredModules = searchModule
    ? modules.filter((m) => m.label.toLowerCase().includes(searchModule.toLowerCase()))
    : modules;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View role-based access permissions across modules</p>
        </div>
        <CardSkeleton count={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles & Permissions</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View role-based access permissions across modules</p>
        </div>
        <Badge variant="info" size="lg">
          <Info className="mr-1 h-3.5 w-3.5" />
          Read-only view
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Permissions Matrix</CardTitle>
          <Input
            placeholder="Search modules..."
            value={searchModule}
            onChange={(e) => setSearchModule(e.target.value)}
            className="w-64"
          />
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead>
              <tr className="border-b dark:border-gray-800">
                <th className="sticky left-0 z-10 bg-white p-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-gray-900">
                  Module
                </th>
                {roles.map((role) => (
                  <th
                    key={role.id}
                    className="p-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    <span className={cn('inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold', role.color)}>
                      {role.label}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-800">
              {filteredModules.map((mod) => (
                <tr key={mod.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                  <td className="sticky left-0 z-10 bg-white p-3 dark:bg-gray-900">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <mod.icon className="h-4 w-4 text-gray-500" />
                      </div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{mod.label}</span>
                    </div>
                  </td>
                  {roles.map((role) => {
                    const perms = permissionData[role.id]?.[mod.id] || [];
                    const hasFull = perms.includes('read') && perms.includes('create') && perms.includes('update');
                    const hasSome = perms.length > 0;
                    const hasDelete = perms.includes('delete');

                    let display: string;
                    let variant: string;

                    if (hasFull && hasDelete) {
                      display = 'CRUD';
                      variant = 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
                    } else if (hasFull) {
                      display = 'CRU';
                      variant = 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
                    } else if (hasSome) {
                      display = perms.filter((p) => p !== 'approve' && p !== 'export').map((p) => p.charAt(0).toUpperCase()).join('');
                      variant = 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
                    } else {
                      display = '—';
                      variant = 'text-gray-300 dark:text-gray-600';
                    }

                    const hasExtra = perms.includes('approve') || perms.includes('export');

                    return (
                      <td key={`${mod.id}-${role.id}`} className="p-3 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className={cn('inline-flex items-center justify-center rounded-md px-2 py-0.5 text-[11px] font-semibold', variant)}>
                            {display}
                          </span>
                          {hasExtra && (
                            <span className="text-[9px] text-gray-400">
                              {perms.filter((p) => p === 'approve' || p === 'export').join(', ')}
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          {filteredModules.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <Shield className="mb-3 h-10 w-10 text-gray-300 dark:text-gray-600" />
              <p className="text-sm text-gray-500">No modules match your search</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Legend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-300">CRUD</span>
              <span className="text-xs text-gray-500">Full access (Create, Read, Update, Delete)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">CRU</span>
              <span className="text-xs text-gray-500">Read, Create, Update (no delete)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center rounded-md bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300">R</span>
              <span className="text-xs text-gray-500">Read-only or limited access</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-300 dark:text-gray-600">—</span>
              <span className="text-xs text-gray-500">No access</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[9px] text-gray-400">approve, export</span>
              <span className="text-xs text-gray-500">Special actions</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

