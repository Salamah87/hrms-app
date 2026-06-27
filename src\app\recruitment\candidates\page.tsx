'use client';

import { useState, useMemo } from 'react';
import { Eye, MoreHorizontal, UserPlus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Select } from '@/components/ui/select';
import { SearchInput } from '@/components/ui/search-input';
import { Dropdown } from '@/components/ui/dropdown';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  status: PipelineStatus;
  stage: string;
  appliedDate: string;
}

type PipelineStatus = 'applied' | 'screening' | 'interview' | 'assessment' | 'offer' | 'hired' | 'rejected';

const statusVariant: Record<string, 'info' | 'warning' | 'primary' | 'success' | 'danger' | 'default'> = {
  applied: 'default',
  screening: 'info',
  interview: 'primary',
  assessment: 'warning',
  offer: 'info',
  hired: 'success',
  rejected: 'danger',
};

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'applied', label: 'Applied' },
  { value: 'screening', label: 'Screening' },
  { value: 'interview', label: 'Interview' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'offer', label: 'Offer' },
  { value: 'hired', label: 'Hired' },
  { value: 'rejected', label: 'Rejected' },
];

const mockCandidates: Candidate[] = [
  { id: '1', name: 'Ahmad Khaled', email: 'ahmad@email.com', phone: '+966 55 111 1111', position: 'Frontend Developer', status: 'applied', stage: 'Applied', appliedDate: '2026-06-20' },
  { id: '2', name: 'Sarah Johnson', email: 'sara@email.com', phone: '+966 55 222 2222', position: 'Product Manager', status: 'screening', stage: 'Screening', appliedDate: '2026-06-19' },
  { id: '3', name: 'Michael Brown', email: 'mohammed@email.com', phone: '+966 55 333 3333', position: 'Backend Developer', status: 'interview', stage: 'Interview', appliedDate: '2026-06-18' },
  { id: '4', name: 'Nora Hassan', email: 'nora@email.com', phone: '+966 55 444 4444', position: 'UX Designer', status: 'assessment', stage: 'Assessment', appliedDate: '2026-06-17' },
  { id: '5', name: 'Robert Wilson', email: 'fahad@email.com', phone: '+966 55 555 5555', position: 'Sales Manager', status: 'offer', stage: 'Offer', appliedDate: '2026-06-16' },
  { id: '6', name: 'Jennifer Lee', email: 'lama@email.com', phone: '+966 55 666 6666', position: 'Frontend Developer', status: 'hired', stage: 'Hired', appliedDate: '2026-06-15' },
  { id: '7', name: 'James Taylor', email: 'sultan@email.com', phone: '+966 55 777 7777', position: 'Backend Developer', status: 'rejected', stage: 'Rejected', appliedDate: '2026-06-14' },
  { id: '8', name: 'Lisa Anderson', email: 'hind@email.com', phone: '+966 55 888 8888', position: 'HR Officer', status: 'applied', stage: 'Applied', appliedDate: '2026-06-13' },
];

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState(mockCandidates);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewCandidate, setViewCandidate] = useState<Candidate | null>(null);

  const filtered = useMemo(() => {
    let result = candidates;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || c.position.toLowerCase().includes(q));
    }
    if (statusFilter) result = result.filter((c) => c.status === statusFilter);
    return result;
  }, [search, statusFilter, candidates]);

  const updateStatus = (id: string, newStatus: PipelineStatus) => {
    setCandidates((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: newStatus, stage: statusOptions.find((o) => o.value === newStatus)?.label || newStatus } : c))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Candidates</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Review and manage job applicants</p>
        </div>
        <Link href="/recruitment/candidates/new">
          <Button>
            <UserPlus className="h-4 w-4" />
            Add Candidate
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Candidates</CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput value={search} onChange={(v) => setSearch(v)} placeholder="Search candidates..." className="w-72" />
            <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'name', header: 'Name', sortable: true, render: (item: any) => <span className="font-medium">{item.name as string}</span> },
              { key: 'email', header: 'Email', render: (item: any) => <span className="text-sm">{item.email as string}</span> },
              { key: 'phone', header: 'Phone', render: (item: any) => <span className="text-sm">{item.phone as string}</span> },
              { key: 'position', header: 'Position', sortable: true },
              {
                key: 'status', header: 'Status',
                render: (item: any) => (
                  <Dropdown
                    align="right"
                    trigger={
                      <Badge variant={statusVariant[item.status as PipelineStatus]} className="cursor-pointer">
                        {item.status as string}
                      </Badge>
                    }
                    items={statusOptions.slice(1).map((opt) => ({
                      label: opt.label,
                      onClick: () => updateStatus(item.id as string, opt.value as PipelineStatus),
                    }))}
                  />
                ),
              },
              { key: 'appliedDate', header: 'Applied', sortable: true, render: (item: any) => <span>{formatDate(item.appliedDate as string)}</span> },
              {
                key: 'actions', header: '', className: 'w-16',
                render: (item: any) => (
                  <Dropdown
                    align="right"
                    trigger={
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    }
                    items={[
                      { label: 'View Profile', icon: <Eye className="h-4 w-4" />, onClick: () => window.location.href = `/recruitment/candidates/${item.id}` },
                      ...statusOptions.slice(1).map((opt) => ({
                        label: `Move to ${opt.label}`,
                        onClick: () => updateStatus(item.id as string, opt.value as PipelineStatus),
                      })),
                    ]}
                  />
                ),
              },
            ]}
            data={filtered as any[]}
            keyExtractor={(item) => item.id as string}
            sortable
            emptyState={
              <EmptyState icon={UserPlus} title="No candidates" description={search || statusFilter ? 'Try adjusting your filters' : 'Start by adding a candidate'} />
            }
          />
        </CardContent>
      </Card>

      <Modal isOpen={!!viewCandidate} onClose={() => setViewCandidate(null)} title={viewCandidate?.name || 'Candidate Profile'} size="lg">
        {viewCandidate && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div><p className="text-xs text-gray-500">Email</p><p className="text-sm font-medium">{viewCandidate.email}</p></div>
              <div><p className="text-xs text-gray-500">Phone</p><p className="text-sm font-medium">{viewCandidate.phone}</p></div>
              <div><p className="text-xs text-gray-500">Position</p><p className="text-sm font-medium">{viewCandidate.position}</p></div>
              <div><p className="text-xs text-gray-500">Status</p><Badge variant={statusVariant[viewCandidate.status]}>{viewCandidate.status}</Badge></div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

