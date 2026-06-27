'use client';

import { useState, useMemo } from 'react';
import { Plus, Pencil, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/loading';

const shiftTypes = [
  { value: 'fixed', label: 'Fixed' },
  { value: 'flexible', label: 'Flexible' },
  { value: 'rotational', label: 'Rotational' },
  { value: 'night', label: 'Night' },
];

const mockShifts = [
  { id: 'shift-1', name: 'Morning Shift', type: 'fixed', startTime: '07:00', endTime: '15:00', gracePeriod: 15, lateThreshold: 30, assignedCount: 5 },
  { id: 'shift-2', name: 'Afternoon Shift', type: 'fixed', startTime: '15:00', endTime: '23:00', gracePeriod: 10, lateThreshold: 30, assignedCount: 3 },
  { id: 'shift-3', name: 'Night Shift', type: 'night', startTime: '23:00', endTime: '07:00', gracePeriod: 20, lateThreshold: 30, assignedCount: 1 },
  { id: 'shift-4', name: 'Flexi Hours', type: 'flexible', startTime: '07:00', endTime: '18:00', gracePeriod: 30, lateThreshold: 60, assignedCount: 2 },
  { id: 'shift-5', name: 'Rotating A', type: 'rotational', startTime: '06:00', endTime: '14:00', gracePeriod: 10, lateThreshold: 30, assignedCount: 0 },
  { id: 'shift-6', name: 'Rotating B', type: 'rotational', startTime: '14:00', endTime: '22:00', gracePeriod: 10, lateThreshold: 30, assignedCount: 1 },
];

const mockEmployees = [
  { value: 'emp-1', label: 'Ahmad Khaled' },
  { value: 'emp-2', label: 'Sarah Johnson' },
  { value: 'emp-3', label: 'Michael Brown' },
  { value: 'emp-4', label: 'Nora Hassan' },
  { value: 'emp-5', label: 'Robert Wilson' },
  { value: 'emp-6', label: 'Jennifer Lee' },
  { value: 'emp-8', label: 'Lisa Anderson' },
  { value: 'emp-9', label: 'James Taylor' },
  { value: 'emp-10', label: 'Maria Garcia' },
  { value: 'emp-11', label: 'William Thomas' },
  { value: 'emp-12', label: 'Amanda White' },
  { value: 'emp-4b', label: 'Emily Davis' },
];

export default function ShiftsPage() {
  const [isLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [editingShift, setEditingShift] = useState<typeof mockShifts[0] | null>(null);

  const [formData, setFormData] = useState({
    name: '', type: 'fixed', startTime: '08:00', endTime: '17:00',
    gracePeriod: '15', lateThreshold: '30',
  });
  const [assignData, setAssignData] = useState({
    employeeId: '', shiftId: '', startDate: '', endDate: '',
  });

  const openEdit = (shift: typeof mockShifts[0]) => {
    setEditingShift(shift);
    setFormData({
      name: shift.name, type: shift.type, startTime: shift.startTime, endTime: shift.endTime,
      gracePeriod: String(shift.gracePeriod), lateThreshold: String(shift.lateThreshold),
    });
    setShowCreateModal(true);
  };

  const handleSave = () => {
    console.log('Save shift', formData);
    setShowCreateModal(false);
    setEditingShift(null);
  };

  const handleAssign = () => {
    console.log('Assign shift', assignData);
    setShowAssignModal(false);
    setAssignData({ employeeId: '', shiftId: '', startDate: '', endDate: '' });
  };

  const typeBadge: Record<string, 'primary' | 'warning' | 'info' | 'default'> = {
    fixed: 'primary', flexible: 'warning', rotational: 'info', night: 'default',
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure and assign work shifts</p>
        </div>
        <TableSkeleton rows={6} columns={7} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Shift Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure and assign work shifts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAssignModal(true)} leftIcon={<Users className="h-4 w-4" />}>
            Assign Shift
          </Button>
          <Button onClick={() => { setEditingShift(null); setFormData({ name: '', type: 'fixed', startTime: '08:00', endTime: '17:00', gracePeriod: '15', lateThreshold: '30' }); setShowCreateModal(true); }} leftIcon={<Plus className="h-4 w-4" />}>
            Create Shift
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Shifts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'name', header: 'Name', sortable: true },
              {
                key: 'type', header: 'Type',
                render: (item: any) => <Badge variant={typeBadge[item.type]}>{item.type}</Badge>,
              },
              {
                key: 'startTime', header: 'Start Time',
                render: (item: any) => <span className="font-mono text-sm">{item.startTime}</span>,
              },
              {
                key: 'endTime', header: 'End Time',
                render: (item: any) => <span className="font-mono text-sm">{item.endTime}</span>,
              },
              { key: 'gracePeriod', header: 'Grace (min)' },
              { key: 'lateThreshold', header: 'Late Threshold' },
              {
                key: 'assignedCount', header: 'Assigned',
                render: (item: any) => <Badge variant="primary">{item.assignedCount}</Badge>,
              },
              {
                key: 'actions', header: '', className: 'w-16',
                render: (item: any) => (
                  <Button variant="ghost" size="sm" onClick={() => openEdit(item)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                ),
              },
            ]}
            data={mockShifts as any[]}
            keyExtractor={(item) => item.id as string}
            emptyState={
              <EmptyState icon={Clock} title="No shifts defined" description="Create your first shift to get started"
                action={{ label: 'Create Shift', onClick: () => setShowCreateModal(true) }} />
            }
          />
        </CardContent>
      </Card>

      <Modal
        isOpen={showCreateModal}
        onClose={() => { setShowCreateModal(false); setEditingShift(null); }}
        title={editingShift ? 'Edit Shift' : 'Create Shift'}
        size="md"
      >
        <div className="space-y-4">
          <Input label="Shift Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
          <Select label="Shift Type" options={shiftTypes} value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" type="time" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
            <Input label="End Time" type="time" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Grace Period (min)" type="number" value={formData.gracePeriod} onChange={(e) => setFormData({ ...formData, gracePeriod: e.target.value })} />
            <Input label="Late Threshold (min)" type="number" value={formData.lateThreshold} onChange={(e) => setFormData({ ...formData, lateThreshold: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => { setShowCreateModal(false); setEditingShift(null); }}>Cancel</Button>
            <Button onClick={handleSave}>{editingShift ? 'Update' : 'Create'}</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showAssignModal} onClose={() => setShowAssignModal(false)} title="Assign Shift" size="md">
        <div className="space-y-4">
          <Select label="Employee" options={mockEmployees} value={assignData.employeeId}
            onChange={(e) => setAssignData({ ...assignData, employeeId: e.target.value })} placeholder="Select employee" />
          <Select label="Shift" options={mockShifts.map((s) => ({ value: s.id, label: s.name }))} value={assignData.shiftId}
            onChange={(e) => setAssignData({ ...assignData, shiftId: e.target.value })} placeholder="Select shift" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={assignData.startDate} onChange={(e) => setAssignData({ ...assignData, startDate: e.target.value })} />
            <Input label="End Date" type="date" value={assignData.endDate} onChange={(e) => setAssignData({ ...assignData, endDate: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button onClick={handleAssign}>Assign</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

