'use client';

import { useState } from 'react';
import {
  GitBranch,
  Plus,
  Play,
  Pause,
  GripVertical,
  Settings,
  ChevronDown,
  ChevronRight,
  Layers,
  Activity,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs } from '@/components/ui/tabs';
import { CardSkeleton } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { cn } from '@/lib/utils';

interface WorkflowStep {
  id: string;
  name: string;
  assignee: string;
  type: 'approval' | 'notification' | 'task' | 'condition';
}

const mockDefinitions = [
  { id: 'w1', name: 'Leave Approval', entityType: 'Leave Request', steps: 3, active: true },
  { id: 'w2', name: 'Expense Reimbursement', entityType: 'Expense', steps: 4, active: true },
  { id: 'w3', name: 'Purchase Order', entityType: 'PO', steps: 5, active: false },
  { id: 'w4', name: 'Travel Request', entityType: 'Travel', steps: 3, active: true },
  { id: 'w5', name: 'Overtime Approval', entityType: 'Overtime', steps: 2, active: true },
];

const mockSteps: Record<string, WorkflowStep[]> = {
  w1: [
    { id: 's1', name: 'Manager Approval', assignee: 'Department Manager', type: 'approval' },
    { id: 's2', name: 'HR Review', assignee: 'HR Manager', type: 'approval' },
    { id: 's3', name: 'Notify Employee', assignee: 'System', type: 'notification' },
  ],
  w2: [
    { id: 's4', name: 'Submit Expense Report', assignee: 'Employee', type: 'task' },
    { id: 's5', name: 'Manager Review', assignee: 'Department Manager', type: 'approval' },
    { id: 's6', name: 'Finance Check', assignee: 'Finance Manager', type: 'approval' },
    { id: 's7', name: 'Process Payment', assignee: 'Payroll', type: 'task' },
  ],
};

const mockInstances = [
  { id: 'i1', workflow: 'Leave Approval', entity: 'Annual Leave - Ahmad Khaled', status: 'in_progress' as const, startedAt: '2026-06-28', currentStep: 'Manager Approval' },
  { id: 'i2', workflow: 'Expense Reimbursement', entity: 'Travel Expenses - Sarah Johnson', status: 'pending' as const, startedAt: '2026-06-27', currentStep: 'Finance Check' },
  { id: 'i3', workflow: 'Leave Approval', entity: 'Sick Leave - Michael Brown', status: 'completed' as const, startedAt: '2026-06-25', currentStep: 'Completed' },
  { id: 'i4', workflow: 'Travel Request', entity: 'Dubai Trip - Nora Hassan', status: 'in_progress' as const, startedAt: '2026-06-30', currentStep: 'Manager Approval' },
];

const statusBadge: Record<string, 'success' | 'warning' | 'info' | 'default'> = {
  completed: 'success',
  in_progress: 'info',
  pending: 'warning',
  cancelled: 'default',
};

const stepTypeIcons: Record<string, string> = {
  approval: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400',
  notification: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400',
  task: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400',
  condition: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400',
};

const entityTypes = [
  { value: '', label: 'Select entity type...' },
  { value: 'leave', label: 'Leave Request' },
  { value: 'expense', label: 'Expense' },
  { value: 'travel', label: 'Travel Request' },
  { value: 'po', label: 'Purchase Order' },
  { value: 'overtime', label: 'Overtime' },
];

export default function WorkflowPage() {
  const [isLoading] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedDef, setExpandedDef] = useState<string | null>(null);
  const [newDefName, setNewDefName] = useState('');
  const [newDefEntity, setNewDefEntity] = useState('');
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const currentSteps = expandedDef ? mockSteps[expandedDef] || [] : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workflow</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Design and manage approval workflows</p>
        </div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Workflow</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Design and manage approval workflows</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4" />
          Create Definition
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Workflow Definitions</CardTitle>
            <Badge variant="primary">{mockDefinitions.length} Definitions</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table
              columns={[
                { key: 'name', header: 'Name', sortable: true },
                { key: 'entityType', header: 'Entity Type' },
                {
                  key: 'steps', header: 'Steps',
                  render: (item: any) => (
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.steps} steps</span>
                  ),
                },
                {
                  key: 'active', header: 'Active',
                  render: (item: any) => (
                    <Badge variant={item.active ? 'success' : 'default'}>{item.active ? 'Active' : 'Inactive'}</Badge>
                  ),
                },
                {
                  key: 'actions', header: '',
                  render: (item: any) => (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => { e.stopPropagation(); setExpandedDef(expandedDef === item.id ? null : item.id as string); }}
                      leftIcon={expandedDef === item.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    >
                      Steps
                    </Button>
                  ),
                },
              ]}
              data={mockDefinitions as any[]}
              keyExtractor={(item) => item.id as string}
              sortable
              emptyState={
                <EmptyState icon={GitBranch} title="No definitions" description="Create your first workflow definition" action={{ label: 'Create Definition', onClick: () => setShowCreateModal(true) }} />
              }
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Instances</CardTitle>
            <Badge variant="primary">{mockInstances.length}</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table
              columns={[
                { key: 'workflow', header: 'Workflow', className: 'text-xs' },
                {
                  key: 'status', header: 'Status',
                  render: (item: any) => (
                    <Badge variant={statusBadge[item.status as string]} size="sm">{(item.status as string).replace('_', ' ')}</Badge>
                  ),
                },
              ]}
              data={mockInstances as any[]}
              keyExtractor={(item) => item.id as string}
              emptyState={
                <EmptyState icon={Activity} title="No instances" description="Active workflow instances will appear here" />
              }
            />
          </CardContent>
        </Card>
      </div>

      {expandedDef && (
        <Card>
          <CardHeader>
            <CardTitle>Steps: {mockDefinitions.find((d) => d.id === expandedDef)?.name}</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="info">{currentSteps.length} steps</Badge>
              <Button variant="outline" size="sm" leftIcon={<Plus className="h-4 w-4" />}>Add Step</Button>
            </div>
          </CardHeader>
          <CardContent>
            {currentSteps.length === 0 ? (
              <div className="py-8 text-center text-sm text-gray-400">No steps defined. Add steps to this workflow.</div>
            ) : (
              <div className="space-y-3">
                {currentSteps.map((step, index) => (
                  <div
                    key={step.id}
                    className={cn(
                      'flex items-center gap-4 rounded-lg border bg-white p-4 transition-shadow dark:border-gray-700 dark:bg-gray-900',
                      dragIndex === index && 'shadow-md ring-2 ring-blue-200 dark:ring-blue-800',
                    )}
                    draggable
                    onDragStart={() => setDragIndex(index)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => { setDragIndex(null); }}
                  >
                    <div className="cursor-grab text-gray-400 hover:text-gray-600">
                      <GripVertical className="h-5 w-5" />
                    </div>
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${stepTypeIcons[step.type]}`}>
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{step.name}</p>
                      <p className="text-xs text-gray-500">{step.assignee}</p>
                    </div>
                    <Badge variant="default" size="sm">{step.type}</Badge>
                    <Button variant="ghost" size="sm"><Settings className="h-4 w-4" /></Button>
                  </div>
                ))}
                <div className="flex items-center justify-center py-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600">
                    <Plus className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create Workflow Definition" size="md">
        <div className="space-y-4">
          <Input label="Workflow Name" value={newDefName} onChange={(e) => setNewDefName(e.target.value)} placeholder="e.g. Leave Approval" />
          <Select label="Entity Type" options={entityTypes} value={newDefEntity} onChange={(e) => setNewDefEntity(e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Initial Steps</label>
            <div className="mt-2 space-y-2">
              {['Manager Approval', 'HR Review', 'Notify Employee'].map((s) => (
                <label key={s} className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{s}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button disabled={!newDefName || !newDefEntity}>Create Definition</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

