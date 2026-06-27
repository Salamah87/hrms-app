'use client';

import { useState, useEffect } from 'react';
import { Star, Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { Competency } from '@/types';

const CATEGORIES = ['Behavioural', 'Leadership', 'Cognitive', 'Technical', 'Performance'];

export default function CompetenciesPage() {
  const [competencies, setCompetencies] = useState<Competency[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', description: '', category: 'Behavioural' });

  const fetchData = async () => {
    const res = await fetch('/api/performance/competencies');
    if (res.ok) setCompetencies(await res.json());
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    let updated: Competency[];
    if (editingId) {
      updated = competencies.map(c =>
        c.id === editingId ? { ...c, ...form, isActive: true } : c
      );
    } else {
      const newComp: Competency = {
        id: `comp-${Date.now()}`,
        ...form,
        isActive: true,
        createdAt: new Date().toISOString(),
      };
      updated = [...competencies, newComp];
    }
    const res = await fetch('/api/performance/competencies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      setCompetencies(await res.json());
      setShowModal(false);
      setEditingId(null);
      setForm({ name: '', description: '', category: 'Behavioural' });
    }
  };

  const handleToggle = async (id: string) => {
    const updated = competencies.map(c =>
      c.id === id ? { ...c, isActive: !c.isActive } : c
    );
    const res = await fetch('/api/performance/competencies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (res.ok) setCompetencies(await res.json());
  };

  const handleDelete = async (id: string) => {
    const updated = competencies.filter(c => c.id !== id);
    const res = await fetch('/api/performance/competencies', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    if (res.ok) setCompetencies(await res.json());
  };

  const activeComps = competencies.filter(c => c.isActive);
  const inactiveComps = competencies.filter(c => !c.isActive);

  if (loading) return (
    <div className="flex justify-center py-12">
      <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Competencies</h1>
          <p className="mt-1 text-sm text-gray-500">Define competencies for performance evaluation</p>
        </div>
        <Button onClick={() => { setEditingId(null); setForm({ name: '', description: '', category: 'Behavioural' }); setShowModal(true); }} leftIcon={<Plus className="h-4 w-4" />}>
          Add Competency
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Competencies ({activeComps.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {activeComps.length === 0 ? (
            <div className="text-center py-8 text-sm text-gray-400">No competencies defined</div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {activeComps.map(comp => (
                <div key={comp.id} className="flex items-start justify-between border rounded-lg p-4 dark:border-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 text-blue-600 mt-0.5">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{comp.name}</p>
                      {comp.description && <p className="text-xs text-gray-500 mt-0.5">{comp.description}</p>}
                      <Badge variant="primary" size="sm" className="mt-1.5">{comp.category}</Badge>
                    </div>
                  </div>
                  <div className="flex gap-1 ml-3 shrink-0">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditingId(comp.id);
                      setForm({ name: comp.name, description: comp.description || '', category: comp.category || 'Behavioural' });
                      setShowModal(true);
                    }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleToggle(comp.id)}>
                      <X className="h-3.5 w-3.5 text-gray-400" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(comp.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-red-400" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {inactiveComps.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inactive ({inactiveComps.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {inactiveComps.map(comp => (
                <div key={comp.id} className="flex items-center justify-between border rounded-lg p-4 opacity-60 dark:border-gray-700">
                  <div className="flex items-center gap-3">
                    <Star className="h-4 w-4 text-gray-300" />
                    <div>
                      <p className="font-medium text-gray-500">{comp.name}</p>
                      <Badge variant="default" size="sm">{comp.category}</Badge>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleToggle(comp.id)}>
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? 'Edit Competency' : 'Add Competency'} size="md">
        <div className="space-y-4">
          <Input label="Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Problem Solving" />
          <Input label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description" />
          <Select label="Category" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            options={CATEGORIES.map(c => ({ value: c, label: c }))}
          />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name}>{editingId ? 'Save' : 'Add'}</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
