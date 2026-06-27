'use client';

import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Banknote, Wallet, Users, TrendingUp, TrendingDown, Send, FileText,
  PlusCircle, Eye, DollarSign, Clock, AlertCircle, CheckCircle,
  ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { BarChart, LineChart } from '@/components/ui/dynamic-chart';
import { formatCurrency } from '@/lib/utils';
import type { Employee } from '@/types';

const statusVariant: Record<string, 'warning' | 'info' | 'success' | 'primary'> = {
  draft: 'warning', processing: 'info', review: 'warning', approved: 'success', locked: 'primary', paid: 'success',
};

const deptNames: Record<string, string> = {
  'dept-1': 'Engineering', 'dept-2': 'Marketing', 'dept-3': 'Sales',
  'dept-4': 'Finance', 'dept-5': 'HR',
};

function calcPayroll(basic: number) {
  const housing = Math.round(basic * 0.3);
  const transport = Math.round(basic * 0.1);
  const gross = basic + housing + transport;
  const tax = Math.round(gross * 0.1);
  const gosi = Math.round(gross * 0.0975);
  return { housing, transport, gross, tax, gosi, deductions: tax + gosi, net: gross - tax - gosi };
}

const quickActions = [
  { label: 'Process Payroll', icon: Send, href: '/payroll/processing', desc: 'Run new payroll period' },
  { label: 'View Payslips', icon: FileText, href: '/payroll/payslips', desc: 'Download salary slips' },
  { label: 'Payroll Profiles', icon: Users, href: '/payroll/profiles', desc: 'Manage salary info' },
  { label: 'Add Adjustment', icon: PlusCircle, href: '/payroll/adjustments', desc: 'Bonuses, loans, etc.' },
  { label: 'Approvals', icon: CheckCircle, href: '/payroll/approvals', desc: 'Review payroll runs' },
  { label: 'Reports', icon: FileText, href: '/payroll/reports', desc: 'Export & analytics' },
];

export default function PayrollDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(setEmployees)
      .catch(() => {});
  }, []);

  const payrollData = useMemo(() => {
    const active = employees.filter(e => e.status === 'active' && e.salary);
    const emps = active.map(e => ({
      name: e.fullName,
      id: e.id,
      dept: deptNames[e.departmentId ?? ''] ?? 'Other',
      basic: e.salary ?? 0,
    }));
    const totalBasic = emps.reduce((s, e) => s + e.basic, 0);
    const totalGross = emps.reduce((s, e) => s + calcPayroll(e.basic).gross, 0);
    const totalNet = emps.reduce((s, e) => s + calcPayroll(e.basic).net, 0);
    const totalDeductions = emps.reduce((s, e) => s + calcPayroll(e.basic).deductions, 0);
    const avgBasic = Math.round(totalBasic / emps.length);
    const avgNet = Math.round(totalNet / emps.length);

    const deptMap = new Map<string, { basic: number; net: number }>();
    emps.forEach((e) => {
      const p = calcPayroll(e.basic);
      const d = deptMap.get(e.dept) || { basic: 0, net: 0 };
      d.basic += e.basic;
      d.net += p.net;
      deptMap.set(e.dept, d);
    });

    const monthlyTrend = ['Feb', 'Mar', 'Apr', 'May', 'Jun'].map((m, i) => {
      const factor = [0.96, 0.97, 0.98, 0.99, 1.0][i];
      return {
        month: m,
        payroll: Math.round(totalNet * factor),
        deductions: Math.round(totalDeductions * factor),
      };
    });
    monthlyTrend.unshift({ month: 'Jan', payroll: Math.round(totalNet * 0.94), deductions: Math.round(totalDeductions * 0.94) });

    return {
      totalBasic,
      totalGross,
      totalNet,
      totalDeductions,
      avgBasic,
      avgNet,
      employeeCount: emps.length,
      deptMap,
      monthlyTrend,
    };
  }, [employees]);

  const statCards = [
    { label: 'Total Payroll (This Month)', value: payrollData.totalGross, icon: Banknote, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400', trend: '+5.2%', trendUp: true },
    { label: 'Average Salary', value: payrollData.avgBasic, icon: Wallet, color: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400', trend: '+2.1%', trendUp: true },
    { label: 'Active Employees', value: payrollData.employeeCount, icon: Users, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400', trend: '0%', trendUp: true },
    { label: 'Net Payroll (This Month)', value: payrollData.totalNet, icon: TrendingUp, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400', trend: '+12.8%', trendUp: true },
    { label: 'Tax Liability (YTD)', value: Math.round(payrollData.totalDeductions * 6), icon: DollarSign, color: 'text-red-600 bg-red-100 dark:bg-red-900/20 dark:text-red-400', trend: '+8.3%', trendUp: false },
    { label: 'Pending Approvals', value: 2, icon: Clock, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400', trend: null, trendUp: null },
  ];

  const deptData = Array.from(payrollData.deptMap.entries()).map(([department, data]) => ({
    department,
    earnings: data.basic,
    deductions: data.basic - data.net,
  }));

  const mockPeriods = [
    { id: '1', name: 'June 2026', start: '2026-06-01', end: '2026-06-30', status: 'draft' as const, earnings: payrollData.totalBasic, deductions: payrollData.totalDeductions, net: payrollData.totalNet, employees: 12 },
    { id: '2', name: 'May 2026', start: '2026-05-01', end: '2026-05-31', status: 'paid' as const, earnings: Math.round(payrollData.totalBasic * 0.97), deductions: Math.round(payrollData.totalDeductions * 0.97), net: Math.round(payrollData.totalNet * 0.97), employees: 12 },
    { id: '3', name: 'April 2026', start: '2026-04-01', end: '2026-04-30', status: 'paid' as const, earnings: Math.round(payrollData.totalBasic * 0.98), deductions: Math.round(payrollData.totalDeductions * 0.98), net: Math.round(payrollData.totalNet * 0.98), employees: 12 },
    { id: '4', name: 'March 2026', start: '2026-03-01', end: '2026-03-31', status: 'paid' as const, earnings: Math.round(payrollData.totalBasic * 0.95), deductions: Math.round(payrollData.totalDeductions * 0.95), net: Math.round(payrollData.totalNet * 0.95), employees: 12 },
    { id: '5', name: 'February 2026', start: '2026-02-01', end: '2026-02-28', status: 'paid' as const, earnings: Math.round(payrollData.totalBasic * 0.80), deductions: Math.round(payrollData.totalDeductions * 0.80), net: Math.round(payrollData.totalNet * 0.80), employees: 10 },
  ];

  const totals = useMemo(() => ({
    ytdNet: mockPeriods.reduce((s, p) => s + p.net, 0),
    ytdDeductions: mockPeriods.reduce((s, p) => s + p.deductions, 0),
    avgNet: Math.round(mockPeriods.reduce((s, p) => s + p.net, 0) / mockPeriods.length),
    currentMonthNet: mockPeriods[0].net,
  }), []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Enterprise payroll overview with KPIs and trends</p>
        </div>
        <div className="flex gap-2">
          <Link href="/payroll/processing">
            <Button><Send className="h-4 w-4" /> Process Payroll</Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="px-4 py-4">
              <div className="flex items-center justify-between">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                {stat.trend && (
                  <span className={`flex items-center gap-0.5 text-xs font-medium ${stat.trendUp ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.trendUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {stat.trend}
                  </span>
                )}
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900 dark:text-white">
                {stat.label === 'Active Employees' || stat.label === 'Pending Approvals' ? stat.value : formatCurrency(stat.value)}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {quickActions.map((action) => (
          <Link key={action.label} href={action.href}>
            <Card className="cursor-pointer transition-all hover:shadow-md hover:-translate-y-0.5">
              <CardContent className="flex flex-col items-center gap-2 px-3 py-4 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="text-xs font-medium text-gray-900 dark:text-white">{action.label}</span>
                <span className="text-[10px] text-gray-400">{action.desc}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Monthly Payroll Trend</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-blue-500" /> Net Pay</span>
              <span className="flex items-center gap-1"><span className="h-2.5 w-2.5 rounded-full bg-red-400" /> Deductions</span>
            </div>
          </CardHeader>
          <CardContent>
            <BarChart
              data={payrollData.monthlyTrend as any[]}
              xKey="month"
              bars={[
                { key: 'payroll', color: '#3B82F6', name: 'Net Pay' },
                { key: 'deductions', color: '#EF4444', name: 'Deductions' },
              ]}
              height={280}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardHeader><CardTitle>Department Breakdown</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deptData.map((d) => {
                  const pct = Math.round((d.earnings / deptData.reduce((s, x) => s + x.earnings, 0)) * 100);
                  return (
                    <div key={d.department}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-700 dark:text-gray-300">{d.department}</span>
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(d.earnings)}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-700">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>YTD Summary</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Net Pay</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(totals.ytdNet)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Deductions</span>
                <span className="font-bold text-red-600">{formatCurrency(totals.ytdDeductions)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Average Monthly Net</span>
                <span className="font-bold text-gray-900 dark:text-white">{formatCurrency(totals.avgNet)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Current Month Net</span>
                <span className="font-bold text-green-600">{formatCurrency(totals.currentMonthNet)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payroll Periods</CardTitle>
          <Link href="/payroll/processing">
            <Button variant="ghost" size="sm">View All</Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'name', header: 'Period', sortable: true, render: (item: any) => <span className="font-medium">{item.name}</span> },
              { key: 'start', header: 'Start', render: (item: any) => <span className="text-sm">{item.start}</span> },
              { key: 'end', header: 'End', render: (item: any) => <span className="text-sm">{item.end}</span> },
              { key: 'employees', header: 'Employees', render: (item: any) => <span className="text-sm">{item.employees}</span> },
              { key: 'earnings', header: 'Earnings', render: (item: any) => <span className="text-sm font-medium">{formatCurrency(item.earnings)}</span> },
              { key: 'deductions', header: 'Deductions', render: (item: any) => <span className="text-sm text-red-600">{formatCurrency(item.deductions)}</span> },
              { key: 'net', header: 'Net Pay', render: (item: any) => <span className="text-sm font-semibold text-green-600">{formatCurrency(item.net)}</span> },
              { key: 'status', header: 'Status', render: (item: any) => <Badge variant={statusVariant[item.status]}>{item.status}</Badge> },
              { key: 'actions', header: '', className: 'w-12', render: (item: any) => (
                <Link href={`/payroll/processing`}><Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button></Link>
              )},
            ]}
            data={mockPeriods as any[]}
            keyExtractor={(item) => item.id as string}
            sortable
          />
        </CardContent>
      </Card>
    </div>
  );
}
