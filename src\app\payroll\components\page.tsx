'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency } from '@/lib/utils';

interface SalaryComponent {
  id: string;
  name: string;
  type: 'earning' | 'deduction';
  calculationType: 'fixed' | 'percentage';
  value: number;
  isTaxable: boolean;
  isActive: boolean;
}

const defaultForm: SalaryComponent = {
  id: '', name: '', type: 'earning', calculationType: 'fixed', value: 0, isTaxable: true, isActive: true,
};

export default function SalaryComponentsPage() {
  const [components, setComponents] = useState<SalaryComponent[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SalaryComponent | null>(null);
  const [form, setForm] = useState<SalaryComponent>(defaultForm);

  useEffect(() => {
    fetch('/api/payroll/components')
      .then(res => res.json())
      .then(setComponents);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(defaultForm);
    setModalOpen(true);
  };

  const openEdit = (comp: SalaryComponent) => {
    setEditing(comp);
    setForm({ ...comp });
    setModalOpen(true);
  };

  const handleSave = async () => {
    if (editing) {
      try {
        const res = await fetch('/api/payroll/components', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editing.id, ...form }),
        });
        if (!res.ok) throw new Error('Failed');
        const updated = await res.json();
        setComponents(prev => prev.map(c => c.id === editing.id ? updated : c));
        toast.success('Component updated');
      } catch {
        toast.error('Failed to update');
      }
    } else {
      try {
        const res = await fetch('/api/payroll/components', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        if (!res.ok) throw new Error('Failed');
        const created = await res.json();
        setComponents(prev => [...prev, created]);
        toast.success('Component created');
      } catch {
        toast.error('Failed to create');
      }
    }
    setModalOpen(false);
  };

  const toggleActive = async (id: string) => {
    const comp = components.find(c => c.id === id);
    if (!comp) return;
    try {
      const res = await fetch('/api/payroll/components', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isActive: !comp.isActive }),
      });
      if (!res.ok) throw new Error('Failed');
      const updated = await res.json();
      setComponents(prev => prev.map(c => c.id === id ? updated : c));
    } catch {
      toast.error('Failed to toggle');
    }
  };

  const typeOptions = [
    { value: 'earning', label: 'Earning' },
    { value: 'deduction', label: 'Deduction' },
  ];

  const calcOptions = [
    { value: 'fixed', label: 'Fixed Amount' },
    { value: 'percentage', label: 'Percentage' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Salary Components</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage payroll earning and deduction items</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Add Component
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'name', header: 'Name', sortable: true, render: (item: any) => <span className="font-medium">{item.name as string}</span> },
              {
                key: 'type', header: 'Type',
                render: (item: any) => (
                  <Badge variant={(item.type as string) === 'earning' ? 'success' : 'danger'}>
                    {item.type as string}
                  </Badge>
                ),
              },
              { key: 'calculationType', header: 'Calculation', render: (item: any) => <Badge variant="info">{item.calculationType as string}</Badge> },
              { key: 'value', header: 'Value', render: (item: any) => <span className="font-medium">{(item.calculationType as string) === 'percentage' ? `${item.value}%` : item.value === 0 ? '—' : formatCurrency(item.value)}</span> },
              {
                key: 'isTaxable', header: 'Taxable',
                render: (item: any) => (
                  <Badge variant={(item.isTaxable as boolean) ? 'warning' : 'default'}>
                    {(item.isTaxable as boolean) ? 'Yes' : 'No'}
                  </Badge>
                ),
              },
              {
                key: 'isActive', header: 'Active',
                render: (item: any) => (
                  <div className="flex items-center gap-2">
                    <Badge variant={(item.isActive as boolean) ? 'success' : 'default'} size="sm">{(item.isActive as boolean) ? 'Active' : 'Inactive'}</Badge>
                    <button onClick={() => toggleActive(item.id as string)} className="text-gray-400 hover:text-blue-600 transition-colors">
                      {(item.isActive as boolean) ? <ToggleRight className="h-5 w-5 text-green-500" /> : <ToggleLeft className="h-5 w-5" />}
                    </button>
                  </div>
                ),
              },
              {
                key: 'actions', header: '', className: 'w-16',
                render: (item: any) => (
                  <Button variant="ghost" size="sm" onClick={() => openEdit(item as unknown as SalaryComponent)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                ),
              },
            ]}
            data={components as any[]}
            keyExtractor={(item) => item.id as string}
            sortable
            emptyState={<EmptyState icon={Plus} title="No salary components" description="Add your first earning or deduction component" />}
          />
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Component' : 'Add Component'} size="md">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Housing Allowance" />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Type" options={typeOptions} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as 'earning' | 'deduction' })} />
            <Select label="Calculation" options={calcOptions} value={form.calculationType} onChange={(e) => setForm({ ...form, calculationType: e.target.value as 'fixed' | 'percentage' })} />
          </div>
          <Input label="Value" type="number" value={String(form.value)} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} placeholder={form.calculationType === 'percentage' ? 'Percentage value' : 'Amount'} />
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={form.isTaxable} onChange={(e) => setForm({ ...form, isTaxable: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Taxable
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              Active
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

