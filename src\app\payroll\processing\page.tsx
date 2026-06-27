'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  Send,
  Play,
  CheckCircle,
  Lock,
  Eye,
  Download,
  Users,
  Banknote,
  Wallet,
  TrendingUp,
  AlertCircle,
  Clock,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Employee } from '@/types';

interface PayrollPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  cycle: 'monthly' | 'bi-weekly' | 'weekly' | 'custom';
  status: 'draft' | 'processing' | 'review' | 'approved' | 'locked' | 'paid';
  employeeCount: number;
  totalEarnings: number;
  totalDeductions: number;
  totalNet: number;
  processedAt?: string;
  approvedAt?: string;
  lockedAt?: string;
}

interface EmployeePayrollRun {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  basicSalary: number;
  allowances: number;
  overtime: number;
  bonuses: number;
  commissions: number;
  grossPay: number;
  tax: number;
  socialInsurance: number;
  loanDeductions: number;
  otherDeductions: number;
  totalDeductions: number;
  netPay: number;
  status: 'pending' | 'calculated' | 'approved';
}

const cycleOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'bi-weekly', label: 'Bi-Weekly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'custom', label: 'Custom' },
];

const statusVariant: Record<string, 'warning' | 'info' | 'success' | 'primary' | 'danger' | 'default'> = {
  draft: 'warning',
  processing: 'info',
  review: 'warning',
  approved: 'success',
  locked: 'primary',
  paid: 'success',
};

const getMonthlySalary = (e: Employee) => {
  if (!e.salaryType || e.salaryType === 'monthly') return e.salary ?? 0;
  if (e.salaryType === 'daily') return (e.salary ?? 0) * 30;
  if (e.salaryType === 'weekly') return (e.salary ?? 0) * 6;
  return (e.salary ?? 0) * 30 * 8;
};

const deptNames: Record<string, string> = {
  'dept-1': 'Engineering', 'dept-2': 'Marketing', 'dept-3': 'Sales',
  'dept-4': 'Finance', 'dept-5': 'HR',
};

const mockPeriods: PayrollPeriod[] = [
  { id: 'p1', name: 'June 2026', startDate: '2026-06-01', endDate: '2026-06-30', cycle: 'monthly', status: 'draft', employeeCount: 12, totalEarnings: 29600, totalDeductions: 4440, totalNet: 25160 },
  { id: 'p2', name: 'May 2026', startDate: '2026-05-01', endDate: '2026-05-31', cycle: 'monthly', status: 'paid', employeeCount: 12, totalEarnings: 29100, totalDeductions: 4365, totalNet: 24735, processedAt: '2026-05-25', approvedAt: '2026-05-28', lockedAt: '2026-05-30' },
  { id: 'p3', name: 'April 2026', startDate: '2026-04-01', endDate: '2026-04-30', cycle: 'monthly', status: 'locked', employeeCount: 12, totalEarnings: 28800, totalDeductions: 4320, totalNet: 24480, processedAt: '2026-04-25', approvedAt: '2026-04-28', lockedAt: '2026-04-30' },
  { id: 'p4', name: 'March 2026', startDate: '2026-03-01', endDate: '2026-03-31', cycle: 'monthly', status: 'paid', employeeCount: 12, totalEarnings: 29500, totalDeductions: 4425, totalNet: 25075 },
  { id: 'p5', name: 'Feb 2026', startDate: '2026-02-01', endDate: '2026-02-28', cycle: 'monthly', status: 'paid', employeeCount: 12, totalEarnings: 28000, totalDeductions: 4200, totalNet: 23800 },
];

function generateEmployeeRuns(periodId: string, employees: EmployeeSalaried[], status: 'pending' | 'calculated' | 'approved' = 'calculated'): EmployeePayrollRun[] {
  return employees.map((emp, i) => {
    const allowances = Math.round(emp.monthlySalary * (0.15 + Math.random() * 0.1));
    const overtime = Math.round(500 + Math.random() * 1500);
    const bonuses = Math.round(200 + Math.random() * 2000);
    const commissions = emp.department === 'Sales' ? Math.round(1000 + Math.random() * 3000) : 0;
    const gross = emp.monthlySalary + allowances + overtime + bonuses + commissions;
    const tax = Math.round(gross * (0.08 + Math.random() * 0.05));
    const socialInsurance = Math.round(emp.monthlySalary * 0.0975);
    const loanDeductions = i % 3 === 0 ? Math.round(500 + Math.random() * 1000) : 0;
    const otherDeductions = Math.round(100 + Math.random() * 300);
    const totalDed = tax + socialInsurance + loanDeductions + otherDeductions;
    return {
      id: `${periodId}-run-${emp.id}`,
      employeeId: emp.id,
      employeeName: emp.name,
      department: emp.department,
      basicSalary: emp.monthlySalary,
      allowances,
      overtime,
      bonuses,
      commissions,
      grossPay: gross,
      tax,
      socialInsurance,
      loanDeductions,
      otherDeductions,
      totalDeductions: totalDed,
      netPay: gross - totalDed,
      status,
    };
  });
}

interface EmployeeSalaried {
  id: string;
  name: string;
  department: string;
  monthlySalary: number;
}

export default function PayrollProcessingPage() {
  const [employees, setEmployees] = useState<EmployeeSalaried[]>([]);
  const [periods, setPeriods] = useState(mockPeriods);
  const [selectedPeriod, setSelectedPeriod] = useState<PayrollPeriod | null>(null);
  const [runs, setRuns] = useState<EmployeePayrollRun[]>([]);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showRunModal, setShowRunModal] = useState(false);

  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then((emps: Employee[]) => {
        setEmployees(emps.map(e => ({
          id: e.id,
          name: e.fullName,
          department: deptNames[e.departmentId ?? ''] ?? 'Other',
          monthlySalary: getMonthlySalary(e),
        })));
      });
  }, []);
  const [showBreakdownModal, setShowBreakdownModal] = useState(false);
  const [selectedRun, setSelectedRun] = useState<EmployeePayrollRun | null>(null);
  const [newPeriod, setNewPeriod] = useState({ name: '', startDate: '', endDate: '', cycle: 'monthly' as const });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedPeriod, setExpandedPeriod] = useState<string | null>(null);

  const filteredPeriods = useMemo(() => {
    let result = periods;
    if (statusFilter) result = result.filter((p) => p.status === statusFilter);
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    return result;
  }, [periods, search, statusFilter]);

  const createPeriod = () => {
    if (!newPeriod.name || !newPeriod.startDate || !newPeriod.endDate) return;
    const period: PayrollPeriod = {
      id: `p${Date.now()}`,
      ...newPeriod,
      status: 'draft',
      employeeCount: employees.length,
      totalEarnings: 0,
      totalDeductions: 0,
      totalNet: 0,
    };
    setPeriods((prev) => [period, ...prev]);
    setShowNewModal(false);
    setNewPeriod({ name: '', startDate: '', endDate: '', cycle: 'monthly' });
    toast.success(`Payroll period "${newPeriod.name}" created`);
  };

  const openPeriod = (period: PayrollPeriod) => {
    setSelectedPeriod(period);
    setRuns(generateEmployeeRuns(period.id, employees));
    setExpandedPeriod(expandedPeriod === period.id ? null : period.id);
  };

  const processPayroll = (periodId: string) => {
    const updatedRuns = runs.map((r) => ({ ...r, status: 'calculated' as const }));
    setRuns(updatedRuns);
    setPeriods((prev) =>
      prev.map((p) =>
        p.id === periodId
          ? { ...p, status: 'processing' as const, totalEarnings: updatedRuns.reduce((s, r) => s + r.grossPay, 0), totalDeductions: updatedRuns.reduce((s, r) => s + r.totalDeductions, 0), totalNet: updatedRuns.reduce((s, r) => s + r.netPay, 0), processedAt: new Date().toISOString() }
          : p
      )
    );
    toast.success('Payroll calculated successfully');
  };

  const approvePayroll = (periodId: string) => {
    setRuns((prev) => prev.map((r) => ({ ...r, status: 'approved' as const })));
    setPeriods((prev) =>
      prev.map((p) => (p.id === periodId ? { ...p, status: 'approved' as const, approvedAt: new Date().toISOString() } : p))
    );
    toast.success('Payroll approved');
  };

  const lockPayroll = (periodId: string) => {
    setPeriods((prev) =>
      prev.map((p) => (p.id === periodId ? { ...p, status: 'locked' as const, lockedAt: new Date().toISOString() } : p))
    );
    toast.success('Payroll locked — no further changes allowed');
  };

  const markPaid = (periodId: string) => {
    setPeriods((prev) =>
      prev.map((p) => (p.id === periodId ? { ...p, status: 'paid' as const } : p))
    );
    toast.success('Payroll marked as paid');
  };

  const calcSummary = useMemo(() => {
    if (!runs.length) return { employeeCount: 0, totalGross: 0, totalDeductions: 0, totalNet: 0, avgSalary: 0 };
    const totalGross = runs.reduce((s, r) => s + r.grossPay, 0);
    const totalDed = runs.reduce((s, r) => s + r.totalDeductions, 0);
    const totalNet = runs.reduce((s, r) => s + r.netPay, 0);
    return { employeeCount: runs.length, totalGross, totalDeductions: totalDed, totalNet, avgSalary: Math.round(totalNet / runs.length) };
  }, [runs]);

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'draft', label: 'Draft' },
    { value: 'processing', label: 'Processing' },
    { value: 'approved', label: 'Approved' },
    { value: 'locked', label: 'Locked' },
    { value: 'paid', label: 'Paid' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Processing</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Create and manage payroll runs</p>
        </div>
        <Button onClick={() => setShowNewModal(true)}>
          <Send className="h-4 w-4" />
          New Payroll Period
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        {[
          { label: 'Active Periods', value: periods.filter((p) => p.status !== 'paid').length, icon: Clock, color: 'text-blue-600 bg-blue-100' },
          { label: 'Draft', value: periods.filter((p) => p.status === 'draft').length, icon: AlertCircle, color: 'text-yellow-600 bg-yellow-100' },
          { label: 'Awaiting Approval', value: periods.filter((p) => p.status === 'processing' || p.status === 'review').length, icon: CheckCircle, color: 'text-purple-600 bg-purple-100' },
          { label: 'Total Paid (YTD)', value: formatCurrency(periods.filter((p) => p.status === 'paid').reduce((s, p) => s + p.totalNet, 0)), icon: Banknote, color: 'text-green-600 bg-green-100' },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 px-6 py-5">
              <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.color} dark:opacity-80`}>
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

      <Card>
        <CardHeader>
          <CardTitle>Payroll Periods</CardTitle>
          <div className="flex items-center gap-3">
            <SearchInput value={search} onChange={setSearch} placeholder="Search periods..." className="w-56" />
            <Select options={statusOptions} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-40" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y dark:divide-gray-800">
            {filteredPeriods.length === 0 ? (
              <div className="px-6 py-12">
                <EmptyState icon={Search} title="No payroll periods" description="Create your first payroll period to get started" />
              </div>
            ) : (
              filteredPeriods.map((period) => (
                <div key={period.id}>
                  <div
                    className="flex items-center gap-4 px-6 py-4 cursor-pointer transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    onClick={() => openPeriod(period)}
                  >
                    <button className="text-gray-400">
                      {expandedPeriod === period.id ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-gray-900 dark:text-white">{period.name}</h3>
                        <Badge variant={statusVariant[period.status]}>{period.status}</Badge>
                        <Badge variant="default" size="sm">{period.cycle}</Badge>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {formatDate(period.startDate)} – {formatDate(period.endDate)} &middot; {period.employeeCount} employees
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(period.totalNet)}</p>
                      <p className="text-xs text-gray-500">Net Pay</p>
                    </div>
                    <div className="flex gap-1">
                      {period.status === 'draft' && (
                        <Button size="sm" onClick={(e) => { e.stopPropagation(); processPayroll(period.id); }}>
                          <Play className="h-4 w-4" /> Calculate
                        </Button>
                      )}
                      {period.status === 'processing' && (
                        <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); approvePayroll(period.id); }}>
                          <CheckCircle className="h-4 w-4" /> Approve
                        </Button>
                      )}
                      {period.status === 'approved' && (
                        <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); lockPayroll(period.id); }}>
                          <Lock className="h-4 w-4" /> Lock
                        </Button>
                      )}
                      {period.status === 'locked' && (
                        <Button size="sm" variant="success" onClick={(e) => { e.stopPropagation(); markPaid(period.id); }}>
                          <Banknote className="h-4 w-4" /> Mark Paid
                        </Button>
                      )}
                    </div>
                  </div>

                  {expandedPeriod === period.id && (
                    <div className="border-t bg-gray-50 px-6 py-4 dark:bg-gray-800/30 dark:border-gray-700">
                      <div className="mb-4 grid gap-3 sm:grid-cols-4">
                        <div className="rounded-lg bg-white p-3 text-center dark:bg-gray-800">
                          <p className="text-xs text-gray-500">Employees</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{period.employeeCount}</p>
                        </div>
                        <div className="rounded-lg bg-white p-3 text-center dark:bg-gray-800">
                          <p className="text-xs text-gray-500">Gross Pay</p>
                          <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCurrency(period.totalEarnings)}</p>
                        </div>
                        <div className="rounded-lg bg-white p-3 text-center dark:bg-gray-800">
                          <p className="text-xs text-gray-500">Deductions</p>
                          <p className="text-lg font-bold text-red-600">{formatCurrency(period.totalDeductions)}</p>
                        </div>
                        <div className="rounded-lg bg-white p-3 text-center dark:bg-gray-800">
                          <p className="text-xs text-gray-500">Net Pay</p>
                          <p className="text-lg font-bold text-green-600">{formatCurrency(period.totalNet)}</p>
                        </div>
                      </div>

                      <Table
                        columns={[
                          { key: 'employeeName', header: 'Employee', sortable: true, render: (item: any) => <span className="font-medium">{item.employeeName}</span> },
                          { key: 'department', header: 'Department' },
                          { key: 'basicSalary', header: 'Basic', render: (item: any) => <span>{formatCurrency(item.basicSalary)}</span> },
                          { key: 'grossPay', header: 'Gross', render: (item: any) => <span className="text-green-600">{formatCurrency(item.grossPay)}</span> },
                          { key: 'totalDeductions', header: 'Deductions', render: (item: any) => <span className="text-red-600">{formatCurrency(item.totalDeductions)}</span> },
                          { key: 'netPay', header: 'Net', render: (item: any) => <span className="font-semibold">{formatCurrency(item.netPay)}</span> },
                          {
                            key: 'status', header: 'Status',
                            render: (item: any) => <Badge variant={item.status === 'approved' ? 'success' : 'warning'}>{item.status}</Badge>,
                          },
                          {
                            key: 'actions', header: '', className: 'w-12',
                            render: (item: any) => (
                              <Button variant="ghost" size="sm" onClick={() => { setSelectedRun(item); setShowBreakdownModal(true); }}>
                                <Eye className="h-4 w-4" />
                              </Button>
                            ),
                          },
                        ]}
                        data={runs as any[]}
                        keyExtractor={(item: any) => item.id}
                        sortable
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Modal isOpen={showNewModal} onClose={() => setShowNewModal(false)} title="Create Payroll Period" size="md">
        <div className="space-y-4">
          <Input label="Period Name" value={newPeriod.name} onChange={(e) => setNewPeriod({ ...newPeriod, name: e.target.value })} placeholder="e.g. July 2026" />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Start Date" type="date" value={newPeriod.startDate} onChange={(e) => setNewPeriod({ ...newPeriod, startDate: e.target.value })} />
            <Input label="End Date" type="date" value={newPeriod.endDate} onChange={(e) => setNewPeriod({ ...newPeriod, endDate: e.target.value })} />
          </div>
          <Select label="Pay Cycle" options={cycleOptions} value={newPeriod.cycle} onChange={(e) => setNewPeriod({ ...newPeriod, cycle: e.target.value as any })} />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowNewModal(false)}>Cancel</Button>
            <Button onClick={createPeriod} disabled={!newPeriod.name || !newPeriod.startDate || !newPeriod.endDate}>Create Period</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showBreakdownModal} onClose={() => setShowBreakdownModal(false)} title={`Payroll Breakdown — ${selectedRun?.employeeName}`} size="sm">
        {selectedRun && (
          <div className="space-y-4">
            <div className="divide-y dark:divide-gray-800">
              <div className="flex justify-between py-2 text-sm"><span className="text-gray-500">Basic Salary</span><span className="font-medium">{formatCurrency(selectedRun.basicSalary)}</span></div>
              <div className="flex justify-between py-2 text-sm"><span className="text-gray-500">Allowances</span><span className="text-green-600">{formatCurrency(selectedRun.allowances)}</span></div>
              <div className="flex justify-between py-2 text-sm"><span className="text-gray-500">Overtime</span><span className="text-green-600">{formatCurrency(selectedRun.overtime)}</span></div>
              <div className="flex justify-between py-2 text-sm"><span className="text-gray-500">Bonuses</span><span className="text-green-600">{formatCurrency(selectedRun.bonuses)}</span></div>
              {selectedRun.commissions > 0 && <div className="flex justify-between py-2 text-sm"><span className="text-gray-500">Commissions</span><span className="text-green-600">{formatCurrency(selectedRun.commissions)}</span></div>}
              <div className="flex justify-between py-2 text-sm font-semibold border-t dark:border-gray-700"><span>Gross Pay</span><span className="text-gray-900 dark:text-white">{formatCurrency(selectedRun.grossPay)}</span></div>
              <div className="flex justify-between py-2 text-sm"><span className="text-gray-500">Tax</span><span className="text-red-600">{formatCurrency(selectedRun.tax)}</span></div>
              <div className="flex justify-between py-2 text-sm"><span className="text-gray-500">Social Insurance</span><span className="text-red-600">{formatCurrency(selectedRun.socialInsurance)}</span></div>
              {selectedRun.loanDeductions > 0 && <div className="flex justify-between py-2 text-sm"><span className="text-gray-500">Loan Deduction</span><span className="text-red-600">{formatCurrency(selectedRun.loanDeductions)}</span></div>}
              <div className="flex justify-between py-2 text-sm"><span className="text-gray-500">Other Deductions</span><span className="text-red-600">{formatCurrency(selectedRun.otherDeductions)}</span></div>
              <div className="flex justify-between py-2 text-lg font-bold border-t dark:border-gray-700"><span>Net Pay</span><span className="text-green-600">{formatCurrency(selectedRun.netPay)}</span></div>
            </div>
            <div className="flex justify-end">
              <Badge variant={selectedRun.status === 'approved' ? 'success' : 'warning'}>{selectedRun.status}</Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
