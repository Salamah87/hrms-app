'use client';

import { useState } from 'react';
import { Download, FileSpreadsheet, Building2, CalendarRange } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ReportCard {
  title: string;
  description: string;
  icon: typeof FileSpreadsheet;
  color: string;
}

const reports: ReportCard[] = [
  { title: 'Payroll Register', description: 'Detailed payroll register with earnings, deductions, and net pay for all employees', icon: FileSpreadsheet, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400' },
  { title: 'Bank Transfer File', description: 'Generate bank transfer file compatible with banking systems for salary disbursement', icon: Building2, color: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400' },
  { title: 'Yearly Summary', description: 'Annual payroll summary with month-by-month breakdown of costs and headcount', icon: CalendarRange, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400' },
];

export default function PayrollReportsPage() {
  const [dateRange, setDateRange] = useState({ from: '2026-01-01', to: '2026-12-31' });

  const handleExport = (title: string) => {
    console.log(`Exporting ${title}...`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payroll Reports</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Generate and export payroll reports</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Date Range</CardTitle>
          <div className="flex items-center gap-3">
            <Input type="date" label="From" value={dateRange.from} onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })} className="w-44" />
            <Input type="date" label="To" value={dateRange.to} onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })} className="w-44" />
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.title}>
            <CardContent className="px-6 py-6">
              <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-xl ${report.color}`}>
                <report.icon className="h-7 w-7" />
              </div>
              <h3 className="mb-1 text-lg font-semibold text-gray-900 dark:text-white">{report.title}</h3>
              <p className="mb-5 text-sm text-gray-500 dark:text-gray-400">{report.description}</p>
              <Button className="w-full" variant="outline" leftIcon={<Download className="h-4 w-4" />} onClick={() => handleExport(report.title)}>
                Export
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

