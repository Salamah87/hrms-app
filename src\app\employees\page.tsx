'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Plus,
  Download,
  Upload,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { Pagination } from '@/components/ui/pagination';
import { Dropdown } from '@/components/ui/dropdown';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/loading';
import { formatDate } from '@/lib/utils';
import { Avatar } from '@/components/ui/avatar';
import type { Employee } from '@/types';

const statusVariant: Record<string, 'success' | 'default' | 'warning' | 'danger' | 'info'> = {
  active: 'success',
  inactive: 'default',
  suspended: 'warning',
  terminated: 'danger',
  resigned: 'info',
};

const departments = [
  { value: '', label: 'All Departments' },
  { value: 'dept-1', label: 'Engineering' },
  { value: 'dept-2', label: 'Marketing' },
  { value: 'dept-3', label: 'Sales' },
  { value: 'dept-4', label: 'Finance' },
  { value: 'dept-5', label: 'HR' },
];

const statuses = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'terminated', label: 'Terminated' },
  { value: 'resigned', label: 'Resigned' },
];

const employmentTypes = [
  { value: '', label: 'All Types' },
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'intern', label: 'Intern' },
  { value: 'temporary', label: 'Temporary' },
];

export default function EmployeesPage() {
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => { setAllEmployees(data); setIsLoading(false); })
      .catch(() => setIsLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let result = allEmployees;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.firstName.toLowerCase().includes(q) ||
          e.lastName.toLowerCase().includes(q) ||
          e.employeeNumber.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q)
      );
    }
    if (departmentFilter) result = result.filter((e) => e.departmentId === departmentFilter);
    if (statusFilter) result = result.filter((e) => e.status === statusFilter);
    if (typeFilter) result = result.filter((e) => e.employmentType === typeFilter);
    return result;
  }, [search, departmentFilter, statusFilter, typeFilter, allEmployees]);

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const deptName = (id: string) => departments.find((d) => d.value === id)?.label || id;
  const posName = (_id: string) => {
    const names = ['Frontend Developer', 'Backend Developer', 'Designer', 'Product Manager', 'Sales Rep', 'Accountant', 'HR Officer', 'Marketing Specialist'];
    return names[parseInt(_id.split('-')[1] || '1') - 1] || _id;
  };

  const handleExport = () => {
    const csv = [
      ['Employee #', 'Name', 'Email', 'Department', 'Position', 'Status', 'Hire Date'].join(','),
      ...filtered.map((e) =>
        [e.employeeNumber, `${e.firstName} ${e.lastName}`, e.email, deptName(e.departmentId || ''), posName(e.positionId || ''), e.status, formatDate(e.joiningDate)].join(',')
      ),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'employees.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your workforce</p>
        </div>
        <TableSkeleton rows={8} columns={7} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employees</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage your workforce</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Employees</CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Search employees..."
              className="w-72"
            />
            <Select
              options={departments}
              value={departmentFilter}
              onChange={(e) => { setDepartmentFilter(e.target.value); setPage(1); }}
              className="w-44"
            />
            <Select
              options={statuses}
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
              className="w-36"
            />
            <Select
              options={employmentTypes}
              value={typeFilter}
              onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
              className="w-36"
            />
            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Link href="/employees/import">
              <Button variant="outline">
                <Upload className="h-4 w-4" />
                Import
              </Button>
            </Link>
            <Link href="/employees/new">
              <Button>
                <Plus className="h-4 w-4" />
                Add Employee
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              {
                key: 'employeeNumber',
                header: 'Employee #',
                sortable: true,
                className: 'font-mono text-xs',
              },
              {
                key: 'name',
                header: 'Name',
                sortable: true,
                render: (item: any) => (
                  <Link
                    href={`/employees/${item.id}`}
                    className="flex items-center gap-3 group"
                  >
                    <Avatar
                      src={item.avatar}
                      name={`${item.firstName} ${item.lastName}`}
                      size="sm"
                    />
                    <div>
                      <p className="font-medium text-gray-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400 transition-colors">
                        {item.firstName} {item.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{item.email}</p>
                    </div>
                  </Link>
                ),
              },
              {
                key: 'departmentId',
                header: 'Department',
                render: (item: any) => (
                  <span className="text-gray-700 dark:text-gray-300">
                    {deptName(item.departmentId || '')}
                  </span>
                ),
              },
              {
                key: 'positionId',
                header: 'Position',
                render: (item: any) => (
                  <span className="text-gray-700 dark:text-gray-300">
                    {posName(item.positionId || '')}
                  </span>
                ),
              },
              {
                key: 'status',
                header: 'Status',
                render: (item: any) => (
                  <Badge variant={statusVariant[item.status]}>
                    {item.status}
                  </Badge>
                ),
              },
              {
                key: 'joiningDate',
                header: 'Hire Date',
                sortable: true,
                render: (item: any) => (
                  <span className="text-gray-700 dark:text-gray-300">
                    {formatDate(item.joiningDate)}
                  </span>
                ),
              },
              {
                key: 'actions',
                header: '',
                className: 'w-16',
                render: (item: any) => (
                  <Dropdown
                    align="right"
                    trigger={
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    }
                    items={[
                      {
                        label: 'View',
                        icon: <Eye className="h-4 w-4" />,
                        onClick: () => window.location.href = `/employees/${item.id}`,
                      },
                      {
                        label: 'Edit',
                        icon: <Pencil className="h-4 w-4" />,
                        onClick: () => window.location.href = `/employees/${item.id}/edit`,
                      },
                      { divider: true },
                      {
                        label: 'Delete',
                        icon: <Trash2 className="h-4 w-4" />,
                        danger: true,
                        onClick: () => {
                          if (window.confirm(`Delete employee ${item.firstName} ${item.lastName}?`)) {
                            console.log('Delete', item.id);
                          }
                        },
                      },
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
                title="No employees found"
                description={search || departmentFilter || statusFilter || typeFilter ? 'Try adjusting your filters' : 'Get started by adding your first employee'}
                action={!search && !departmentFilter && !statusFilter && !typeFilter ? { label: 'Add Employee', onClick: () => window.location.href = '/employees/new' } : undefined}
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
    </div>
  );
}

