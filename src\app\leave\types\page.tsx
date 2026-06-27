'use client';

import { useState, useEffect, useMemo } from 'react';
import { Pencil, ToggleLeft, ToggleRight, Settings, Save, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/loading';
import toast from 'react-hot-toast';

interface LeaveType {
  id: string;
  code: string;
  name: string;
  paid: boolean;
  daysPerYear: number;
  maxConsecutive: number;
  accrual: boolean;
  carryForward: number;
  encashable: boolean;
  active: boolean;
}

export default function LeaveTypesPage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingType, setEditingType] = useState<LeaveType | null>(null);
  const [formData, setFormData] = useState({
    name: '', paid: true, daysPerYear: '0', maxConsecutive: '0',
    accrual: false, carryForward: '0', encashable: false,
  });

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leave/types');
      if (res.ok) setLeaveTypes(await res.json());
    } catch { toast.error('Failed to load leave types'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTypes(); }, []);

  const openEdit = (lt: LeaveType) => {
    setEditingType(lt);
    setFormData({
      name: lt.name, paid: lt.paid, daysPerYear: String(lt.daysPerYear),
      maxConsecutive: String(lt.maxConsecutive), accrual: lt.accrual,
      carryForward: String(lt.carryForward), encashable: lt.encashable,
    });
    setShowEditModal(true);
  };

  const handleSave = async () => {
    if (!editingType) return;
    const updated = leaveTypes.map((t) =>
      t.id === editingType.id ? {
        ...t,
        name: formData.name,
        paid: formData.paid,
        daysPerYear: parseInt(formData.daysPerYear) || 0,
        maxConsecutive: parseInt(formData.maxConsecutive) || 0,
        accrual: formData.accrual,
        carryForward: parseInt(formData.carryForward) || 0,
        encashable: formData.encashable,
      } : t
    );
    try {
      const res = await fetch('/api/leave/types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      setLeaveTypes(updated);
      toast.success('Leave type updated');
      setShowEditModal(false);
      setEditingType(null);
    } catch { toast.error('Failed to save'); }
  };

  const toggleActive = async (id: string) => {
    const updated = leaveTypes.map((t) => t.id === id ? { ...t, active: !t.active } : t);
    try {
      const res = await fetch('/api/leave/types', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error();
      setLeaveTypes(updated);
      toast.success('Status toggled');
    } catch { toast.error('Failed to toggle'); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Types</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure leave type policies</p></div>
        <TableSkeleton rows={7} columns={8} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Types</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure leave type policies and entitlements</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Leave Type Configuration</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'name', header: 'Name', sortable: true },
              { key: 'paid', header: 'Paid', render: (item: any) => item.paid ? <Badge variant="success" size="sm">Paid</Badge> : <Badge variant="danger" size="sm">Unpaid</Badge> },
              { key: 'daysPerYear', header: 'Days/Year' },
              { key: 'maxConsecutive', header: 'Max Consec.' },
              { key: 'accrual', header: 'Accrual', render: (item: any) => item.accrual ? <Badge variant="primary" size="sm">Yes</Badge> : <span className="text-sm text-gray-400">—</span> },
              { key: 'carryForward', header: 'Carry Fwd.', render: (item: any) => item.carryForward > 0 ? <span className="text-sm text-gray-700 dark:text-gray-300">{item.carryForward} days</span> : <span className="text-sm text-gray-400">—</span> },
              { key: 'encashable', header: 'Encash.', render: (item: any) => item.encashable ? <Badge variant="success" size="sm">Yes</Badge> : <span className="text-sm text-gray-400">—</span> },
              { key: 'active', header: 'Status', render: (item: any) => item.active ? <Badge variant="success" size="sm">Active</Badge> : <Badge variant="default" size="sm">Inactive</Badge> },
              {
                key: 'actions', header: '', className: 'w-20',
                render: (item: any) => (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => toggleActive(item.id)}>
                      {item.active ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                    </Button>
                  </div>
                ),
              },
            ]}
            data={leaveTypes as any[]}
            keyExtractor={(item: any) => item.id}
            sortable
            emptyState={<EmptyState icon={Settings} title="No leave types configured" description="Add leave types to get started" />}
          />
        </CardContent>
      </Card>

      <Card className="border-green-200 dark:border-green-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Carry-Over Rules</CardTitle>
            <Button variant="outline" onClick={async () => {
              try {
                const res = await fetch('/api/leave/carry-over', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ year: new Date().getFullYear() }),
                });
                if (!res.ok) throw new Error();
                const data = await res.json();
                toast.success(`Carry-over processed: ${data.processed} entries created`);
              } catch { toast.error('Carry-over processing failed'); }
            }}>
              <RefreshCw className="h-4 w-4" /> Process Carry-Over
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {leaveTypes.filter((t) => t.carryForward > 0 && t.active).map((t) => (
              <div key={t.id} className="flex items-center justify-between rounded-lg border px-4 py-3 dark:border-gray-700">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{t.name}</p>
                  <p className="text-xs text-gray-500">Max {t.carryForward} days carry-over, expires after 12 months</p>
                </div>
                <Badge variant="info">Active</Badge>
              </div>
            ))}
            {leaveTypes.filter((t) => t.carryForward > 0 && t.active).length === 0 && (
              <p className="text-sm text-gray-400">No carry-over rules active. Enable carry-forward on leave types above.</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); setEditingType(null); }}
        title={editingType ? `Edit ${editingType.name}` : 'Edit Leave Type'} size="md">
        <div className="space-y-4">
          <Input label="Leave Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Days Per Year" type="number" value={formData.daysPerYear} onChange={(e) => setFormData({ ...formData, daysPerYear: e.target.value })} />
            <Input label="Max Consecutive Days" type="number" value={formData.maxConsecutive} onChange={(e) => setFormData({ ...formData, maxConsecutive: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Carry Forward (days)" type="number" value={formData.carryForward} onChange={(e) => setFormData({ ...formData, carryForward: e.target.value })} />
          </div>
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.paid} onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Paid Leave</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.accrual} onChange={(e) => setFormData({ ...formData, accrual: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Enable Accrual</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.encashable} onChange={(e) => setFormData({ ...formData, encashable: e.target.checked })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">Encashable</span>
            </label>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => { setShowEditModal(false); setEditingType(null); }}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
