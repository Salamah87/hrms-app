'use client';

import { useState } from 'react';
import {
  Building2,
  Save,
  Upload,
  Globe,
  CalendarDays,
  DollarSign,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { CardSkeleton } from '@/components/ui/loading';
import { cn } from '@/lib/utils';

const timezones = [
  { value: 'asia/riyadh', label: 'Asia/Riyadh (UTC+3)' },
  { value: 'asia/dubai', label: 'Asia/Dubai (UTC+4)' },
  { value: 'america/new_york', label: 'America/New_York (UTC-5)' },
  { value: 'europe/london', label: 'Europe/London (UTC+0)' },
  { value: 'asia/kolkata', label: 'Asia/Kolkata (UTC+5:30)' },
];

const dateFormats = [
  { value: 'MM/DD/YYYY', label: 'MM/DD/YYYY' },
  { value: 'DD/MM/YYYY', label: 'DD/MM/YYYY' },
  { value: 'YYYY-MM-DD', label: 'YYYY-MM-DD' },
];

const currencies = [
  { value: 'SAR', label: 'SAR - Saudi Riyal' },
  { value: 'AED', label: 'AED - UAE Dirham' },
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
];

const fiscalMonths = [
  { value: '1', label: 'January' },
  { value: '2', label: 'February' },
  { value: '3', label: 'March' },
  { value: '4', label: 'April' },
  { value: '5', label: 'May' },
  { value: '6', label: 'June' },
  { value: '7', label: 'July' },
  { value: '8', label: 'August' },
  { value: '9', label: 'September' },
  { value: '10', label: 'October' },
  { value: '11', label: 'November' },
  { value: '12', label: 'December' },
];

export default function GeneralSettingsPage() {
  const [isLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [companyName, setCompanyName] = useState('Acme Corporation');
  const [companyEmail, setCompanyEmail] = useState('info@acme.com');
  const [companyPhone, setCompanyPhone] = useState('+966 11 234 5678');
  const [companyAddress, setCompanyAddress] = useState('123 Business Tower, King Fahd Road');
  const [companyCity, setCompanyCity] = useState('Riyadh');
  const [companyCountry, setCompanyCountry] = useState('Saudi Arabia');
  const [timezone, setTimezone] = useState('asia/riyadh');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [currency, setCurrency] = useState('SAR');
  const [fiscalStart, setFiscalStart] = useState('1');
  const [fiscalYear, setFiscalYear] = useState('2026');

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">General Settings</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage company information and regional settings</p>
        </div>
        <CardSkeleton count={2} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">General Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage company information and regional settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Company Information
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-6">
              <div className="flex h-20 w-20 items-center justify-center rounded-xl bg-gray-100 dark:bg-gray-800">
                <Building2 className="h-8 w-8 text-gray-400" />
              </div>
              <div>
                <Button variant="outline" size="sm" leftIcon={<Upload className="h-4 w-4" />}>
                  Upload Logo
                </Button>
                <p className="mt-1 text-xs text-gray-400">PNG, JPG. Max 2MB</p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              <Input label="Company Email" type="email" value={companyEmail} onChange={(e) => setCompanyEmail(e.target.value)} />
              <Input label="Phone Number" value={companyPhone} onChange={(e) => setCompanyPhone(e.target.value)} />
              <Input label="City" value={companyCity} onChange={(e) => setCompanyCity(e.target.value)} />
              <Input label="Country" value={companyCountry} onChange={(e) => setCompanyCountry(e.target.value)} className="sm:col-span-2" />
              <Input label="Address" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} className="sm:col-span-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Regional Settings
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Timezone" options={timezones} value={timezone} onChange={(e) => setTimezone(e.target.value)} />
            <Select label="Date Format" options={dateFormats} value={dateFormat} onChange={(e) => setDateFormat(e.target.value)} />
            <Select label="Currency" options={currencies} value={currency} onChange={(e) => setCurrency(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            <div className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Fiscal Year Configuration
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select label="Fiscal Year Start Month" options={fiscalMonths} value={fiscalStart} onChange={(e) => setFiscalStart(e.target.value)} />
            <Input label="Fiscal Year" value={fiscalYear} onChange={(e) => setFiscalYear(e.target.value)} placeholder="e.g. 2026" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Reset</Button>
        <Button onClick={handleSave} isLoading={isSaving} leftIcon={<Save className="h-4 w-4" />}>
          Save Changes
        </Button>
      </div>
    </div>
  );
}

