'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Eye, Send, CheckCircle, XCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { Offer } from '@/types';

const statusVariant: Record<string, 'default' | 'info' | 'success' | 'danger' | 'warning'> = {
  draft: 'default',
  sent: 'info',
  accepted: 'success',
  rejected: 'danger',
  expired: 'warning',
};

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recruitment/offers');
      if (!res.ok) throw new Error();
      setOffers(await res.json());
    } catch { toast.error('Failed to load offers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchOffers(); }, []);

  const handleSend = async (id: string) => {
    try {
      const res = await fetch(`/api/recruitment/offers/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'send' }),
      });
      if (!res.ok) throw new Error();
      toast.success('Offer sent');
      fetchOffers();
    } catch { toast.error('Failed to send offer'); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Offer Letters</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create, send, and manage employment offers</p>
        </div>
        <Link href="/recruitment/pipeline">
          <Button variant="outline">
            <ExternalLink className="h-4 w-4" /> Pipeline Board
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Offers</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              {
                key: 'id', header: 'Offer',
                render: (item: any) => (
                  <Link href={`/recruitment/offers/${item.id}`} className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    {item.id.slice(0, 8)}...
                  </Link>
                ),
              },
              {
                key: 'applicationId', header: 'Application',
                render: (item: any) => <span className="text-sm">{item.applicationId.slice(0, 12)}...</span>,
              },
              {
                key: 'salary', header: 'Salary',
                render: (item: any) => <span>{item.salary ? formatCurrency(item.salary, item.currency || 'USD') : '—'}</span>,
              },
              {
                key: 'contractType', header: 'Contract',
                render: (item: any) => <span className="text-sm capitalize">{item.contractType?.replace(/_/g, ' ') || '—'}</span>,
              },
              {
                key: 'status', header: 'Status',
                render: (item: any) => <Badge variant={statusVariant[item.status as string]}>{item.status as string}</Badge>,
              },
              {
                key: 'sentAt', header: 'Sent',
                render: (item: any) => <span className="text-sm">{item.sentAt ? formatDate(item.sentAt) : '—'}</span>,
              },
              {
                key: 'actions', header: '', className: 'w-24',
                render: (item: any) => {
                  const offer = item as unknown as Offer;
                  return (
                    <div className="flex items-center gap-1">
                      <Link href={`/recruitment/offers/${offer.id}`}>
                        <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                      </Link>
                      {offer.status === 'draft' && (
                        <Button variant="ghost" size="sm" onClick={() => handleSend(offer.id)}>
                          <Send className="h-4 w-4 text-blue-500" />
                        </Button>
                      )}
                      {offer.status === 'sent' && (
                        <span className="flex items-center gap-1 text-xs text-yellow-500">
                          <Send className="h-3 w-3" />Pending
                        </span>
                      )}
                      {offer.status === 'accepted' && (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      )}
                      {offer.status === 'rejected' && (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  );
                },
              },
            ]}
            data={offers as any[]}
            keyExtractor={(item) => item.id}
            sortable
            isLoading={loading}
            emptyState={
              <EmptyState icon={Plus} title="No offers yet" description="Create offers from the Pipeline Board when candidates reach the Offer stage" />
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
