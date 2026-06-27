'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Users, Clock, CalendarDays, Briefcase, UserPlus, FileText,
  Banknote, Settings, ArrowUpRight, ArrowDownRight, Gift,
  Sparkles, Umbrella, PieChart as PieChartIcon,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs } from '@/components/ui/tabs';
import { BarChart, PieChart, AreaChart } from '@/components/ui/dynamic-chart';
import { cn } from '@/lib/utils';

const stats = [
  {
    label: 'Total Employees', value: '12', change: '+1', trend: 'up',
    icon: Users, accent: 'border-l-blue-500', iconColor: 'text-blue-500',
  },
  {
    label: 'Present Today', value: '10', change: '-1', trend: 'down',
    icon: Clock, accent: 'border-l-green-500', iconColor: 'text-green-500',
  },
  {
    label: 'On Leave', value: '1', change: '0', trend: 'up',
    icon: CalendarDays, accent: 'border-l-amber-500', iconColor: 'text-amber-500',
  },
  {
    label: 'Open Positions', value: '3', change: '+1', trend: 'up',
    icon: Briefcase, accent: 'border-l-purple-500', iconColor: 'text-purple-500',
  },
];

const attendanceData = [
  { day: 'Jun 1', present: 10, absent: 1, late: 1 },
  { day: 'Jun 3', present: 9, absent: 2, late: 1 },
  { day: 'Jun 5', present: 11, absent: 0, late: 1 },
  { day: 'Jun 7', present: 10, absent: 1, late: 1 },
  { day: 'Jun 9', present: 11, absent: 0, late: 1 },
  { day: 'Jun 11', present: 10, absent: 1, late: 1 },
  { day: 'Jun 13', present: 9, absent: 2, late: 1 },
  { day: 'Jun 15', present: 10, absent: 1, late: 1 },
  { day: 'Jun 17', present: 8, absent: 3, late: 1 },
  { day: 'Jun 19', present: 11, absent: 0, late: 1 },
  { day: 'Jun 21', present: 10, absent: 1, late: 1 },
  { day: 'Jun 23', present: 10, absent: 1, late: 1 },
];

const departmentData = [
  { name: 'Engineering', count: 4 },
  { name: 'Sales', count: 2 },
  { name: 'Marketing', count: 2 },
  { name: 'HR', count: 2 },
  { name: 'Finance', count: 2 },
];

const leaveTypeData = [
  { name: 'Annual', value: 45 },
  { name: 'Sick', value: 20 },
  { name: 'Personal', value: 10 },
  { name: 'Emergency', value: 5 },
  { name: 'Maternity', value: 90 },
];

const monthlyHiresData = [
  { month: 'Jan', hires: 1, exits: 0 },
  { month: 'Feb', hires: 0, exits: 1 },
  { month: 'Mar', hires: 2, exits: 0 },
  { month: 'Apr', hires: 0, exits: 0 },
  { month: 'May', hires: 1, exits: 0 },
  { month: 'Jun', hires: 0, exits: 0 },
];

const overtimeData = [
  { name: 'Engineering', hours: 28 },
  { name: 'Sales', hours: 15 },
  { name: 'Marketing', hours: 12 },
  { name: 'Finance', hours: 8 },
  { name: 'HR', hours: 5 },
];

const genderData = [
  { name: 'Male', value: 7 },
  { name: 'Female', value: 5 },
];

const recentLeaves = [
  { employee: 'Ahmad Khaled', department: 'Engineering', type: 'Annual', days: 5, status: 'pending' as const },
  { employee: 'Jennifer Lee', department: 'Marketing', type: 'Sick', days: 2, status: 'approved' as const },
  { employee: 'William Thomas', department: 'Sales', type: 'Personal', days: 1, status: 'approved' as const },
  { employee: 'Emily Davis', department: 'Finance', type: 'Annual', days: 3, status: 'rejected' as const },
  { employee: 'Robert Wilson', department: 'Engineering', type: 'Emergency', days: 2, status: 'pending' as const },
];

const upcomingBirthdays = [
  { name: 'Maria Garcia', date: 'Jun 25', department: 'Marketing', initials: 'MG', color: 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400' },
  { name: 'James Taylor', date: 'Jun 28', department: 'Engineering', initials: 'JT', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' },
  { name: 'Lisa Anderson', date: 'Jul 2', department: 'HR', initials: 'LA', color: 'bg-pink-100 text-pink-600 dark:bg-pink-900/30 dark:text-pink-400' },
];

const quickActions = [
  { label: 'Add Employee', icon: UserPlus, href: '/employees/new', color: 'text-blue-600', desc: 'New team member' },
  { label: 'Mark Attendance', icon: Clock, href: '/attendance', color: 'text-green-600', desc: 'Clock in/out' },
  { label: 'Leave Request', icon: CalendarDays, href: '/leave/my', color: 'text-amber-600', desc: 'Submit request' },
  { label: 'Generate Report', icon: FileText, href: '/reports', color: 'text-purple-600', desc: 'Export data' },
  { label: 'Run Payroll', icon: Banknote, href: '/payroll', color: 'text-indigo-600', desc: 'Process payroll' },
  { label: 'Settings', icon: Settings, href: '/settings', color: 'text-gray-600', desc: 'Configuration' },
];

const statusVariant = {
  pending: 'warning' as const, approved: 'success' as const, rejected: 'danger' as const, cancelled: 'default' as const,
};

function OverviewTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className={`border-l-4 ${stat.accent}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="mt-1 text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                </div>
                <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
              </div>
              <div className="mt-2 flex items-center gap-1">
                <span className={cn('text-xs font-medium', stat.trend === 'up' ? 'text-green-600' : 'text-red-600')}>{stat.change}</span>
                {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 text-green-600" /> : <ArrowDownRight className="h-3 w-3 text-red-600" />}
                <span className="text-xs text-gray-400">vs yesterday</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Leave Requests</CardTitle>
          <Link href="/leave/requests"><Button variant="ghost" size="sm">View All</Button></Link>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left dark:border-gray-800">
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">Employee</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">Department</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">Type</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">Days</th>
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-800">
                {recentLeaves.map((leave) => (
                  <tr key={leave.employee} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{leave.employee}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{leave.department}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{leave.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">{leave.days}</td>
                    <td className="px-6 py-4"><Badge variant={statusVariant[leave.status]}>{leave.status}</Badge></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-pink-500" />
              Upcoming Birthdays
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {upcomingBirthdays.map((b) => (
                <div key={b.name} className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-gray-50 dark:border-gray-800 dark:hover:bg-gray-800/50">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${b.color}`}>{b.initials}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{b.name}</p>
                    <p className="text-xs text-gray-400">{b.date} &middot; {b.department}</p>
                  </div>
                  <Gift className="h-4 w-4 text-pink-400" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-purple-500" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href} className="flex flex-col items-center gap-2 rounded-lg border p-4 text-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-gray-800 dark:hover:bg-gray-800">
                  <action.icon className={cn('h-6 w-6', action.color)} />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{action.label}</span>
                  <span className="text-[10px] text-gray-400">{action.desc}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function WidgetsTab() {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-500" />
              Attendance Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AreaChart data={attendanceData} xKey="day" areas={[
              { key: 'present', name: 'Present', color: '#10B981' },
              { key: 'absent', name: 'Absent', color: '#EF4444' },
              { key: 'late', name: 'Late', color: '#F59E0B' },
            ]} height={280} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              Department Headcount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={departmentData} xKey="name" bars={[{ key: 'count', color: '#3B82F6' }]} height={280} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Umbrella className="h-4 w-4 text-purple-500" />
              Leave Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={leaveTypeData} dataKey="value" nameKey="name" height={260} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-4 w-4 text-indigo-500" />
              Monthly Hires & Exits
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={monthlyHiresData} xKey="month" bars={[
              { key: 'hires', name: 'Hires', color: '#10B981' },
              { key: 'exits', name: 'Exits', color: '#EF4444' },
            ]} height={260} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Overtime by Department
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={overtimeData} xKey="name" bars={[{ key: 'hours', name: 'Hours', color: '#F59E0B' }]} height={260} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-4 w-4 text-rose-500" />
              Gender Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <PieChart data={genderData} dataKey="value" nameKey="name" donut height={260} colors={['#3B82F6', '#EC4899']} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-4 w-4 text-emerald-500" />
              Department Budget vs Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={[
              { name: 'Engineering', budget: 180, spend: 145 },
              { name: 'Sales', budget: 90, spend: 72 },
              { name: 'Marketing', budget: 75, spend: 55 },
              { name: 'Finance', budget: 85, spend: 73 },
              { name: 'HR', budget: 70, spend: 67 },
            ]} xKey="name" bars={[
              { key: 'budget', name: 'Budget', color: '#6366F1' },
              { key: 'spend', name: 'Spent', color: '#10B981' },
            ]} height={260} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const today = useMemo(() => new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }), []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">Good morning! Here's what's happening today.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Clock className="h-4 w-4" />
          <span>{today}</span>
        </div>
      </div>

      <Tabs
        tabs={[
          { id: 'overview', label: 'Overview', content: <OverviewTab /> },
          { id: 'widgets', label: 'Widgets', content: <WidgetsTab /> },
        ]}
        defaultTab="overview"
      />
    </div>
  );
}
