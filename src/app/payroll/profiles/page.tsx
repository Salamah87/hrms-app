'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  Banknote,
  Wallet,
  Users,
  Search,
  Pencil,
  Eye,
  DollarSign,
  Building2,
  Briefcase,
  BadgeCheck,
  Calendar,
  Percent,
  Shield,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SearchInput } from '@/components/ui/search-input';
import { Avatar } from '@/components/ui/avatar';
import { formatCurrency } from '@/lib/utils';
import type { Employee } from '@/types';

interface PayrollProfile {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  position: string;
  employmentType: string;
  salaryType: 'monthly' | 'daily' | 'hourly' | 'weekly';
  baseSalary: number;
  currency: string;
  bankName: string;
  bankAccount: string;
  taxId: string;
  socialSecurityNumber: string;
  gosiContribution: number;
  status: 'active' | 'inactive';
  joiningDate: string;
  lastPayrollDate?: string;
}

const deptNames: Record<string, string> = {
  'dept-1': 'Engineering', 'dept-2': 'Marketing', 'dept-3': 'Sales',
  'dept-4': 'Finance', 'dept-5': 'HR',
};

const salaryTypeOptions = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'daily', label: 'Daily' },
  { value: 'hourly', label: 'Hourly' },
  { value: 'weekly', label: 'Weekly' },
];

export default function PayrollProfilesPage() {
  const [profiles, setProfiles] = useState<PayrollProfile[]>([]);
  const [search, setSearch] = useState('');
  const [displayMode, setDisplayMode] = useState('monthly');
  const [selectedProfile, setSelectedProfile] = useState<PayrollProfile | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<PayrollProfile | null>(null);

  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then((emps: Employee[]) => {
        const mapped: PayrollProfile[] = emps.map((e, i) => ({
          id: `pp-${e.id}`,
          employeeId: e.id,
          employeeName: e.fullName,
          department: deptNames[e.departmentId ?? ''] ?? 'Other',
          position: ['Senior Developer', 'HR Director', 'Finance Manager', 'Sales Manager', 'Lead Developer', 'Marketing Manager', 'Accountant', 'HR Coordinator', 'DevOps Engineer', 'Marketing Specialist', 'Sales Representative', 'Junior Developer'][i] || 'Employee',
          employmentType: 'Full-Time',
          salaryType: e.salaryType ?? 'monthly',
          baseSalary: e.salary ?? 0,
          currency: e.currency ?? 'SAR',
          bankName: e.bankName ?? '',
          bankAccount: e.bankAccount ?? '',
          taxId: `TX-${1001 + i}`,
          socialSecurityNumber: `GOSI-${1001 + i}`,
          gosiContribution: (() => {
            const monthly = e.salaryType === 'daily' ? (e.salary ?? 0) * 30 : e.salaryType === 'weekly' ? (e.salary ?? 0) * 6 : e.salaryType === 'hourly' ? (e.salary ?? 0) * 30 * 8 : (e.salary ?? 0);
            return Math.round(monthly * 0.0975);
          })(),
          status: e.status === 'active' ? 'active' : 'inactive',
          joiningDate: e.joiningDate.split('T')[0],
          lastPayrollDate: '2026-05-30',
        }));
        setProfiles(mapped);
      });
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const q = params.get('search');
    if (q) setSearch(q);
  }, []);

  const filtered = useMemo(() => {
    let result = profiles;
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.employeeName.toLowerCase().includes(q) || p.department.toLowerCase().includes(q));
    }
    return result;
  }, [profiles, search]);

  const openEdit = (profile: PayrollProfile) => {
    setSelectedProfile(profile);
    setEditForm({ ...profile });
    setShowEditModal(true);
  };

  const convertSalary = (amount: number, from: string, to: string): number => {
    const monthly = from === 'monthly' ? amount : from === 'daily' ? amount * 30 : from === 'weekly' ? amount * 6 : amount * 30 * 8;
    if (to === 'monthly') return monthly;
    if (to === 'daily') return Math.round(monthly / 30);
    if (to === 'weekly') return Math.round(monthly / 30 * 5);
    return Math.round(monthly / 30 / 8); // hourly
  };

  const handleSalaryTypeChange = (newType: string) => {
    if (!editForm) return;
    const converted = convertSalary(editForm.baseSalary, editForm.salaryType, newType);
    setEditForm({ ...editForm, salaryType: newType as any, baseSalary: converted });
  };

  const saveEdit = async () => {
    if (!editForm) return;
    try {
      const res = await fetch(`/api/employees/${editForm.employeeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ salary: editForm.baseSalary, salaryType: editForm.salaryType }),
      });
      if (!res.ok) throw new Error('Failed to save');
      const updated = await res.json();
      setProfiles(prev => prev.map(p => p.employeeId === updated.id ? { ...p, baseSalary: updated.salary, salaryType: updated.salaryType ?? 'monthly' } : p));
      toast.success(`Profile updated for ${editForm.employeeName}`);
      setShowEditModal(false);
    } catch {
      toast.error('Failed to save profile');
    }
  };

  const toMonthly = (p: PayrollProfile) =>
    p.salaryType === 'monthly' ? p.baseSalary : p.salaryType === 'daily' ? p.baseSalary * 30 : p.salaryType === 'weekly' ? p.baseSalary * 6 : p.baseSalary * 30 * 8;

  const displaySalary = (p: PayrollProfile) => {
    const monthly = toMonthly(p);
    if (displayMode === 'monthly') return monthly;
    if (displayMode === 'daily') return Math.round(monthly / 30);
    if (displayMode === 'weekly') return Math.round(monthly / 30 * 5);
    return Math.round(monthly / 30 / 8); // hourly
  };

  const displayLabel = displayMode === 'monthly' ? 'Monthly Salary' : displayMode === 'daily' ? 'Daily Rate' : displayMode === 'weekly' ? 'Weekly Rate' : 'Hourly Rate';
  const displaySuffix = displayMode === 'monthly' ? '/mo' : displayMode === 'daily' ? '/day' : displayMode === 'weekly' ? '/wk' : '/hr';

  const totals = useMemo(() => ({
    total: profiles.length,
    active: profiles.filter((p) => p.status === 'active').length,
    payrollCost: profiles.reduce((s, p) => s + toMonthly(p), 0),
    avgSalary: Math.round(profiles.reduce((s, p) => s + toMonthly(p), 0) / profiles.length),
  }), [profiles]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Employee Payroll Profiles</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage salary, bank, tax, and social security information</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 px-6 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"><Users className="h-6 w-6" /></div>
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Total Employees</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{totals.total}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 px-6 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400"><BadgeCheck className="h-6 w-6" /></div>
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Active Profiles</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{totals.active}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 px-6 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400"><Banknote className="h-6 w-6" /></div>
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Total Monthly Cost</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totals.payrollCost)}</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 px-6 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400"><Wallet className="h-6 w-6" /></div>
            <div><p className="text-sm text-gray-500 dark:text-gray-400">Average Salary</p><p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totals.avgSalary)}</p></div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or department..." className="w-72" />
        <Select options={salaryTypeOptions} value={displayMode} onChange={(e) => setDisplayMode(e.target.value)} className="w-40" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((profile) => (
          <Card key={profile.id} className="transition-shadow hover:shadow-md">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <Avatar name={profile.employeeName} size="md" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{profile.employeeName}</h3>
                  <p className="text-xs text-gray-500">{profile.position} &middot; {profile.department}</p>
                  <Badge variant={profile.status === 'active' ? 'success' : 'default'} size="sm" className="mt-1">{profile.status === 'active' ? 'Active' : 'Inactive'}</Badge>
                </div>
                <div className="flex gap-1">
                  <Link href={`/employees/${profile.employeeId}`} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><Eye className="h-4 w-4" /></Link>
                  <button onClick={() => openEdit(profile)} className="rounded p-1.5 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"><Pencil className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">{displayLabel}</p>
                    <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(displaySalary(profile))}<span className="text-xs text-gray-400 font-normal">{displaySuffix}</span></p>
                  </div>
                  <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800">
                    <p className="text-xs text-gray-500">{displayMode === 'monthly' ? 'Type' : 'Monthly Equiv'}</p>
                    <p className="font-semibold text-gray-900 dark:text-white capitalize">{displayMode === 'monthly' ? profile.salaryType : formatCurrency(toMonthly(profile))}<span className="text-xs text-gray-400 font-normal">{displayMode === 'monthly' ? '' : '/mo'}</span></p>
                  </div>
                <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800">
                  <p className="text-xs text-gray-500">Bank</p>
                  <p className="font-semibold text-gray-900 dark:text-white truncate">{profile.bankName}</p>
                </div>
                <div className="rounded-lg bg-gray-50 p-2.5 dark:bg-gray-800">
                  <p className="text-xs text-gray-500">GOSI</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(profile.gosiContribution)}/mo</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                <span>Joined {profile.joiningDate}</span>
                {profile.lastPayrollDate && <span>Last pay: {profile.lastPayrollDate}</span>}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title={`Edit Profile — ${editForm?.employeeName}`} size="lg">
        {editForm && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Base Salary" type="number" value={String(editForm.baseSalary)} onChange={(e) => setEditForm({ ...editForm, baseSalary: Number(e.target.value) })} />
              <Select label="Salary Type" options={[{ value: 'monthly', label: 'Monthly' }, { value: 'daily', label: 'Daily' }, { value: 'hourly', label: 'Hourly' }, { value: 'weekly', label: 'Weekly' }]} value={editForm.salaryType} onChange={(e) => handleSalaryTypeChange(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Bank Name" value={editForm.bankName} onChange={(e) => setEditForm({ ...editForm, bankName: e.target.value })} />
              <Input label="Bank Account" value={editForm.bankAccount} onChange={(e) => setEditForm({ ...editForm, bankAccount: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="Tax ID" value={editForm.taxId} onChange={(e) => setEditForm({ ...editForm, taxId: e.target.value })} />
              <Input label="Social Security #" value={editForm.socialSecurityNumber} onChange={(e) => setEditForm({ ...editForm, socialSecurityNumber: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Input label="GOSI Contribution" type="number" value={String(editForm.gosiContribution)} onChange={(e) => setEditForm({ ...editForm, gosiContribution: Number(e.target.value) })} />
              <Select label="Status" options={[{ value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} value={editForm.status} onChange={(e) => setEditForm({ ...editForm, status: e.target.value as any })} />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
              <Button onClick={saveEdit}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
