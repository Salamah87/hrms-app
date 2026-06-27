'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, Play, CheckCircle, Lock, DollarSign, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { formatCurrency } from '@/lib/utils';

const employees = [
  { id: 'emp-1', name: 'Ahmad Khaled', dept: 'Engineering', basic: 15000 },
  { id: 'emp-2', name: 'Sarah Johnson', dept: 'HR', basic: 18000 },
  { id: 'emp-3', name: 'Michael Brown', dept: 'Finance', basic: 22000 },
  { id: 'emp-4', name: 'Nora Hassan', dept: 'Sales', basic: 14000 },
  { id: 'emp-5', name: 'Robert Wilson', dept: 'Engineering', basic: 16000 },
  { id: 'emp-6', name: 'Jennifer Lee', dept: 'Marketing', basic: 13000 },
  { id: 'emp-8', name: 'Lisa Anderson', dept: 'HR', basic: 12000 },
  { id: 'emp-9', name: 'James Taylor', dept: 'Engineering', basic: 25000 },
  { id: 'emp-10', name: 'Maria Garcia', dept: 'Marketing', basic: 11000 },
  { id: 'emp-11', name: 'William Thomas', dept: 'Sales', basic: 19000 },
  { id: 'emp-12', name: 'Amanda White', dept: 'Engineering', basic: 9000 },
  { id: 'emp-4b', name: 'Emily Davis', dept: 'Finance', basic: 13500 },
];

const mockRuns = employees.map((emp) => {
  const housing = Math.round(emp.basic * 0.3);
  const transport = Math.round(emp.basic * 0.1);
  const earnings = housing + transport;
  const grossPay = emp.basic + earnings;
  const tax = Math.round(grossPay * 0.1);
  const gosi = Math.round(grossPay * 0.0975);
  const deductions = tax + gosi;
  const net = grossPay - deductions;
  return {
    id: `run-${emp.id}`,
    employeeId: emp.id,
    employee: emp.name,
    department: emp.dept,
    basic: emp.basic,
    earnings,
    housing,
    transport,
    deductions,
    tax,
    gosi,
    grossPay,
    net,
    status: (['calculated', 'approved', 'paid'] as const)[Math.floor(Math.random() * 3)],
  };
});

const statusVariant: Record<string, 'warning' | 'info' | 'success'> = {
  calculated: 'warning',
  approved: 'info',
  paid: 'success',
};

export default function PayrollPeriodDetailPage() {
  const params = useParams();
  const periodName = 'June 2026';

  const [selectedRun, setSelectedRun] = useState<(typeof mockRuns)[number] | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const totals = useMemo(() => ({
    employees: mockRuns.length,
    basic: mockRuns.reduce((s, r) => s + r.basic, 0),
    earnings: mockRuns.reduce((s, r) => s + r.earnings, 0),
    deductions: mockRuns.reduce((s, r) => s + r.deductions + r.tax, 0),
    net: mockRuns.reduce((s, r) => s + r.net, 0),
    grossPay: mockRuns.reduce((s, r) => s + r.grossPay, 0),
  }), []);

  const openBreakdown = (run: (typeof mockRuns)[number]) => {
    setSelectedRun(run);
    setModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/payroll/processing">
          <Button variant="ghost" size="sm">
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{periodName}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            1 Jun 2026 – 30 Jun 2026 &middot; {totals.employees} employees &middot; Net: {formatCurrency(totals.net)}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm"><Play className="h-4 w-4" /> Process</Button>
          <Button variant="default" size="sm"><CheckCircle className="h-4 w-4" /> Approve</Button>
          <Button variant="outline" size="sm"><Lock className="h-4 w-4" /> Lock</Button>
          <Button variant="outline" size="sm"><DollarSign className="h-4 w-4" /> Mark Paid</Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-gray-500">Employees</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{totals.employees}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-gray-500">Basic Salary</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{formatCurrency(totals.basic)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-gray-500">Gross Pay</p>
            <p className="text-xl font-bold text-green-600">{formatCurrency(totals.grossPay)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-gray-500">Deductions</p>
            <p className="text-xl font-bold text-red-600">{formatCurrency(totals.deductions)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4 text-center">
            <p className="text-xs text-gray-500">Net Pay</p>
            <p className="text-xl font-bold text-blue-600">{formatCurrency(totals.net)}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Employee Payroll Runs</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'employee', header: 'Employee', sortable: true, render: (item: any) => <span className="font-medium text-gray-900 dark:text-white">{item.employee}</span> },
              { key: 'department', header: 'Department' },
              { key: 'basic', header: 'Basic', render: (item: any) => <span>{formatCurrency(item.basic)}</span> },
              { key: 'earnings', header: 'Earnings', render: (item: any) => <span className="text-green-600">{formatCurrency(item.earnings)}</span> },
              { key: 'deductions', header: 'Deductions', render: (item: any) => <span className="text-red-600">{formatCurrency(item.deductions)}</span> },
              { key: 'tax', header: 'Tax', render: (item: any) => <span className="text-red-600">{formatCurrency(item.tax)}</span> },
              { key: 'net', header: 'Net', render: (item: any) => <span className="font-semibold text-green-600">{formatCurrency(item.net)}</span> },
              {
                key: 'status', header: 'Status',
                render: (item: any) => <Badge variant={statusVariant[item.status]}>{item.status}</Badge>,
              },
              {
                key: 'actions', header: '', className: 'w-16',
                render: (item: any) => (
                  <Button variant="ghost" size="sm" onClick={() => openBreakdown(item)}>
                    <Eye className="h-4 w-4" />
                  </Button>
                ),
              },
            ]}
            data={mockRuns as any[]}
            keyExtractor={(item) => item.id}
            sortable
          />
        </CardContent>
      </Card>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={`Breakdown — ${selectedRun?.employee}`} size="md">
        {selectedRun && (
          <div className="space-y-5">
            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="mb-2 text-sm font-semibold text-green-600">Earnings</div>
              <div className="divide-y dark:divide-gray-700">
                {[
                  { label: 'Basic Salary', value: selectedRun.basic },
                  { label: 'Housing Allowance', value: selectedRun.housing },
                  { label: 'Transport Allowance', value: selectedRun.transport },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-1.5 text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(item.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1.5 text-sm font-semibold">
                  <span>Gross Pay</span>
                  <span className="text-green-600">{formatCurrency(selectedRun.grossPay)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
              <div className="mb-2 text-sm font-semibold text-red-600">Deductions</div>
              <div className="divide-y dark:divide-gray-700">
                {[
                  { label: 'Income Tax', value: selectedRun.tax },
                  { label: 'GOSI', value: selectedRun.gosi },
                ].map((item) => (
                  <div key={item.label} className="flex justify-between py-1.5 text-sm">
                    <span className="text-gray-500">{item.label}</span>
                    <span className="font-medium text-red-600">-{formatCurrency(item.value)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-1.5 text-sm font-semibold">
                  <span>Total Deductions</span>
                  <span className="text-red-600">-{formatCurrency(selectedRun.deductions + selectedRun.tax)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
              <div className="flex justify-between text-lg font-bold">
                <span>Net Pay</span>
                <span className="text-blue-600">{formatCurrency(selectedRun.net)}</span>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <Badge variant={statusVariant[selectedRun.status]}>{selectedRun.status}</Badge>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
