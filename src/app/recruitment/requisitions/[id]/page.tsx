'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, XCircle, Pencil, Users, MapPin, Clock, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Job } from '@/types';

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  open: 'success',
  draft: 'default',
  closed: 'danger',
  on_hold: 'warning',
};

const typeOptions = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '', type: '', location: '', description: '', requirements: '',
    salaryMin: '', salaryMax: '', closesAt: '',
  });

  const fetchJob = async () => {
    try {
      const res = await fetch(`/api/recruitment/jobs/${id}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      setJob(data);
      setEditForm({
        title: data.title,
        type: data.type,
        location: data.location || '',
        description: data.description || '',
        requirements: data.requirements || '',
        salaryMin: data.salaryMin ? String(data.salaryMin) : '',
        salaryMax: data.salaryMax ? String(data.salaryMax) : '',
        closesAt: data.closesAt ? data.closesAt.slice(0, 10) : '',
      });
    } catch {
      toast.error('Job not found');
      router.push('/recruitment/requisitions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJob(); }, [id]);

  const handlePublish = async () => {
    try {
      const res = await fetch(`/api/recruitment/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'publish' }),
      });
      if (!res.ok) throw new Error();
      toast.success('Job published');
      fetchJob();
    } catch { toast.error('Failed to publish'); }
  };

  const handleClose = async () => {
    try {
      const res = await fetch(`/api/recruitment/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close' }),
      });
      if (!res.ok) throw new Error();
      toast.success('Job closed');
      fetchJob();
    } catch { toast.error('Failed to close'); }
  };

  const handleSaveEdit = async () => {
    if (!editForm.title) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/recruitment/jobs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editForm.title,
          type: editForm.type,
          location: editForm.location || undefined,
          description: editForm.description || undefined,
          requirements: editForm.requirements || undefined,
          salaryMin: editForm.salaryMin ? Number(editForm.salaryMin) : null,
          salaryMax: editForm.salaryMax ? Number(editForm.salaryMax) : null,
          closesAt: editForm.closesAt || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Job updated');
      setEditOpen(false);
      fetchJob();
    } catch { toast.error('Failed to update'); }
    finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!job) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/recruitment/requisitions')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{job.title}</h1>
              <Badge variant={statusVariant[job.status]}>{job.status.replace(/_/g, ' ')}</Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Created {formatDate(job.createdAt)} &middot; Updated {formatDate(job.updatedAt)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" /> Edit
          </Button>
          {job.status === 'draft' && (
            <Button onClick={handlePublish}>
              <Send className="h-4 w-4" /> Publish
            </Button>
          )}
          {job.status === 'open' && (
            <Button variant="danger" onClick={handleClose}>
              <XCircle className="h-4 w-4" /> Close
            </Button>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Job Description</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {job.description || 'No description provided.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Requirements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none dark:prose-invert">
                <p className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
                  {job.requirements || 'No requirements specified.'}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Users className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Type</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white capitalize">{job.type.replace(/_/g, ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                  <MapPin className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Location</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{job.location || 'Not specified'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                  <DollarSign className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Salary Range</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {job.salaryMin ? `${formatCurrency(job.salaryMin)} - ${formatCurrency(job.salaryMax)}` : 'Not specified'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                  <Clock className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Closes</p>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {job.closesAt ? formatDate(job.closesAt) : 'No deadline'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {job.publishedAt && (
            <Card>
              <CardHeader>
                <CardTitle>Publishing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500 dark:text-gray-400">Published</span>
                  <span className="font-medium text-gray-900 dark:text-white">{formatDate(job.publishedAt)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Job" size="lg">
        <div className="space-y-4">
          <Input label="Position Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} />
          <div className="grid grid-cols-2 gap-4">
            <Select label="Employment Type" options={typeOptions} value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })} />
            <Input label="Location" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Min Salary" type="number" value={editForm.salaryMin} onChange={(e) => setEditForm({ ...editForm, salaryMin: e.target.value })} />
            <Input label="Max Salary" type="number" value={editForm.salaryMax} onChange={(e) => setEditForm({ ...editForm, salaryMax: e.target.value })} />
          </div>
          <Input label="Closes At" type="date" value={editForm.closesAt} onChange={(e) => setEditForm({ ...editForm, closesAt: e.target.value })} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              rows={4}
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-800"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Requirements</label>
            <textarea
              value={editForm.requirements}
              onChange={(e) => setEditForm({ ...editForm, requirements: e.target.value })}
              rows={4}
              className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-800"
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={!editForm.title || saving} isLoading={saving}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
