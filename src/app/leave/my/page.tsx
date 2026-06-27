'use client';

import { useState, useMemo } from 'react';
import {
  Plus, CalendarDays, Clock, CheckCircle, XCircle, AlertCircle,
  FileText, ChevronRight, ChevronDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
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
];

const myBalances = [
  { leaveType: 'annual' as LeaveTypeCode, entitlement: 30, used: 12, pending: 3 },
  { leaveType: 'sick' as LeaveTypeCode, entitlement: 14, used: 3, pending: 0 },
  { leaveType: 'personal' as LeaveTypeCode, entitlement: 5, used: 2, pending: 1 },
  { leaveType: 'emergency' as LeaveTypeCode, entitlement: 3, used: 0, pending: 0 },
  { leaveType: 'hajj' as LeaveTypeCode, entitlement: 15, used: 0, pending: 0 },
  { leaveType: 'unpaid' as LeaveTypeCode, entitlement: 30, used: 0, pending: 0 },
];

const myRequests = [
  { id: '1', type: 'annual' as LeaveTypeCode, start: '2026-07-01', end: '2026-07-05', days: 5, status: 'approved' as LeaveStatus, reason: 'Family vacation' },
  { id: '2', type: 'personal' as LeaveTypeCode, start: '2026-06-25', end: '2026-06-25', days: 1, status: 'pending' as LeaveStatus, reason: 'Personal errand' },
  { id: '3', type: 'sick' as LeaveTypeCode, start: '2026-06-10', end: '2026-06-11', days: 2, status: 'approved' as LeaveStatus, reason: 'Medical leave' },
  { id: '4', type: 'annual' as LeaveTypeCode, start: '2026-05-01', end: '2026-05-03', days: 3, status: 'rejected' as LeaveStatus, reason: 'Peak season request' },
];

const statusBadge: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  pending: 'warning', approved: 'success', rejected: 'danger', cancelled: 'default',
};

export default function MyLeavePage() {
  const [expandedRequest, setExpandedRequest] = useState<string | null>(null);
  const [tab, setTab] = useState<'balance' | 'history'>('balance');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({ leaveType: '', startDate: '', endDate: '', reason: '' });

  const handleSubmitRequest = () => {
    console.log('Submit request', requestForm);
    setShowRequestModal(false);
    setRequestForm({ leaveType: '', startDate: '', endDate: '', reason: '' });
  };

  const totals = useMemo(() => ({
    used: myBalances.reduce((s, b) => s + b.used, 0),
    pending: myBalances.reduce((s, b) => s + b.pending, 0),
    remaining: myBalances.reduce((s, b) => s + (b.entitlement - b.used - b.pending), 0),
  }), []);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Leave</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track your balances and requests</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowRequestModal(true)}>Request Leave</Button>
      </div>

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
            <Input label="Start Date" type="date" value={requestForm.startDate}
              onChange={(e: any) => setRequestForm({ ...requestForm, startDate: e.target.value })} />
            <Input label="End Date" type="date" value={requestForm.endDate}
              onChange={(e: any) => setRequestForm({ ...requestForm, endDate: e.target.value })} />
          </div>
          <Input label="Reason" value={requestForm.reason}
            onChange={(e: any) => setRequestForm({ ...requestForm, reason: e.target.value })}
            placeholder="Optional reason for leave" />
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowRequestModal(false)}>Cancel</Button>
            <Button onClick={handleSubmitRequest}>Submit</Button>
          </div>
        </div>
      </Modal>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Total Used', value: totals.used, icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'Pending', value: totals.pending, icon: AlertCircle, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Remaining', value: totals.remaining, icon: Clock, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
          { label: 'Total Requests', value: myRequests.length, icon: FileText, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
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

      <div className="flex gap-2 border-b dark:border-gray-800">
        {(['balance', 'history'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 transition-colors',
              tab === t
                ? 'border-gray-900 text-gray-900 dark:border-white dark:text-white'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            )}
          >
            {t === 'balance' ? 'Leave Balances' : 'Request History'}
          </button>
        ))}
      </div>

      {tab === 'balance' ? (
        <Card>
          <CardContent className="p-5 space-y-4">
            {myBalances.map(b => {
              const lt = leaveTypes.find(t => t.code === b.leaveType);
              const available = b.entitlement - b.used - b.pending;
              const pct = ((b.used + b.pending) / b.entitlement) * 100;
              return (
                <div key={b.leaveType} className="flex items-center gap-4">
                  <div className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white text-xs font-bold', lt?.color)}>
                    {b.used}/{b.entitlement}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{lt?.label}</span>
                        {b.pending > 0 && <Badge variant="warning" size="sm" className="ml-2">{b.pending} pending</Badge>}
                      </div>
                      <span className="text-xs text-gray-500">{available} available</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                      <div className="h-2 rounded-full bg-blue-500 transition-all" style={{ width: `${Math.min(pct, 100)}%` }} />
                    </div>
                    <div className="flex justify-between mt-0.5">
                      <span className="text-[10px] text-gray-400">{b.used} used</span>
                      <span className="text-[10px] text-gray-400">{b.entitlement} total</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y dark:divide-gray-800">
            {myRequests.map(req => (
              <div key={req.id}>
                <div
                  className="flex items-center gap-4 px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
                  onClick={() => setExpandedRequest(expandedRequest === req.id ? null : req.id)}
                >
                  <div className={cn('h-8 w-8 rounded-lg flex items-center justify-center text-white text-xs font-bold', leaveTypes.find(t => t.code === req.type)?.color)}>
                    {req.type.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{leaveTypes.find(t => t.code === req.type)?.label}</p>
                    <p className="text-xs text-gray-400">{req.start} - {req.end} • {req.days} day{req.days > 1 ? 's' : ''}</p>
                  </div>
                  <Badge variant={statusBadge[req.status]} size="sm">{req.status}</Badge>
                  {expandedRequest === req.id ? <ChevronDown className="h-4 w-4 text-gray-400" /> : <ChevronRight className="h-4 w-4 text-gray-400" />}
                </div>
                {expandedRequest === req.id && (
                  <div className="px-6 pb-3 text-xs text-gray-500 dark:text-gray-400">
                    <p><span className="font-medium text-gray-700 dark:text-gray-300">Reason:</span> {req.reason}</p>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
