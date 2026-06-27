'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ClipboardCheck, Star, Target, TrendingUp, Plus, FileText,
  MessageSquare, ChevronRight, Calendar, Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';
import type { PerformanceCycle } from '@/types';

export default function PerformanceDashboard() {
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', type: 'quarterly', startDate: '', endDate: '', reviewStyle: 'manager_only' });

  const fetchCycles = async () => {
    try {
      const res = await fetch('/api/performance/cycles');
      if (res.ok) setCycles(await res.json());
    } catch { /* */ } finally { setLoading(false); }
  };

  useEffect(() => { fetchCycles(); }, []);

  const handleCreate = async () => {
    const res = await fetch('/api/performance/cycles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, companyId: 'company-1' }),
    });
    if (res.ok) {
      setShowCreate(false);
      setForm({ name: '', type: 'quarterly', startDate: '', endDate: '', reviewStyle: 'manager_only' });
      fetchCycles();
    }
  };

  const activeCycle = cycles.find(c => c.status === 'active');
  const draftCycles = cycles.filter(c => c.status === 'draft');
  const closedCycles = cycles.filter(c => c.status === 'closed');

  const statCards = [
    { label: 'Active Cycles', value: cycles.filter(c => c.status === 'active').length, icon: Layers, color: 'text-blue-600 bg-blue-100' },
    { label: 'Reviews Due', value: 0, icon: ClipboardCheck, color: 'text-orange-600 bg-orange-100' },
    { label: 'Goals Set', value: 0, icon: Target, color: 'text-green-600 bg-green-100' },
    { label: 'Avg Rating', value: '—', icon: Star, color: 'text-yellow-600 bg-yellow-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Performance</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage review cycles, goals and feedback</p>
        </div>
        <Button onClick={() => setShowCreate(true)} leftIcon={<Plus className="h-4 w-4" />}>
          New Cycle
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(s => (
          <Card key={s.label}>
            <CardContent className="flex items-center gap-4 px-6 py-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500">{s.label}</p>
                <p className="text-2xl font-bold text-gray-900">{s.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {activeCycle && (
            <Link href={`/performance/cycles/${activeCycle.id}`}>
              <Card className="cursor-pointer transition-all hover:shadow-md border-blue-200 dark:border-blue-800">
                <CardContent className="px-6 py-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                      <Layers className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="text-sm text-blue-600 font-medium">Active Cycle</p>
                      <p className="text-lg font-semibold text-gray-900">{activeCycle.name}</p>
                      <p className="text-xs text-gray-500">
                        {formatDate(activeCycle.startDate)} — {formatDate(activeCycle.endDate)}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-gray-300" />
                </CardContent>
              </Card>
            </Link>
          )}

          <Card>
            <CardHeader>
              <CardTitle>All Cycles</CardTitle>
              <Link href="/performance/cycles">
                <Button variant="ghost" size="sm" rightIcon={<ChevronRight className="h-4 w-4" />}>View All</Button>
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {cycles.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <Calendar className="mx-auto h-12 w-12 text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">No cycles yet. Create your first review cycle.</p>
                </div>
              ) : (
                <div className="divide-y dark:divide-gray-800">
                  {cycles.slice(0, 5).map(cycle => (
                    <Link key={cycle.id} href={`/performance/cycles/${cycle.id}`}
                      className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{cycle.name}</p>
                        <p className="text-xs text-gray-500">
                          {cycle.type.replace('_', ' ')} · {formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        cycle.status === 'active' ? 'bg-green-100 text-green-700' :
                        cycle.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {cycle.status}
                      </span>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-3">
                <Link href="/performance/cycles">
                  <Card className="cursor-pointer transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-4 px-6 py-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
                        <FileText className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Review Cycles</p>
                        <p className="text-xs text-gray-500">Manage performance cycles</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/performance/goals">
                  <Card className="cursor-pointer transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-4 px-6 py-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600">
                        <Target className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Set Goals</p>
                        <p className="text-xs text-gray-500">Define OKRs and KPIs</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                <Link href="/performance/reviews">
                  <Card className="cursor-pointer transition-shadow hover:shadow-md">
                    <CardContent className="flex items-center gap-4 px-6 py-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600">
                        <MessageSquare className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Reviews</p>
                        <p className="text-xs text-gray-500">View all performance reviews</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Review Cycle" size="md">
        <div className="space-y-4">
          <Input label="Cycle Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Q3 2026" />
          <Select label="Type" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
            options={[
              { value: 'quarterly', label: 'Quarterly' },
              { value: 'semi_annual', label: 'Semi-Annual' },
              { value: 'annual', label: 'Annual' },
            ]}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
            <Input label="End Date" type="date" value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
          </div>
          <Select label="Review Style" value={form.reviewStyle} onChange={e => setForm(f => ({ ...f, reviewStyle: e.target.value }))}
            options={[
              { value: 'manager_only', label: 'Manager Only' },
              { value: '360', label: '360° Feedback' },
              { value: 'okr', label: 'OKR Based' },
              { value: 'all', label: 'All Components' },
            ]}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!form.name || !form.startDate || !form.endDate}>Create</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
