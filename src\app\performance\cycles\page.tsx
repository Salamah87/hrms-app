'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Calendar, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { formatDate } from '@/lib/utils';
import type { PerformanceCycle } from '@/types';

export default function CyclesPage() {
  const [cycles, setCycles] = useState<PerformanceCycle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/performance/cycles')
      .then(r => r.json())
      .then(data => { setCycles(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Review Cycles</h1>
      <div className="flex justify-center py-12">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Review Cycles</h1>
          <p className="mt-1 text-sm text-gray-500">Manage performance review periods</p>
        </div>
        <Link href="/performance">
          <Button leftIcon={<Plus className="h-4 w-4" />}>New Cycle (from Dashboard)</Button>
        </Link>
      </div>

      {cycles.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Calendar className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-gray-500 font-medium">No cycles yet</p>
            <p className="text-xs text-gray-400 mt-1">Create your first review cycle from the Performance dashboard</p>
            <Link href="/performance" className="mt-4">
              <Button>Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {cycles.map(cycle => (
            <Link key={cycle.id} href={`/performance/cycles/${cycle.id}`}
              className="group bg-white rounded-xl border border-gray-200 p-5 hover:border-blue-300 hover:shadow-md transition-all flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  cycle.status === 'active' ? 'bg-green-100 text-green-600' :
                  cycle.status === 'draft' ? 'bg-gray-100 text-gray-500' :
                  'bg-blue-100 text-blue-600'
                }`}>
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{cycle.name}</p>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      cycle.status === 'active' ? 'bg-green-100 text-green-700' :
                      cycle.status === 'draft' ? 'bg-gray-100 text-gray-600' :
                      'bg-blue-100 text-blue-700'
                    }`}>{cycle.status}</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {cycle.type.replace('_', ' ')} · {formatDate(cycle.startDate)} — {formatDate(cycle.endDate)}
                    {cycle.reviewStyle !== 'manager_only' && ` · ${cycle.reviewStyle === '360' ? '360°' : cycle.reviewStyle}`}
                  </p>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
