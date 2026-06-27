'use client';

import { useState } from 'react';
import {
  FileText,
  Users,
  Clock,
  CalendarDays,
  Banknote,
  UserMinus,
  BarChart3,
  PieChart,
  Download,
  FileSpreadsheet,
  File as FileIcon,
  Eye,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select } from '@/components/ui/select';
import { CardSkeleton } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';

interface ReportType {
  id: string;
  title: string;
  description: string;
  icon: typeof FileText;
  color: string;
}

const reportTypes: ReportType[] = [
  { id: 'employee-list', title: 'Employee List', description: 'Complete list of all employees with details', icon: Users, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400' },
  { id: 'attendance-summary', title: 'Attendance Summary', description: 'Monthly attendance and punctuality report', icon: Clock, color: 'text-green-600 bg-green-100 dark:bg-green-900/20 dark:text-green-400' },
  { id: 'leave-report', title: 'Leave Report', description: 'Leave balances and usage by employee', icon: CalendarDays, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/20 dark:text-purple-400' },
  { id: 'payroll-register', title: 'Payroll Register', description: 'Detailed payroll summary for a period', icon: Banknote, color: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/20 dark:text-yellow-400' },
  { id: 'turnover-report', title: 'Turnover Report', description: 'Employee turnover and retention analysis', icon: UserMinus, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/20 dark:text-orange-400' },
  { id: 'headcount-report', title: 'Headcount Report', description: 'Department-wise headcount distribution', icon: BarChart3, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-400' },
  { id: 'custom-report', title: 'Custom Report', description: 'Build a custom report with selected fields', icon: PieChart, color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/20 dark:text-rose-400' },
];

const periods = [
  { value: 'current', label: 'Current Month' },
  { value: 'last', label: 'Last Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

const mockPreviewData = {
  headers: ['Employee', 'Department', 'Status', 'Joining Date'],
  rows: [
    ['Ahmad Khaled', 'Engineering', 'Active', '2023-06-01'],
    ['Sarah Johnson', 'Marketing', 'Active', '2023-08-15'],
    ['Michael Brown', 'Sales', 'Active', '2024-01-10'],
    ['Nora Hassan', 'Finance', 'Active', '2024-03-22'],
    ['Robert Wilson', 'HR', 'Active', '2024-07-05'],
  ],
};

export default function ReportsPage() {
  const [isLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [period, setPeriod] = useState('current');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = (reportId: string) => {
    setSelectedReport(reportId);
    setIsGenerating(true);
    setTimeout(() => setIsGenerating(false), 1500);
  };

  const handleExport = (format: 'pdf' | 'excel' | 'csv') => {
    const blob = new Blob([`Exporting ${selectedReport} as ${format}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedReport}.${format === 'excel' ? 'xlsx' : format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Generate and export HR reports</p>
        </div>
        <CardSkeleton count={6} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Reports</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Generate and export HR reports</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {reportTypes.map((report) => (
          <Card
            key={report.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              selectedReport === report.id && 'ring-2 ring-blue-500 dark:ring-blue-400',
            )}
            onClick={() => setSelectedReport(report.id)}
          >
            <CardContent className="px-6 py-5">
              <div className="flex items-start justify-between">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${report.color}`}>
                  <report.icon className="h-6 w-6" />
                </div>
                {selectedReport === report.id && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <ChevronRight className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                )}
              </div>
              <h3 className="mt-4 text-base font-semibold text-gray-900 dark:text-white">{report.title}</h3>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{report.description}</p>
              <Button
                size="sm"
                className="mt-4 w-full"
                onClick={(e) => { e.stopPropagation(); handleGenerate(report.id); }}
                isLoading={isGenerating && selectedReport === report.id}
              >
                <FileText className="h-4 w-4" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedReport && (
        <Card>
          <CardHeader>
            <CardTitle>
              {reportTypes.find((r) => r.id === selectedReport)?.title || 'Report'}
            </CardTitle>
            <div className="flex items-center gap-3">
              <Select options={periods} value={period} onChange={(e) => setPeriod(e.target.value)} className="w-40" />
              <Badge variant="primary">Preview</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {isGenerating ? (
              <div className="flex h-48 items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600" />
                  <p className="text-sm text-gray-500 dark:text-gray-400">Generating report...</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto rounded-lg border dark:border-gray-800">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
                        {mockPreviewData.headers.map((h) => (
                          <th key={h} className="p-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y dark:divide-gray-800">
                      {mockPreviewData.rows.map((row, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                          {row.map((cell, j) => (
                            <td key={j} className="p-3 text-sm text-gray-700 dark:text-gray-300">
                              {cell}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="flex items-center justify-end gap-3">
                  <span className="text-sm text-gray-500">Export as:</span>
                  <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} leftIcon={<FileIcon className="h-4 w-4" />}>
                    PDF
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport('excel')} leftIcon={<FileSpreadsheet className="h-4 w-4" />}>
                    Excel
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleExport('csv')} leftIcon={<Download className="h-4 w-4" />}>
                    CSV
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

