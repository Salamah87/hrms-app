'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Settings,
  Shield,
  Users,
  Bell,
  Globe,
  Link2,
  ChevronRight,
  Building2,
  UserCog,
  Key,
  Sliders,
  Plus,
  X,
  Pencil,
  MoreHorizontal,
  Eye,
  Trash2,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs } from '@/components/ui/tabs';
import { SearchInput } from '@/components/ui/search-input';
import { CardSkeleton } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import { ROLES } from '@/lib/constants';

const settingsSections = [
  { id: 'company', title: 'Company Settings', description: 'Manage company profile and branding', icon: Building2, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400', href: '/settings/general' },
  { id: 'users', title: 'Users & Roles', description: 'Manage system users and assign roles', icon: Users, color: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400', href: '/settings/users' },
  { id: 'permissions', title: 'Permissions Matrix', description: 'View role-based access permissions', icon: Shield, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400', href: '/settings/roles' },

];

const mockUsers = [
  { id: 'u1', name: 'Admin User', email: 'admin@company.com', role: 'company_admin', status: 'active' as const, lastLogin: '2026-06-22 09:15' },
  { id: 'u2', name: 'HR Manager', email: 'hr.manager@company.com', role: 'hr_manager', status: 'active' as const, lastLogin: '2026-06-21 14:30' },
  { id: 'u3', name: 'HR Officer', email: 'hr.officer@company.com', role: 'hr_officer', status: 'active' as const, lastLogin: '2026-06-20 11:00' },
  { id: 'u4', name: 'Payroll Officer', email: 'payroll@company.com', role: 'payroll_officer', status: 'active' as const, lastLogin: '2026-06-19 16:45' },
  { id: 'u5', name: 'Department Manager', email: 'dept.manager@company.com', role: 'dept_manager', status: 'inactive' as const, lastLogin: '2026-05-15 08:30' },
  { id: 'u6', name: 'Recruiter', email: 'recruiter@company.com', role: 'recruiter', status: 'active' as const, lastLogin: '2026-06-22 10:00' },
];

const roleLabels: Record<string, string> = {
  system_owner: 'System Owner',
  company_admin: 'Admin',
  hr_manager: 'HR Manager',
  hr_officer: 'HR Officer',
  payroll_officer: 'Payroll Officer',
  dept_manager: 'Dept Manager',
  team_leader: 'Team Leader',
  employee: 'Employee',
  recruiter: 'Recruiter',
  finance_manager: 'Finance Manager',
};

const modules = ['Employees', 'Attendance', 'Leave', 'Payroll', 'Reports', 'Settings', 'Recruitment', 'Performance'];
const roles = ['company_admin', 'hr_manager', 'hr_officer', 'payroll_officer', 'dept_manager', 'team_leader', 'employee', 'recruiter'];
const crudActions = ['Read', 'Create', 'Update', 'Delete'];

const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({ value, label }));

export default function SettingsPage() {
  const [isLoading] = useState(false);
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('');
  const [userSearch, setUserSearch] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage system configuration and users</p>
        </div>
        <CardSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage system configuration and users</p>
      </div>

      <Tabs
        tabs={[
          {
            id: 'overview',
            label: 'Overview',
            content: (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {settingsSections.map((section) => (
                  <Link key={section.id} href={section.href}>
                    <Card className="h-full cursor-pointer transition-all hover:shadow-md">
                      <CardContent className="px-6 py-5">
                        <div className="flex items-start justify-between">
                          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${section.color}`}>
                            <section.icon className="h-6 w-6" />
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                        </div>
                        <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">{section.title}</h3>
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{section.description}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ),
          },
          {
            id: 'users',
            label: 'Users & Roles',
            badge: mockUsers.length,
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Users</CardTitle>
                  <div className="flex items-center gap-3">
                    <SearchInput value={userSearch} onChange={setUserSearch} placeholder="Search users..." className="w-64" />
                    <Button onClick={() => setShowAddUserModal(true)}>
                      <Plus className="h-4 w-4" />
                      Add User
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table
                    columns={[
                      { key: 'name', header: 'Name', sortable: true },
                      { key: 'email', header: 'Email', sortable: true },
                      {
                        key: 'role', header: 'Role',
                        render: (item: any) => (
                          <Badge variant="primary" size="sm">{roleLabels[item.role as string] || (item.role as string)}</Badge>
                        ),
                      },
                      {
                        key: 'status', header: 'Status',
                        render: (item: any) => (
                          <Badge variant={item.status === 'active' ? 'success' : 'default'}>
                            {item.status as string}
                          </Badge>
                        ),
                      },
                      {
                        key: 'lastLogin', header: 'Last Login',
                        render: (item: any) => (
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.lastLogin as string}</span>
                        ),
                      },
                      {
                        key: 'actions', header: '',
                        className: 'w-16',
                        render: () => (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm"><Pencil className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </div>
                        ),
                      },
                    ]}
                    data={mockUsers as any[]}
                    keyExtractor={(item) => item.id as string}
                    sortable
                    emptyState={
                      <EmptyState icon={Users} title="No users found" description="Add users to grant system access" />
                    }
                  />
                </CardContent>
              </Card>
            ),
          },
          {
            id: 'permissions',
            label: 'Permissions Matrix',
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Permissions Matrix</CardTitle>
                  <Badge variant="info">Read-only view</Badge>
                </CardHeader>
                <CardContent className="overflow-x-auto">
                  <table className="w-full min-w-[800px]">
                    <thead>
                      <tr className="border-b dark:border-gray-800">
                        <th className="sticky left-0 bg-white p-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 dark:bg-gray-900">Module</th>
                        <th className="p-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Action</th>
                        {roles.map((role) => (
                          <th key={role} className="p-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500">
                            <div className="whitespace-nowrap">{roleLabels[role] || role}</div>
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-800">
                      {modules.map((mod, mi) => (
                        crudActions.map((action, ai) => (
                          <tr key={`${mod}-${action}`} className={ai === 0 ? 'border-t-2 border-gray-200 dark:border-gray-700' : ''}>
                            {ai === 0 && (
                              <td
                                rowSpan={crudActions.length}
                                className="p-3 text-sm font-medium text-gray-900 dark:text-white align-top"
                              >
                                {mod}
                              </td>
                            )}
                            <td className="p-3 text-xs text-gray-500">{action}</td>
                            {roles.map((role) => {
                              const permKey = `${mod.toLowerCase()}:${action.toLowerCase()}`;
                              const rolePerms = role === 'company_admin';
                              const hasAccess = role === 'company_admin' || (role === 'hr_manager' && ['Read', 'Create', 'Update'].includes(action) && !['Settings', 'Payroll'].includes(mod));
                              return (
                                <td key={`${mod}-${role}-${action}`} className="p-3 text-center">
                                  {hasAccess ? (
                                    <Check className="mx-auto h-4 w-4 text-green-500" />
                                  ) : (
                                    <span className="text-gray-300 dark:text-gray-600">—</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        ))
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            ),
          },
        ]}
      />

      <Modal isOpen={showAddUserModal} onClose={() => setShowAddUserModal(false)} title="Add User" size="md">
        <div className="space-y-4">
          <Input label="Full Name" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} placeholder="Enter full name" />
          <Input label="Email Address" type="email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} placeholder="email@company.com" />
          <Select label="Role" options={roleOptions} value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)} placeholder="Select role..." />
          <Select label="Link Employee (Optional)" options={[{ value: '', label: 'None' }, { value: 'emp-1', label: 'Ahmad Khaled' }, { value: 'emp-2', label: 'Sarah Johnson' }]} placeholder="Select employee..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowAddUserModal(false)}>Cancel</Button>
            <Button disabled={!newUserName || !newUserEmail || !newUserRole}>Add User</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

