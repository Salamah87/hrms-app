import { promises as fs } from 'fs';
import path from 'path';
import type {
  PerformanceCycle, Goal, KPI, PerformanceReview, ReviewSection,
  Feedback, PIP, PIPCheckIn,
} from '@/types';
import { isDbAvailable, pgGetCollection, pgSetCollection } from '@/lib/pg-store';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'performance.json');

interface PerformanceData {
  cycles: PerformanceCycle[];
  goals: Goal[];
  kpis: KPI[];
  reviews: PerformanceReview[];
  reviewSections: ReviewSection[];
  feedback: Feedback[];
  pips: PIP[];
  pipCheckIns: PIPCheckIn[];
}

async function ensureDir() {
  try { await fs.access(DATA_DIR); }
  catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
}

async function read(): Promise<PerformanceData> {
  if (await isDbAvailable()) {
    const data = await pgGetCollection<PerformanceData>('performance');
    if (data.cycles) return data;
  }
  await ensureDir();
  try {
    const raw = await fs.readFile(FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { cycles: [], goals: [], kpis: [], reviews: [], reviewSections: [], feedback: [], pips: [], pipCheckIns: [] };
  }
}

async function write(data: PerformanceData) {
  if (await isDbAvailable()) {
    await pgSetCollection('performance', data);
    return;
  }
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ============ Cycles ============

export async function getCycles(): Promise<PerformanceCycle[]> {
  const data = await read();
  return data.cycles.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getCycleById(id: string): Promise<PerformanceCycle | null> {
  const data = await read();
  return data.cycles.find(c => c.id === id) || null;
}

export async function createCycle(input: {
  companyId: string; name: string; type: PerformanceCycle['type'];
  startDate: string; endDate: string; reviewStyle: PerformanceCycle['reviewStyle']; createdBy?: string;
}): Promise<PerformanceCycle> {
  const data = await read();
  const cycle: PerformanceCycle = {
    id: `pc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    companyId: input.companyId,
    name: input.name,
    type: input.type,
    startDate: input.startDate,
    endDate: input.endDate,
    status: 'draft',
    reviewStyle: input.reviewStyle,
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.cycles.push(cycle);
  await write(data);
  return cycle;
}

export async function updateCycle(id: string, updates: Partial<PerformanceCycle>): Promise<PerformanceCycle | null> {
  const data = await read();
  const idx = data.cycles.findIndex(c => c.id === id);
  if (idx === -1) return null;
  data.cycles[idx] = { ...data.cycles[idx], ...updates, updatedAt: new Date().toISOString() };
  await write(data);
  return data.cycles[idx];
}

export async function launchCycle(id: string): Promise<PerformanceCycle | null> {
  return updateCycle(id, { status: 'active' });
}

export async function closeCycle(id: string): Promise<PerformanceCycle | null> {
  return updateCycle(id, { status: 'closed' });
}

// ============ Goals ============

export async function getGoals(filters?: { employeeId?: string; cycleId?: string }): Promise<Goal[]> {
  const data = await read();
  let result = data.goals;
  if (filters?.employeeId) result = result.filter(g => g.employeeId === filters.employeeId);
  if (filters?.cycleId) result = result.filter(g => g.cycleId === filters.cycleId);
  const objectives = result.filter(g => g.type === 'objective');
  const keyResults = result.filter(g => g.type === 'key_result');
  return objectives.map(o => ({
    ...o,
    children: keyResults.filter(kr => kr.parentId === o.id),
  }));
}

export async function getGoalById(id: string): Promise<Goal | null> {
  const data = await read();
  return data.goals.find(g => g.id === id) || null;
}

export async function createGoal(input: {
  employeeId: string; cycleId: string; title: string; description?: string;
  type: Goal['type']; parentId?: string; targetValue?: number;
  unit?: string; weight?: number; dueDate?: string;
}): Promise<Goal> {
  const data = await read();
  const goal: Goal = {
    id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    employeeId: input.employeeId,
    cycleId: input.cycleId,
    title: input.title,
    description: input.description,
    type: input.type,
    parentId: input.parentId,
    targetValue: input.targetValue,
    currentValue: 0,
    unit: input.unit,
    weight: input.weight || 100,
    status: 'on_track',
    dueDate: input.dueDate,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.goals.push(goal);
  await write(data);
  return goal;
}

export async function updateGoal(id: string, updates: Partial<Goal>): Promise<Goal | null> {
  const data = await read();
  const idx = data.goals.findIndex(g => g.id === id);
  if (idx === -1) return null;
  data.goals[idx] = { ...data.goals[idx], ...updates, updatedAt: new Date().toISOString() };
  await write(data);
  return data.goals[idx];
}

export async function deleteGoal(id: string): Promise<boolean> {
  const data = await read();
  const idx = data.goals.findIndex(g => g.id === id);
  if (idx === -1) return false;
  data.goals = data.goals.filter(g => g.id !== id && g.parentId !== id);
  await write(data);
  return true;
}

// ============ KPIs ============

export async function getKPIs(employeeId?: string, cycleId?: string): Promise<KPI[]> {
  const data = await read();
  let result = data.kpis;
  if (employeeId) result = result.filter(k => k.employeeId === employeeId);
  if (cycleId) result = result.filter(k => k.cycleId === cycleId);
  return result;
}

export async function createKPI(input: {
  employeeId: string; cycleId: string; name: string;
  target: number; unit?: string; weight?: number;
}): Promise<KPI> {
  const data = await read();
  const kpi: KPI = {
    id: `kpi-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    employeeId: input.employeeId,
    cycleId: input.cycleId,
    name: input.name,
    target: input.target,
    actual: 0,
    unit: input.unit,
    weight: input.weight || 100,
    source: 'manual',
    updatedAt: new Date().toISOString(),
  };
  data.kpis.push(kpi);
  await write(data);
  return kpi;
}

// ============ Reviews ============

export async function getReviews(filters?: { revieweeId?: string; reviewerId?: string; cycleId?: string }): Promise<PerformanceReview[]> {
  const data = await read();
  let result = data.reviews;
  if (filters?.revieweeId) result = result.filter(r => r.revieweeId === filters.revieweeId);
  if (filters?.reviewerId) result = result.filter(r => r.reviewerId === filters.reviewerId);
  if (filters?.cycleId) result = result.filter(r => r.cycleId === filters.cycleId);
  return result.map(r => ({
    ...r,
    sections: data.reviewSections.filter(s => s.reviewId === r.id).sort((a, b) => a.sectionOrder - b.sectionOrder),
  }));
}

export async function createReview(input: {
  cycleId: string; revieweeId: string; reviewerId: string; type: PerformanceReview['type'];
}): Promise<PerformanceReview> {
  const data = await read();
  const review: PerformanceReview = {
    id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    cycleId: input.cycleId,
    revieweeId: input.revieweeId,
    reviewerId: input.reviewerId,
    type: input.type,
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  data.reviews.push(review);
  await write(data);
  return review;
}

export async function updateReview(id: string, updates: Partial<PerformanceReview>): Promise<PerformanceReview | null> {
  const data = await read();
  const idx = data.reviews.findIndex(r => r.id === id);
  if (idx === -1) return null;
  data.reviews[idx] = { ...data.reviews[idx], ...updates };
  await write(data);
  return data.reviews[idx];
}

// ============ Feedback ============

export async function getFeedback(receiverId?: string, cycleId?: string): Promise<Feedback[]> {
  const data = await read();
  let result = data.feedback;
  if (receiverId) result = result.filter(f => f.receiverId === receiverId);
  if (cycleId) result = result.filter(f => f.cycleId === cycleId);
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createFeedback(input: {
  giverId: string; receiverId: string; cycleId?: string;
  type: Feedback['type']; content: string; isAnonymous?: boolean;
}): Promise<Feedback> {
  const data = await read();
  const fb: Feedback = {
    id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    giverId: input.giverId,
    receiverId: input.receiverId,
    cycleId: input.cycleId,
    type: input.type,
    content: input.content,
    isAnonymous: input.isAnonymous || false,
    createdAt: new Date().toISOString(),
  };
  data.feedback.push(fb);
  await write(data);
  return fb;
}

// ============ PIP ============

export async function getPIPs(employeeId?: string): Promise<PIP[]> {
  const data = await read();
  let result = data.pips;
  if (employeeId) result = result.filter(p => p.employeeId === employeeId);
  return result.map(p => ({
    ...p,
    checkIns: data.pipCheckIns.filter(c => c.pipId === p.id).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
  }));
}

export async function createPIP(input: {
  employeeId: string; managerId: string; cycleId?: string;
  reason?: string; goalsText?: string; startDate?: string; endDate?: string; checkInFrequency?: string;
}): Promise<PIP> {
  const data = await read();
  const pip: PIP = {
    id: `pip-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    employeeId: input.employeeId,
    managerId: input.managerId,
    cycleId: input.cycleId,
    reason: input.reason,
    goalsText: input.goalsText,
    startDate: input.startDate,
    endDate: input.endDate,
    checkInFrequency: input.checkInFrequency,
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  data.pips.push(pip);
  await write(data);
  return pip;
}

export async function updatePIP(id: string, updates: Partial<PIP>): Promise<PIP | null> {
  const data = await read();
  const idx = data.pips.findIndex(p => p.id === id);
  if (idx === -1) return null;
  data.pips[idx] = { ...data.pips[idx], ...updates };
  await write(data);
  return data.pips[idx];
}

export async function createPIPCheckIn(input: {
  pipId: string; date: string; notes?: string; rating?: number; createdBy?: string;
}): Promise<PIPCheckIn> {
  const data = await read();
  const ci: PIPCheckIn = {
    id: `pci-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    pipId: input.pipId,
    date: input.date,
    notes: input.notes,
    rating: input.rating,
    createdBy: input.createdBy,
    createdAt: new Date().toISOString(),
  };
  data.pipCheckIns.push(ci);
  await write(data);
  return ci;
}
