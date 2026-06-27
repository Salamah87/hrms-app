'use client';

import { useState } from 'react';
import {
  Building2,
  ChevronDown,
  ChevronRight,
  User,
  DollarSign,
  MapPin,
  Mail,
  Phone,
  Globe,
  HardDrive,
  Megaphone,
  Receipt,
  HeartHandshake,
  BarChart3,
  Target,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { cn, formatCurrency } from '@/lib/utils';

interface DeptEmployee {
  id: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  position: string;
}

const deptIcons: Record<string, any> = {
  'dept-1': HardDrive,
  'dept-2': Megaphone,
  'dept-3': Target,
  'dept-4': Receipt,
  'dept-5': HeartHandshake,
};

const deptColors: Record<string, string> = {
  'dept-1': 'from-blue-500 to-blue-600',
  'dept-2': 'from-purple-500 to-purple-600',
  'dept-3': 'from-emerald-500 to-emerald-600',
  'dept-4': 'from-amber-500 to-amber-600',
  'dept-5': 'from-rose-500 to-rose-600',
};

const mockEmployeesByDept: Record<string, DeptEmployee[]> = {
  'dept-1': [
    { id: 'emp-1', firstName: 'Ahmad', lastName: 'Khaled', position: 'Senior Developer', avatar: 'https://ui-avatars.com/api/?name=Ahmad+Khaled&background=3b82f6&color=fff&size=64' },
    { id: 'emp-5', firstName: 'Robert', lastName: 'Wilson', position: 'Software Engineer', avatar: 'https://ui-avatars.com/api/?name=Robert+Wilson&background=10b981&color=fff&size=64' },
    { id: 'emp-9', firstName: 'James', lastName: 'Taylor', position: 'DevOps Engineer', avatar: 'https://ui-avatars.com/api/?name=James+Taylor&background=8b5cf6&color=fff&size=64' },
    { id: 'emp-12', firstName: 'Amanda', lastName: 'White', position: 'Junior Developer', avatar: 'https://ui-avatars.com/api/?name=Amanda+White&background=f59e0b&color=fff&size=64' },
  ],
  'dept-2': [
    { id: 'emp-6', firstName: 'Jennifer', lastName: 'Lee', position: 'Marketing Specialist', avatar: 'https://ui-avatars.com/api/?name=Jennifer+Lee&background=ec4899&color=fff&size=64' },
    { id: 'emp-10', firstName: 'Maria', lastName: 'Garcia', position: 'Content Writer', avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=14b8a6&color=fff&size=64' },
  ],
  'dept-3': [
    { id: 'emp-4', firstName: 'Nora', lastName: 'Hassan', position: 'Sales Manager', avatar: 'https://ui-avatars.com/api/?name=Nora+Hassan&background=8b5cf6&color=fff&size=64' },
    { id: 'emp-11', firstName: 'William', lastName: 'Thomas', position: 'Account Executive', avatar: 'https://ui-avatars.com/api/?name=William+Thomas&background=ef4444&color=fff&size=64' },
  ],
  'dept-4': [
    { id: 'emp-3', firstName: 'Michael', lastName: 'Brown', position: 'Finance Manager', avatar: 'https://ui-avatars.com/api/?name=Michael+Brown&background=3b82f6&color=fff&size=64' },
    { id: 'emp-4b', firstName: 'Emily', lastName: 'Davis', position: 'Accountant', avatar: 'https://ui-avatars.com/api/?name=Emily+Davis&background=10b981&color=fff&size=64' },
  ],
  'dept-5': [
    { id: 'emp-2', firstName: 'Sarah', lastName: 'Johnson', position: 'HR Manager', avatar: 'https://ui-avatars.com/api/?name=Sarah+Johnson&background=ec4899&color=fff&size=64' },
    { id: 'emp-8', firstName: 'Lisa', lastName: 'Anderson', position: 'HR Coordinator', avatar: 'https://ui-avatars.com/api/?name=Lisa+Anderson&background=f59e0b&color=fff&size=64' },
  ],
};

const departments = [
  {
    id: 'dept-1', name: 'Engineering', code: 'ENG',
    description: 'Software development and infrastructure',
    manager: { firstName: 'Sultan', lastName: 'Ahmed' },
    budget: 5000000,
  },
  {
    id: 'dept-2', name: 'Marketing', code: 'MKT',
    description: 'Brand, campaigns and communications',
    manager: { firstName: 'Rana', lastName: 'Abdullah' },
    budget: 3000000,
  },
  {
    id: 'dept-3', name: 'Sales', code: 'SAL',
    description: 'Revenue generation and client management',
    manager: { firstName: 'Nora', lastName: 'Hassan' },
    budget: 4000000,
  },
  {
    id: 'dept-4', name: 'Finance', code: 'FIN',
    description: 'Financial planning and accounting',
    manager: { firstName: 'Michael', lastName: 'Brown' },
    budget: 2500000,
  },
  {
    id: 'dept-5', name: 'Human Resources', code: 'HR',
    description: 'People operations and talent management',
    manager: { firstName: 'Sarah', lastName: 'Johnson' },
    budget: 1800000,
  },
];

const companyInfo = {
  name: 'Acme Corporation',
  nameAr: 'أكيم كوربوريشن',
  email: 'info@acmecorp.com',
  phone: '+966 11 234 5678',
  address: 'King Fahd Road, Olaya District, Riyadh, Saudi Arabia',
  website: 'www.acmecorp.com',
  departments: 8,
};

function DeptCard({ dept }: { dept: typeof departments[0] }) {
  const [expanded, setExpanded] = useState(false);
  const employees = mockEmployeesByDept[dept.id] || [];
  const Icon = deptIcons[dept.id] || Building2;

  return (
    <Card
      className={cn(
        'overflow-hidden transition-all duration-200 cursor-pointer hover:shadow-md',
        expanded ? 'ring-2 ring-blue-500 dark:ring-blue-400' : ''
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <CardContent className="p-0">
        <div className="flex items-start gap-4 p-5">
          <div className={cn(
            'flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-white bg-gradient-to-br',
            deptColors[dept.id]
          )}>
            <Icon className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{dept.name}</h3>
              <Badge variant="primary" size="sm">{dept.code}</Badge>
            </div>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{dept.description}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-500">
              {dept.manager && (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4" />
                  {dept.manager.firstName} {dept.manager.lastName}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <DollarSign className="h-4 w-4" />
                {formatCurrency(dept.budget)}
              </span>
            </div>
          </div>
          <div className="shrink-0 pt-1 text-gray-400">
            {expanded ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </div>
        </div>

        {expanded && (
          <div className="border-t dark:border-gray-700">
            {employees.length > 0 ? (
              <div className="divide-y dark:divide-gray-700">
                <div className="px-5 py-2.5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Team Members ({employees.length})
                  </p>
                </div>
                {employees.map((emp) => (
                  <Link
                    key={emp.id}
                    href={`/employees/${emp.id}`}
                    className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  >
                    <Avatar src={emp.avatar} name={`${emp.firstName} ${emp.lastName}`} size="sm" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {emp.firstName} {emp.lastName}
                      </p>
                      <p className="text-xs text-gray-500">{emp.position}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 shrink-0 text-gray-400" />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="px-5 py-8 text-center text-sm text-gray-400">
                No team members assigned
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function OrganizationPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organization Structure</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            View and manage your company hierarchy
          </p>
        </div>
        <Button>
          <Building2 className="h-4 w-4" />
          Add Department
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-start gap-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/20">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{companyInfo.name}</h2>
              <p className="text-sm text-gray-500">{companyInfo.nameAr}</p>
              <div className="mt-3 grid gap-x-8 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Mail className="h-4 w-4" />{companyInfo.email}
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Phone className="h-4 w-4" />{companyInfo.phone}
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <Globe className="h-4 w-4" />{companyInfo.website}
                </span>
                <span className="flex items-center gap-2 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />{companyInfo.address}
                </span>
              </div>
            </div>
            <div className="flex gap-6 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{companyInfo.departments}</p>
                <p className="text-xs text-gray-500">Departments</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {departments.map((dept) => (
          <DeptCard key={dept.id} dept={dept} />
        ))}
      </div>
    </div>
  );
}
