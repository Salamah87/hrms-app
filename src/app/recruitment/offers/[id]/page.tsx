'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Send, CheckCircle, XCircle, FileText, Calendar, DollarSign, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Offer } from '@/types';

const statusVariant: Record<string, 'default' | 'info' | 'success' | 'danger' | 'warning'> = {
  draft: 'default',
  sent: 'info',
  accepted: 'success',
  rejected: 'danger',
  expired: 'warning',
};

const contractOptions = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'temporary', label: 'Temporary' },
];

export default function OfferDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [offer, setOffer] = useState<Offer | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    salary: '', currency: 'USD', startDate: '', contractType: 'full_time', benefits: '',
  });

  const fetchOffer = async () => {
    try {
      const res = await fetch(`/api/recruitment/offers/${id}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setOffer(data);
      setEditForm({
        salary: data.salary ? String(data.salary) : '',
        currency: data.currency || 'USD',
        startDate: data.startDate ? data.startDate.slice(0, 10) : '',
        contractType: data.contractType || 'full_time',
        benefits: data.benefits || '',
      });
    } catch {
      toast.error('Offer not found');
      router.push('/recruitment/offers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchOffer(); }, [id]);

  const handleAction = async (action: 'send' | 'accept' | 'reject') => {
    try {
      const res = await fetch(`/api/recruitment/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error();
      toast.success(action === 'send' ? 'Offer sent' : action === 'accept' ? 'Offer accepted — employee created' : 'Offer rejected');
      fetchOffer();
    } catch { toast.error('Failed to update offer'); }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`/api/recruitment/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          salary: editForm.salary ? Number(editForm.salary) : null,
          currency: editForm.currency,
          startDate: editForm.startDate || null,
          contractType: editForm.contractType,
          benefits: editForm.benefits || null,
        }),
      });
      if (!res.ok) throw new Error();
      toast.success('Offer updated');
      setEditOpen(false);
      fetchOffer();
    } catch { toast.error('Failed to update'); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!offer) return null;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/recruitment/offers')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Offer Letter</h1>
              <Badge variant={statusVariant[offer.status]}>{offer.status}</Badge>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Created {formatDate(offer.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {offer.status === 'draft' && (
            <>
              <Button variant="outline" onClick={() => setEditOpen(true)}>Edit</Button>
              <Button onClick={() => handleAction('send')}>
                <Send className="h-4 w-4" /> Send Offer
              </Button>
            </>
          )}
          {offer.status === 'sent' && (
            <>
              <Button variant="outline" onClick={() => handleAction('accept')}>
                <CheckCircle className="h-4 w-4 text-green-500" /> Accept
              </Button>
              <Button variant="danger" onClick={() => handleAction('reject')}>
                <XCircle className="h-4 w-4" /> Reject
              </Button>
            </>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-8">
          <div className="border-b pb-6 mb-6 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Employment Offer</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">We are pleased to offer you the following terms of employment.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <DollarSign className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Salary</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {offer.salary ? formatCurrency(offer.salary, offer.currency || 'USD') : 'Not set'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Start Date</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {offer.startDate ? formatDate(offer.startDate, { year: 'numeric', month: 'long', day: 'numeric' }) : 'TBD'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Contract Type</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white capitalize">
                  {offer.contractType?.replace(/_/g, ' ') || 'Not set'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Currency</p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">{offer.currency || 'USD'}</p>
              </div>
            </div>
          </div>

          {offer.benefits && (
            <div className="mt-6 pt-6 border-t dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Benefits & Perks</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{offer.benefits}</p>
            </div>
          )}

          <div className="mt-6 pt-6 border-t dark:border-gray-700 flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
            {offer.sentAt && <span>Sent: {formatDate(offer.sentAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
            {offer.respondedAt && <span>Responded: {formatDate(offer.respondedAt, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>}
          </div>
        </CardContent>
      </Card>

      {offer.status === 'sent' && (
        <Card className="border-yellow-300 dark:border-yellow-700">
          <CardContent className="py-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Awaiting Candidate Response</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">The candidate can accept or reject this offer. Use the buttons above to record their decision.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {offer.status === 'accepted' && (
        <Card className="border-green-300 dark:border-green-700">
          <CardContent className="py-6">
            <div className="text-center space-y-2">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Offer Accepted</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">An employee record has been auto-created. Proceed to the onboarding checklist.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {offer.status === 'rejected' && (
        <Card className="border-red-300 dark:border-red-700">
          <CardContent className="py-6">
            <div className="text-center space-y-2">
              <XCircle className="h-12 w-12 text-red-500 mx-auto" />
              <h3 className="text-lg font-semibold text-red-700 dark:text-red-400">Offer Declined</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">The candidate has declined this offer.</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Offer" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Salary" type="number" value={editForm.salary} onChange={(e) => setEditForm({ ...editForm, salary: e.target.value })} />
            <Select label="Currency" options={[{ value: 'USD', label: 'USD' }, { value: 'EUR', label: 'EUR' }, { value: 'LYD', label: 'LYD' }, { value: 'GBP', label: 'GBP' }]} value={editForm.currency} onChange={(e) => setEditForm({ ...editForm, currency: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={editForm.startDate} onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })} />
            <Select label="Contract Type" options={contractOptions} value={editForm.contractType} onChange={(e) => setEditForm({ ...editForm, contractType: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Benefits & Perks</label>
            <textarea
              value={editForm.benefits}
              onChange={(e) => setEditForm({ ...editForm, benefits: e.target.value })}
              rows={4}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-800"
              placeholder="Health insurance, annual leave, stock options..."
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
