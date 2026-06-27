'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, X, SearchCheck, Timer } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/loading';
import type { OvertimeRequest } from '@/types';

const statusBadge: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  pending: 'warning', approved: 'success', rejected: 'danger', cancelled: 'default',
};

export default function OvertimeRequestsPage() {
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [selected, setSelected] = useState<OvertimeRequest | null>(null);
  const [comment, setComment] = useState('');

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams();
    if (statusFilter) params.set('status', statusFilter);
    const res = await fetch(`/api/overtime/requests?${params}`);
    setRequests(await res.json());
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleApprove = async (stepId: string) => {
    await fetch(`/api/overtime/approvals/${stepId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment }),
    });
    setApprovalOpen(false);
    setComment('');
    await fetchData();
  };

  const handleReject = async (stepId: string) => {
    await fetch(`/api/overtime/approvals/${stepId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ comment }),
    });
    setApprovalOpen(false);
    setComment('');
    await fetchData();
  };

  const openApproval = (r: OvertimeRequest) => {
    setSelected(r);
    setComment('');
    setApprovalOpen(true);
  };

  const columns = [
    { key: 'employeeId', header: 'Employee', render: (r: OvertimeRequest) => <span className="font-medium">{r.employeeId}</span> },
    { key: 'date', header: 'Date' },
    { key: 'time', header: 'Time', render: (r: OvertimeRequest) => `${r.startTime}–${r.endTime}` },
    { key: 'hours', header: 'Hours', render: (r: OvertimeRequest) => `${r.totalHours}h` },
    {
      key: 'dayType', header: 'Day Type',
      render: (r: OvertimeRequest) => (
        <Badge variant={r.dayType === 'weekend' ? 'warning' : r.dayType === 'public_holiday' ? 'danger' : 'primary'} size="sm">{r.dayType}</Badge>
      ),
    },
    { key: 'rateMultiplier', header: 'Rate', render: (r: OvertimeRequest) => `${r.rateMultiplier}x` },
    {
      key: 'status', header: 'Status',
      render: (r: OvertimeRequest) => <Badge variant={statusBadge[r.status]} size="sm">{r.status}</Badge>,
    },
    {
      key: 'actions', header: 'Actions',
      render: (r: OvertimeRequest) => (
        r.status === 'pending' ? (
          <div className="flex gap-1">
            <Button size="sm" variant="primary" onClick={() => openApproval(r)}>
              <Check className="h-3.5 w-3.5" />
            </Button>
            <Button size="sm" variant="danger" onClick={() => {
              const step = r.approvalSteps?.[0];
              if (step) handleReject(step.id);
            }}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        ) : null
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overtime Requests</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">View and manage all overtime requests</p>
        </div>
        <Select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setLoading(true); }}
          options={[
            { value: '', label: 'All statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'approved', label: 'Approved' },
            { value: 'rejected', label: 'Rejected' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
          className="w-44"
        />
      </div>

      {loading ? (
        <Card>
          <CardContent className="p-4">
            <TableSkeleton rows={6} columns={9} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table
              columns={columns}
              data={requests as any}
              keyExtractor={(r: any) => r.id}
              emptyState={<EmptyState icon={SearchCheck} title="No requests found" description="Try changing the status filter." />}
            />
          </CardContent>
        </Card>
      )}

      <Modal isOpen={approvalOpen} onClose={() => setApprovalOpen(false)} title="Approve Overtime Request" size="sm">
        {selected && (
          <div className="space-y-4">
            <p className="text-sm">
              <strong>{selected.employeeId}</strong> &mdash; {selected.date} {selected.startTime}&ndash;{selected.endTime} ({selected.totalHours}h)
            </p>
            {selected.reason && <p className="text-sm text-gray-500 dark:text-gray-400">Reason: {selected.reason}</p>}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Comment (optional)</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                className="flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:border-blue-400 dark:focus:ring-blue-800"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button leftIcon={<Check className="h-4 w-4" />} onClick={() => {
                const step = selected.approvalSteps?.[0];
                if (step) handleApprove(step.id);
              }}>Approve</Button>
              <Button variant="danger" leftIcon={<X className="h-4 w-4" />} onClick={() => {
                const step = selected.approvalSteps?.[0];
                if (step) handleReject(step.id);
              }}>Reject</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
