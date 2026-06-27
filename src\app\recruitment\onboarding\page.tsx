'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ClipboardList, User, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/search-input';
import { Select } from '@/components/ui/select';
import { formatDate } from '@/lib/utils';

interface OnboardingTask {
  id: string;
  employeeId: string;
  task: string;
  category: string;
  assignedTo: string;
  dueDays: number;
  isCompleted: boolean;
  completedAt?: string;
  createdAt: string;
}

interface EmployeeInfo {
  id: string;
  fullName: string;
  email: string;
}

const categoryColors: Record<string, string> = {
  document: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  setup: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  training: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  introduction: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  compliance: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

export default function OnboardingPage() {
  const [tasks, setTasks] = useState<OnboardingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recruitment/onboarding');
      if (!res.ok) throw new Error();
      setTasks(await res.json());
    } catch { toast.error('Failed to load onboarding tasks'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchTasks(); }, []);

  const toggleTask = async (task: OnboardingTask) => {
    try {
      const res = await fetch('/api/recruitment/onboarding', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id, updates: { isCompleted: !task.isCompleted } }),
      });
      if (!res.ok) throw new Error();
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, isCompleted: !t.isCompleted, completedAt: !t.isCompleted ? new Date().toISOString() : undefined } : t)));
      toast.success(task.isCompleted ? 'Task unmarked' : 'Task completed');
    } catch { toast.error('Failed to update task'); }
  };

  const generateTasks = async (employeeId: string) => {
    try {
      const res = await fetch('/api/recruitment/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ employeeId }),
      });
      if (!res.ok) throw new Error();
      toast.success('Onboarding tasks generated');
      fetchTasks();
    } catch { toast.error('Failed to generate tasks'); }
  };

  const groupByEmployee = (tasks: OnboardingTask[]): [string, OnboardingTask[]][] => {
    const groups = new Map<string, OnboardingTask[]>();
    for (const t of tasks) {
      if (!groups.has(t.employeeId)) groups.set(t.employeeId, []);
      groups.get(t.employeeId)!.push(t);
    }
    return Array.from(groups.entries());
  };

  const filtered = search
    ? tasks.filter((t) => t.employeeId.toLowerCase().includes(search.toLowerCase()) || t.task.toLowerCase().includes(search.toLowerCase()))
    : tasks;

  const grouped = groupByEmployee(filtered);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Onboarding</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage new hire onboarding checklists</p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
              <ClipboardList className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{totalTasks}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{completedTasks}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 px-6 py-5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400">
              <AlertCircle className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Progress</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{progress}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by employee or task..." className="w-72" />
        <Input
          placeholder="Employee ID (e.g. emp-123)"
          className="w-48"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const val = (e.target as HTMLInputElement).value;
              if (val) generateTasks(val);
            }
          }}
        />
        <Button variant="outline" size="sm" onClick={() => {
          const input = document.querySelector<HTMLInputElement>('input[placeholder="Employee ID (e.g. emp-123)"]');
          if (input?.value) generateTasks(input.value);
        }}>Generate Tasks</Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : grouped.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No onboarding tasks. Enter an employee ID and click "Generate Tasks" to create a checklist.</p>
          </CardContent>
        </Card>
      ) : (
        grouped.map(([employeeId, employeeTasks]) => {
          const empCompleted = employeeTasks.filter((t) => t.isCompleted).length;
          const empProgress = Math.round((empCompleted / employeeTasks.length) * 100);
          return (
            <Card key={employeeId}>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-400" />
                  <CardTitle>{employeeId}</CardTitle>
                  <Badge variant={empProgress === 100 ? 'success' : empProgress > 50 ? 'info' : 'warning'}>{empProgress}%</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {employeeTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <button onClick={() => toggleTask(task)} className="flex-shrink-0">
                        {task.isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-gray-300 dark:text-gray-600" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${task.isCompleted ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                          {task.task}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Badge variant="default" size="sm" className={categoryColors[task.category]}>
                            {task.category}
                          </Badge>
                          <span className="text-[10px] text-gray-400">{task.assignedTo}</span>
                          {task.dueDays > 0 && (
                            <span className="text-[10px] text-gray-400">
                              <Clock className="h-3 w-3 inline mr-0.5" />Due in {task.dueDays}d
                            </span>
                          )}
                          {task.dueDays <= 0 && task.dueDays < 0 && (
                            <span className="text-[10px] text-orange-400">
                              <Clock className="h-3 w-3 inline mr-0.5" />Overdue by {Math.abs(task.dueDays)}d
                            </span>
                          )}
                        </div>
                      </div>
                      {task.completedAt && (
                        <span className="text-[10px] text-gray-400 flex-shrink-0">{formatDate(task.completedAt)}</span>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );
}
