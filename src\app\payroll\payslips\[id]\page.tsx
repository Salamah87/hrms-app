'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Download, Printer, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';
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

const monthFullMap: Record<string, string> = {
  Jan: 'January 2026', Feb: 'February 2026', Mar: 'March 2026',
  Apr: 'April 2026', May: 'May 2026', Jun: 'June 2026',
  Jul: 'July 2026', Aug: 'August 2026', Sep: 'September 2026',
  Oct: 'October 2026', Nov: 'November 2026', Dec: 'December 2026',
};
const monthNames: Record<string, string> = {
  'June 2026': 'June', 'May 2026': 'May', 'April 2026': 'April',
};

function parseSlipId(id: string) {
  const parts = id.split('-');
  const monthAbbr = parts[parts.length - 1];
  const empId = parts.slice(1, parts.length - 1).join('-');
  return { empId, period: monthFullMap[monthAbbr] || 'June 2026' };
}

export default function PayslipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [employees, setEmployees] = useState<Employee[]>([]);

  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(setEmployees);
  }, []);

  const payslipData = useMemo(() => {
    const { empId, period } = parseSlipId(id);
    const emp = employees.find((e) => e.id === empId);
    if (!emp) return null;

    const basic = getMonthlySalary(emp);
    const housing = Math.round(basic * 0.3);
    const transport = Math.round(basic * 0.1);
    const grossPay = basic + housing + transport;
    const tax = Math.round(grossPay * 0.1);
    const gosi = Math.round(grossPay * 0.0975);
    const deductions = tax + gosi;
    const netPay = grossPay - deductions;

    return {
      emp,
      dept: deptNames[emp.departmentId ?? ''] ?? 'Other',
      basic, housing, transport, grossPay, tax, gosi, deductions, netPay,
      period, monthName: monthNames[period] || period,
    };
  }, [id, employees]);

  if (!payslipData) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-gray-500 dark:text-gray-400">Payslip not found</p>
        <Button variant="outline" className="mt-4" onClick={() => router.push('/payroll/payslips')}>
          Back to Payslips
        </Button>
      </div>
    );
  }

  const { emp, dept, period, monthName, basic, housing, transport, grossPay, tax, gosi, deductions, netPay } = payslipData;

  const handlePrint = () => window.print();

  const handleDownload = () => {
    const link = document.createElement('a');
    const lines = [
      `PAYSLIP - ${period}`,
      `Employee: ${emp.fullName} (${emp.employeeNumber})`,
      `Department: ${dept}`,
      `Bank: ${emp.bankName ?? '-'} - ${emp.bankAccount ?? '-'}`,
      '',
      `Basic Salary: ${basic.toLocaleString()} ${emp.currency ?? 'SAR'}`,
      `Housing Allowance: ${housing.toLocaleString()} ${emp.currency ?? 'SAR'}`,
      `Transport Allowance: ${transport.toLocaleString()} ${emp.currency ?? 'SAR'}`,
      `Gross Pay: ${grossPay.toLocaleString()} ${emp.currency ?? 'SAR'}`,
      `Income Tax: -${tax.toLocaleString()} ${emp.currency ?? 'SAR'}`,
      `GOSI: -${gosi.toLocaleString()} ${emp.currency ?? 'SAR'}`,
      `Total Deductions: -${deductions.toLocaleString()} ${emp.currency ?? 'SAR'}`,
      '',
      `NET PAY: ${netPay.toLocaleString()} ${emp.currency ?? 'SAR'}`,
    ];
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    link.href = URL.createObjectURL(blob);
    link.download = `${emp.fullName.replace(/\s+/g, '_')}_${period.replace(/\s+/g, '_')}.txt`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center justify-between print:hidden">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/payroll/payslips')}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payslip</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">{period} &middot; {emp.fullName}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}><Download className="h-4 w-4" /> Download</Button>
          <Button variant="outline" size="sm" onClick={handlePrint}><Printer className="h-4 w-4" /> Print</Button>
          <Button variant="outline" size="sm"><Mail className="h-4 w-4" /> Email</Button>
        </div>
      </div>

      <div className="mx-auto max-w-3xl">
        <Card className="overflow-hidden border-0 shadow-xl print:border print:shadow-none">
          {/* Top gradient bar */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-600" />

          <CardContent className="p-0 print:p-0">
            {/* Header */}
            <div className="border-b bg-gradient-to-br from-gray-50 to-white px-8 py-6 dark:from-gray-900 dark:to-gray-800/50">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold tracking-wider">AC</div>
                    <div>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">Acme Corp</p>
                      <p className="text-xs text-gray-500">Riyadh, Saudi Arabia</p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold uppercase tracking-widest text-gray-400">Payslip</p>
                  <p className="text-xs text-gray-500">{period}</p>
                </div>
              </div>
            </div>

            {/* Employee Info Banner */}
            <div className="grid grid-cols-3 divide-x bg-gray-50/80 px-8 py-4 text-sm dark:bg-gray-800/40">
              <div className="space-y-0.5">
                <p className="text-xs text-gray-400">Employee</p>
                <p className="font-semibold text-gray-900 dark:text-white">{emp.fullName}</p>
                <p className="text-xs text-gray-500">#{emp.employeeNumber}</p>
              </div>
              <div className="space-y-0.5 px-6">
                <p className="text-xs text-gray-400">Department</p>
                <p className="font-semibold text-gray-900 dark:text-white">{dept}</p>
              </div>
              <div className="space-y-0.5 pl-6">
                <p className="text-xs text-gray-400">Payment Date</p>
                <p className="font-semibold text-gray-900 dark:text-white">End of {monthName}</p>
              </div>
            </div>

            {/* Earnings & Deductions */}
            <div className="grid grid-cols-2 gap-0 divide-x px-8 py-6">
              {/* Earnings */}
              <div className="pr-8">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-green-600">Earnings</h3>
                </div>
                <div className="space-y-0">
                  {[
                    { label: 'Basic Salary', amount: basic },
                    { label: 'Housing Allowance', amount: housing },
                    { label: 'Transport Allowance', amount: transport },
                  ].map((item, i) => (
                    <div key={item.label} className={`flex justify-between px-3 py-2 text-sm ${i % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/20' : ''} -mx-3`}>
                      <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="mt-2 flex justify-between rounded-md bg-green-50 px-3 py-2.5 text-sm font-semibold dark:bg-green-900/20">
                    <span className="text-green-700 dark:text-green-400">Gross Pay</span>
                    <span className="text-green-600">{formatCurrency(grossPay)}</span>
                  </div>
                </div>
              </div>

              {/* Deductions */}
              <div className="pl-8">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-red-500" />
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-red-600">Deductions</h3>
                </div>
                <div className="space-y-0">
                  {[
                    { label: 'Income Tax (10%)', amount: tax, pct: '10%' },
                    { label: 'GOSI (9.75%)', amount: gosi, pct: '9.75%' },
                  ].map((item, i) => (
                    <div key={item.label} className={`flex justify-between px-3 py-2 text-sm ${i % 2 === 0 ? 'bg-gray-50/50 dark:bg-gray-800/20' : ''} -mx-3`}>
                      <span className="text-gray-600 dark:text-gray-400">{item.label}</span>
                      <span className="font-medium text-red-600">-{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div className="mt-2 flex justify-between rounded-md bg-red-50 px-3 py-2.5 text-sm font-semibold dark:bg-red-900/20">
                    <span className="text-red-700 dark:text-red-400">Total Deductions</span>
                    <span className="text-red-600">-{formatCurrency(deductions)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Net Pay */}
            <div className="mx-8 mb-6 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 p-5 text-white shadow-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-100">Net Pay</p>
                  <p className="text-xs text-blue-200">After all deductions</p>
                </div>
                <p className="text-3xl font-bold tracking-tight">{formatCurrency(netPay)}</p>
              </div>
            </div>

            {/* Bank Info Row */}
            <div className="border-t bg-gray-50/80 px-8 py-3 dark:bg-gray-800/40">
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Bank: <span className="font-medium text-gray-700 dark:text-gray-300">{emp.bankName ?? '-'}</span></span>
                <span>Account: <span className="font-medium text-gray-700 dark:text-gray-300">{emp.bankAccount ?? '-'}</span></span>
                <span className="text-gray-400">Computer-generated — no signature required</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}