'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, MessageSquare, Star, Calendar, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import type { Interview } from '@/types';

const statusVariant: Record<string, 'info' | 'success' | 'danger' | 'warning'> = {
  scheduled: 'info',
  completed: 'success',
  cancelled: 'danger',
  rescheduled: 'warning',
};

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
  { value: 'rescheduled', label: 'Rescheduled' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  { value: 'video', label: 'Video Call' },
  { value: 'phone', label: 'Phone Call' },
  { value: 'onsite', label: 'On-site' },
  { value: 'technical', label: 'Technical' },
];

export default function InterviewsPage() {
  const [interviews, setInterviews] = useState<(Interview & { candidateName?: string; position?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [feedbackModal, setFeedbackModal] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recruitment/interviews');
      if (!res.ok) throw new Error();
      const data = await res.json();
      const enriched = data.map((i: Interview) => ({
        ...i,
        candidateName: `Candidate #${i.applicationId.slice(-4)}`,
        position: `Application ${i.applicationId.slice(-4)}`,
      }));
      setInterviews(enriched);
    } catch {
      toast.error('Failed to load interviews');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInterviews(); }, []);

  const filtered = useMemo(() => {
    let result = interviews;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((i) =>
        (i.candidateName || '').toLowerCase().includes(q) ||
        (i.type || '').toLowerCase().includes(q)
      );
    }
    if (statusFilter) result = result.filter((i) => i.status === statusFilter);
    if (typeFilter) result = result.filter((i) => i.type === typeFilter);
    return result;
  }, [search, statusFilter, typeFilter, interviews]);

  const handleSubmitFeedback = async () => {
    if (!feedbackModal) return;
    try {
      const res = await fetch(`/api/recruitment/interviews/${feedbackModal}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          feedback: feedbackText,
          rating: feedbackRating,
          status: 'completed',
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Feedback submitted');
      setFeedbackModal(null);
      setFeedbackText('');
      setFeedbackRating(0);
      fetchInterviews();
    } catch {
      toast.error('Failed to submit feedback');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interviews</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track and manage candidate interviews</p>
        </div>
        <Link href="/recruitment/pipeline">
          <Button variant="outline">
            <ExternalLink className="h-4 w-4" />
            Pipeline Board
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Interviews</CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search interviews..." className="w-64" />
            <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-36" />
            <Select options={typeOptions} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="w-36" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'candidateName', header: 'Candidate', sortable: true, render: (item: any) => <span className="font-medium">{item.candidateName as string}</span> },
              { key: 'position', header: 'Position' },
              {
                key: 'scheduledAt', header: 'Scheduled', sortable: true,
                render: (item: any) => <span>{item.scheduledAt ? formatDate(item.scheduledAt) : '—'}</span>,
              },
              {
                key: 'durationMins', header: 'Duration',
                render: (item: any) => <span className="text-sm">{item.durationMins} min</span>,
              },
              {
                key: 'type', header: 'Type',
                render: (item: any) => <Badge variant="info">{item.type as string}</Badge>,
              },
              {
                key: 'status', header: 'Status',
                render: (item: any) => <Badge variant={statusVariant[item.status as string] || 'default'}>{item.status as string}</Badge>,
              },
              {
                key: 'actions', header: '', className: 'w-20',
                render: (item: any) => {
                  const interview = item as unknown as Interview;
                  return (
                    <div className="flex items-center gap-1">
                      {interview.status === 'scheduled' && (
                        <Button variant="ghost" size="sm" onClick={() => { setFeedbackModal(interview.id); setFeedbackText(interview.feedback || ''); setFeedbackRating(interview.rating || 0); }}>
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      )}
                      {interview.status === 'completed' && interview.rating && (
                        <span className="flex items-center gap-1 text-xs text-yellow-500">
                          <Star className="h-3.5 w-3.5 fill-current" />{interview.rating}
                        </span>
                      )}
                    </div>
                  );
                },
              },
            ]}
            data={filtered as any[]}
            keyExtractor={(item) => item.id}
            sortable
            isLoading={loading}
            emptyState={
              <EmptyState icon={Calendar} title="No interviews found" description={search || statusFilter || typeFilter ? 'Try adjusting your filters' : 'Schedule interviews from the Pipeline Board'} />
            }
          />
        </CardContent>
      </Card>

      <Modal isOpen={!!feedbackModal} onClose={() => setFeedbackModal(null)} title="Interview Feedback" size="md">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">Rating</label>
            <div className="flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <button key={i} type="button" onClick={() => setFeedbackRating(i + 1)}>
                  <Star className={`h-6 w-6 ${i < feedbackRating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} />
                </button>
              ))}
              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'][feedbackRating]}
              </span>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Feedback Notes</label>
            <textarea
              value={feedbackText}
              onChange={(e) => setFeedbackText(e.target.value)}
              rows={5}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-800"
              placeholder="Describe the candidate's performance, strengths, areas for improvement..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setFeedbackModal(null)}>Cancel</Button>
            <Button onClick={handleSubmitFeedback} disabled={!feedbackText.trim()}>Submit Feedback</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
