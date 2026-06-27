'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Eye, Send, XCircle, Pencil } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Job } from '@/types';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  open: 'success',
  draft: 'default',
  closed: 'danger',
  on_hold: 'warning',
};

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'draft', label: 'Draft' },
  { value: 'closed', label: 'Closed' },
  { value: 'on_hold', label: 'On Hold' },
];

export default function JobListPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/recruitment/jobs?${params}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setJobs(data);
    } catch {
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const handlePublish = async (id: string) => {
    try {
      const res = await fetch(`/api/recruitment/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' }),
      });
      if (!res.ok) throw new Error();
      toast.success('Job published');
      fetchJobs();
    } catch {
      toast.error('Failed to publish job');
    }
  };

  const handleClose = async (id: string) => {
    try {
      const res = await fetch(`/api/recruitment/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' }),
      });
      if (!res.ok) throw new Error();
      toast.success('Job closed');
      fetchJobs();
    } catch {
      toast.error('Failed to close job');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Job Requisitions</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage job postings and hiring requests</p>
        </div>
        <Link href="/recruitment/requisitions/new">
          <Button>
            <Plus className="h-4 w-4" />
            New Requisition
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Jobs</CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search by title..." className="w-64" />
            <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              {
                key: 'title', header: 'Position', sortable: true,
                render: (item: any) => (
                  <Link href={`/recruitment/requisitions/${item.id}`} className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    {item.title}
                  </Link>
                ),
              },
              {
                key: 'type', header: 'Type',
                render: (item: any) => (
                  <span className="text-sm capitalize">{item.type?.replace(/_/g, ' ')}</span>
                ),
              },
              {
                key: 'location', header: 'Location',
                render: (item: any) => <span className="text-sm">{item.location || '—'}</span>,
              },
              {
                key: 'salaryMin', header: 'Salary Range',
                render: (item: any) => (
                  <span className="text-sm">
                    {item.salaryMin ? `${formatCurrency(item.salaryMin)} - ${formatCurrency(item.salaryMax)}` : '—'}
                  </span>
                ),
              },
              {
                key: 'status', header: 'Status', sortable: true,
                render: (item: any) => (
                  <Badge variant={statusVariant[item.status as string] || 'default'}>
                    {item.status?.replace(/_/g, ' ')}
                  </Badge>
                ),
              },
              {
                key: 'publishedAt', header: 'Published', sortable: true,
                render: (item: any) => (
                  <span className="text-sm">{item.publishedAt ? formatDate(item.publishedAt) : '—'}</span>
                ),
              },
              {
                key: 'actions', header: '', className: 'w-32',
                render: (item: any) => {
                  const job = item as unknown as Job;
                  return (
                    <div className="flex items-center gap-1">
                      <Link href={`/recruitment/requisitions/${job.id}`}>
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      </Link>
                      {job.status === 'draft' && (
                        <Button variant="ghost" size="sm" onClick={() => handlePublish(job.id)}>
                          <Send className="h-4 w-4 text-green-500" />
                        </Button>
                      )}
                      {job.status === 'open' && (
                        <Button variant="ghost" size="sm" onClick={() => handleClose(job.id)}>
                          <XCircle className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  );
                },
              },
            ]}
            data={jobs as any[]}
            keyExtractor={(item) => item.id}
            sortable
            isLoading={loading}
            emptyState={
              <EmptyState
                icon={Plus}
                title="No jobs found"
                description={search || statusFilter ? 'Try adjusting your filters' : 'Create your first job requisition'}
                action={!search && !statusFilter ? { label: 'New Requisition', onClick: () => window.location.href = '/recruitment/requisitions/new' } : undefined}
              />
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
