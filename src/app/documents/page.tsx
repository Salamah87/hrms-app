'use client';

import { useState } from 'react';
import {
  FileText,
  Upload,
  Plus,
  Search,
  Download,
  Eye,
  AlertTriangle,
  Clock,
  File,
  FolderOpen,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs } from '@/components/ui/tabs';
import { SearchInput } from '@/components/ui/search-input';
import { CardSkeleton } from '@/components/ui/loading';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';

const mockTemplates = [
  { id: 'dt1', name: 'Employment Contract', category: 'Contracts', variables: 8, updatedAt: '2026-06-15' },
  { id: 'dt2', name: 'Offer Letter', category: 'Recruitment', variables: 6, updatedAt: '2026-06-10' },
  { id: 'dt3', name: 'NDA Agreement', category: 'Legal', variables: 4, updatedAt: '2026-06-01' },
  { id: 'dt4', name: 'Salary Certificate', category: 'Payroll', variables: 5, updatedAt: '2026-05-28' },
  { id: 'dt5', name: 'Experience Letter', category: 'HR', variables: 7, updatedAt: '2026-05-20' },
];

const mockEmployeeDocs = [
  { id: 'ed1', employee: 'Ahmad Khaled', document: 'Employment Contract', category: 'Contracts', uploadedAt: '2026-06-20', expiresAt: '2027-06-20', status: 'active' as const },
  { id: 'ed2', employee: 'Sarah Johnson', document: 'Passport Copy', category: 'Identification', uploadedAt: '2026-05-15', expiresAt: '2026-08-15', status: 'expiring_soon' as const },
  { id: 'ed3', employee: 'Michael Brown', document: 'NDA Agreement', category: 'Legal', uploadedAt: '2026-06-01', expiresAt: '2026-09-01', status: 'active' as const },
  { id: 'ed4', employee: 'Nora Hassan', document: 'Visa Document', category: 'Immigration', uploadedAt: '2026-04-10', expiresAt: '2026-07-10', status: 'expiring_soon' as const },
  { id: 'ed5', employee: 'Robert Wilson', document: 'ID Card Copy', category: 'Identification', uploadedAt: '2026-03-01', expiresAt: '2026-06-01', status: 'expired' as const },
  { id: 'ed6', employee: 'Jennifer Lee', document: 'Salary Certificate', category: 'Payroll', uploadedAt: '2026-06-25', expiresAt: null, status: 'active' as const },
];

const statusVariant: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
  active: 'success',
  expiring_soon: 'warning',
  expired: 'danger',
};

const categories = [
  { value: '', label: 'All Categories' },
  { value: 'contracts', label: 'Contracts' },
  { value: 'recruitment', label: 'Recruitment' },
  { value: 'legal', label: 'Legal' },
  { value: 'payroll', label: 'Payroll' },
  { value: 'identification', label: 'Identification' },
  { value: 'immigration', label: 'Immigration' },
];

const employees = [
  { value: 'emp-1', label: 'Ahmad Khaled' },
  { value: 'emp-2', label: 'Sarah Johnson' },
  { value: 'emp-3', label: 'Michael Brown' },
  { value: 'emp-4', label: 'Nora Hassan' },
  { value: 'emp-5', label: 'Robert Wilson' },
];

export default function DocumentsPage() {
  const [isLoading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showCreateTemplateModal, setShowCreateTemplateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [employeeDocSearch, setEmployeeDocSearch] = useState('');

  const today = new Date();
  const expiringSoonDocs = mockEmployeeDocs.filter((d) => {
    if (!d.expiresAt) return false;
    const exp = new Date(d.expiresAt);
    const diffDays = Math.ceil((exp.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 90;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage document templates and employee documents</p>
        </div>
        <CardSkeleton count={3} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Documents</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage document templates and employee documents</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setShowCreateTemplateModal(true)}>
            <Plus className="h-4 w-4" />
            Create Template
          </Button>
          <Button onClick={() => setShowUploadModal(true)}>
            <Upload className="h-4 w-4" />
            Upload Document
          </Button>
        </div>
      </div>

      {expiringSoonDocs.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-900/10">
          <CardContent className="flex items-center gap-3 px-6 py-4">
            <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                {expiringSoonDocs.length} document{expiringSoonDocs.length > 1 ? 's' : ''} expiring within 90 days
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400">Review and renew before expiration</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setEmployeeDocSearch('expiring')}>Review Now</Button>
          </CardContent>
        </Card>
      )}

      <Tabs
        tabs={[
          {
            id: 'templates',
            label: 'Templates',
            badge: mockTemplates.length,
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Document Templates</CardTitle>
                  <div className="flex items-center gap-3">
                    <Select options={categories} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-40" />
                    <Button variant="outline" size="sm" onClick={() => setShowCreateTemplateModal(true)}>
                      <Plus className="h-4 w-4" />
                      New Template
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table
                    columns={[
                      { key: 'name', header: 'Template Name', sortable: true },
                      { key: 'category', header: 'Category', sortable: true },
                      {
                        key: 'variables', header: 'Variables',
                        render: (item: any) => (
                          <span className="text-sm text-gray-700 dark:text-gray-300">{item.variables} vars</span>
                        ),
                      },
                      {
                        key: 'updatedAt', header: 'Last Updated',
                        render: (item: any) => (
                          <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(item.updatedAt as string)}</span>
                        ),
                      },
                      {
                        key: 'actions', header: '',
                        className: 'w-32',
                        render: () => (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm"><FileText className="h-4 w-4" /></Button>
                          </div>
                        ),
                      },
                    ]}
                    data={mockTemplates as any[]}
                    keyExtractor={(item) => item.id as string}
                    sortable
                    emptyState={
                      <EmptyState icon={FileText} title="No templates" description="Create your first document template" />
                    }
                  />
                </CardContent>
              </Card>
            ),
          },
          {
            id: 'employee-docs',
            label: 'Employee Documents',
            badge: mockEmployeeDocs.length,
            content: (
              <Card>
                <CardHeader>
                  <CardTitle>Employee Documents</CardTitle>
                  <SearchInput value={employeeDocSearch} onChange={setEmployeeDocSearch} placeholder="Search by employee or document..." className="w-72" />
                </CardHeader>
                <CardContent className="p-0">
                  <Table
                    columns={[
                      { key: 'employee', header: 'Employee', sortable: true },
                      { key: 'document', header: 'Document', sortable: true },
                      { key: 'category', header: 'Category' },
                      {
                        key: 'uploadedAt', header: 'Uploaded',
                        render: (item: any) => (
                          <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(item.uploadedAt as string)}</span>
                        ),
                      },
                      {
                        key: 'expiresAt', header: 'Expires',
                        render: (item: any) => {
                          if (!item.expiresAt) return <span className="text-sm text-gray-400">N/A</span>;
                          const exp = new Date(item.expiresAt as string);
                          const diffDays = Math.ceil((exp.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                          return (
                            <span className={`text-sm ${diffDays <= 30 ? 'font-medium text-red-600' : diffDays <= 90 ? 'text-yellow-600' : 'text-gray-700 dark:text-gray-300'}`}>
                              {formatDate(item.expiresAt as string)} {diffDays <= 30 ? '(Urgent)' : diffDays <= 90 ? '(Soon)' : ''}
                            </span>
                          );
                        },
                      },
                      {
                        key: 'status', header: 'Status',
                        render: (item: any) => (
                          <Badge variant={statusVariant[item.status as string]}>
                            {(item.status as string).replace('_', ' ')}
                          </Badge>
                        ),
                      },
                      {
                        key: 'actions', header: '',
                        className: 'w-24',
                        render: () => (
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button>
                            <Button variant="ghost" size="sm"><Trash2 className="h-4 w-4 text-red-500" /></Button>
                          </div>
                        ),
                      },
                    ]}
                    data={mockEmployeeDocs as any[]}
                    keyExtractor={(item) => item.id as string}
                    sortable
                    emptyState={
                      <EmptyState icon={FolderOpen} title="No documents" description="Upload employee documents to get started" />
                    }
                  />
                </CardContent>
              </Card>
            ),
          },
        ]}
      />

      <Modal isOpen={showUploadModal} onClose={() => setShowUploadModal(false)} title="Upload Document" size="md">
        <div className="space-y-4">
          <Select label="Employee" options={employees} placeholder="Select employee..." />
          <Select label="Category" options={categories.slice(1)} placeholder="Select category..." />
          <Input label="Document Name" placeholder="e.g. Employment Contract" />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">File</label>
            <div className="mt-2 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 dark:border-gray-600">
              <div className="text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <p className="mt-2 text-sm text-gray-500">Drag & drop or click to browse</p>
                <p className="text-xs text-gray-400">PDF, DOC, DOCX, PNG, JPG (max 10MB)</p>
              </div>
            </div>
          </div>
          <Input label="Expiry Date" type="date" />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowUploadModal(false)}>Cancel</Button>
            <Button>Upload Document</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showCreateTemplateModal} onClose={() => setShowCreateTemplateModal(false)} title="Create Document Template" size="lg">
        <div className="space-y-4">
          <Input label="Template Name" placeholder="e.g. Employment Contract" />
          <Select label="Category" options={categories.slice(1)} placeholder="Select category..." />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Template Content</label>
            <textarea
              rows={8}
              className="mt-2 w-full rounded-lg border border-gray-300 bg-white p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              placeholder={`Use {{variable_name}} for dynamic fields\n\nDear {{employee_name}},\n\nWe are pleased to offer you...`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Variables</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {['employee_name', 'position', 'department', 'salary', 'start_date', 'manager_name'].map((v) => (
                <Badge key={v} variant="info" size="sm">{`{{${v}}}`}</Badge>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowCreateTemplateModal(false)}>Cancel</Button>
            <Button variant="outline" leftIcon={<Eye className="h-4 w-4" />}>Preview</Button>
            <Button>Create Template</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

