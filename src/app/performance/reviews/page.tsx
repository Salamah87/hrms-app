'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Star,
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { Dropdown } from '@/components/ui/dropdown';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/loading';
import { formatDate } from '@/lib/utils';

type ReviewStatus = 'pending' | 'draft' | 'completed' | 'overdue';

interface Review {
  id: string;
  employee: string;
  reviewer: string;
  cycle: string;
  period: string;
  rating: number | null;
  status: ReviewStatus;
  dueDate: string;
  department: string;
}

const mockReviews: Review[] = Array.from({ length: 30 }, (_, i) => ({
  id: `rev-${i + 1}`,
  employee: (['Ahmad Khaled', 'Sarah Johnson', 'Michael Brown', 'Nora Hassan', 'Robert Wilson', 'Jennifer Lee', 'James Taylor', 'Lisa Anderson', 'William Thomas', 'Amanda White'])[i % 10],
  reviewer: (['You', 'HR Team', 'Dept Manager', 'External'])[i % 4],
  cycle: (['Q1 2026', 'Q2 2026', 'H1 2026', 'FY 2025-26'])[i % 4],
  period: (['Jan-Mar 2026', 'Apr-Jun 2026', 'Jan-Jun 2026', 'Jul 2025-Jun 2026'])[i % 4],
  rating: i % 5 === 0 ? null : [3, 4, 4, 5, 3, 2, 4, 5][i % 8],
  status: (['pending', 'draft', 'completed', 'completed', 'pending', 'overdue'] as ReviewStatus[])[i % 6],
  dueDate: new Date(2026, 6, 15 + (i % 15)).toISOString(),
  department: (['Engineering', 'Marketing', 'Sales', 'Finance', 'HR'])[i % 5],
}));

const statusBadge: Record<string, 'warning' | 'info' | 'success' | 'danger'> = {
  pending: 'warning',
  draft: 'info',
  completed: 'success',
  overdue: 'danger',
};

const cycleOptions = [
  { value: '', label: 'All Cycles' },
  { value: 'Q1 2026', label: 'Q1 2026' },
  { value: 'Q2 2026', label: 'Q2 2026' },
  { value: 'H1 2026', label: 'H1 2026' },
  { value: 'FY 2025-26', label: 'FY 2025-26' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'draft', label: 'Draft' },
  { value: 'completed', label: 'Completed' },
  { value: 'overdue', label: 'Overdue' },
];

const departmentOptions = [
  { value: '', label: 'All Departments' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Finance', label: 'Finance' },
  { value: 'HR', label: 'HR' },
];

export default function ReviewsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [cycleFilter, setCycleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    employee: '', reviewer: '', cycle: '', period: '', dueDate: '',
  });

  const filtered = useMemo(() => {
    let result = mockReviews;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.employee.toLowerCase().includes(q) || r.reviewer.toLowerCase().includes(q));
    }
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    if (cycleFilter) result = result.filter((r) => r.cycle === cycleFilter);
    if (deptFilter) result = result.filter((r) => r.department === deptFilter);
    return result;
  }, [search, statusFilter, cycleFilter, deptFilter]);

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const handleCreate = () => {
    console.log('Create review', createForm);
    setShowCreateModal(false);
    setCreateForm({ employee: '', reviewer: '', cycle: '', period: '', dueDate: '' });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Reviews</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage employee performance reviews</p>
        </div>
        <TableSkeleton rows={8} columns={7} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance Reviews</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage employee performance reviews</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Create Review
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search reviews..." className="w-64" />
            <Select options={statusOptions} value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="w-36" />
            <Select options={cycleOptions} value={cycleFilter} onChange={(e) => { setCycleFilter(e.target.value); setPage(1); }} className="w-36" />
            <Select options={departmentOptions} value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }} className="w-40" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'employee', header: 'Employee', sortable: true },
              { key: 'reviewer', header: 'Reviewer', sortable: true },
              { key: 'cycle', header: 'Cycle', sortable: true },
              { key: 'period', header: 'Period' },
              {
                key: 'rating', header: 'Rating',
                render: (item: any) => (
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {item.rating != null ? (
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        {item.rating}/5
                      </span>
                    ) : '—'}
                  </span>
                ),
              },
              {
                key: 'status', header: 'Status',
                render: (item: any) => (
                  <Badge variant={statusBadge[item.status as ReviewStatus]}>
                    {item.status as string}
                  </Badge>
                ),
              },
              {
                key: 'dueDate', header: 'Due Date', sortable: true,
                render: (item: any) => (
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(item.dueDate as string)}
                  </span>
                ),
              },
              {
                key: 'actions', header: '', className: 'w-16',
                render: (item: any) => (
                  <Dropdown
                    align="right"
                    trigger={
                      <Button variant="ghost" size="sm"><MoreHorizontal className="h-4 w-4" /></Button>
                    }
                    items={[
                      { label: 'View', icon: <Eye className="h-4 w-4" />, onClick: () => console.log('View', item.id) },
                      { label: 'Edit', icon: <Pencil className="h-4 w-4" />, onClick: () => console.log('Edit', item.id) },
                      { divider: true },
                      { label: 'Delete', icon: <Trash2 className="h-4 w-4" />, danger: true, onClick: () => console.log('Delete', item.id) },
                    ]}
                  />
                ),
              },
            ]}
            data={paginated as any[]}
            keyExtractor={(item) => item.id as string}
            sortable
            emptyState={
              <EmptyState icon={ClipboardCheck} title="No reviews found" description="Try adjusting your filters" />
            }
          />
        </CardContent>
        {filtered.length > 0 && (
          <div className="border-t px-6 py-4 dark:border-gray-800">
            <Pagination currentPage={page} totalPages={totalPages} total={filtered.length} limit={limit} onPageChange={setPage} onLimitChange={(l) => { setLimit(l); setPage(1); }} />
          </div>
        )}
      </Card>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Review" size="md">
        <div className="space-y-4">
          <Input label="Employee" value={createForm.employee} onChange={(e) => setCreateForm({ ...createForm, employee: e.target.value })} placeholder="Employee name" />
          <Input label="Reviewer" value={createForm.reviewer} onChange={(e) => setCreateForm({ ...createForm, reviewer: e.target.value })} placeholder="Reviewer name" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cycle" value={createForm.cycle} onChange={(e) => setCreateForm({ ...createForm, cycle: e.target.value })} placeholder="e.g. Q2 2026" />
            <Input label="Period" value={createForm.period} onChange={(e) => setCreateForm({ ...createForm, period: e.target.value })} placeholder="e.g. Apr-Jun 2026" />
          </div>
          <Input label="Due Date" type="date" value={createForm.dueDate} onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button onClick={handleCreate}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

