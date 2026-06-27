'use client';

import { useState } from 'react';
import { Plus, Briefcase, Users, Calendar, Clock, ListTree } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Candidate {
  id: string;
  name: string;
  position: string;
  date: string;
  stage: PipelineStage;
}

type PipelineStage = 'applied' | 'screening' | 'interview' | 'assessment' | 'offer' | 'hired' | 'rejected';

interface Column {
  id: PipelineStage;
  label: string;
  color: string;
}

const columns: Column[] = [
  { id: 'applied', label: 'Applied', color: 'border-t-blue-500' },
  { id: 'screening', label: 'Screening', color: 'border-t-indigo-500' },
  { id: 'interview', label: 'Interview', color: 'border-t-purple-500' },
  { id: 'assessment', label: 'Assessment', color: 'border-t-orange-500' },
  { id: 'offer', label: 'Offer', color: 'border-t-yellow-500' },
  { id: 'hired', label: 'Hired', color: 'border-t-green-500' },
  { id: 'rejected', label: 'Rejected', color: 'border-t-red-500' },
];

const allCandidates: Candidate[] = [
  { id: '1', name: 'Ahmad Khaled', position: 'Frontend Developer', date: '2026-06-20', stage: 'applied' },
  { id: '2', name: 'Sarah Johnson', position: 'Product Manager', date: '2026-06-19', stage: 'screening' },
  { id: '3', name: 'Michael Brown', position: 'Backend Developer', date: '2026-06-18', stage: 'interview' },
  { id: '4', name: 'Nora Hassan', position: 'UX Designer', date: '2026-06-17', stage: 'assessment' },
  { id: '5', name: 'Robert Wilson', position: 'Sales Manager', date: '2026-06-16', stage: 'offer' },
  { id: '6', name: 'Jennifer Lee', position: 'Frontend Developer', date: '2026-06-15', stage: 'hired' },
  { id: '7', name: 'James Taylor', position: 'Backend Developer', date: '2026-06-14', stage: 'rejected' },
  { id: '8', name: 'Lisa Anderson', position: 'HR Officer', date: '2026-06-13', stage: 'applied' },
  { id: '9', name: 'William Thomas', position: 'Data Analyst', date: '2026-06-12', stage: 'screening' },
  { id: '10', name: 'Amanda White', position: 'Marketing Specialist', date: '2026-06-11', stage: 'interview' },
  { id: '11', name: 'Khalid Fahad', position: 'DevOps Engineer', date: '2026-06-10', stage: 'applied' },
  { id: '12', name: 'Nouf Ibrahim', position: 'Product Designer', date: '2026-06-09', stage: 'offer' },
];

const stageCandidates = (stage: PipelineStage) => allCandidates.filter((c) => c.stage === stage);

const statCards = [
  { label: 'Open Positions', value: 12, icon: Briefcase, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400' },
  { label: 'Total Candidates', value: 142, icon: Users, color: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400' },
  { label: 'Interviews Scheduled', value: 18, icon: Calendar, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400' },
  { label: 'Offers Pending', value: 5, icon: Clock, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400' },
];

export default function RecruitmentDashboard() {
  const [draggedId, setDraggedId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Recruitment</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage candidates and job requisitions</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/recruitment/pipeline">
            <Button variant="outline">
              <ListTree className="h-4 w-4" />
              Pipeline Board
            </Button>
          </Link>
          <Link href="/recruitment/requisitions/new">
            <Button>
              <Plus className="h-4 w-4" />
              New Requisition
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 px-6 py-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid auto-cols-[240px] grid-flow-col gap-4 overflow-x-auto pb-2">
        {columns.map((col) => {
          const candidates = stageCandidates(col.id);
          return (
            <div key={col.id} className={cn('flex flex-col rounded-xl border bg-white shadow-sm dark:border-gray-800 dark:bg-gray-900', col.color)}>
              <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{col.label}</h3>
                <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200 px-1.5 text-[11px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                  {candidates.length}
                </span>
              </div>
              <div className="flex-1 space-y-2 p-3">
                {candidates.length === 0 ? (
                  <p className="py-6 text-center text-xs text-gray-400">No candidates</p>
                ) : (
                  candidates.map((candidate) => (
                    <Link key={candidate.id} href={`/recruitment/candidates/${candidate.id}`}>
                      <Card className="cursor-pointer transition-shadow hover:shadow-md">
                        <CardContent className="px-4 py-3">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{candidate.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{candidate.position}</p>
                          <p className="mt-1 text-[10px] text-gray-400">{new Date(candidate.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

