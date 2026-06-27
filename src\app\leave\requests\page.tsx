'use client';

import { useState, useMemo } from 'react';
import {
  Check, X, FileText, Search, ChevronRight, ChevronDown,
  Filter, Users, Shield, Building2, Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { formatDate, getInitials } from '@/lib/utils';
import type { LeaveTypeCode, LeaveStatus } from '@/types';

interface Approval {
  level: number;
  approver: string;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  comment?: string;
}

interface LeaveRequest {
  id: string;
  employee: string;
  department: string;
  leaveType: LeaveTypeCode;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: LeaveStatus;
  reason: string;
  createdAt: string;
  approvals: Approval[];
}

const leaveTypeLabels: Record<LeaveTypeCode, string> = {
  annual: 'Annual', sick: 'Sick', personal: 'Personal', emergency: 'Emergency',
  maternity: 'Maternity', paternity: 'Paternity', hajj: 'Hajj', unpaid: 'Unpaid',
};

const mockRequests: LeaveRequest[] = Array.from({ length: 35 }, (_, i) => {
  const days = 1 + (i % 5);
  const isLong = days > 3;
  return {
    id: `lr-${i + 1}`,
    employee: ['Ahmad Khaled', 'Sarah Johnson', 'Michael Brown', 'Nora Hassan', 'Robert Wilson', 'Jennifer Lee', 'James Taylor', 'Lisa Anderson', 'William Thomas', 'Amanda White'][i % 10],
    department: ['Engineering', 'HR', 'Finance', 'Sales', 'Marketing'][i % 5],
    leaveType: (['annual', 'sick', 'personal', 'emergency', 'hajj', 'unpaid'] as LeaveTypeCode[])[i % 6],
    startDate: new Date(2026, 5, 5 + (i % 20)).toISOString(),
    endDate: new Date(2026, 5, 7 + (i % 20) + (i % 3)).toISOString(),
    totalDays: days,
    status: (['pending', 'pending', 'approved', 'approved', 'rejected', 'cancelled'] as LeaveStatus[])[i % 6],
    reason: ['Family vacation', 'Medical appointment', 'Personal matters', 'Emergency', 'Hajj pilgrimage', 'Rest'][i % 6],
    createdAt: new Date(2026, 4, 20 + i).toISOString(),
    approvals: (() => {
      const chain: Approval[] = [
        { level: 1, approver: 'Direct Manager', role: 'Team Lead', status: 'approved' },
      ];
      if (isLong || i % 3 === 0) {
        chain.push({ level: 2, approver: 'Department Head', role: 'Dept Manager', status: i < 10 ? 'approved' : 'pending' });
      }
      if (i % 5 === 0) {
        chain.push({ level: 3, approver: 'HR Admin', role: 'HR', status: i < 3 ? 'approved' : 'pending' });
      }
      if (i % 6 >= 4) {
        chain[chain.length - 1].status = 'rejected';
        chain[chain.length - 1].comment = 'Insufficient team coverage during this period.';
      }
      return chain;
    })(),
  };
});

const statusBadge: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  pending: 'warning', approved: 'success', rejected: 'danger', cancelled: 'default',
};

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'cancelled', label: 'Cancelled' },
];

const typeOptions = [
  { value: '', label: 'All Types' },
  ...Object.entries(leaveTypeLabels).map(([value, label]) => ({ value, label })),
];

export default function LeaveRequestsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const limit = 10;

  const filtered = useMemo(() => {
    let result = mockRequests;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(r => r.employee.toLowerCase().includes(q));
    }
    if (typeFilter) result = result.filter(r => r.leaveType === typeFilter);
    if (statusFilter) result = result.filter(r => r.status === statusFilter);
    if (deptFilter) result = result.filter(r => r.department === deptFilter);
    return result;
  }, [search, typeFilter, statusFilter, deptFilter]);

  const totalPages = Math.ceil(filtered.length / limit);
  const paginated = filtered.slice((page - 1) * limit, page * limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Requests</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Multi-level approval chain with auto-routing rules
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Requests ({filtered.length})</CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                type="text" placeholder="Search employee..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="h-10 w-56 rounded-lg border border-gray-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="h-10 w-36 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {statusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value); setPage(1); }}
              className="h-10 w-40 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {typeOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              value={deptFilter}
              onChange={e => { setDeptFilter(e.target.value); setPage(1); }}
              className="h-10 w-40 rounded-lg border border-gray-200 bg-white px-3 text-sm outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              <option value="">All Departments</option>
              {['Engineering', 'HR', 'Finance', 'Sales', 'Marketing'].map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y dark:divide-gray-800">
            {paginated.map(req => {
              const hasChainInfo = req.approvals.length > 1;
              const currentLevel = req.approvals.find(a => a.status === 'pending');
              return (
                <div key={req.id}>
                  <div
                    className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                    onClick={() => setExpandedId(expandedId === req.id ? null : req.id)}
                  >
                    <Avatar name={req.employee} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{req.employee}</span>
                        <span className="text-xs text-gray-400">{req.department}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="info" size="sm">{leaveTypeLabels[req.leaveType]}</Badge>
                        <span className="text-xs text-gray-400">{req.totalDays}d</span>
                        <span className="text-xs text-gray-300">•</span>
                        <span className="text-xs text-gray-400">
                          {formatDate(req.startDate, { month: 'short', day: 'numeric' })} - {formatDate(req.endDate, { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {hasChainInfo && (
                        <div className="hidden sm:flex items-center gap-1">
                          {req.approvals.map((a, i) => (
                            <div
                              key={i}
                              className={cn(
                                'flex h-5 w-5 items-center justify-center rounded-full text-[8px] font-bold text-white',
                                a.status === 'approved' ? 'bg-green-500' :
                                a.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                              )}
                              title={`L${a.level}: ${a.approver} - ${a.status}`}
                            >
                              {i + 1}
                            </div>
                          ))}
                        </div>
                      )}
                      <Badge variant={statusBadge[req.status]} size="sm">{req.status}</Badge>
                      {expandedId === req.id ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                    </div>
                  </div>
                  {expandedId === req.id && (
                    <div className="bg-gray-50 px-6 py-4 dark:bg-gray-800/50 space-y-3">
                      <p className="text-xs text-gray-500">{req.reason}</p>
                      <div className="flex items-start gap-0">
                        {req.approvals.map((a, i) => (
                          <div key={i} className="flex items-center flex-1">
                            <div className="flex items-center gap-2">
                              <div className={cn(
                                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white',
                                a.status === 'approved' ? 'bg-green-500' :
                                a.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                              )}>
                                {a.level === 1 ? <Users className="h-4 w-4" /> : a.level === 2 ? <Building2 className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                              </div>
                              <div>
                                <p className={cn(
                                  'text-xs font-medium',
                                  a.status === 'approved' ? 'text-green-700 dark:text-green-400' :
                                  a.status === 'rejected' ? 'text-red-700 dark:text-red-400' : 'text-gray-500'
                                )}>
                                  {a.approver}
                                </p>
                                <p className="text-[10px] text-gray-400">{a.role} • L{a.level}</p>
                                <p className={cn(
                                  'text-[10px] font-medium capitalize',
                                  a.status === 'approved' ? 'text-green-600' :
                                  a.status === 'rejected' ? 'text-red-600' : 'text-gray-400'
                                )}>
                                  {a.status}
                                </p>
                                {a.comment && <p className="text-[10px] text-gray-400 italic mt-0.5">"{a.comment}"</p>}
                              </div>
                            </div>
                            {i < req.approvals.length - 1 && (
                              <div className={cn(
                                'flex-1 h-px mx-3 mt-4',
                                a.status === 'approved' ? 'bg-green-300' : 'bg-gray-200 dark:bg-gray-700'
                              )} />
                            )}
                          </div>
                        ))}
                      </div>
                      {req.status === 'pending' && currentLevel && (
                        <div className="flex gap-2 pt-2">
                          <Button size="sm" variant="outline" className="text-green-600 border-green-300 hover:bg-green-50">
                            <Check className="h-3.5 w-3.5 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
                            <X className="h-3.5 w-3.5 mr-1" /> Reject
                          </Button>
                          {currentLevel.level > 1 && (
                            <span className="text-[10px] text-gray-400 self-center ml-2">
                              Current: Level {currentLevel.level} ({currentLevel.approver})
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
        {filtered.length > 0 && (
          <div className="flex items-center justify-between border-t px-6 py-3 dark:border-gray-800">
            <span className="text-xs text-gray-400">{filtered.length} total requests</span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(p => p - 1)}
                className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={cn(
                    'flex h-7 w-7 items-center justify-center rounded text-xs font-medium',
                    page === i + 1 ? 'bg-gray-900 text-white dark:bg-white dark:text-gray-900' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={page >= totalPages}
                onClick={() => setPage(p => p + 1)}
                className="rounded px-2 py-1 text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30 dark:hover:bg-gray-800"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <Sparkles className="h-4 w-4 text-purple-500" />
            Approval Routing Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { rule: 'Skip Level 2', desc: 'Leaves under 3 days bypass Department Head approval and go directly to HR if needed.', icon: ChevronRight },
              { rule: 'Auto-Approval', desc: 'Sick leave under 2 consecutive days is auto-approved without manager review.', icon: Check },
              { rule: 'HR Escalation', desc: 'Leaves over 14 days or maternity/paternity are automatically escalated to HR Admin.', icon: Shield },
            ].map(r => (
              <div key={r.rule} className="rounded-lg border p-3 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-1">
                  <r.icon className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{r.rule}</span>
                </div>
                <p className="text-xs text-gray-500">{r.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
