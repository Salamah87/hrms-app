'use client';

import { useState } from 'react';
import {
  UserPlus,
  ClipboardCheck,
  Clock,
  Plus,
  Play,
  Users,
  FileText,
  CalendarDays,
  CheckCircle2,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CardSkeleton } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';

const statCards = [
  { label: 'Active Onboardings', value: 14, icon: UserPlus, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400' },
  { label: 'Completed This Month', value: 8, icon: CheckCircle2, color: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400' },
  { label: 'Pending Tasks', value: 23, icon: ClipboardCheck, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400' },
  { label: 'Avg. Completion Time', value: '12 days', icon: Clock, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400' },
];

const mockTemplates = [
  { id: 't1', name: 'Standard Employee Onboarding', tasks: 14, department: 'All', duration: '14 days' },
  { id: 't2', name: 'IT Setup Checklist', tasks: 8, department: 'IT', duration: '5 days' },
  { id: 't3', name: 'Contractor Onboarding', tasks: 6, department: 'HR', duration: '7 days' },
  { id: 't4', name: 'Executive Onboarding', tasks: 18, department: 'Executive', duration: '21 days' },
];

const mockTasks = [
  { id: 'ts1', employee: 'Ahmad Khaled', task: 'IT Equipment Setup', assignedTo: 'IT Support', dueDate: '2026-07-05', status: 'in_progress' as const },
  { id: 'ts2', employee: 'Sarah Johnson', task: 'HR Orientation', assignedTo: 'HR Officer', dueDate: '2026-07-08', status: 'pending' as const },
  { id: 'ts3', employee: 'Michael Brown', task: 'Email & Accounts', assignedTo: 'IT Support', dueDate: '2026-07-03', status: 'completed' as const },
  { id: 'ts4', employee: 'Nora Hassan', task: 'Benefits Enrollment', assignedTo: 'HR Officer', dueDate: '2026-07-12', status: 'pending' as const },
  { id: 'ts5', employee: 'Robert Wilson', task: 'Desk Assignment', assignedTo: 'Facilities', dueDate: '2026-07-01', status: 'completed' as const },
  { id: 'ts6', employee: 'Jennifer Lee', task: 'ID Badge Creation', assignedTo: 'Security', dueDate: '2026-07-10', status: 'in_progress' as const },
  { id: 'ts7', employee: 'James Taylor', task: 'Payroll Setup', assignedTo: 'Payroll', dueDate: '2026-07-15', status: 'pending' as const },
];

const statusBadge: Record<string, 'success' | 'warning' | 'info' | 'default' | 'danger'> = {
  completed: 'success',
  in_progress: 'info',
  pending: 'warning',
  overdue: 'danger',
};

const employees = [
  { value: 'emp-1', label: 'Ahmad Khaled' },
  { value: 'emp-2', label: 'Sarah Johnson' },
  { value: 'emp-3', label: 'Michael Brown' },
  { value: 'emp-4', label: 'Nora Hassan' },
];

const templateOptions = [
  { value: '', label: 'Select template...' },
  ...mockTemplates.map((t) => ({ value: t.id, label: t.name })),
];

export default function OnboardingPage() {
  const [isLoading] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showStartModal, setShowStartModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Onboarding</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage employee onboarding and checklists</p>
        </div>
        <CardSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Onboarding</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage employee onboarding and checklists</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowTemplateModal(true)}>
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
          <Button onClick={() => setShowStartModal(true)}>
            <Play className="h-4 w-4" />
            Start Onboarding
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 px-6 py-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Active Onboarding Tasks</CardTitle>
            <Badge variant="primary">{mockTasks.length} Tasks</Badge>
          </CardHeader>
          <CardContent className="p-0">
            <Table
              columns={[
                { key: 'employee', header: 'Employee', sortable: true },
                { key: 'task', header: 'Task', sortable: true },
                { key: 'assignedTo', header: 'Assigned To' },
                {
                  key: 'dueDate', header: 'Due Date', sortable: true,
                  render: (item: any) => (
                    <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(item.dueDate as string)}</span>
                  ),
                },
                {
                  key: 'status', header: 'Status',
                  render: (item: any) => (
                    <Badge variant={statusBadge[item.status as string]}>
                      {(item.status as string).replace('_', ' ')}
                    </Badge>
                  ),
                },
              ]}
              data={mockTasks as any[]}
              keyExtractor={(item) => item.id as string}
              sortable
              emptyState={
                <EmptyState icon={ClipboardCheck} title="No tasks" description="Onboarding tasks will appear here" />
              }
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Templates</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowTemplateModal(true)}>
                <Plus className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockTemplates.length === 0 ? (
                <p className="py-6 text-center text-sm text-gray-400">No templates yet</p>
              ) : (
                mockTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="flex items-center justify-between rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{tpl.name}</p>
                      <p className="text-xs text-gray-500">{tpl.tasks} tasks · {tpl.duration}</p>
                    </div>
                    <Badge variant="default" size="sm">{tpl.department}</Badge>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Modal isOpen={showTemplateModal} onClose={() => setShowTemplateModal(false)} title="Create Onboarding Template" size="md">
        <div className="space-y-4">
          <Input label="Template Name" value={newTemplateName} onChange={(e) => setNewTemplateName(e.target.value)} placeholder="e.g. Standard Employee Onboarding" />
          <Select label="Department" options={[{ value: '', label: 'All Departments' }, { value: 'it', label: 'IT' }, { value: 'hr', label: 'HR' }, { value: 'finance', label: 'Finance' }, { value: 'ops', label: 'Operations' }]} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Tasks</label>
            <div className="mt-2 space-y-2">
              {['IT Equipment Setup', 'Email & Accounts', 'HR Orientation', 'Benefits Enrollment', 'Desk Assignment', 'ID Badge', 'Payroll Setup'].map((t) => (
                <label key={t} className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{t}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowTemplateModal(false)}>Cancel</Button>
            <Button>Create Template</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showStartModal} onClose={() => setShowStartModal(false)} title="Start Onboarding" size="md">
        <div className="space-y-4">
          <Select label="Select Employee" options={employees} value={selectedEmployee} onChange={(e) => setSelectedEmployee(e.target.value)} placeholder="Choose employee..." />
          <Select label="Select Template" options={templateOptions} value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)} placeholder="Choose template..." />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowStartModal(false)}>Cancel</Button>
            <Button disabled={!selectedEmployee || !selectedTemplate}>Start Onboarding</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

