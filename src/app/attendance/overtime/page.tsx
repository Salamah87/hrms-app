'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Clock, CheckCircle, XCircle, Timer, CalendarClock, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { EmptyState } from '@/components/ui/empty-state';
import { CardSkeleton } from '@/components/ui/loading';
import type { OvertimeRequest, OvertimePolicy, Employee } from '@/types';

const statusBadge: Record<string, 'warning' | 'success' | 'danger' | 'default'> = {
  pending: 'warning', approved: 'success', rejected: 'danger', cancelled: 'default',
};

function toHourly(salary: number, salaryType?: string): number {
  if (!salary) return 0;
  if (salaryType === 'hourly') return salary;
  if (salaryType === 'daily') return salary / 8;
  if (salaryType === 'weekly') return salary / (5 * 8);
  return salary / (30 * 8);
}

export default function OvertimeDashboard() {
  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [policies, setPolicies] = useState<OvertimePolicy[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const [employeeId, setEmployeeId] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('18:00');
  const [endTime, setEndTime] = useState('20:00');
  const [reason, setReason] = useState('');

  const fetchData = useCallback(async () => {
    try {
      const [reqRes, polRes, empRes] = await Promise.all([
        fetch('/api/overtime/requests'),
        fetch('/api/overtime/policies'),
        fetch('/api/employees'),
      ]);
      setRequests(await reqRes.json());
      setPolicies(await polRes.json());
      setEmployees(await empRes.json());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async () => {
    if (!employeeId || !date || !startTime || !endTime) return;
    await fetch('/api/overtime/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, date, startTime, endTime, reason }),
    });
    setModalOpen(false);
    setEmployeeId(''); setDate(''); setStartTime('18:00'); setEndTime('20:00'); setReason('');
    await fetchData();
  };

  const activePolicy = policies.find(p => p.active);

  const selectedEmployee = employees.find(e => e.employeeNumber === employeeId);
  const hourlyRate = selectedEmployee ? toHourly(selectedEmployee.salary || 0, selectedEmployee.salaryType) : 0;

  const computedHours = date && startTime && endTime
    ? Math.round(
        ((parseFloat(endTime.split(':')[0]) + parseFloat(endTime.split(':')[1]) / 60) -
         (parseFloat(startTime.split(':')[0]) + parseFloat(startTime.split(':')[1]) / 60)) * 10
      ) / 10
    : 0;
  const dayType = date
    ? (new Date(date).getDay() === 0 || new Date(date).getDay() === 6 ? 'weekend' : 'weekday')
    : 'weekday';
  const rateMultiplier = activePolicy
    ? (dayType === 'weekend' ? activePolicy.weekendRate : dayType === 'public_holiday' ? activePolicy.holidayRate : activePolicy.weekdayRate)
    : 1.5;
  const estimatedAmount = hourlyRate && computedHours ? hourlyRate * rateMultiplier * computedHours : 0;

  const stats = [
    { label: 'Total Requests', value: requests.length, icon: Clock, color: 'text-blue-600' },
    { label: 'Approved', value: requests.filter(r => r.status === 'approved').length, icon: CheckCircle, color: 'text-green-600' },
    { label: 'Pending', value: requests.filter(r => r.status === 'pending').length, icon: Users, color: 'text-yellow-600' },
    { label: 'Rejected', value: requests.filter(r => r.status === 'rejected').length, icon: XCircle, color: 'text-red-600' },
  ];
  const totalHours = requests.filter(r => r.status === 'approved').reduce((s, r) => s + r.totalHours, 0);

  const columns = [
    { key: 'date', header: 'Date', render: (r: OvertimeRequest) => r.date },
    { key: 'time', header: 'Time', render: (r: OvertimeRequest) => `${r.startTime}–${r.endTime}` },
    { key: 'hours', header: 'Hours', render: (r: OvertimeRequest) => `${r.totalHours}h` },
    {
      key: 'dayType', header: 'Type',
      render: (r: OvertimeRequest) => (
        <Badge variant={r.dayType === 'weekend' ? 'warning' : r.dayType === 'public_holiday' ? 'danger' : 'primary'} size="sm">{r.dayType}</Badge>
      ),
    },
    { key: 'rate', header: 'Rate', render: (r: OvertimeRequest) => `${r.rateMultiplier}x` },
    {
      key: 'status', header: 'Status',
      render: (r: OvertimeRequest) => <Badge variant={statusBadge[r.status]} size="sm">{r.status}</Badge>,
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Overtime Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Submit and manage overtime requests</p>
        </div>
        <Button leftIcon={<Plus className="h-4 w-4" />} onClick={() => setModalOpen(true)}>New Request</Button>
      </div>

      {loading ? (
        <CardSkeleton count={4} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map(s => (
            <Card key={s.label}>
              <CardContent className="flex items-center gap-4 p-6">
                <div className={`rounded-lg bg-gray-100 p-3 dark:bg-gray-800 ${s.color}`}>
                  <s.icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {activePolicy && (
        <Card>
          <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-violet-100 p-2 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300">
                <CalendarClock className="h-5 w-5" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">Active Policy: {activePolicy.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Max {activePolicy.maxHoursPerMonth}h/month &middot; Min {activePolicy.minClaimableHours}h claim &middot; Max {activePolicy.maxHoursPerRequest}h/request
                </p>
              </div>
            </div>
            <Badge variant="primary">
              {activePolicy.weekdayRate}x weekday / {activePolicy.weekendRate}x weekend / {activePolicy.holidayRate}x holiday
            </Badge>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Requests</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="primary">{totalHours}h total approved</Badge>
            <Button variant="secondary" size="sm" onClick={() => window.location.href = '/attendance/overtime/requests'}>View All</Button>
            <Button variant="ghost" size="sm" onClick={() => window.location.href = '/attendance/overtime/policies'}>Policies</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table
            columns={columns}
            data={requests.slice(0, 10) as any}
            keyExtractor={(r: any) => r.id}
            emptyState={<EmptyState icon={Timer} title="No requests yet" description="Click 'New Request' to submit overtime." />}
          />
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="New Overtime Request" size="md">
        <div className="space-y-4">
          <Select
            label="Employee"
            value={employeeId}
            onChange={e => setEmployeeId(e.target.value)}
            options={[
              { value: '', label: 'Select employee' },
              ...employees.map(e => ({ value: e.employeeNumber, label: `${e.fullName} (${e.employeeNumber})` })),
            ]}
          />
          <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Time" type="time" value={startTime} onChange={e => setStartTime(e.target.value)} />
            <Input label="End Time" type="time" value={endTime} onChange={e => setEndTime(e.target.value)} />
          </div>
          {computedHours > 0 && (
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-900/20">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <span className="text-gray-500 dark:text-gray-400">Duration</span>
                <span className="text-right font-medium text-gray-900 dark:text-white">{computedHours}h</span>
                <span className="text-gray-500 dark:text-gray-400">Day type</span>
                <span className="text-right font-medium text-gray-900 dark:text-white capitalize">{dayType}</span>
                <span className="text-gray-500 dark:text-gray-400">Rate multiplier</span>
                <span className="text-right font-medium text-gray-900 dark:text-white">{rateMultiplier}x</span>
                <span className="text-gray-500 dark:text-gray-400">Hourly rate</span>
                <span className="text-right font-medium text-gray-900 dark:text-white">${hourlyRate.toFixed(2)}</span>
                <span className="text-base font-semibold text-gray-900 dark:text-white">Estimated pay</span>
                <span className="text-right text-base font-bold text-green-600 dark:text-green-400">${estimatedAmount.toFixed(2)}</span>
              </div>
            </div>
          )}
          <Input label="Reason" value={reason} onChange={e => setReason(e.target.value)} placeholder="Why is overtime needed?" />
          <Button className="w-full" leftIcon={<Plus className="h-4 w-4" />} onClick={handleSubmit}>Submit Request</Button>
        </div>
      </Modal>
    </div>
  );
}
