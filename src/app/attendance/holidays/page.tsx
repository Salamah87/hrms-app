'use client';

import { useState, useEffect, useMemo } from 'react';
import { Plus, CalendarDays, Sun, Repeat, DollarSign, Trash2, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { EmptyState } from '@/components/ui/empty-state';
import { TableSkeleton } from '@/components/ui/loading';
import { formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const months = [
  { value: '', label: 'All Months' },
  { value: '0', label: 'January' }, { value: '1', label: 'February' },
  { value: '2', label: 'March' }, { value: '3', label: 'April' },
  { value: '4', label: 'May' }, { value: '5', label: 'June' },
  { value: '6', label: 'July' }, { value: '7', label: 'August' },
  { value: '8', label: 'September' }, { value: '9', label: 'October' },
  { value: '10', label: 'November' }, { value: '11', label: 'December' },
];

const countries = [
  { value: '', label: 'All Countries' },
  { value: 'LY', label: 'Libya' },
  { value: 'SA', label: 'Saudi Arabia' },
  { value: 'AE', label: 'UAE' },
  { value: 'US', label: 'United States' },
  { value: 'GB', label: 'United Kingdom' },
  { value: 'EG', label: 'Egypt' },
  { value: 'JO', label: 'Jordan' },
];

export default function HolidaysPage() {
  const [holidays, setHolidays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [monthFilter, setMonthFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [formData, setFormData] = useState({ name: '', date: '', country: '', recurring: false, paid: true });

  const fetchHolidays = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (countryFilter) params.set('country', countryFilter);
      const res = await fetch(`/api/attendance/holidays?${params}`);
      if (res.ok) setHolidays(await res.json());
    } catch { toast.error('Failed to load holidays'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchHolidays(); }, [countryFilter]);

  const filtered = useMemo(() => {
    let result = holidays;
    if (monthFilter) result = result.filter((h) => new Date(h.date).getMonth() === parseInt(monthFilter));
    if (yearFilter) result = result.filter((h) => new Date(h.date).getFullYear() === parseInt(yearFilter));
    return result;
  }, [holidays, monthFilter, yearFilter]);

  const handleAdd = async () => {
    try {
      const res = await fetch('/api/attendance/holidays', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      toast.success('Holiday added');
      setShowAddModal(false);
      setFormData({ name: '', date: '', country: '', recurring: false, paid: true });
      fetchHolidays();
    } catch { toast.error('Failed to add holiday'); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/attendance/holidays/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      toast.success('Holiday deleted');
      fetchHolidays();
    } catch { toast.error('Failed to delete'); }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Public Holidays</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage company holidays and observances</p></div>
        <TableSkeleton rows={5} columns={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Public Holidays</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage company holidays and observances</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} leftIcon={<Plus className="h-4 w-4" />}>Add Holiday</Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Holidays</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex gap-2 flex-wrap">
              {months.filter((m) => m.value).map((m) => (
                <button key={m.value} onClick={() => setMonthFilter(monthFilter === m.value ? '' : m.value)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${monthFilter === m.value ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700'}`}>
                  {m.label.slice(0, 3)}
                </button>
              ))}
            </div>
            <div className="w-24">
              <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                <option value="">All Years</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
            <div className="w-32">
              <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)}
                className="flex h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-xs dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300">
                {countries.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table
            columns={[
              { key: 'name', header: 'Holiday', sortable: true },
              {
                key: 'date', header: 'Date', sortable: true,
                render: (item: any) => (
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{formatDate(item.date)}</span>
                  </div>
                ),
              },
              {
                key: 'day', header: 'Day',
                render: (item: any) => (
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {new Date(item.date).toLocaleDateString('en-US', { weekday: 'long' })}
                  </span>
                ),
              },
              {
                key: 'country', header: 'Country',
                render: (item: any) => item.country ? (
                  <Badge variant="info" size="sm"><Globe className="mr-1 h-3 w-3" />{item.country}</Badge>
                ) : <span className="text-sm text-gray-400">—</span>,
              },
              {
                key: 'recurring', header: 'Recurring',
                render: (item: any) => item.recurring
                  ? <Badge variant="primary" size="sm"><Repeat className="mr-1 h-3 w-3" />Annual</Badge>
                  : <Badge variant="default" size="sm">One-time</Badge>,
              },
              {
                key: 'paid', header: 'Paid',
                render: (item: any) => item.paid
                  ? <Badge variant="success" size="sm"><DollarSign className="mr-1 h-3 w-3" />Paid</Badge>
                  : <Badge variant="danger" size="sm">Unpaid</Badge>,
              },
              {
                key: 'actions', header: '', className: 'w-16',
                render: (item: any) => (
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </Button>
                ),
              },
            ]}
            data={filtered}
            keyExtractor={(item) => item.id}
            sortable
            emptyState={
              <EmptyState icon={Sun} title="No holidays found" description={monthFilter || yearFilter || countryFilter ? 'Try adjusting your filters' : 'Add your first holiday'} />
            }
          />
        </CardContent>
      </Card>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Holiday" size="sm">
        <div className="space-y-4">
          <Input label="Holiday Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. National Day" />
          <Input label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
          <Select label="Country" options={countries.filter((c) => c.value)} value={formData.country} onChange={(e) => setFormData({ ...formData, country: e.target.value })} />
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={formData.recurring} onChange={(e) => setFormData({ ...formData, recurring: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Recurring annually</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={formData.paid} onChange={(e) => setFormData({ ...formData, paid: e.target.checked })}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="text-sm text-gray-700 dark:text-gray-300">Paid holiday</span>
          </label>
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button onClick={handleAdd}>Add Holiday</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
