'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, X, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table } from '@/components/ui/table';
import { cn } from '@/lib/utils';

export default function ImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ imported: number; errors: { row: number; message: string }[]; employees: any[] } | null>(null);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragging(true); };
  const handleDragLeave = () => setDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && (f.name.endsWith('.csv') || f.name.endsWith('.xlsx') || f.name.endsWith('.xls'))) {
      setFile(f);
    } else toast.error('Please upload a CSV or Excel file');
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/employees/import', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResult(data);
      if (data.imported > 0) {
        toast.success(`Imported ${data.imported} employees`);
      }
      if (data.errors?.length) {
        toast.error(`${data.errors.length} rows had errors`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Import failed');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Import Employees</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Upload CSV or Excel files to bulk-add employees</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/employees')}>
            <Users className="h-4 w-4" /> View Employees
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              'flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-12 transition-colors',
              dragging ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-900/20' : 'border-gray-300 dark:border-gray-700',
              file ? 'bg-gray-50 dark:bg-gray-800/50' : ''
            )}
          >
            {file ? (
              <>
                <FileSpreadsheet className="h-12 w-12 text-blue-500" />
                <div className="text-center">
                  <p className="font-medium text-gray-900 dark:text-white">{file.name}</p>
                  <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => { setFile(null); setResult(null); }}>
                    <X className="h-4 w-4" /> Remove
                  </Button>
                  <Button onClick={handleImport} isLoading={importing}>
                    <Upload className="h-4 w-4" /> Import
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-gray-300 dark:text-gray-600" />
                <div className="text-center">
                  <p className="font-medium text-gray-900 dark:text-white">Drop your file here, or click to browse</p>
                  <p className="text-sm text-gray-500 mt-1">Supports .csv, .xlsx, .xls files</p>
                </div>
                <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <FileSpreadsheet className="h-4 w-4" /> Select File
                </Button>
                <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setFile(f);
                }} />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle>Required Columns</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
          <p>The file should include these columns (case-insensitive):</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { col: 'firstName', req: true },
              { col: 'lastName', req: false },
              { col: 'email', req: true },
              { col: 'phone', req: false },
              { col: 'location', req: false },
              { col: 'departmentId', req: false },
              { col: 'positionId', req: false },
              { col: 'joiningDate', req: false },
            ].map((c) => (
              <div key={c.col} className="flex items-center gap-2">
                <code className="rounded bg-gray-100 px-2 py-0.5 text-xs dark:bg-gray-800">{c.col}</code>
                {c.req && <Badge variant="danger" size="sm">Required</Badge>}
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs">Download a <a href="#" onClick={(e) => { e.preventDefault(); toast('Template download - implement as needed'); }} className="text-blue-600 hover:underline">template</a> to get started.</p>
        </CardContent>
      </Card>

      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Import Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 dark:bg-green-900/20">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-700 dark:text-green-400">{result.imported} imported</span>
              </div>
              {result.errors.length > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 dark:bg-red-900/20">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <span className="text-sm font-medium text-red-700 dark:text-red-400">{result.errors.length} errors</span>
                </div>
              )}
            </div>
            {result.employees.length > 0 && (
              <Table
                columns={[
                  { key: 'employeeNumber', header: 'EMP ID' },
                  { key: 'fullName', header: 'Name' },
                  { key: 'email', header: 'Email' },
                  { key: 'departmentId', header: 'Department' },
                ]}
                data={result.employees}
                keyExtractor={(item: any) => item.id}
              />
            )}
            {result.errors.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-2">Skipped Rows</h3>
                <div className="space-y-1">
                  {result.errors.map((err, i) => (
                    <div key={i} className="flex gap-3 text-sm text-gray-600 dark:text-gray-400">
                      <span className="font-mono text-xs text-gray-400">Row {err.row}:</span>
                      <span>{err.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
