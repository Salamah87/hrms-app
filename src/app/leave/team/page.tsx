'use client';

import { useState, useMemo } from 'react';
import { Users, CalendarDays, MapPin, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';

const teamMembers = [
  { name: 'Ahmad Khaled', dept: 'Engineering', location: 'Riyadh HQ', avatar: 'Ahmad Khaled' },
  { name: 'Sarah Johnson', dept: 'HR', location: 'Riyadh HQ', avatar: 'Sarah Johnson' },
  { name: 'Michael Brown', dept: 'Finance', location: 'Riyadh HQ', avatar: 'Michael Brown' },
  { name: 'Nora Hassan', dept: 'Sales', location: 'Jeddah Office', avatar: 'Nora Hassan' },
  { name: 'Robert Wilson', dept: 'Engineering', location: 'Riyadh HQ', avatar: 'Robert Wilson' },
  { name: 'Jennifer Lee', dept: 'Marketing', location: 'Riyadh HQ', avatar: 'Jennifer Lee' },
  { name: 'James Taylor', dept: 'Engineering', location: 'Remote', avatar: 'James Taylor' },
  { name: 'Lisa Anderson', dept: 'HR', location: 'Riyadh HQ', avatar: 'Lisa Anderson' },
  { name: 'William Thomas', dept: 'Sales', location: 'Jeddah Office', avatar: 'William Thomas' },
  { name: 'Amanda White', dept: 'Engineering', location: 'Riyadh HQ', avatar: 'Amanda White' },
];

const leaveEvents = [
  { employee: 'Sarah Johnson', type: 'Annual', start: 15, end: 19, color: 'bg-blue-400' },
  { employee: 'Michael Brown', type: 'Sick', start: 10, end: 11, color: 'bg-red-400' },
  { employee: 'Nora Hassan', type: 'Hajj', start: 20, end: 34, color: 'bg-indigo-400' },
  { employee: 'Robert Wilson', type: 'Personal', start: 22, end: 23, color: 'bg-amber-400' },
  { employee: 'James Taylor', type: 'Annual', start: 8, end: 10, color: 'bg-blue-400' },
];

const deptColors: Record<string, string> = {
  Engineering: 'bg-blue-500',
  HR: 'bg-rose-500',
  Finance: 'bg-amber-500',
  Sales: 'bg-emerald-500',
  Marketing: 'bg-purple-500',
};

export default function TeamLeavePage() {
  const [currentMonth] = useState(new Date(2026, 5));
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string | null>(null);

  const monthLabel = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();

  const filteredMembers = useMemo(() => {
    let result = teamMembers;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(q) || m.dept.toLowerCase().includes(q));
    }
    if (deptFilter) result = result.filter(m => m.dept === deptFilter);
    return result;
  }, [search, deptFilter]);

  const departments = [...new Set(teamMembers.map(m => m.dept))];

  const today = new Date().getDate();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Team Leave Calendar</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View team availability and leave schedules</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Team Members', value: teamMembers.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950/30' },
          { label: 'On Leave Now', value: 2, icon: CalendarDays, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-950/30' },
          { label: 'Departments', value: departments.length, icon: MapPin, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950/30' },
          { label: 'Pending Requests', value: 3, icon: Search, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950/30' },
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

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text" placeholder="Search team member..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-200 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-gray-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {departments.map(d => (
            <button
              key={d}
              onClick={() => setDeptFilter(deptFilter === d ? null : d)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                deptFilter === d
                  ? 'bg-gray-900 text-white border-gray-900 dark:bg-white dark:text-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-400 dark:border-gray-700'
              )}
            >
              {d}
            </button>
          ))}
          {deptFilter && (
            <button onClick={() => setDeptFilter(null)} className="text-xs text-gray-500 underline">Clear</button>
          )}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{monthLabel}</CardTitle>
              <div className="flex items-center gap-1">
                <button className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs text-gray-500 w-8 text-center">Today</span>
                <button className="rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="grid grid-cols-7 border-b dark:border-gray-800">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="border-r px-2 py-1.5 text-center text-xs font-medium text-gray-500 dark:border-gray-800 last:border-r-0">
                  {d}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7">
              {Array.from({ length: firstDay }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[90px] border-b border-r p-1.5 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50" />
              ))}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const events = leaveEvents.filter(e => day >= e.start && day <= e.end);
                const isToday = day === today;
                return (
                  <div
                    key={day}
                    className={cn(
                      'min-h-[90px] border-b border-r p-1.5 dark:border-gray-800 last:border-r-0',
                      isToday && 'bg-blue-50 dark:bg-blue-950/20'
                    )}
                  >
                    <span className={cn(
                      'inline-flex h-5 w-5 items-center justify-center rounded-full text-xs',
                      isToday ? 'bg-blue-600 text-white font-bold' : 'text-gray-700 dark:text-gray-300'
                    )}>
                      {day}
                    </span>
                    <div className="mt-1 space-y-0.5">
                      {events.map(e => (
                        <div
                          key={`${e.employee}-${day}`}
                          className={cn('rounded px-1 py-0.5 text-[9px] text-white truncate leading-tight', e.color)}
                          title={`${e.employee} - ${e.type}`}
                        >
                          {e.employee.split(' ')[0]} {e.type}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Team Directory</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y dark:divide-gray-800 max-h-[400px] overflow-y-auto">
                {filteredMembers.map(m => (
                  <div key={m.name} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <Avatar name={m.name} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{m.name}</p>
                      <div className="flex items-center gap-1.5">
                        <span className={cn('inline-block h-1.5 w-1.5 rounded-full', deptColors[m.dept] || 'bg-gray-400')} />
                        <span className="text-xs text-gray-400">{m.dept}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-gray-400">{m.location}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Currently on Leave</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaveEvents.filter(e => e.start <= today && e.end >= today).map(e => {
                const emp = teamMembers.find(m => m.name === e.employee);
                return (
                  <div key={e.employee} className="flex items-center gap-2">
                    <Avatar name={e.employee} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-900 dark:text-white">{e.employee}</p>
                      <p className="text-[10px] text-gray-400">{e.type} • Day {today - e.start + 1} of {e.end - e.start + 1}</p>
                    </div>
                    <Badge variant="warning" size="sm">Away</Badge>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
