'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';

const typeOptions = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
];

export default function NewRequisitionPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    type: 'full_time',
    location: '',
    departmentId: '',
    description: '',
    requirements: '',
    salaryMin: '',
    salaryMax: '',
    closesAt: '',
  });

  const handleSave = async () => {
    if (!form.title) {
      toast.error('Position title is required');
      return;
    }
    setSaving(true);
    try {
      const res = await fetch('/api/recruitment/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyId: 'company-1',
          title: form.title,
          type: form.type,
          location: form.location || undefined,
          departmentId: form.departmentId || undefined,
          description: form.description || undefined,
          requirements: form.requirements || undefined,
          salaryMin: form.salaryMin ? Number(form.salaryMin) : undefined,
          salaryMax: form.salaryMax ? Number(form.salaryMax) : undefined,
          closesAt: form.closesAt || undefined,
        }),
      });
      if (!res.ok) throw new Error('Failed to create');
      toast.success('Job requisition created');
      router.push('/recruitment/requisitions');
    } catch {
      toast.error('Failed to create requisition');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push('/recruitment/requisitions')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">New Requisition</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Create a new job posting</p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Job Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Input label="Position Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Senior Frontend Developer" />
            <div className="grid grid-cols-2 gap-4">
              <Select label="Employment Type" options={typeOptions} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} />
              <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="e.g. Remote, New York" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Min Salary" type="number" value={form.salaryMin} onChange={(e) => setForm({ ...form, salaryMin: e.target.value })} placeholder="0.00" />
              <Input label="Max Salary" type="number" value={form.salaryMax} onChange={(e) => setForm({ ...form, salaryMax: e.target.value })} placeholder="0.00" />
            </div>
            <Input label="Closes At" type="date" value={form.closesAt} onChange={(e) => setForm({ ...form, closesAt: e.target.value })} />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Job description, responsibilities, and qualifications..."
                rows={4}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-800"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Requirements</label>
              <textarea
                value={form.requirements}
                onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                placeholder="Skills, experience, education requirements..."
                rows={4}
                className="flex w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-800"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => router.push('/recruitment/requisitions')}>Cancel</Button>
              <Button onClick={handleSave} disabled={!form.title || saving} isLoading={saving}>
                <Save className="h-4 w-4" /> Create Requisition
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
