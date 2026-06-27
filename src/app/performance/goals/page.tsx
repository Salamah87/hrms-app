'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Target, Plus, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import type { Goal, PerformanceCycle } from '@/types';

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCycle, setSelectedCycle] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', targetValue: '', unit: '', cycleId: '', dueDate: '' });

  useEffect(() => {
    Promise.all([
      fetch('/api/performance/goals').then(r => r.json()),
      fetch('/api/performance/cycles').then(r => r.json()),
    ]).then(([g, c]) => {
      setGoals(g);
      setCycles(c);
      if (c.length > 0) setSelectedCycle(c[0].id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const fetchGoals = async (cycleId?: string) => {
    const url = cycleId ? `/api/performance/goals?cycleId=${cycleId}` : '/api/performance/goals';
    const res = await fetch(url);
    if (res.ok) setGoals(await res.json());
  };

  const handleAdd = async () => {
    const res = await fetch('/api/performance/goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cycleId: form.cycleId || cycles[0]?.id,
        employeeId: 'emp-1',
        title: form.title,
        description: form.description,
        type: 'objective',
        targetValue: form.targetValue ? Number(form.targetValue) : undefined,
        unit: form.unit,
        dueDate: form.dueDate || undefined,
      }),
    });
    if (res.ok) {
      setShowModal(false);
      setForm({ title: '', description: '', targetValue: '', unit: '', cycleId: '', dueDate: '' });
      fetchGoals(selectedCycle);
    }
  };

  const updateProgress = async (goalId: string, currentValue: number) => {
    const res = await fetch(`/api/performance/goals/${goalId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentValue }),
    });
    if (res.ok) fetchGoals(selectedCycle);
  };

  const filteredGoals = selectedCycle ? goals.filter(g => g.cycleId === selectedCycle) : goals;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Goals & OKRs</h1>
          <p className="mt-1 text-sm text-gray-500">Define and track performance objectives</p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={selectedCycle}
            onChange={e => { setSelectedCycle(e.target.value); fetchGoals(e.target.value); }}
            options={cycles.map(c => ({ value: c.id, label: c.name }))}
            className="w-48"
            placeholder="Select cycle"
          />
          <Button onClick={() => setShowModal(true)} leftIcon={<Plus className="h-4 w-4" />}>
            Add Objective
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : filteredGoals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No goals defined</p>
            <p className="text-xs text-gray-400 mt-1">Create your first objective to track progress</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={() => setShowModal(true)}>
              <Plus className="h-4 w-4 mr-1" /> Add Objective
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredGoals.map(goal => (
            <Card key={goal.id}>
              <CardContent className="px-6 py-5">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      <p className="font-semibold text-gray-900">{goal.title}</p>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        goal.status === 'on_track' ? 'bg-green-100 text-green-700' :
                        goal.status === 'at_risk' ? 'bg-yellow-100 text-yellow-700' :
                        goal.status === 'behind' ? 'bg-red-100 text-red-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>{goal.status.replace('_', ' ')}</span>
                    </div>
                    {goal.description && <p className="text-sm text-gray-500 mt-1">{goal.description}</p>}
                    {goal.targetValue && (
                      <div className="mt-3 max-w-md">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>Progress</span>
                          <span>{goal.currentValue}/{goal.targetValue}{goal.unit ? ` ${goal.unit}` : ''}</span>
                        </div>
                        <div className="bg-gray-200 rounded-full h-2.5">
                          <div className="bg-blue-500 h-2.5 rounded-full transition-all" style={{ width: `${Math.min((goal.currentValue / goal.targetValue) * 100, 100)}%` }} />
                        </div>
                        <div className="flex items-center gap-2 mt-2">
                          <input
                            type="number"
                            className="w-20 px-2 py-1 text-xs border rounded dark:bg-gray-800 dark:border-gray-700"
                            placeholder="Update"
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                const val = parseFloat((e.target as HTMLInputElement).value);
                                if (!isNaN(val)) updateProgress(goal.id, val);
                              }
                            }}
                          />
                          <span className="text-xs text-gray-400">Enter value + press Enter</span>
                        </div>
                      </div>
                    )}
                    {goal.children && goal.children.length > 0 && (
                      <div className="mt-3 ml-5 space-y-1.5 border-l-2 border-blue-200 pl-4">
                        {goal.children.map(kr => (
                          <div key={kr.id} className="flex items-center justify-between text-sm">
                            <span className="text-gray-700">{kr.title}</span>
                            {kr.targetValue && (
                              <span className="text-xs text-gray-500">{kr.currentValue}/{kr.targetValue}{kr.unit}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  {goal.dueDate && <span className="text-xs text-gray-400 whitespace-nowrap ml-4">Due {formatDate(goal.dueDate)}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Objective" size="md">
        <div className="space-y-4">
          <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Improve feature delivery speed" />
          <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Describe the objective" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Target Value" type="number" value={form.targetValue} onChange={e => setForm(f => ({ ...f, targetValue: e.target.value }))} placeholder="e.g. 100" />
            <Input label="Unit" value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} placeholder="e.g. %" />
          </div>
          <Input label="Due Date" type="date" value={form.dueDate} onChange={e => setForm(f => ({ ...f, dueDate: e.target.value }))} />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleAdd} disabled={!form.title}>Add</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
