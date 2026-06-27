'use client';

import { useState } from 'react';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  MoreHorizontal,
  Eye,
  Power,
  PowerOff,
  Search,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SearchInput } from '@/components/ui/search-input';
import { Avatar } from '@/components/ui/avatar';
import { Pagination } from '@/components/ui/pagination';
import { Dropdown } from '@/components/ui/dropdown';
import { TableSkeleton } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';

interface UserItem {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
  lastLogin: string;
  employeeLink?: string;
  avatar?: string;
}

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

const roleOptions = Object.entries(roleLabels).map(([value, label]) => ({ value, label }));

const mockUsers: UserItem[] = [
  { id: 'u1', name: 'Admin User', email: 'admin@company.com', role: 'company_admin', status: 'active', lastLogin: '2026-06-22 09:15' },
  { id: 'u2', name: 'HR Manager', email: 'hr.manager@company.com', role: 'hr_manager', status: 'active', lastLogin: '2026-06-21 14:30' },
  { id: 'u3', name: 'HR Officer', email: 'hr.officer@company.com', role: 'hr_officer', status: 'active', lastLogin: '2026-06-20 11:00' },
  { id: 'u4', name: 'Payroll Officer', email: 'payroll@company.com', role: 'payroll_officer', status: 'active', lastLogin: '2026-06-19 16:45' },
  { id: 'u5', name: 'Dept Manager', email: 'dept.manager@company.com', role: 'dept_manager', status: 'inactive', lastLogin: '2026-05-15 08:30' },
  { id: 'u6', name: 'Recruiter', email: 'recruiter@company.com', role: 'recruiter', status: 'active', lastLogin: '2026-06-22 10:00' },
  { id: 'u7', name: 'Finance Manager', email: 'finance@company.com', role: 'finance_manager', status: 'active', lastLogin: '2026-06-18 13:20' },
  { id: 'u8', name: 'Team Leader', email: 'team.leader@company.com', role: 'team_leader', status: 'inactive', lastLogin: '2026-04-10 09:00' },
];

export default function UsersPage() {
  const [isLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editUser, setEditUser] = useState<UserItem | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('');

  const filtered = search
    ? mockUsers.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    : mockUsers;

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const openEdit = (user: UserItem) => {
    setEditUser(user);
    setNewName(user.name);
    setNewEmail(user.email);
    setNewRole(user.role);
    setShowEditModal(true);
  };

  const toggleStatus = (user: UserItem) => {
    console.log(`Toggle ${user.id} to ${user.status === 'active' ? 'inactive' : 'active'}`);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage system users and their roles</p>
        </div>
        <TableSkeleton rows={8} columns={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage system users and their roles</p>
        </div>
        <Button onClick={() => { setNewName(''); setNewEmail(''); setNewRole(''); setShowAddModal(true); }}>
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
          <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or email..." className="w-72" />
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              {
                key: 'name', header: 'Name', sortable: true,
                render: (item: any) => (
                  <div className="flex items-center gap-3">
                    <Avatar src={item.avatar} name={item.name as string} size="sm" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.name as string}</p>
                      <p className="text-xs text-gray-500">{item.email as string}</p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'email', header: 'Email',
                render: () => null,
              },
              {
                key: 'role', header: 'Role',
                render: (item: any) => (
                  <Badge variant="primary" size="sm">{roleLabels[item.role as string] || (item.role as string)}</Badge>
                ),
              },
              {
                key: 'status', header: 'Status',
                render: (item: any) => (
                  <Badge variant={item.status === 'active' ? 'success' : 'default'}>{item.status as string}</Badge>
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
                className: 'w-20',
                render: (item: any) => (
                  <Dropdown
                    align="right"
                    trigger={
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    }
                    items={[
                      { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => openEdit(item as unknown as UserItem) },
                      {
                        label: item.status === 'active' ? 'Deactivate' : 'Activate',
                        icon: item.status === 'active' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />,
                        onClick: () => toggleStatus(item as unknown as UserItem),
                      },
                      { divider: true },
                      { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, danger: true, onClick: () => { if (window.confirm(`Delete user ${item.name}?`)) console.log('Delete', item.id); } },
                    ]}
                  />
                ),
              },
            ]}
            data={paginated as any[]}
            keyExtractor={(item) => item.id as string}
            sortable
            emptyState={
              <EmptyState
                icon={Users}
                title="No users found"
                description={search ? 'Try a different search term' : 'Add users to grant system access'}
                action={!search ? { label: 'Add User', onClick: () => setShowAddModal(true) } : undefined}
              />
            }
          />
        </CardContent>
        {filtered.length > 0 && (
          <div className="border-t px-6 py-4 dark:border-gray-800">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              total={filtered.length}
              limit={limit}
              onPageChange={setPage}
              onLimitChange={(l) => { setLimit(l); setPage(1); }}
            />
          </div>
        )}
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add User" size="md">
        <div className="space-y-4">
          <Input label="Full Name" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Enter full name" />
          <Input label="Email Address" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} placeholder="email@company.com" />
          <Input label="Password" type="password" placeholder="Enter temporary password" />
          <Select label="Role" options={roleOptions} value={newRole} onChange={(e) => setNewRole(e.target.value)} placeholder="Select role..." />
          <Select label="Link Employee (Optional)" options={[
            { value: '', label: 'None' },
            { value: 'emp-1', label: 'Ahmad Khaled' },
            { value: 'emp-2', label: 'Sarah Johnson' },
            { value: 'emp-3', label: 'Michael Brown' },
          ]} placeholder="Select employee..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button disabled={!newName || !newEmail || !newRole}>Add User</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditUser(null); }} title="Edit User" size="md">
        <div className="space-y-4">
          <Input label="Full Name" value={newName} onChange={(e) => setNewName(e.target.value)} />
          <Input label="Email Address" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
          <Select label="Role" options={roleOptions} value={newRole} onChange={(e) => setNewRole(e.target.value)} />
          <div className="flex items-center gap-3 rounded-lg border p-3 dark:border-gray-700">
            <span className="text-sm text-gray-700 dark:text-gray-300">Status</span>
            <Badge variant={editUser?.status === 'active' ? 'success' : 'default'}>
              {editUser?.status || 'active'}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditUser((prev) => prev ? { ...prev, status: prev.status === 'active' ? 'inactive' : 'active' } : null)}
            >
              Toggle
            </Button>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => { setShowEditModal(false); setEditUser(null); }}>Cancel</Button>
            <Button>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

