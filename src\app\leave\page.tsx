'use client';

import { useState, useMemo } from 'react';
import {
  Plus, CalendarDays, Clock, CheckCircle, XCircle, AlertCircle,
  Users, Sparkles, ChevronRight, ChevronDown, Search, RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import type { LeaveTypeCode, LeaveStatus } from '@/types';

const leaveTypes: { code: LeaveTypeCode; label: string; color: string }[] = [
  { code: 'annual', label: 'Annual Leave', color: 'bg-blue-500' },
  { code: 'sick', label: 'Sick Leave', color: 'bg-red-500' },
  { code: 'personal', label: 'Personal Leave', color: 'bg-amber-500' },
  { code: 'emergency', label: 'Emergency Leave', color: 'bg-orange-500' },
  { code: 'maternity', label: 'Maternity Leave', color: 'bg-pink-500' },
  { code: 'paternity', label: 'Paternity Leave', color: 'bg-purple-500' },
  { code: 'hajj', label: 'Hajj Leave', color: 'bg-indigo-500' },
  { code: 'unpaid', label: 'Unpaid Leave', color: 'bg-gray-500' },
  { code: 'study', label: 'Study Leave', color: 'bg-teal-500' },
];

const mockBalances = [
  { leaveType: 'annual' as LeaveTypeCode, entitlement: 30, used: 12, carriedOver: 5 },
  { leaveType: 'sick' as LeaveTypeCode, entitlement: 14, used: 3, carriedOver: 0 },
  { leaveType: 'personal' as LeaveTypeCode, entitlement: 5, used: 2, carriedOver: 0 },
  { leaveType: 'emergency' as LeaveTypeCode, entitlement: 3, used: 0, carriedOver: 0 },
  { leaveType: 'maternity' as LeaveTypeCode, entitlement: 90, used: 0, carriedOver: 0 },
  { leaveType: 'paternity' as LeaveTypeCode, entitlement: 3, used: 1, carriedOver: 0 },
  { leaveType: 'hajj' as LeaveTypeCode, entitlement: 15, used: 0, carriedOver: 0 },
  { leaveType: 'unpaid' as LeaveTypeCode, entitlement: 30, used: 0, carriedOver: 0 },
  { leaveType: 'study' as LeaveTypeCode, entitlement: 10, used: 0, carriedOver: 0 },
];

const mockRequests = Array.from({ length: 8 }, (_, i) => ({
  id: `lr-${i + 1}`,
  employee: ['Ahmad Khaled', 'Sarah Johnson', 'Michael Brown', 'Nora Hassan', 'Jennifer Lee', 'Robert Wilson', 'James Taylor', 'Lisa Anderson'][i],
  department: ['Engineering', 'HR', 'Finance', 'Sales', 'Marketing', 'Engineering', 'Engineering', 'HR'][i],
  avatar: ['Ahmad Khaled', 'Sarah Johnson', 'Michael Brown', 'Nora Hassan', 'Jennifer Lee', 'Robert Wilson', 'James Taylor', 'Lisa Anderson'][i],
  leaveType: (['annual', 'sick', 'personal', 'emergency', 'annual', 'personal', 'sick', 'annual'] as LeaveTypeCode[])[i],
  startDate: `2026-06-${10 + i}`,
  endDate: `2026-06-${12 + i}`,
  totalDays: 1 + (i % 3),
  status: (['pending', 'approved', 'approved', 'rejected', 'pending', 'pending', 'approved', 'cancelled'] as LeaveStatus[])[i],
  reason: ['Family vacation', 'Medical appointment', 'Personal matters', 'Emergency', 'Annual trip', 'Family event', 'Rest', 'Personal'][i],
  approvals: [
    { level: 1, approver: 'Direct Manager', status: i < 2 ? 'approved' : i < 4 ? 'approved' : 'pending' },
    { level: 2, approver: 'Department Head', status: i < 4 ? 'approved' : i < 6 ? 'pending' : 'pending' },
    { level: 3, approver: 'HR Admin', status: i < 1 ? 'approved' : i < 5 ? 'pending' : 'rejected' },
  ],
}));

const statusBadge: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  pending: 'warning', approved: 'success', rejected: 'danger', cancelled: 'default',
};

const teamOnLeave = [
  { name: 'Sarah Johnson', dept: 'HR', type: 'Annual', days: 'Jun 15-19', avatar: 'Sarah Johnson' },
  { name: 'Michael Brown', dept: 'Finance', type: 'Sick', days: 'Jun 10-11', avatar: 'Michael Brown' },
  { name: 'Nora Hassan', dept: 'Sales', type: 'Hajj', days: 'Jun 20 - Jul 4', avatar: 'Nora Hassan' },
];

const aiResponses: Record<string, string> = {
  'balance': 'Your balances: Annual 18/30 days, Sick 11/14, Personal 3/5, Emergency 3/3, Hajj 15/15.',
  'annual': 'Annual Leave policy: 30 days/year, paid, can carry forward up to 10 days, encashable upon exit.',
  'sick': 'Sick Leave: 14 days/year, paid. Medical certificate required for absences over 2 consecutive days.',
  'maternity': 'Maternity Leave: 90 calendar days, paid. Eligible after 12 months of continuous service.',
  'pending': 'You have 3 pending requests awaiting approval. Check with your manager if urgent.',
};

function getAIResponse(query: string): string {
  const q = query.toLowerCase();
  for (const [key, resp] of Object.entries(aiResponses)) {
    if (q.includes(key)) return resp;
  }
  if (q.includes('policy') || q.includes('rule')) {
    return 'Leave policies are configured in Settings > Leave Types. Key rules: max 30 consecutive days for annual, carry-over capped at 10 days, sick leave >2 days needs certificate.';
  }
  if (q.includes('approv') || q.includes('workflow')) {
    return 'Leave requests follow a 3-level approval chain: Direct Manager → Department Head → HR Admin. Leaves under 3 days skip Level 2. Sick leave under 2 days auto-approves.';
  }
  return 'I can help with balances, policies, approvals, and leave types. Try: "How many sick days do I have?", "What is the maternity policy?", "Who approves my leave?"';
}

export default function LeavePage() {
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<string | null>(null);
  const [expandedBalance, setExpandedBalance] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ leaveType: '', startDate: '', endDate: '', reason: '' });

  const handleSubmitRequest = () => {
    console.log('Submit leave request', requestForm);
    setShowRequestModal(false);
    setRequestForm({ leaveType: '', startDate: '', endDate: '', reason: '' });
  };

  const filteredRequests = useMemo(() => {
    if (!search) return mockRequests;
    const q = search.toLowerCase();
    return mockRequests.filter(r =>
      r.employee.toLowerCase().includes(q) ||
      r.department.toLowerCase().includes(q) ||
      r.leaveType.toLowerCase().includes(q)
    );
  }, [search]);

  const stats = useMemo(() => ({
    total: mockRequests.length,
    pending: mockRequests.filter(r => r.status === 'pending').length,
    approved: mockRequests.filter(r => r.status === 'approved').length,
    rejected: mockRequests.filter(r => r.status === 'rejected').length,
  }), []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Leave Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Multi-level approval system with AI-powered assistant
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            leftIcon={<Sparkles className="h-4 w-4" />}
            onClick={() => setShowAIPanel(!showAIPanel)}
            className={showAIPanel ? 'bg-purple-50 border-purple-300 text-purple-700 dark:bg-purple-900/20 dark:border-purple-700' : ''}
          >
            AI Assistant
          </Button>
          <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowRequestModal(true)}>
            Request Leave
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: 'Total Requests', value: stats.total, icon: Clock, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Pending Approval', value: stats.pending, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Approved', value: stats.approved, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
          { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-950/30' },
        ].map(stat => (
          <Card key={stat.label}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn('rounded-lg p-2.5', stat.bg)}>
                <stat.icon className={cn('h-5 w-5', stat.color)} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-5">
        <div className={cn('flex-1 min-w-0 space-y-5', showAIPanel && 'lg:w-2/3')}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Leave Balances
                <Badge variant="primary" size="sm">{mockBalances.length} types</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {mockBalances.map(b => {
                  const lt = leaveTypes.find(t => t.code === b.leaveType);
                  const remaining = b.entitlement + (b.carriedOver || 0) - b.used;
                  const pct = (b.used / b.entitlement) * 100;
                  const isExpanded = expandedBalance === b.leaveType;
                  return (
                    <div
                      key={b.leaveType}
                      className={cn(
                        'rounded-lg border p-3 transition-all cursor-pointer hover:shadow-sm',
                        isExpanded ? 'ring-2 ring-gray-300 dark:ring-gray-600' : ''
                      )}
                      onClick={() => setExpandedBalance(isExpanded ? null : b.leaveType)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn('h-3 w-3 rounded-full', lt?.color)} />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{lt?.label}</span>
                        </div>
                        <span className={cn(
                          'text-xs font-semibold',
                          remaining < 3 ? 'text-red-600' : remaining < 8 ? 'text-amber-600' : 'text-green-600'
                        )}>
                          {remaining} left
                        </span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: lt?.color.replace('bg-', '#').replace('-500', '') ?
                              ({ blue: '#3B82F6', red: '#EF4444', amber: '#F59E0B', orange: '#F97316', pink: '#EC4899', purple: '#A855F7', indigo: '#6366F1', gray: '#6B7280', teal: '#14B8A6' } as Record<string, string>)[lt.color.replace('bg-', '').replace('-500', '')] || '#3B82F6'
                              : '#3B82F6'
                          }}
                        />
                      </div>
                      <div className="flex items-center justify-between mt-1.5">
                        <span className="text-[10px] text-gray-400">{b.used} used / {b.entitlement} total</span>
                        {isExpanded && b.carriedOver > 0 && (
                          <span className="text-[10px] text-gray-400">Carry-over: {b.carriedOver}d</span>
                        )}
                      </div>
                      {isExpanded && (
                        <div className="mt-2 pt-2 border-t text-xs text-gray-500 dark:text-gray-400 space-y-1 dark:border-gray-700">
                          <p>{lt?.label} policy: {b.entitlement} days/year, {'paid' in b ? 'paid' : lt?.code === 'unpaid' ? 'unpaid' : 'paid'}.</p>
                          {(b.carriedOver || 0) > 0 && <p>Carried over: {b.carriedOver}d from previous year.</p>}
                          {b.leaveType === 'annual' && <p>Carry forward up to 10 days. Encashable on exit.</p>}
                          {b.leaveType === 'sick' && <p>Medical certificate required if &gt;2 consecutive days.</p>}
                          {b.leaveType === 'maternity' && <p>Eligible after 12 months of continuous service.</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Multi-Level Approval Workflow</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search requests..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="h-8 w-48 rounded-md border border-gray-200 bg-white pl-8 pr-2 text-xs outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                  />
                </div>
                <Badge variant="primary" size="sm">{filteredRequests.length} requests</Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y dark:divide-gray-800">
                {filteredRequests.map(req => (
                  <div key={req.id}>
                    <div
                      className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer transition-colors"
                      onClick={() => setSelectedRequest(selectedRequest === req.id ? null : req.id)}
                    >
                      <Avatar name={req.employee} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{req.employee}</span>
                          <span className="text-xs text-gray-400">{req.department}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="info" size="sm">{leaveTypes.find(t => t.code === req.leaveType)?.label}</Badge>
                          <span className="text-xs text-gray-400">{req.totalDays} day{req.totalDays > 1 ? 's' : ''}</span>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-400">{req.startDate} - {req.endDate}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          {req.approvals.map((a, i) => (
                            <div
                              key={i}
                              className={cn(
                                'h-2 w-2 rounded-full',
                                a.status === 'approved' ? 'bg-green-500' :
                                a.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                              )}
                              title={`Level ${a.level}: ${a.approver} - ${a.status}`}
                            />
                          ))}
                        </div>
                        <Badge variant={statusBadge[req.status]} size="sm">{req.status}</Badge>
                        {selectedRequest === req.id ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                      </div>
                    </div>
                    {selectedRequest === req.id && (
                      <div className="bg-gray-50 px-6 py-4 dark:bg-gray-800/50">
                        <p className="text-xs text-gray-500 mb-3">{req.reason}</p>
                        <div className="flex items-center gap-0">
                          {req.approvals.map((a, i) => (
                            <div key={i} className="flex items-center flex-1">
                              <div className="flex items-center gap-2">
                                <div className={cn(
                                  'flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold text-white',
                                  a.status === 'approved' ? 'bg-green-500' :
                                  a.status === 'rejected' ? 'bg-red-500' : 'bg-gray-300 dark:bg-gray-600'
                                )}>
                                  {i + 1}
                                </div>
                                <div>
                                  <p className={cn(
                                    'text-xs font-medium',
                                    a.status === 'approved' ? 'text-green-700 dark:text-green-400' :
                                    a.status === 'rejected' ? 'text-red-700 dark:text-red-400' : 'text-gray-500'
                                  )}>
                                    {a.approver}
                                  </p>
                                  <p className="text-[10px] text-gray-400 capitalize">{a.status}</p>
                                </div>
                              </div>
                              {i < req.approvals.length - 1 && (
                                <div className={cn(
                                  'flex-1 h-px mx-2',
                                  a.status === 'approved' ? 'bg-green-300' : 'bg-gray-200 dark:bg-gray-700'
                                )} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {showAIPanel && (
          <Card className="w-full lg:w-[360px] shrink-0 self-start">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-purple-500" />
                AI Leave Assistant
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ask about leave policies..."
                  value={aiQuery}
                  onChange={e => setAiQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && aiQuery.trim()) {
                      setAiResponse(getAIResponse(aiQuery.trim()));
                    }
                  }}
                  className="w-full rounded-lg border border-gray-200 bg-white py-2 px-3 pr-8 text-sm outline-none focus:border-purple-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
                />
                <button
                  onClick={() => { if (aiQuery.trim()) setAiResponse(getAIResponse(aiQuery.trim())); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                >
                  <Sparkles className="h-4 w-4 text-purple-500" />
                </button>
              </div>
              {aiResponse && (
                <div className="rounded-lg border bg-purple-50 p-3 text-sm text-gray-700 dark:border-purple-900/50 dark:bg-purple-950/20 dark:text-gray-300">
                  {aiResponse}
                </div>
              )}
              <div className="space-y-1.5">
                <p className="text-[10px] font-medium uppercase text-gray-400">Try asking:</p>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'How many sick days do I have?',
                    'What is the maternity policy?',
                    'Tell me about the approval workflow',
                    'Who approves my leave?',
                  ].map(q => (
                    <button
                      key={q}
                      onClick={() => { setAiQuery(q); setAiResponse(getAIResponse(q)); }}
                      className="rounded-full border bg-white px-2.5 py-1 text-[11px] text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              <div className="pt-2 border-t dark:border-gray-700">
                <p className="text-[10px] font-medium uppercase text-gray-400 mb-2">Team on Leave</p>
                <div className="space-y-2">
                  {teamOnLeave.map(t => (
                    <div key={t.name} className="flex items-center gap-2">
                      <Avatar name={t.name} size="sm" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{t.name}</p>
                        <p className="text-[10px] text-gray-400">{t.type} • {t.days}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {!showAIPanel && (
        <div className="grid gap-5 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'New Request', icon: Plus, color: 'text-blue-600', desc: 'Submit a leave request', action: () => setShowRequestModal(true) },
                  { label: 'My Calendar', icon: CalendarDays, color: 'text-green-600', desc: 'View my schedule', action: () => {} },
                  { label: 'Team View', icon: Users, color: 'text-purple-600', desc: 'Team availability', action: () => {} },
                  { label: 'Leave Types', icon: Clock, color: 'text-amber-600', desc: 'Configure policies', action: () => {} },
                  { label: 'My Balance', icon: CheckCircle, color: 'text-emerald-600', desc: 'Check entitlement', action: () => {} },
                  { label: 'Carry-Over', icon: RefreshCw, color: 'text-indigo-600', desc: 'Process annual carry-over', action: async () => {
                    try {
                      const res = await fetch('/api/leave/carry-over', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ year: new Date().getFullYear() }),
                      });
                      const data = await res.json();
                      toast.success(`Carry-over complete: ${data.processed} entries`);
                    } catch { toast.error('Carry-over failed'); }
                  } },
                ].map(action => (
                  <button
                    key={action.label}
                    onClick={action.action}
                    className="flex flex-col items-center gap-1.5 rounded-lg border p-3 text-sm transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800"
                  >
                    <action.icon className={cn('h-5 w-5', action.color)} />
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                    <span className="text-[10px] text-gray-400 text-center">{action.desc}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-sm">
                <AlertCircle className="h-4 w-4 text-amber-500" />
                Approval Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pending your approval</span>
                <Badge variant="warning" size="sm">3</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Awaiting Level 2</span>
                <Badge variant="warning" size="sm">2</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Awaiting HR</span>
                <Badge variant="info" size="sm">1</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completed today</span>
                <Badge variant="success" size="sm">4</Badge>
              </div>
              <div className="pt-2 border-t dark:border-gray-700">
                <p className="text-xs text-gray-400">Avg approval time: <span className="font-medium text-gray-700 dark:text-gray-300">1.2 days</span></p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Modal isOpen={showRequestModal} onClose={() => setShowRequestModal(false)} title="Request Leave" size="md">
        <div className="space-y-4">
          <Select
            label="Leave Type"
            options={leaveTypes.map(lt => ({ value: lt.code, label: lt.label }))}
            value={requestForm.leaveType}
            onChange={(e: any) => setRequestForm({ ...requestForm, leaveType: e.target.value })}
            placeholder="Select leave type"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Date"
              type="date"
              value={requestForm.startDate}
              onChange={(e: any) => setRequestForm({ ...requestForm, startDate: e.target.value })}
            />
            <Input
              label="End Date"
              type="date"
              value={requestForm.endDate}
              onChange={(e: any) => setRequestForm({ ...requestForm, endDate: e.target.value })}
            />
          </div>
          <Input
            label="Reason"
            value={requestForm.reason}
            onChange={(e: any) => setRequestForm({ ...requestForm, reason: e.target.value })}
            placeholder="Optional reason for leave"
          />
          <div className="flex items-center justify-between pt-2">
            <p className="text-xs text-gray-400">Approval chain will route automatically</p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setShowRequestModal(false)}>Cancel</Button>
              <Button onClick={handleSubmitRequest}>Submit Request</Button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
