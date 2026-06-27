'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Edit3, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { CardSkeleton } from '@/components/ui/loading';
import type { OvertimePolicy } from '@/types';

export default function OvertimePoliciesPage() {
  const [policies, setPolicies] = useState<OvertimePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<OvertimePolicy | null>(null);

  const [editName, setEditName] = useState('');
  const [editWeekday, setEditWeekday] = useState('1.5');
  const [editWeekend, setEditWeekend] = useState('2.0');
  const [editHoliday, setEditHoliday] = useState('2.5');
  const [editMaxMonth, setEditMaxMonth] = useState('40');
  const [editMaxReq, setEditMaxReq] = useState('12');
  const [newName, setNewName] = useState('');

  const fetchData = useCallback(async () => {
    const res = await fetch('/api/overtime/policies');
    setPolicies(await res.json());
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openEdit = (p: OvertimePolicy) => {
    setSelected(p);
    setEditName(p.name);
    setEditWeekday(String(p.weekdayRate));
    setEditWeekend(String(p.weekendRate));
    setEditHoliday(String(p.holidayRate));
    setEditMaxMonth(String(p.maxHoursPerMonth));
    setEditMaxReq(String(p.maxHoursPerRequest));
    setEditOpen(true);
  };

  const handleEdit = async () => {
    if (!selected) return;
    await fetch(`/api/overtime/policies/${selected.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editName,
        weekdayRate: parseFloat(editWeekday),
        weekendRate: parseFloat(editWeekend),
        holidayRate: parseFloat(editHoliday),
        maxHoursPerMonth: parseInt(editMaxMonth),
        maxHoursPerRequest: parseInt(editMaxReq),
      }),
    });
    setEditOpen(false);
    await fetchData();
  };

  const handleCreate = async () => {
    if (!newName) return;
    await fetch('/api/overtime/policies', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ companyId: 'company-1', name: newName }),
    });
    setCreateOpen(false);
    setNewName('');
    await fetchData();
  };

  const toggleActive = async (p: OvertimePolicy) => {
    await fetch(`/api/overtime/policies/${p.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ active: !p.active }),
    });
    await fetchData();
  };

  const columns = [
    { key: 'name', header: 'Name', render: (p: OvertimePolicy) => <span className="font-semibold">{p.name}</span> },
    {
      key: 'status', header: 'Status',
      render: (p: OvertimePolicy) => (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={p.active} onChange={() => toggleActive(p)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
          {p.active ? 'Active' : 'Inactive'}
        </label>
      ),
    },
    { key: 'weekdayRate', header: 'Weekday', render: (p: OvertimePolicy) => `${p.weekdayRate}x` },
    { key: 'weekendRate', header: 'Weekend', render: (p: OvertimePolicy) => `${p.weekendRate}x` },
    { key: 'holidayRate', header: 'Holiday', render: (p: OvertimePolicy) => `${p.holidayRate}x` },
    { key: 'maxHoursPerMonth', header: 'Max/Month', render: (p: OvertimePolicy) => `${p.maxHoursPerMonth}h` },
    { key: 'maxHoursPerRequest', header: 'Max/Req', render: (p: OvertimePolicy) => `${p.maxHoursPerRequest}h` },
    {
      key: 'actions', header: 'Actions',
      render: (p: OvertimePolicy) => (
        <Button variant="ghost" size="sm" onClick={() => openEdit(p)}>
          <Edit3 className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overtime Policies</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Configure overtime rates, limits, and rules</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setCreateOpen(true)}>New Policy</Button>
      </div>

      {loading ? (
        <CardSkeleton count={1} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table
              columns={columns}
              data={policies as any}
              keyExtractor={(p: any) => p.id}
              emptyState={<EmptyState icon={Settings} title="No policies defined" description="Create one to get started." />}
            />
          </CardContent>
        </Card>
      )}

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Policy" size="md">
        <div className="space-y-4">
          <Input label="Policy Name" value={editName} onChange={e => setEditName(e.target.value)} />
          <Input label="Weekday Rate (x)" type="number" min="1" max="5" step="0.1" value={editWeekday} onChange={e => setEditWeekday(e.target.value)} />
          <Input label="Weekend Rate (x)" type="number" min="1" max="5" step="0.1" value={editWeekend} onChange={e => setEditWeekend(e.target.value)} />
          <Input label="Holiday Rate (x)" type="number" min="1" max="5" step="0.1" value={editHoliday} onChange={e => setEditHoliday(e.target.value)} />
          <Input label="Max Hours Per Month" type="number" min="1" max="200" value={editMaxMonth} onChange={e => setEditMaxMonth(e.target.value)} />
          <Input label="Max Hours Per Request" type="number" min="1" max="24" value={editMaxReq} onChange={e => setEditMaxReq(e.target.value)} />
          <Button className="w-full" onClick={handleEdit}>Save Changes</Button>
        </div>
      </Modal>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="New Policy" size="sm">
        <div className="space-y-4">
          <Input label="Policy Name" placeholder="e.g. Standard Overtime" value={newName} onChange={e => setNewName(e.target.value)} />
          <Button className="w-full" onClick={handleCreate}>Create Policy</Button>
        </div>
      </Modal>
    </div>
  );
}
