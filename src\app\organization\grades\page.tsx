'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SearchInput } from '@/components/ui/search-input';
import { Pagination } from '@/components/ui/pagination';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/utils';

interface GradeItem {
  id: string;
  code: string;
  name: string;
  minSalary: number;
  maxSalary: number;
  description: string;
  isActive: boolean;
  employeeCount: number;
}

const mockGrades: GradeItem[] = Array.from({ length: 15 }, (_, i) => ({
  id: `grade-${i + 1}`,
  code: `GRD-${String(i + 1).padStart(2, '0')}`,
  name: `Grade ${i + 1}`,
  minSalary: 3000 + (i * 2000),
  maxSalary: 6000 + (i * 3500),
  description: `Salary grade ${i + 1}`,
  isActive: i < 12,
  employeeCount: Math.floor(Math.random() * 80) + 5,
}));

const defaultForm = { code: '', name: '', minSalary: '', maxSalary: '', description: '', isActive: true };

export default function GradesPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GradeItem | null>(null);
  const [form, setForm] = useState(defaultForm);

  const filtered = useMemo(() => {
    if (!search) return mockGrades;
    const q = search.toLowerCase();
    return mockGrades.filter((g) => g.code.toLowerCase().includes(q) || g.name.toLowerCase().includes(q));
  }, [search]);

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (grade: GradeItem) => {
    setEditing(grade);
    setForm({
      code: grade.code,
      name: grade.name,
      minSalary: grade.minSalary.toString(),
      maxSalary: grade.maxSalary.toString(),
      description: grade.description,
      isActive: grade.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    console.log('Save grade', { ...form, id: editing?.id });
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grades</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage salary grades and bands</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Grades</CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Search grades..."
              className="w-64"
            />
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Grade
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'code', header: 'Code', sortable: true, className: 'font-mono text-xs' },
              { key: 'name', header: 'Name', sortable: true },
              {
                key: 'minSalary',
                header: 'Salary Range',
                render: (item: any) => (
                  <span className="text-xs">
                    {formatCurrency(item.minSalary as number)} — {formatCurrency(item.maxSalary as number)}
                  </span>
                ),
              },
              {
                key: 'description',
                header: 'Description',
                render: (item: any) => <span className="text-gray-500">{item.description as string}</span>,
              },
              {
                key: 'employeeCount',
                header: 'Employees',
                sortable: true,
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
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item as unknown as GradeItem)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => window.confirm('Delete this grade?') && console.log('Delete', (item as any).id)}>
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
                icon={GraduationCap}
                title="No grades found"
                description={search ? 'Try adjusting your search' : 'Create your first grade'}
                action={!search ? { label: 'Add Grade', onClick: openCreate } : undefined}
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
        title={editing ? 'Edit Grade' : 'Create Grade'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
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

