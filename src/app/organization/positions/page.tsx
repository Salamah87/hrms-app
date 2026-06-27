'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Briefcase,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/utils';
import type { Position } from '@/types';

const mockPositions: Position[] = Array.from({ length: 24 }, (_, i) => ({
  id: `pos-${i + 1}`,
  title: [
    'Frontend Developer', 'Backend Developer', 'Full Stack Developer', 'UI/UX Designer',
    'Product Manager', 'Scrum Master', 'DevOps Engineer', 'QA Engineer',
    'Sales Manager', 'Sales Rep', 'Account Executive', 'Marketing Manager',
    'Digital Marketing Specialist', 'Content Writer', 'Graphic Designer', 'SEO Specialist',
    'Accountant', 'Financial Analyst', 'Finance Manager', 'HR Manager',
    'HR Officer', 'Recruiter', 'Office Manager', 'Executive Assistant',
  ][i],
  titleAr: '',
  code: ['FE', 'BE', 'FS', 'UX', 'PM', 'SM', 'DO', 'QA', 'SLM', 'SR', 'AE', 'MKM', 'DM', 'CW', 'GD', 'SEO', 'ACC', 'FA', 'FIM', 'HRM', 'HRO', 'REC', 'OM', 'EA'][i],
  departmentId: `dept-${(i % 5) + 1}`,
  description: 'Standard position description',
  requirements: '3+ years experience',
  minSalary: 5000 + (i * 2000),
  maxSalary: 10000 + (i * 3000),
  isActive: i % 7 !== 0,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
}));

const departmentOptions = [
  { value: '', label: 'All Departments' },
  { value: 'dept-1', label: 'Engineering' },
  { value: 'dept-2', label: 'Marketing' },
  { value: 'dept-3', label: 'Sales' },
  { value: 'dept-4', label: 'Finance' },
  { value: 'dept-5', label: 'HR' },
];

const defaultForm = { title: '', code: '', departmentId: '', description: '', requirements: '', minSalary: '', maxSalary: '', isActive: true };

export default function PositionsPage() {
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Position | null>(null);
  const [form, setForm] = useState(defaultForm);

  const filtered = useMemo(() => {
    let result = mockPositions;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.title.toLowerCase().includes(q) || p.code.toLowerCase().includes(q));
    }
    if (deptFilter) result = result.filter((p) => p.departmentId === deptFilter);
    return result;
  }, [search, deptFilter]);

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const deptName = (id: string) => departmentOptions.find((d) => d.value === id)?.label || id;

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (pos: Position) => {
    setEditing(pos);
    setForm({
      title: pos.title,
      code: pos.code,
      departmentId: pos.departmentId,
      description: pos.description || '',
      requirements: pos.requirements || '',
      minSalary: pos.minSalary?.toString() || '',
      maxSalary: pos.maxSalary?.toString() || '',
      isActive: pos.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    console.log('Save position', { ...form, id: editing?.id });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Positions</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage job positions across departments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Positions</CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Search positions..."
              className="w-64"
            />
            <Select
              options={departmentOptions}
              value={deptFilter}
              onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
              className="w-44"
            />
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Position
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'code', header: 'Code', sortable: true, className: 'font-mono text-xs' },
              { key: 'title', header: 'Title', sortable: true },
              {
                key: 'departmentId',
                header: 'Department',
                render: (item: any) => <span>{deptName(item.departmentId as string)}</span>,
              },
              {
                key: 'minSalary',
                header: 'Salary Range',
                render: (item: any) => (
                  <span className="text-xs">
                    {formatCurrency(item.minSalary as number)} - {formatCurrency(item.maxSalary as number)}
                  </span>
                ),
              },
              {
                key: 'isActive',
                header: 'Status',
                render: (item: any) => (
                  <Badge variant={item.isActive ? 'success' : 'default'}>
                    {item.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                ),
              },
              {
                key: 'actions',
                header: '',
                className: 'w-24',
                render: (item: any) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item as unknown as Position)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => window.confirm('Delete this position?') && console.log('Delete', (item as any).id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={paginated as any[]}
            keyExtractor={(item) => item.id as string}
            sortable
            emptyState={
              <EmptyState
                icon={Briefcase}
                title="No positions found"
                description={search || deptFilter ? 'Try adjusting your search' : 'Create your first position'}
                action={!search && !deptFilter ? { label: 'Add Position', onClick: openCreate } : undefined}
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

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Position' : 'Create Position'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </div>
          <Select
            label="Department"
            options={departmentOptions.filter((d) => d.value)}
            value={form.departmentId}
            onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            placeholder="Select department"
          />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <Input label="Requirements" value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Min Salary" type="number" value={form.minSalary} onChange={(e) => setForm({ ...form, minSalary: e.target.value })} />
            <Input label="Max Salary" type="number" value={form.maxSalary} onChange={(e) => setForm({ ...form, maxSalary: e.target.value })} />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Active
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>{editing ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

