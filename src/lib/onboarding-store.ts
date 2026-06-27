import { promises as fs } from 'fs';
import path from 'path';
import { isDbAvailable, pgGetCollection, pgSetCollection } from '@/lib/pg-store';

const DATA_DIR = path.join(process.cwd(), 'data');
const ONBOARDING_FILE = path.join(DATA_DIR, 'onboarding.json');

export interface OnboardingTask {
  id: string;
  employeeId: string;
  task: string;
  category: 'document' | 'setup' | 'training' | 'introduction' | 'compliance';
  assignedTo: string;
  dueDays: number;
  isCompleted: boolean;
  completedAt?: string;
  notes?: string;
  createdAt: string;
}

interface OnboardingData {
  tasks: OnboardingTask[];
}

const DEFAULT_TASKS = [
  { task: 'Submit signed contract', category: 'document' as const, assignedTo: 'Employee', dueDays: 0 },
  { task: 'Upload passport copy', category: 'document' as const, assignedTo: 'Employee', dueDays: 3 },
  { task: 'Upload visa/work permit', category: 'document' as const, assignedTo: 'Employee', dueDays: 7 },
  { task: 'Set up email account', category: 'setup' as const, assignedTo: 'IT', dueDays: -3 },
  { task: 'Set up laptop & equipment', category: 'setup' as const, assignedTo: 'IT', dueDays: 0 },
  { task: 'Set up Slack/Discord accounts', category: 'setup' as const, assignedTo: 'IT', dueDays: 0 },
  { task: 'HR orientation session', category: 'training' as const, assignedTo: 'HR', dueDays: 1 },
  { task: 'Team introduction meeting', category: 'introduction' as const, assignedTo: 'Manager', dueDays: 0 },
  { task: 'Assign buddy/mentor', category: 'introduction' as const, assignedTo: 'Manager', dueDays: 0 },
  { task: 'Complete safety training', category: 'compliance' as const, assignedTo: 'HR', dueDays: 5 },
  { task: 'Sign company policies', category: 'compliance' as const, assignedTo: 'HR', dueDays: 2 },
  { task: 'Set up payroll & bank details', category: 'setup' as const, assignedTo: 'Finance', dueDays: 3 },
];

async function ensureDataDir() {
  try { await fs.access(DATA_DIR); } catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
}

async function readData(): Promise<OnboardingData> {
  if (await isDbAvailable()) {
    const data = await pgGetCollection<OnboardingData>('onboarding');
    if (data.tasks) return data;
  }
  await ensureDataDir();
  try {
    const raw = await fs.readFile(ONBOARDING_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { tasks: [] };
  }
}

async function writeData(data: OnboardingData) {
  if (await isDbAvailable()) {
    await pgSetCollection('onboarding', data);
    return;
  }
  await ensureDataDir();
  await fs.writeFile(ONBOARDING_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function getTasks(employeeId?: string): Promise<OnboardingTask[]> {
  const data = await readData();
  let tasks = data.tasks;
  if (employeeId) tasks = tasks.filter((t) => t.employeeId === employeeId);
  return tasks.sort((a, b) => {
    if (a.employeeId !== b.employeeId) return a.employeeId.localeCompare(b.employeeId);
    return a.dueDays - b.dueDays;
  });
}

export async function createOnboardingTasks(employeeId: string): Promise<OnboardingTask[]> {
  const data = await readData();
  const existing = data.tasks.filter((t) => t.employeeId === employeeId);
  if (existing.length > 0) return existing;

  const tasks: OnboardingTask[] = DEFAULT_TASKS.map((t, i) => ({
    id: `onb-${employeeId}-${i}`,
    employeeId,
    task: t.task,
    category: t.category,
    assignedTo: t.assignedTo,
    dueDays: t.dueDays,
    isCompleted: false,
    createdAt: new Date().toISOString(),
  }));

  data.tasks.push(...tasks);
  await writeData(data);
  return tasks;
}

export async function updateTask(taskId: string, updates: Partial<OnboardingTask>): Promise<OnboardingTask | null> {
  const data = await readData();
  const idx = data.tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return null;
  data.tasks[idx] = { ...data.tasks[idx], ...updates };
  if (updates.isCompleted && !data.tasks[idx].completedAt) {
    data.tasks[idx].completedAt = new Date().toISOString();
  }
  await writeData(data);
  return data.tasks[idx];
}

export async function getOnboardingProgress(employeeId: string) {
  const data = await readData();
  const tasks = data.tasks.filter((t) => t.employeeId === employeeId);
  const total = tasks.length;
  const completed = tasks.filter((t) => t.isCompleted).length;
  return {
    total,
    completed,
    progress: total > 0 ? Math.round((completed / total) * 100) : 0,
  };
}
