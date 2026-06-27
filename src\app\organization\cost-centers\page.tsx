'use client';

import { useState, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  DollarSign,
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
import { cn, formatCurrency } from '@/lib/utils';

interface CostCenterItem {
  id: string;
  code: string;
  name: string;
  description: string;
  budget: number;
  allocated: number;
  manager: string;
  isActive: boolean;
  employeeCount: number;
}

const mockCostCenters: CostCenterItem[] = Array.from({ length: 18 }, (_, i) => ({
  id: `cc-${i + 1}`,
  code: `CC-${['ENG', 'MKT', 'SAL', 'FIN', 'HR', 'OPS', 'IT', 'R&D'][i % 8]}-${String(i + 1).padStart(3, '0')}`,
  name: [
    'Engineering Operations', 'Marketing Campaigns', 'Sales North', 'Sales South',
    'Financial Operations', 'HR Operations', 'Infrastructure', 'Cloud Services',
    'Product Development', 'Customer Support', 'Training & Development', 'Travel & Expenses',
    'Office Administration', 'Legal & Compliance', 'IT Security', 'Data Analytics',
    'Content Production', 'Payroll Operations',
  ][i],
  description: 'Cost center for departmental operations',
  budget: 500000 + (i * 250000),
  allocated: 300000 + (i * 180000),
  manager: ['James Taylor', 'Amanda White', 'Nora Hassan', 'Robert Wilson', 'Jennifer Lee', 'Ahmad Khaled', 'Sarah Johnson', 'Michael Brown'][i % 8],
  isActive: i % 6 !== 0,
  employeeCount: Math.floor(Math.random() * 100) + 3,
}));

const defaultForm = { code: '', name: '', description: '', budget: '', allocated: '', manager: '', isActive: true };

export default function CostCentersPage() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CostCenterItem | null>(null);
  const [form, setForm] = useState(defaultForm);

  const filtered = useMemo(() => {
    if (!search) return mockCostCenters;
    const q = search.toLowerCase();
    return mockCostCenters.filter(
      (c) => c.code.toLowerCase().includes(q) || c.name.toLowerCase().includes(q) || c.manager.toLowerCase().includes(q)
    );
  }, [search]);

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (cc: CostCenterItem) => {
    setEditing(cc);
    setForm({
      code: cc.code,
      name: cc.name,
      description: cc.description,
      budget: cc.budget.toString(),
      allocated: cc.allocated.toString(),
      manager: cc.manager,
      isActive: cc.isActive,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    console.log('Save cost center', { ...form, id: editing?.id });
    setModalOpen(false);
  };

  const budgetUtil = (budget: number, allocated: number) => {
    return Math.min(Math.round((allocated / budget) * 100), 100);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Cost Centers</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage budget allocation across departments</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Cost Centers</CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput
              value={search}
              onChange={(v) => { setSearch(v); setPage(1); }}
              placeholder="Search cost centers..."
              className="w-64"
            />
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add Cost Center
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'code', header: 'Code', sortable: true, className: 'font-mono text-xs' },
              { key: 'name', header: 'Name', sortable: true },
              {
                key: 'budget',
                header: 'Budget',
                sortable: true,
                render: (item: any) => <span className="font-mono text-xs">{formatCurrency(item.budget as number)}</span>,
              },
              {
                key: 'allocated',
                header: 'Allocated',
                sortable: true,
                render: (item: any) => <span className="font-mono text-xs">{formatCurrency(item.allocated as number)}</span>,
              },
              {
                key: 'utilization',
                header: 'Utilization',
                render: (item: any) => {
                  const pct = budgetUtil(item.budget as number, item.allocated as number);
                  return (
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-20 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className={cn(
                            'h-2 rounded-full',
                            pct > 90 ? 'bg-red-500' : pct > 70 ? 'bg-yellow-500' : 'bg-green-500'
                          )}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-500">{pct}%</span>
                    </div>
                  );
                },
              },
              { key: 'manager', header: 'Manager' },
              { key: 'employeeCount', header: 'Employees', sortable: true },
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
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item as unknown as CostCenterItem)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => window.confirm('Delete this cost center?') && console.log('Delete', (item as any).id)}>
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
                icon={DollarSign}
                title="No cost centers found"
                description={search ? 'Try adjusting your search' : 'Create your first cost center'}
                action={!search ? { label: 'Add Cost Center', onClick: openCreate } : undefined}
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
        title={editing ? 'Edit Cost Center' : 'Create Cost Center'}
        size="lg"
      >
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Code" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Budget" type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} />
            <Input label="Allocated" type="number" value={form.allocated} onChange={(e) => setForm({ ...form, allocated: e.target.value })} />
          </div>
          <Input label="Manager" value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} />
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



