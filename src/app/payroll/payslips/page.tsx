'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Download, Search, Eye, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { SearchInput } from '@/components/ui/search-input';
import { EmptyState } from '@/components/ui/empty-state';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { Employee } from '@/types';

const deptNames: Record<string, string> = {
  'dept-1': 'Engineering', 'dept-2': 'Marketing', 'dept-3': 'Sales',
  'dept-4': 'Finance', 'dept-5': 'HR',
};

const getMonthlySalary = (e: Employee) => {
  if (!e.salaryType || e.salaryType === 'monthly') return e.salary ?? 0;
  if (e.salaryType === 'daily') return (e.salary ?? 0) * 30;
  if (e.salaryType === 'weekly') return (e.salary ?? 0) * 6;
  return (e.salary ?? 0) * 30 * 8;
};

const periods = ['June 2026', 'May 2026', 'April 2026'];
const months: Record<string, string> = {
  'June 2026': 'Jun',
  'May 2026': 'May',
  'April 2026': 'Apr',
};

const periodOptions = [
  { value: '', label: 'All Periods' },
  { value: 'June 2026', label: 'June 2026' },
  { value: 'May 2026', label: 'May 2026' },
  { value: 'April 2026', label: 'April 2026' },
];

const deptOptions = [
  { value: '', label: 'All Departments' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Sales', label: 'Sales' },
  { value: 'Finance', label: 'Finance' },
  { value: 'HR', label: 'HR' },
];

export default function PayslipsPage() {
  const [employees, setEmployees] = useState<{ id: string; name: string; dept: string; basic: number }[]>([]);
  const [search, setSearch] = useState('');
  const [periodFilter, setPeriodFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    if (searchParam) setSearch(searchParam);
  }, []);

  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then((emps: Employee[]) => {
        setEmployees(emps.map(e => ({
          id: e.id,
          name: e.fullName,
          dept: deptNames[e.departmentId ?? ''] ?? 'Other',
          basic: getMonthlySalary(e),
        })));
      });
  }, []);

  const payslips = useMemo(() =>
    periods.flatMap((period) =>
      employees.map((emp) => {
        const housing = Math.round(emp.basic * 0.3);
        const transport = Math.round(emp.basic * 0.1);
        const grossPay = emp.basic + housing + transport;
        const tax = Math.round(grossPay * 0.1);
        const gosi = Math.round(grossPay * 0.0975);
        const deductions = tax + gosi;
        const netPay = grossPay - deductions;
        return {
          id: `slip-${emp.id}-${months[period]}`,
          period,
          employeeId: emp.id,
          employee: emp.name,
          department: emp.dept,
          basic: emp.basic,
          housing,
          transport,
          grossPay,
          tax,
          gosi,
          deductions,
          netPay,
          status: period === 'June 2026' ? ('generated' as const) : ('sent' as const),
        };
      })
    ),
    [employees]
  );

  const filtered = useMemo(() => {
    let result = payslips;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((s) => s.employee.toLowerCase().includes(q));
    }
    if (periodFilter) result = result.filter((s) => s.period === periodFilter);
    if (deptFilter) result = result.filter((s) => s.department === deptFilter);
    return result;
  }, [search, periodFilter, deptFilter, payslips]);

  const handleDownload = (slip: (typeof payslips)[number]) => {
    const link = document.createElement('a');
    const blob = new Blob([`Payslip: ${slip.employee} - ${slip.period}\nNet Pay: ${slip.netPay} SAR`], { type: 'text/plain' });
    link.href = URL.createObjectURL(blob);
    link.download = `${slip.employee.replace(/\s+/g, '_')}_${slip.period.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payslips</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">View and download salary slips for all employees</p>
        </div>
        <div className="flex items-center gap-3">
          <Select options={deptOptions} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="w-40" />
          <Select options={periodOptions} value={periodFilter} onChange={(e) => setPeriodFilter(e.target.value)} className="w-40" />
          <SearchInput value={search} onChange={setSearch} placeholder="Search employees..." className="w-56" />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'period', header: 'Period', sortable: true },
              {
                key: 'employee', header: 'Employee', sortable: true,
                render: (item: any) => (
                  <Link href={`/payroll/payslips/${item.id}`} className="font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300">
                    {item.employee}
                  </Link>
                ),
              },
              { key: 'department', header: 'Department' },
              { key: 'basic', header: 'Basic', render: (item: any) => <span>{formatCurrency(item.basic)}</span> },
              { key: 'grossPay', header: 'Gross', render: (item: any) => <span>{formatCurrency(item.grossPay)}</span> },
              { key: 'deductions', header: 'Deductions', render: (item: any) => <span className="text-red-600">{formatCurrency(item.deductions)}</span> },
              { key: 'netPay', header: 'Net Pay', render: (item: any) => <span className="font-semibold text-green-600">{formatCurrency(item.netPay)}</span> },
              {
                key: 'status', header: 'Status',
                render: (item: any) => (
                  <Badge variant={item.status === 'downloaded' ? 'success' : item.status === 'sent' ? 'info' : 'warning'}>
                    {item.status}
                  </Badge>
                ),
              },
              {
                key: 'actions', header: '', className: 'w-24',
                render: (item: any) => (
                  <div className="flex items-center gap-1">
                    <Link href={`/payroll/payslips/${item.id}`}>
                      <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDownload(item)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                ),
              },
            ]}
            data={filtered as any[]}
            keyExtractor={(item) => item.id as string}
            sortable
            emptyState={
              <EmptyState icon={Search} title="No payslips found" description="Try adjusting your search or filters" />
            }
          />
        </CardContent>
      </Card>
    </div>
  );
}
