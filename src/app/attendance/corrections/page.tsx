'use client';

import { useState, useMemo } from 'react';
import { Plus, Check, X, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/loading';
import { formatDate } from '@/lib/utils';

const mockRequests = Array.from({ length: 15 }, (_, i) => ({
  id: `req-${i + 1}`,
  employee: ['Ahmad Khaled', 'Sarah Johnson', 'Michael Brown', 'Nora Hassan', 'Robert Wilson'][i % 5],
  date: new Date(2026, 5, 10 + i).toISOString(),
  requestType: (['early_out', 'late_in', 'missing_punch', 'wrong_time'] as const)[i % 4],
  currentTime: `${7 + (i % 2)}:${String(15 * (i % 4)).padStart(2, '0')} ${i % 2 === 0 ? 'AM' : 'AM'}`,
  requestedTime: `${8 + (i % 2)}:${String(15 * ((i + 1) % 4)).padStart(2, '0')} ${i % 2 === 0 ? 'AM' : 'AM'}`,
  reason: ['Traffic delay', 'Doctor appointment', 'System error', 'Forgot to clock in', 'Emergency', 'Car issue', 'Family commitment'][i % 7],
  status: (['pending', 'pending', 'approved', 'rejected'] as const)[i % 4],
}));

const requestTypeOptions = [
  { value: '', label: 'All Types' },
  { value: 'early_out', label: 'Early Out' },
  { value: 'late_in', label: 'Late In' },
  { value: 'missing_punch', label: 'Missing Punch' },
  { value: 'wrong_time', label: 'Wrong Time' },
];

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
];

export default function CorrectionsPage() {
  const [isLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);

  const filtered = useMemo(() => {
    let result = mockRequests;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((r) => r.employee.toLowerCase().includes(q));
    }
    if (typeFilter) result = result.filter((r) => r.requestType === typeFilter);
    if (statusFilter) result = result.filter((r) => r.status === statusFilter);
    return result;
  }, [search, typeFilter, statusFilter]);

  const statusBadge: Record<string, 'warning' | 'success' | 'danger'> = {
    pending: 'warning', approved: 'success', rejected: 'danger',
  };

  const typeLabel: Record<string, string> = {
    early_out: 'Early Out', late_in: 'Late In', missing_punch: 'Missing Punch', wrong_time: 'Wrong Time',
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Corrections</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage attendance correction requests</p>
        </div>
        <TableSkeleton rows={8} columns={7} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance Corrections</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage attendance correction requests</p>
        </div>
        <Button onClick={() => setShowRequestModal(true)} leftIcon={<Plus className="h-4 w-4" />}>
          Request Correction
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Correction Requests</CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search employee..." className="w-60" />
            <Select options={requestTypeOptions} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-40" />
            <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'employee', header: 'Employee', sortable: true },
              {
                key: 'date', header: 'Date', sortable: true,
                render: (item: any) => <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(item.date)}</span>,
              },
              {
                key: 'requestType', header: 'Request Type',
                render: (item: any) => <Badge variant="info" size="sm">{typeLabel[item.requestType]}</Badge>,
              },
              {
                key: 'currentTime', header: 'Current Time',
                render: (item: any) => <span className="font-mono text-sm">{item.currentTime}</span>,
              },
              {
                key: 'requestedTime', header: 'Requested Time',
                render: (item: any) => <span className="font-mono text-sm">{item.requestedTime}</span>,
              },
              { key: 'reason', header: 'Reason' },
              {
                key: 'status', header: 'Status',
                render: (item: any) => <Badge variant={statusBadge[item.status]}>{item.status}</Badge>,
              },
              {
                key: 'actions', header: '', className: 'w-24',
                render: (item: any) => (
                  item.status === 'pending' ? (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="text-green-600 hover:text-green-700"><Check className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700"><X className="h-4 w-4" /></Button>
                    </div>
                  ) : null
                ),
              },
            ]}
            data={filtered as any[]}
            keyExtractor={(item: any) => item.id as string}
            sortable
            emptyState={
              <EmptyState icon={AlertTriangle} title="No correction requests" description={search || typeFilter || statusFilter ? 'Try adjusting your filters' : 'No requests have been submitted yet'} />
            }
          />
        </CardContent>
      </Card>

      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request Attendance Correction" size="md">
        <div className="space-y-4">
          <Input label="Date" type="date" />
          <Select label="Request Type" options={requestTypeOptions.slice(1)} placeholder="Select type" />
          <Input label="Current Time" type="time" />
          <Input label="Requested Time" type="time" />
          <Input label="Reason" placeholder="Explain why you need this correction" />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowRequestModal(false)}>Cancel</Button>
            <Button>Submit Request</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

