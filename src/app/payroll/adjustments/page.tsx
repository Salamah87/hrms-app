'use client';

import { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils';

interface Adjustment {
  id: string;
  employee: string;
  type: 'bonus' | 'commission' | 'loan' | 'advance' | 'penalty';
  amount: number;
  description: string;
  date: string;
}

const mockAdjustments: Adjustment[] = [
  { id: '1', employee: 'Ahmad Khaled', type: 'bonus', amount: 2000, description: 'Q2 Performance Bonus', date: '2026-06-15' },
  { id: '2', employee: 'Sarah Johnson', type: 'commission', amount: 1500, description: 'Sales Commission', date: '2026-06-14' },
  { id: '3', employee: 'Michael Brown', type: 'loan', amount: 5000, description: 'Salary Advance Loan', date: '2026-06-10' },
  { id: '4', employee: 'Nora Hassan', type: 'advance', amount: 3000, description: 'Emergency Advance', date: '2026-06-08' },
  { id: '5', employee: 'Robert Wilson', type: 'penalty', amount: 500, description: 'Late Attendance Penalty', date: '2026-06-05' },
  { id: '6', employee: 'Jennifer Lee', type: 'bonus', amount: 1000, description: 'Spot Bonus', date: '2026-06-01' },
];

const typeVariant: Record<string, 'success' | 'info' | 'warning' | 'primary' | 'danger'> = {
  bonus: 'success',
  commission: 'info',
  loan: 'warning',
  advance: 'primary',
  penalty: 'danger',
};

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'bonus', label: 'Bonus' },
  { value: 'commission', label: 'Commission' },
  { value: 'loan', label: 'Loan' },
  { value: 'advance', label: 'Advance' },
  { value: 'penalty', label: 'Penalty' },
];

const defaultForm = { employee: '', type: 'bonus' as 'bonus' | 'commission' | 'loan' | 'advance' | 'penalty', amount: 0, description: '', date: '' };

export default function AdjustmentsPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center py-20"><div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" /></div>}>
      <AdjustmentsContent />
    </Suspense>
  );
}

function AdjustmentsContent() {
  const [adjustments, setAdjustments] = useState(mockAdjustments);
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(defaultForm);

  const filtered = useMemo(() => {
    if (!search) return adjustments;
    const q = search.toLowerCase();
    return adjustments.filter((a) => a.employee.toLowerCase().includes(q));
  }, [search, adjustments]);

  const handleAdd = () => {
    const newAdj: Adjustment = { ...form, id: String(Date.now()), date: form.date || new Date().toISOString().split('T')[0] };
    setAdjustments((prev) => [newAdj, ...prev]);
    setModalOpen(false);
    setForm(defaultForm);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Adjustments</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage bonuses, commissions, loans, and penalties</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Add Adjustment
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Adjustments</CardTitle>
          <SearchInput value={search} onChange={setSearch} placeholder="Search by employee..." className="w-64" />
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'employee', header: 'Employee', sortable: true, render: (item: any) => <span className="font-medium">{item.employee as string}</span> },
              {
                key: 'type', header: 'Type',
                render: (item: any) => <Badge variant={typeVariant[item.type as string]}>{item.type as string}</Badge>,
              },
              { key: 'amount', header: 'Amount', render: (item: any) => <span className="font-semibold">{formatCurrency(item.amount as number)}</span> },
              { key: 'description', header: 'Description', render: (item: any) => <span className="text-gray-500">{item.description as string}</span> },
              { key: 'date', header: 'Date', render: (item: any) => <span>{formatDate(item.date as string)}</span> },
            ]}
            data={filtered as any[]}
            keyExtractor={(item) => item.id as string}
            sortable
            emptyState={
              <EmptyState icon={Plus} title="No adjustments" description={search ? 'Try a different search' : 'Add your first payroll adjustment'} action={!search ? { label: 'Add Adjustment', onClick: () => setModalOpen(true) } : undefined} />
            }
          />
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Adjustment" size="md">
        <div className="space-y-4">
          <Input label="Employee Name" value={form.employee} onChange={(e) => setForm({ ...form, employee: e.target.value })} placeholder="Enter employee name" />
          <Select label="Type" options={typeOptions.slice(1)} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'bonus' | 'commission' | 'loan' | 'advance' | 'penalty' })} />
          <Input label="Amount" type="number" value={String(form.amount)} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} placeholder="0.00" />
          <Input label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Reason for adjustment" />
          <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.employee || !form.amount}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

