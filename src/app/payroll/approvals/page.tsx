'use client';

import { useState } from 'react';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  User,
  Building2,
  Banknote,
  FileText,
  ChevronRight,
  Search,
  Shield,
  Check,
  Eye,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Table } from '@/components/ui/table';
import { SearchInput } from '@/components/ui/search-input';
import { Avatar } from '@/components/ui/avatar';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ApprovalStep {
  id: string;
  stepName: string;
  approver: string;
  approverRole: string;
  status: 'pending' | 'approved' | 'rejected';
  actionedAt?: string;
  comment?: string;
}

interface PayrollApproval {
  id: string;
  period: string;
  periodId: string;
  totalAmount: number;
  employeeCount: number;
  submittedBy: string;
  submittedAt: string;
  status: 'draft' | 'pending_dept' | 'pending_hr' | 'pending_finance' | 'approved' | 'rejected';
  steps: ApprovalStep[];
}

const mockApprovals: PayrollApproval[] = [
  {
    id: 'pa-1', period: 'June 2026', periodId: 'p1', totalAmount: 137700, employeeCount: 12,
    submittedBy: 'Sarah Johnson', submittedAt: '2026-06-20T10:00:00Z',
    status: 'pending_dept',
    steps: [
      { id: 's1', stepName: 'Department Manager Review', approver: 'Ahmad Khaled', approverRole: 'Engineering Manager', status: 'approved', actionedAt: '2026-06-21T09:00:00Z', comment: 'Verified all employee hours' },
      { id: 's2', stepName: 'HR Approval', approver: 'Sarah Johnson', approverRole: 'HR Director', status: 'pending' },
      { id: 's3', stepName: 'Finance Approval', approver: 'Michael Brown', approverRole: 'Finance Manager', status: 'pending' },
      { id: 's4', stepName: 'Final Payroll Lock', approver: 'System', approverRole: 'Automated', status: 'pending' },
    ],
  },
  {
    id: 'pa-2', period: 'May 2026', periodId: 'p2', totalAmount: 134300, employeeCount: 12,
    submittedBy: 'Sarah Johnson', submittedAt: '2026-05-20T10:00:00Z',
    status: 'approved',
    steps: [
      { id: 's5', stepName: 'Department Manager Review', approver: 'Ahmad Khaled', approverRole: 'Engineering Manager', status: 'approved', actionedAt: '2026-05-21T09:00:00Z' },
      { id: 's6', stepName: 'HR Approval', approver: 'Sarah Johnson', approverRole: 'HR Director', status: 'approved', actionedAt: '2026-05-22T10:00:00Z' },
      { id: 's7', stepName: 'Finance Approval', approver: 'Michael Brown', approverRole: 'Finance Manager', status: 'approved', actionedAt: '2026-05-23T11:00:00Z' },
      { id: 's8', stepName: 'Final Payroll Lock', approver: 'System', approverRole: 'Automated', status: 'approved', actionedAt: '2026-05-25T08:00:00Z' },
    ],
  },
  {
    id: 'pa-3', period: 'April 2026', periodId: 'p3', totalAmount: 136000, employeeCount: 12,
    submittedBy: 'Sarah Johnson', submittedAt: '2026-04-20T10:00:00Z',
    status: 'approved',
    steps: [
      { id: 's9', stepName: 'Department Manager Review', approver: 'Ahmad Khaled', approverRole: 'Engineering Manager', status: 'approved', actionedAt: '2026-04-21T09:00:00Z' },
      { id: 's10', stepName: 'HR Approval', approver: 'Sarah Johnson', approverRole: 'HR Director', status: 'approved', actionedAt: '2026-04-22T10:00:00Z' },
      { id: 's11', stepName: 'Finance Approval', approver: 'Michael Brown', approverRole: 'Finance Manager', status: 'approved', actionedAt: '2026-04-23T11:00:00Z' },
      { id: 's12', stepName: 'Final Payroll Lock', approver: 'System', approverRole: 'Automated', status: 'approved', actionedAt: '2026-04-25T08:00:00Z' },
    ],
  },
];

const statusVariant: Record<string, 'warning' | 'info' | 'success' | 'danger'> = {
  draft: 'warning',
  pending_dept: 'warning',
  pending_hr: 'info',
  pending_finance: 'info',
  approved: 'success',
  rejected: 'danger',
};

const stepIcon: Record<string, typeof CheckCircle> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

const stepColor: Record<string, string> = {
  pending: 'text-yellow-500',
  approved: 'text-green-500',
  rejected: 'text-red-500',
};

export default function PayrollApprovalsPage() {
  const [approvals, setApprovals] = useState(mockApprovals);
  const [search, setSearch] = useState('');
  const [selectedApproval, setSelectedApproval] = useState<PayrollApproval | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const handleAction = (approvalId: string, stepId: string, action: 'approved' | 'rejected') => {
    setApprovals((prev) =>
      prev.map((a) => {
        if (a.id !== approvalId) return a;
        const updatedSteps = a.steps.map((s) =>
          s.id === stepId ? { ...s, status: action, actionedAt: new Date().toISOString() } : s
        );
        const allDone = updatedSteps.every((s) => s.status !== 'pending');
        const anyRejected = updatedSteps.some((s) => s.status === 'rejected');
        let newStatus = a.status;
        if (anyRejected) newStatus = 'rejected' as const;
        else if (allDone) newStatus = 'approved' as const;
        else {
          const lastApproved = updatedSteps.filter((s) => s.status === 'approved').length;
          if (lastApproved === 1) newStatus = 'pending_hr' as const;
          else if (lastApproved === 2) newStatus = 'pending_finance' as const;
        }
        return { ...a, steps: updatedSteps, status: newStatus };
      })
    );
    const actionLabel = action === 'approved' ? 'approved' : 'rejected';
    toast.success(`Step ${actionLabel} successfully`);
    if (selectedApproval?.id === approvalId) {
      setApprovals((prev) => {
        const updated = prev.find((a) => a.id === approvalId);
        if (updated) setSelectedApproval(updated);
        return prev;
      });
    }
  };

  const statusLabel: Record<string, string> = {
    draft: 'Draft', pending_dept: 'Pending Dept Manager', pending_hr: 'Pending HR', pending_finance: 'Pending Finance', approved: 'Approved', rejected: 'Rejected',
  };

  const filtered = search
    ? approvals.filter((a) => a.period.toLowerCase().includes(search.toLowerCase()))
    : approvals;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Approval Workflow</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Review and approve payroll runs through multi-step workflow</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Submissions', value: approvals.length, icon: FileText, color: 'text-blue-600 bg-blue-100' },
          { label: 'Pending Review', value: approvals.filter((a) => a.status.includes('pending')).length, icon: Clock, color: 'text-yellow-600 bg-yellow-100' },
          { label: 'Approved', value: approvals.filter((a) => a.status === 'approved').length, icon: CheckCircle, color: 'text-green-600 bg-green-100' },
          { label: 'Rejected', value: approvals.filter((a) => a.status === 'rejected').length, icon: XCircle, color: 'text-red-600 bg-red-100' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 px-6 py-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} dark:opacity-80`}><stat.icon className="h-6 w-6" /></div>
              <div><p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p></div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <Card><CardContent className="py-12"><EmptyState icon={Search} title="No approvals found" /></CardContent></Card>
        ) : (
          filtered.map((approval) => (
            <Card key={approval.id} className="overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"><Banknote className="h-6 w-6" /></div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{approval.period}</h3>
                      <Badge variant={statusVariant[approval.status]}>{statusLabel[approval.status]}</Badge>
                    </div>
                    <p className="text-sm text-gray-500">{approval.employeeCount} employees &middot; {formatCurrency(approval.totalAmount)} total &middot; Submitted by {approval.submittedBy} on {formatDate(approval.submittedAt)}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => { setSelectedApproval(approval); setShowDetail(true); }}><Eye className="h-4 w-4" /> View</Button>
              </div>

              <div className="border-t bg-gray-50 px-6 py-4 dark:bg-gray-800/30 dark:border-gray-700">
                <div className="flex items-center gap-0">
                  {approval.steps.map((step, idx) => {
                    const Icon = stepIcon[step.status];
                    const color = stepColor[step.status];
                    return (
                      <div key={step.id} className="flex items-center flex-1">
                        <div className="flex items-center gap-2">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${color} bg-opacity-10 ${step.status === 'approved' ? 'bg-green-100' : step.status === 'rejected' ? 'bg-red-100' : 'bg-gray-100 dark:bg-gray-700'}`}>
                            <Icon className={`h-4 w-4 ${color}`} />
                          </div>
                          <div className="min-w-0">
                            <p className={`text-xs font-medium ${step.status === 'approved' ? 'text-green-700' : step.status === 'rejected' ? 'text-red-700' : 'text-gray-500'} dark:text-gray-300`}>{step.stepName}</p>
                            <p className="text-xs text-gray-400">{step.status === 'pending' ? 'Waiting' : step.status === 'approved' ? `by ${step.approver}` : `by ${step.approver}`}</p>
                          </div>
                        </div>
                        {idx < approval.steps.length - 1 && (
                          <div className="flex-1 mx-3 h-px border-t border-dashed border-gray-300 dark:border-gray-600" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      <Modal isOpen={showDetail} onClose={() => setShowDetail(false)} title={`Approval Detail — ${selectedApproval?.period}`} size="lg">
        {selectedApproval && (
          <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800">
                <p className="text-xs text-gray-500">Total Amount</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(selectedApproval.totalAmount)}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800">
                <p className="text-xs text-gray-500">Employees</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{selectedApproval.employeeCount}</p>
              </div>
              <div className="rounded-lg bg-gray-50 p-3 text-center dark:bg-gray-800">
                <p className="text-xs text-gray-500">Status</p>
                <Badge variant={statusVariant[selectedApproval.status]} size="lg">{statusLabel[selectedApproval.status]}</Badge>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium text-gray-900 dark:text-white">Approval Steps</h4>
              {selectedApproval.steps.map((step, idx) => {
                const Icon = stepIcon[step.status];
                const color = stepColor[step.status];
                const isCurrent = step.status === 'pending';
                return (
                  <div key={step.id} className={`flex items-start gap-4 rounded-lg border p-4 ${isCurrent ? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20' : 'dark:border-gray-700'}`}>
                    <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full ${step.status === 'approved' ? 'bg-green-100 text-green-600' : step.status === 'rejected' ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-400 dark:bg-gray-700'}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{step.stepName}</p>
                          <p className="text-sm text-gray-500">{step.approver} &middot; {step.approverRole}</p>
                        </div>
                        {isCurrent && (
                          <div className="flex gap-2">
                            <Button size="sm" variant="success" onClick={() => handleAction(selectedApproval.id, step.id, 'approved')}><Check className="h-4 w-4" /> Approve</Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => handleAction(selectedApproval.id, step.id, 'rejected')}><XCircle className="h-4 w-4" /> Reject</Button>
                          </div>
                        )}
                        {step.status !== 'pending' && (
                          <Badge variant={step.status === 'approved' ? 'success' : 'danger'}>{step.status}</Badge>
                        )}
                      </div>
                      {step.comment && <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 italic">"{step.comment}"</p>}
                      {step.actionedAt && <p className="mt-1 text-xs text-gray-400">Actioned: {formatDate(step.actionedAt)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
