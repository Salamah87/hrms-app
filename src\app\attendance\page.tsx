'use client';

import { useState, useMemo } from 'react';
import { Calendar, LogIn, LogOut, Clock, Users, UserMinus, UserX, UserCheck, AlertTriangle, Fingerprint, BarChart3, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/empty-state';
import { CardSkeleton } from '@/components/ui/loading';
import { BarChart } from '@/components/ui/dynamic-chart';
import { formatDate } from '@/lib/utils';

const statusBadge: Record<string, 'success' | 'danger' | 'warning' | 'info' | 'default'> = {
  present: 'success',
  absent: 'danger',
  late: 'warning',
  'on-leave': 'info',
  'missing-punch': 'default',
};

const mockTodayRecords = Array.from({ length: 20 }, (_, i) => ({
  id: `att-${i + 1}`,
  employee: ['Ahmad Khaled', 'Sarah Johnson', 'Michael Brown', 'Nora Hassan', 'Robert Wilson', 'Jennifer Lee', 'James Taylor', 'Lisa Anderson', 'William Thomas', 'Amanda White'][i % 10],
  department: ['Engineering', 'Marketing', 'Sales', 'Finance', 'HR'][i % 5],
  clockIn: i % 7 === 0 ? null : `${7 + (i % 2)}:${String(15 * (i % 4)).padStart(2, '0')} ${i % 2 === 0 ? 'AM' : 'AM'}`,
  clockOut: i % 7 === 0 ? null : `${4 + (i % 3)}:${String(15 * (i % 3)).padStart(2, '0')} ${i % 2 === 0 ? 'PM' : 'PM'}`,
  status: (['present', 'present', 'present', 'absent', 'late', 'on-leave', 'missing-punch'] as const)[i % 7],
  hours: i % 7 === 0 ? 0 : 7 + (i % 3),
  lateMinutes: i % 5 === 0 ? 15 + (i * 3) : 0,
}));

const statCards = [
  { label: 'Present', value: 142, total: 180, icon: UserCheck, color: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400' },
  { label: 'Absent', value: 12, total: 180, icon: UserX, color: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400' },
  { label: 'Late', value: 8, total: 180, icon: UserMinus, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400' },
  { label: 'On Leave', value: 15, total: 180, icon: Users, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400' },
  { label: 'Missing Punch', value: 3, total: 180, icon: AlertTriangle, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400' },
];

const departments = [
  { value: '', label: 'All Departments' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Finance', label: 'Finance' },
  { value: 'HR', label: 'HR' },
];

const chartData = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() - (6 - i));
  return {
    day: d.toLocaleDateString('en-US', { weekday: 'short' }),
    Present: 140 + Math.floor(Math.random() * 20),
    Absent: 5 + Math.floor(Math.random() * 10),
    Late: 4 + Math.floor(Math.random() * 8),
  };
});

export default function AttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [departmentFilter, setDepartmentFilter] = useState('');
  const [isLoading] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [clockTime, setClockTime] = useState<string | null>(null);
  const [showCorrection, setShowCorrection] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [correctionInTime, setCorrectionInTime] = useState('09:00');
  const [correctionOutTime, setCorrectionOutTime] = useState('18:00');
  const [correctionMonth, setCorrectionMonth] = useState(() => {
    const d = new Date();
    return d.getMonth();
  });
  const [correctionYear, setCorrectionYear] = useState(() => {
    const d = new Date();
    return d.getFullYear();
  });

  interface MissedDay {
    day: number;
    missedIn: boolean;
    missedOut: boolean;
    clockInTime?: string;
    clockOutTime?: string;
  }

  const missedDays = useMemo(() => {
    const days: MissedDay[] = [];
    const year = correctionYear;
    const month = correctionMonth;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    for (let day = 1; day <= daysInMonth; day++) {
      if (Math.random() < 0.2) {
        const missedIn = Math.random() < 0.6;
        const missedOut = !missedIn || Math.random() < 0.4;
        days.push({
          day,
          missedIn,
          missedOut,
          clockInTime: missedIn ? undefined : `${7 + Math.floor(Math.random() * 2)}:${String(Math.floor(Math.random() * 4) * 15).padStart(2, '0')} AM`,
          clockOutTime: missedOut ? undefined : `${4 + Math.floor(Math.random() * 3)}:${String(Math.floor(Math.random() * 4) * 15).padStart(2, '0')} PM`,
        });
      }
    }
    return days;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [correctionMonth, correctionYear]);

  const [correctionType, setCorrectionType] = useState<{ addIn: boolean; addOut: boolean }>({ addIn: false, addOut: false });

  const handleCheckIn = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setIsCheckedIn(true);
    setClockTime(time);
    toast.success(`Checked in at ${time}`);
  };

  const handleCheckOut = () => {
    if (!isCheckedIn) {
      toast.error('You need to check in first');
      return;
    }
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setIsCheckedIn(false);
    setClockTime(null);
    toast.success(`Checked out at ${time}`);
  };

  const handleCorrectionRequest = () => {
    setShowCorrection(true);
    setSelectedDate(null);
    setCorrectionType({ addIn: false, addOut: false });
    setCorrectionInTime('09:00');
    setCorrectionOutTime('18:00');
    const d = new Date();
    setCorrectionMonth(d.getMonth());
    setCorrectionYear(d.getFullYear());
  };

  const selectCorrectionDay = (day: number) => {
    const dateStr = formatSelected(day);
    setSelectedDate(dateStr);
    setCorrectionType({ addIn: false, addOut: false });
    const info = missedDays.find((m) => m.day === day);
    if (info) {
      setCorrectionType({ addIn: info.missedIn, addOut: info.missedOut });
    }
  };

  const submitCorrection = () => {
    if (!selectedDate) return;
    const parts: string[] = [];
    if (correctionType.addIn) parts.push(`In at ${correctionInTime}`);
    if (correctionType.addOut) parts.push(`Out at ${correctionOutTime}`);
    const detail = parts.length ? ` (${parts.join(', ')})` : '';
    toast.success(`Correction submitted for ${selectedDate}${detail}`);
    setShowCorrection(false);
  };

  const firstDayOfMonth = new Date(correctionYear, correctionMonth, 1).getDay();
  const daysInMonth = new Date(correctionYear, correctionMonth + 1, 0).getDate();
  const monthName = new Date(correctionYear, correctionMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const today = new Date().getDate();
  const isCurrentMonth = new Date().getMonth() === correctionMonth && new Date().getFullYear() === correctionYear;

  const prevMonth = () => {
    if (correctionMonth === 0) {
      setCorrectionMonth(11);
      setCorrectionYear((y) => y - 1);
    } else {
      setCorrectionMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (correctionMonth === 11) {
      setCorrectionMonth(0);
      setCorrectionYear((y) => y + 1);
    } else {
      setCorrectionMonth((m) => m + 1);
    }
  };

  const formatSelected = (day: number) => {
    return `${correctionYear}-${String(correctionMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const filtered = useMemo(() => {
    if (!departmentFilter) return mockTodayRecords;
    return mockTodayRecords.filter((r) => r.department === departmentFilter);
  }, [departmentFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track employee attendance and punctuality</p>
        </div>
        <CardSkeleton count={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track employee attendance and punctuality</p>
        </div>
        <div className="flex items-center gap-3">
          <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-44" />
          <Select
            options={departments}
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => {
          const pct = Math.round((stat.value / stat.total) * 100);
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 px-6 py-5">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  <p className="text-xs text-gray-400">{pct}% of total</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Today&apos;s Attendance</CardTitle>
            <div className="flex items-center gap-2">
              <Badge variant="success" size="sm">{filtered.filter((r) => r.status === 'present').length} Present</Badge>
              <Badge variant="danger" size="sm">{filtered.filter((r) => r.status === 'absent').length} Absent</Badge>
              <Badge variant="warning" size="sm">{filtered.filter((r) => r.status === 'late').length} Late</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table
              columns={[
                { key: 'employee', header: 'Employee', sortable: true },
                { key: 'department', header: 'Department', sortable: true },
                {
                  key: 'clockIn', header: 'Clock In',
                  render: (item: any) => (
                    <span className={`text-sm ${!item.clockIn ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {item.clockIn || '—'}
                    </span>
                  ),
                },
                {
                  key: 'clockOut', header: 'Clock Out',
                  render: (item: any) => (
                    <span className={`text-sm ${!item.clockOut ? 'text-gray-400' : 'text-gray-700 dark:text-gray-300'}`}>
                      {item.clockOut || '—'}
                    </span>
                  ),
                },
                {
                  key: 'status', header: 'Status',
                  render: (item: any) => (
                    <Badge variant={statusBadge[item.status]}>{item.status}</Badge>
                  ),
                },
                {
                  key: 'hours', header: 'Hours',
                  render: (item: any) => (
                    <span className="text-sm text-gray-700 dark:text-gray-300">{item.hours}h</span>
                  ),
                },
                {
                  key: 'lateMinutes', header: 'Late',
                  render: (item: any) => (
                    <span className={`text-sm ${item.lateMinutes > 0 ? 'text-red-600 font-medium' : 'text-gray-400'}`}>
                      {item.lateMinutes > 0 ? `${item.lateMinutes}m` : '—'}
                    </span>
                  ),
                },
              ]}
              data={filtered as any[]}
              keyExtractor={(item) => item.id as string}
              sortable
              emptyState={
                <EmptyState icon={Fingerprint} title="No attendance records found" description="Try adjusting your filters" />
              }
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button size="lg" className="w-full" leftIcon={<LogIn className="h-5 w-5" />} onClick={handleCheckIn} disabled={isCheckedIn}>
                {isCheckedIn ? `Checked in at ${clockTime}` : 'Check In'}
              </Button>
              <Button size="lg" variant="outline" className="w-full" leftIcon={<LogOut className="h-5 w-5" />} onClick={handleCheckOut}>
                Check Out
              </Button>
              <Button variant="ghost" className="w-full" leftIcon={<Fingerprint className="h-4 w-4" />} onClick={handleCorrectionRequest}>
                Request Correction
              </Button>
              {isCheckedIn && (
                <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <Clock className="h-4 w-4" />
                  <span>Clocked in at {clockTime}</span>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Weekly Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={chartData}
                xKey="day"
                bars={[
                  { key: 'Present', color: '#10B981' },
                  { key: 'Absent', color: '#EF4444' },
                  { key: 'Late', color: '#F59E0B' },
                ]}
                height={220}
              />
            </CardContent>
          </Card>
        </div>
      </div>

      {showCorrection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowCorrection(false)}>
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-gray-900" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Request Attendance Correction</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Select a missed day and describe the correction</p>

            <div className="mt-4">
              <div className="flex items-center justify-between">
                <button onClick={prevMonth} className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-sm font-medium text-gray-900 dark:text-white">{monthName}</span>
                <button onClick={nextMonth} className="rounded p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid grid-cols-7 gap-1 text-center text-xs font-medium text-gray-500">
                {['Su','Mo','Tu','We','Th','Fr','Sa'].map((d) => (
                  <div key={d} className="py-1">{d}</div>
                ))}
              </div>

              <div className="mt-1 grid grid-cols-7 gap-1">
                {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                  <div key={`empty-${i}`} />
                ))}
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                  const info = missedDays.find((m) => m.day === day);
                  const isMissed = !!info;
                  const isSelected = selectedDate === formatSelected(day);
                  const isToday = isCurrentMonth && day === today;
                  return (
                    <button
                      key={day}
                      onClick={() => selectCorrectionDay(day)}
                      className={`
                        relative flex items-center justify-center rounded-lg py-2 text-sm transition-colors
                        ${isSelected
                          ? 'bg-blue-600 text-white'
                          : isToday
                            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      {day}
                      {isMissed && (
                        <>
                          {info?.missedIn && <span className="absolute top-0 left-0.5 h-1.5 w-1.5 rounded-full bg-red-500" />}
                          {info?.missedOut && <span className="absolute top-0 right-0.5 h-1.5 w-1.5 rounded-full bg-red-500" />}
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedDate && (() => {
              const dayNum = parseInt(selectedDate.split('-')[2]);
              const info = missedDays.find((m) => m.day === dayNum);
              return (
                <div className="mt-4 space-y-3">
                  <div className="rounded-lg bg-gray-50 p-3 text-sm dark:bg-gray-800">
                    <span className="font-medium text-gray-900 dark:text-white">Selected: </span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {new Date(selectedDate + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>

                  {info && (
                    <div className="space-y-2 rounded-lg border p-3 dark:border-gray-700">
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Punch Status</p>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Check In:
                          {info.clockInTime ? <span className="ml-1 font-medium text-green-600">{info.clockInTime}</span> : <span className="ml-1 text-red-500">Missed</span>}
                        </span>
                        {info.missedIn && (
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={correctionType.addIn}
                              onChange={(e) => setCorrectionType((prev) => ({ ...prev, addIn: e.target.checked }))}
                              className="rounded border-gray-300 text-blue-600"
                            />
                            Add In
                          </label>
                        )}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Check Out:
                          {info.clockOutTime ? <span className="ml-1 font-medium text-green-600">{info.clockOutTime}</span> : <span className="ml-1 text-red-500">Missed</span>}
                        </span>
                        {info.missedOut && (
                          <label className="flex items-center gap-2 text-sm cursor-pointer">
                            <input
                              type="checkbox"
                              checked={correctionType.addOut}
                              onChange={(e) => setCorrectionType((prev) => ({ ...prev, addOut: e.target.checked }))}
                              className="rounded border-gray-300 text-blue-600"
                            />
                            Add Out
                          </label>
                        )}
                      </div>
                    </div>
                  )}

                  {correctionType.addIn && (
                    <div className="flex items-center gap-3 rounded-lg border p-3 dark:border-gray-700">
                      <LogIn className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Check In time:</span>
                      <input
                        type="time"
                        value={correctionInTime}
                        onChange={(e) => setCorrectionInTime(e.target.value)}
                        className="ml-auto rounded border px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600"
                      />
                    </div>
                  )}
                  {correctionType.addOut && (
                    <div className="flex items-center gap-3 rounded-lg border p-3 dark:border-gray-700">
                      <LogOut className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Check Out time:</span>
                      <input
                        type="time"
                        value={correctionOutTime}
                        onChange={(e) => setCorrectionOutTime(e.target.value)}
                        className="ml-auto rounded border px-2 py-1 text-sm dark:bg-gray-800 dark:border-gray-600"
                      />
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="mt-5 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowCorrection(false)}>Cancel</Button>
              <Button onClick={submitCorrection} disabled={!selectedDate || (!correctionType.addIn && !correctionType.addOut)}>
                Submit Request
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

