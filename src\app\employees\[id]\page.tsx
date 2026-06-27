'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, Briefcase, Globe,
  FileText, Clock, Building2, User, GraduationCap, Banknote,
  Sparkles, SendHorizontal, ChevronRight, CheckCircle2, XCircle,
  Clock4, Umbrella, Monitor, Home, RefreshCw, Pencil, Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { cn, formatDate, formatCurrency } from '@/lib/utils';
import type { Employee } from '@/types';

const statusVariant: Record<string, 'success' | 'default' | 'warning' | 'danger' | 'info'> = {
  active: 'success', inactive: 'default', suspended: 'warning', terminated: 'danger', resigned: 'info',
};



const teamMembers = [
  { id: 'emp-5', name: 'Robert Wilson', role: 'Lead Developer', status: 'office' as const, avatar: 'https://ui-avatars.com/api/?name=Robert+Wilson&background=10b981&color=fff&size=64' },
  { id: 'emp-9', name: 'James Taylor', role: 'DevOps Engineer', status: 'remote' as const, avatar: 'https://ui-avatars.com/api/?name=James+Taylor&background=8b5cf6&color=fff&size=64' },
  { id: 'emp-12', name: 'Amanda White', role: 'Junior Developer', status: 'onleave' as const, avatar: 'https://ui-avatars.com/api/?name=Amanda+White&background=f59e0b&color=fff&size=64' },
];

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const requestHistory = [
  { id: 'r1', type: 'Annual Leave', dates: 'Jun 10 - Jun 12', status: 'approved' as const, icon: Umbrella },
  { id: 'r2', type: 'Sick Leave', dates: 'May 22 - May 23', status: 'approved' as const, icon: Clock4 },
  { id: 'r3', type: 'Personal Leave', dates: 'Apr 14', status: 'rejected' as const, icon: User },
  { id: 'r4', type: 'Emergency Leave', dates: 'Mar 2', status: 'pending' as const, icon: Clock },
];

const leaveUsage = [
  { type: 'Annual', used: 12, total: 30, color: 'bg-blue-500' },
  { type: 'Sick', used: 3, total: 14, color: 'bg-red-500' },
  { type: 'Personal', used: 2, total: 5, color: 'bg-purple-500' },
  { type: 'Emergency', used: 0, total: 3, color: 'bg-orange-500' },
];

const quickActions = [
  { label: 'Request Leave', icon: Umbrella, desc: 'Submit a new leave request', href: '/leave/my', ai: 'Ask about leave policy or check your balance' },
  { label: 'Mark Attendance', icon: Clock, desc: 'Clock in or report absence', href: '/attendance', ai: 'Ask about attendance rules or shift timing' },
  { label: 'View Payslips', icon: FileText, desc: 'Download salary slips', href: `/payroll/payslips`, ai: 'Ask about salary breakdown or deductions' },
  { label: 'Team Calendar', icon: Calendar, desc: 'See team availability', href: '/leave/team', ai: 'Ask who is available this week' },
];

const suggestions = [
  'What is my leave balance?',
  'Who is out of office this week?',
  'How many sick days do I have left?',
  'Show my upcoming approvals',
];

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<{ type: 'user' | 'ai'; text: string }[]>([]);
  const [showSalaryModal, setShowSalaryModal] = useState(false);
  const [salaryEditValue, setSalaryEditValue] = useState('');
  const [showHousingModal, setShowHousingModal] = useState(false);
  const [housingEditValue, setHousingEditValue] = useState('');
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [transportEditValue, setTransportEditValue] = useState('');

  useEffect(() => {
    fetch(`/api/employees/${params.id}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then(emp => { setEmployee(emp); setIsLoading(false); })
      .catch(() => { setIsLoading(false); });
  }, [params.id]);

  const handleAiSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;
    setAiResponse(prev => [...prev, { type: 'user', text: aiQuery }]);
    setAiResponse(prev => [...prev, {
      type: 'ai',
      text: `Based on ${employee?.firstName}'s profile, ${aiQuery.toLowerCase().includes('balance') ? `they have 15 annual leave days remaining.` : aiQuery.toLowerCase().includes('out of office') ? `Amanda White is on leave this week.` : `I can help with that. Would you like me to check the system for more details?`}`
    }]);
    setAiQuery('');
  };

  if (isLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm text-gray-500">Loading profile...</p>
        </div>
      </div>
    );
  }
  if (!employee) return <div className="p-6 text-center text-gray-500">Employee not found</div>;

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => router.push('/employees')}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Link href="/employees" className="hover:text-gray-600 dark:hover:text-gray-300">Employees</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-gray-900 dark:text-white">{employee.fullName}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* ===================== SIDEBAR ===================== */}
        <div className="space-y-5">
          {/* Profile Card */}
          <Card className="overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-blue-600 to-blue-400" />
            <CardContent className="relative px-5 pb-5 pt-0">
              <Avatar
                src={employee.avatar}
                name={employee.fullName}
                size="xl"
                className="-mt-10 ring-4 ring-white dark:ring-gray-900"
              />
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white truncate">{employee.fullName}</h2>
                  <Badge variant={statusVariant[employee.status]} size="sm">{employee.status}</Badge>
                </div>
                <p className="text-sm text-gray-500">Senior Developer</p>
                <p className="text-xs text-gray-400">Engineering Department</p>
              </div>
              <div className="mt-4 space-y-2.5 border-t pt-4 dark:border-gray-800">
                <div className="flex items-center gap-2.5 text-sm">
                  <Mail className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300 truncate">{employee.email}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Phone className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">{employee.phone}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Calendar className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">Joined {formatDate(employee.joiningDate)}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300 truncate">{employee.city ?? 'Riyadh'}, {employee.country ?? 'Saudi Arabia'}</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm">
                  <Building2 className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                  <span className="text-gray-600 dark:text-gray-300">{employee.bankName ?? 'Al Rajhi Bank'}</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" onClick={() => router.push(`/employees/${employee.id}/edit`)}>
                  Edit Profile
                </Button>
                <Link href={`/payroll/profiles?search=${encodeURIComponent(employee.fullName)}`} className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-transparent px-3 py-1.5 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:focus:ring-offset-gray-900 flex-1">Payroll</Link>
                </div>
            </CardContent>
          </Card>

          {/* Payroll Summary */}
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Banknote className="h-3 w-3 text-emerald-500" />
                Payroll Summary
              </h3>
              {(() => {
                const basic = employee.salary ?? 0;
                const housing = employee.housingOverride ?? Math.round(basic * 0.3);
                const transport = employee.transportOverride ?? Math.round(basic * 0.1);
                const gross = basic + housing + transport;
                const tax = Math.round(gross * 0.1);
                const gosi = Math.round(gross * 0.0975);
                const deductions = tax + gosi;
                const net = gross - deductions;
                return (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Base Salary</span>
                      <span className="flex items-center gap-1.5">
                        <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(basic)}</span>
                        <button onClick={() => { setSalaryEditValue(String(basic)); setShowSalaryModal(true); }} className="rounded p-0.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Pencil className="h-3 w-3" /></button>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Housing</span>
                      <span className="flex items-center gap-1.5">
                        <span className="text-gray-700 dark:text-gray-300">{formatCurrency(housing)}</span>
                        <button onClick={() => { setHousingEditValue(String(housing)); setShowHousingModal(true); }} className="rounded p-0.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Pencil className="h-3 w-3" /></button>
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">Transport</span>
                      <span className="flex items-center gap-1.5">
                        <span className="text-gray-700 dark:text-gray-300">{formatCurrency(transport)}</span>
                        <button onClick={() => { setTransportEditValue(String(transport)); setShowTransportModal(true); }} className="rounded p-0.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"><Pencil className="h-3 w-3" /></button>
                      </span>
                    </div>
                    <div className="border-t pt-2 dark:border-gray-800 flex justify-between text-sm font-semibold"><span className="text-gray-700 dark:text-gray-200">Gross Pay</span><span className="text-green-600">{formatCurrency(gross)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">Tax (10%)</span><span className="text-red-500">-{formatCurrency(tax)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-gray-500">GOSI (9.75%)</span><span className="text-red-500">-{formatCurrency(gosi)}</span></div>
                    <div className="border-t pt-2 dark:border-gray-800 flex justify-between text-sm font-bold"><span className="text-gray-800 dark:text-gray-100">Net Pay</span><span className="text-blue-600">{formatCurrency(net)}</span></div>
                  </div>
                );
              })()}
              <div className="mt-3 flex gap-2">
                <Link href={`/payroll/payslips/slip-${employee.id}-Jun`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full"><FileText className="h-3.5 w-3.5" /> Latest Payslip</Button>
                </Link>
                <Link href={`/payroll/adjustments?search=${encodeURIComponent(employee.fullName)}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full"><Plus className="h-3.5 w-3.5" /> Adjustment</Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardContent className="p-4">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-purple-500" />
                AI Quick Actions
              </h3>
              <div className="space-y-1.5">
                {quickActions.map((action) => (
                  <Link key={action.label} href={action.href} className="group flex items-center gap-3 rounded-lg p-2.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                      <action.icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</p>
                      <p className="text-xs text-gray-400 truncate">{action.desc}</p>
                    </div>
                    <ChevronRight className="h-3.5 w-3.5 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100" />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ===================== MAIN PANEL ===================== */}
        <div className="space-y-5">
          {/* Stat Cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: 'Present This Month', value: '21 days', sub: '87.5% attendance rate', accent: 'border-l-green-500', icon: CheckCircle2, iconColor: 'text-green-500' },
              { label: 'Leave Taken', value: '17 days', sub: '5 pending approvals', accent: 'border-l-blue-500', icon: Umbrella, iconColor: 'text-blue-500' },
              { label: 'Pending Approvals', value: '3', sub: '2 from your direct reports', accent: 'border-l-amber-500', icon: Clock4, iconColor: 'text-amber-500' },
            ].map((stat) => (
              <Card key={stat.label} className={`border-l-4 ${stat.accent}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-gray-500">{stat.label}</p>
                      <p className="mt-0.5 text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                      <p className="mt-0.5 text-xs text-gray-400">{stat.sub}</p>
                    </div>
                    <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Timeline-style Request History + Horizontal Bar Chart */}
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Request History */}
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Requests</h3>
                  <Link href="/leave/my" className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">View all</Link>
                </div>
                <div className="space-y-0">
                  {requestHistory.map((req, i) => (
                    <div key={req.id} className="relative flex gap-3 pb-4 last:pb-0">
                      {i < requestHistory.length - 1 && (
                        <div className="absolute left-[13px] top-7 bottom-0 w-0.5 bg-gray-100 dark:bg-gray-800" />
                      )}
                      <div className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full ring-2 ring-white dark:ring-gray-900',
                        req.status === 'approved' ? 'bg-green-100' : req.status === 'rejected' ? 'bg-red-100' : 'bg-amber-100'
                      )}>
                        {req.status === 'approved' ? <CheckCircle2 className="h-3.5 w-3.5 text-green-600" /> :
                         req.status === 'rejected' ? <XCircle className="h-3.5 w-3.5 text-red-600" /> :
                         <Clock className="h-3.5 w-3.5 text-amber-600" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{req.type}</p>
                          <Badge variant={req.status === 'approved' ? 'success' : req.status === 'rejected' ? 'danger' : 'warning'} size="sm">
                            {req.status}
                          </Badge>
                        </div>
                        <p className="text-xs text-gray-400">{req.dates}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Horizontal Bar Chart - Leave Usage */}
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Leave Usage</h3>
                  <span className="text-xs text-gray-400">Year to date</span>
                </div>
                <div className="space-y-4">
                  {leaveUsage.map((item) => (
                    <div key={item.type}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="font-medium text-gray-700 dark:text-gray-300">{item.type}</span>
                        <span className="text-xs text-gray-500">{item.used} / {item.total} days</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-gray-800">
                        <div
                          className={`h-2 rounded-full ${item.color} transition-all duration-500`}
                          style={{ width: `${(item.used / item.total) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Team Availability Grid */}
          <Card>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Team Availability — This Week</h3>
                <Link href="/leave/team" className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400">Full calendar</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b dark:border-gray-800">
                      <th className="py-2 pr-4 text-left text-xs font-medium text-gray-400">Team Member</th>
                      {dayLabels.map((day) => (
                        <th key={day} className="p-2 text-center text-xs font-medium text-gray-400">{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-gray-800">
                    {teamMembers.map((member) => (
                      <tr key={member.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50">
                        <td className="py-3 pr-4">
                          <div className="flex items-center gap-2.5">
                            <Avatar src={member.avatar} name={member.name} size="sm" />
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{member.name}</p>
                              <p className="text-xs text-gray-400">{member.role}</p>
                            </div>
                          </div>
                        </td>
                        {dayLabels.map((day) => {
                          if (member.status === 'onleave' && (day === 'Wed' || day === 'Thu')) {
                            return (
                              <td key={day} className="p-2 text-center">
                                <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs text-orange-700 dark:bg-orange-900/20 dark:text-orange-400">
                                  <Umbrella className="h-3 w-3" /> Leave
                                </span>
                              </td>
                            );
                          }
                          if (member.status === 'remote' && (day === 'Tue' || day === 'Fri')) {
                            return (
                              <td key={day} className="p-2 text-center">
                                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-2 py-0.5 text-xs text-purple-700 dark:bg-purple-900/20 dark:text-purple-400">
                                  <Home className="h-3 w-3" /> Remote
                                </span>
                              </td>
                            );
                          }
                          return (
                            <td key={day} className="p-2 text-center">
                              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                <Monitor className="h-3 w-3" /> Office
                              </span>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ===================== AI ASSISTANT BAR ===================== */}
      <Card className="mt-6 border-2 border-purple-200 dark:border-purple-900/40">
        <CardContent className="p-4">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">AI Assistant</span>
            <span className="text-xs text-gray-400">Ask anything about {employee.firstName}'s profile</span>
          </div>
          {aiResponse.length > 0 && (
            <div className="mb-3 max-h-32 space-y-2 overflow-y-auto rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              {aiResponse.map((msg, i) => (
                <div key={i} className={cn('flex gap-2 text-sm', msg.type === 'user' ? 'justify-end' : 'justify-start')}>
                  <div className={cn(
                    'max-w-[80%] rounded-lg px-3 py-1.5',
                    msg.type === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
          )}
          <form onSubmit={handleAiSubmit} className="flex gap-2">
            <Input
              value={aiQuery}
              onChange={e => setAiQuery(e.target.value)}
              placeholder={`Ask AI about ${employee.firstName}'s profile...`}
              className="flex-1"
            />
            <Button type="submit" size="sm" disabled={!aiQuery.trim()}>
              <SendHorizontal className="h-4 w-4" />
            </Button>
          </form>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setAiResponse(prev => [...prev, { type: 'user', text: s }]); setTimeout(() => setAiResponse(prev => [...prev, { type: 'ai', text: `Good question! Based on ${employee?.firstName}'s records, I'd recommend checking the leave management section for detailed information.` }]), 600); }}
                className="rounded-full bg-gray-100 px-2.5 py-1 text-xs text-gray-500 transition-colors hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
              >
                {s}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ===================== SALARY EDIT MODAL ===================== */}
      <Modal isOpen={showSalaryModal} onClose={() => setShowSalaryModal(false)} title="Edit Base Salary" size="sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Base Salary (SAR)</label>
            <Input
              type="number"
              value={salaryEditValue}
              onChange={e => setSalaryEditValue(e.target.value)}
              placeholder="Enter salary amount"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowSalaryModal(false)}>Cancel</Button>
            <Button onClick={async () => {
              const val = Number(salaryEditValue);
              if (val > 0 && employee) {
                try {
                  const res = await fetch(`/api/employees/${employee.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ salary: val }),
                  });
                  if (!res.ok) throw new Error('Failed to save');
                  const updated = await res.json();
                  setEmployee(updated);
                  toast.success(`Salary updated to ${formatCurrency(val)}`);
                  setShowSalaryModal(false);
                } catch {
                  toast.error('Failed to save salary');
                }
              }
            }}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* ===================== HOUSING EDIT MODAL ===================== */}
      <Modal isOpen={showHousingModal} onClose={() => setShowHousingModal(false)} title="Edit Housing Allowance" size="sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Housing Allowance (SAR)</label>
            <Input type="number" value={housingEditValue} onChange={e => setHousingEditValue(e.target.value)} placeholder="Enter housing amount" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={async () => {
              if (employee) {
                const res = await fetch(`/api/employees/${employee.id}`, {
                  method: 'PUT', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ housingOverride: null }),
                });
                const updated = await res.json();
                setEmployee(updated);
                toast.success('Housing reset to default (30%)');
                setShowHousingModal(false);
              }
            }}>Reset to Default</Button>
            <Button onClick={async () => {
              const val = Number(housingEditValue);
              if (val >= 0 && employee) {
                const res = await fetch(`/api/employees/${employee.id}`, {
                  method: 'PUT', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ housingOverride: val }),
                });
                if (!res.ok) throw new Error('Failed to save');
                const updated = await res.json();
                setEmployee(updated);
                toast.success(`Housing updated to ${formatCurrency(val)}`);
                setShowHousingModal(false);
              }
            }}>Save</Button>
          </div>
        </div>
      </Modal>

      {/* ===================== TRANSPORT EDIT MODAL ===================== */}
      <Modal isOpen={showTransportModal} onClose={() => setShowTransportModal(false)} title="Edit Transport Allowance" size="sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Transport Allowance (SAR)</label>
            <Input type="number" value={transportEditValue} onChange={e => setTransportEditValue(e.target.value)} placeholder="Enter transport amount" />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={async () => {
              if (employee) {
                const res = await fetch(`/api/employees/${employee.id}`, {
                  method: 'PUT', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ transportOverride: null }),
                });
                const updated = await res.json();
                setEmployee(updated);
                toast.success('Transport reset to default (10%)');
                setShowTransportModal(false);
              }
            }}>Reset to Default</Button>
            <Button onClick={async () => {
              const val = Number(transportEditValue);
              if (val >= 0 && employee) {
                const res = await fetch(`/api/employees/${employee.id}`, {
                  method: 'PUT', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ transportOverride: val }),
                });
                if (!res.ok) throw new Error('Failed to save');
                const updated = await res.json();
                setEmployee(updated);
                toast.success(`Transport updated to ${formatCurrency(val)}`);
                setShowTransportModal(false);
              }
            }}>Save</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
