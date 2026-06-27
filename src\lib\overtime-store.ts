import { promises as fs } from 'fs';
import path from 'path';
import type {
  OvertimePolicy, OvertimeRequest, OvertimeApprovalStep, OvertimeMonthlySummary,
} from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'overtime.json');

interface OvertimeData {
  policies: OvertimePolicy[];
  requests: OvertimeRequest[];
  approvalSteps: OvertimeApprovalStep[];
  summaries: OvertimeMonthlySummary[];
}

const DEFAULT_POLICY: OvertimePolicy = {
  id: 'ot-policy-1',
  companyId: 'company-1',
  name: 'Default Policy',
  standardHoursPerDay: 8,
  standardHoursPerWeek: 40,
  weekdayRate: 1.5,
  weekendRate: 2.0,
  holidayRate: 2.5,
  maxHoursPerMonth: 40,
  minClaimableHours: 1,
  maxHoursPerRequest: 12,
  pastDaysLimit: 7,
  active: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

async function ensureDir() {
  try { await fs.access(DATA_DIR); } catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
}

async function read(): Promise<OvertimeData> {
  await ensureDir();
  try {
    const raw = await fs.readFile(FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    const data: OvertimeData = { policies: [DEFAULT_POLICY], requests: [], approvalSteps: [], summaries: [] };
    await write(data);
    return data;
  }
}

async function write(data: OvertimeData) {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ============ Policies ============

export async function getPolicies(): Promise<OvertimePolicy[]> {
  const data = await read();
  return data.policies;
}

export async function getPolicyById(id: string): Promise<OvertimePolicy | null> {
  const data = await read();
  return data.policies.find(p => p.id === id) || null;
}

export async function getActivePolicy(): Promise<OvertimePolicy | null> {
  const data = await read();
  return data.policies.find(p => p.active) || null;
}

export async function createPolicy(input: {
  companyId: string; name: string;
  weekdayRate?: number; weekendRate?: number; holidayRate?: number;
  maxHoursPerMonth?: number; maxHoursPerRequest?: number;
}): Promise<OvertimePolicy> {
  const data = await read();
  const policy: OvertimePolicy = {
    id: `otp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    companyId: input.companyId,
    name: input.name,
    standardHoursPerDay: 8,
    standardHoursPerWeek: 40,
    weekdayRate: input.weekdayRate || 1.5,
    weekendRate: input.weekendRate || 2.0,
    holidayRate: input.holidayRate || 2.5,
    maxHoursPerMonth: input.maxHoursPerMonth || 40,
    minClaimableHours: 1,
    maxHoursPerRequest: input.maxHoursPerRequest || 12,
    pastDaysLimit: 7,
    active: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.policies.push(policy);
  await write(data);
  return policy;
}

export async function updatePolicy(id: string, updates: Partial<OvertimePolicy>): Promise<OvertimePolicy | null> {
  const data = await read();
  const idx = data.policies.findIndex(p => p.id === id);
  if (idx === -1) return null;
  data.policies[idx] = { ...data.policies[idx], ...updates, updatedAt: new Date().toISOString() };
  await write(data);
  return data.policies[idx];
}

// ============ Requests ============

export async function getRequests(filters?: {
  employeeId?: string; status?: string; month?: number; year?: number;
}): Promise<OvertimeRequest[]> {
  const data = await read();
  let result = data.requests;
  if (filters?.employeeId) result = result.filter(r => r.employeeId === filters.employeeId);
  if (filters?.status) result = result.filter(r => r.status === filters.status);
  if (filters?.month) {
    result = result.filter(r => {
      const d = new Date(r.date);
      return d.getMonth() + 1 === filters.month && (!filters.year || d.getFullYear() === filters.year);
    });
  }
  return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map(r => ({
      ...r,
      approvalSteps: data.approvalSteps.filter(s => s.requestId === r.id).sort((a, b) => a.level - b.level),
    }));
}

export async function getRequestById(id: string): Promise<OvertimeRequest | null> {
  const data = await read();
  const req = data.requests.find(r => r.id === id);
  if (!req) return null;
  return {
    ...req,
    approvalSteps: data.approvalSteps.filter(s => s.requestId === id).sort((a, b) => a.level - b.level),
  };
}

function getDayType(dateStr: string): OvertimeRequest['dayType'] {
  const d = new Date(dateStr);
  const day = d.getDay();
  if (day === 0 || day === 6) return 'weekend';
  return 'weekday';
}

export async function createRequest(input: {
  employeeId: string; date: string; startTime: string; endTime: string;
  reason?: string;
}): Promise<OvertimeRequest> {
  const data = await read();
  const policy = data.policies.find(p => p.active) || DEFAULT_POLICY;
  const startH = parseFloat(input.startTime.split(':')[0]) + parseFloat(input.startTime.split(':')[1]) / 60;
  const endH = parseFloat(input.endTime.split(':')[0]) + parseFloat(input.endTime.split(':')[1]) / 60;
  const totalHours = Math.round((endH - startH) * 10) / 10;
  const dayType = getDayType(input.date);
  const rateMultiplier = dayType === 'weekend' ? policy.weekendRate : dayType === 'public_holiday' ? policy.holidayRate : policy.weekdayRate;

  const request: OvertimeRequest = {
    id: `otr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    employeeId: input.employeeId,
    policyId: policy.id,
    date: input.date,
    startTime: input.startTime,
    endTime: input.endTime,
    totalHours,
    dayType,
    rateMultiplier,
    estimatedAmount: 0,
    reason: input.reason,
    status: 'pending',
    currentLevel: 1,
    payrollProcessed: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.requests.push(request);

  data.approvalSteps.push({
    id: `otas-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    requestId: request.id,
    approverId: 'manager-1',
    level: 1,
    status: 'pending',
    createdAt: new Date().toISOString(),
  });

  await write(data);
  return request;
}

export async function updateRequest(id: string, updates: Partial<OvertimeRequest>): Promise<OvertimeRequest | null> {
  const data = await read();
  const idx = data.requests.findIndex(r => r.id === id);
  if (idx === -1) return null;
  data.requests[idx] = { ...data.requests[idx], ...updates, updatedAt: new Date().toISOString() };
  await write(data);
  return data.requests[idx];
}

// ============ Approvals ============

export async function getPendingApprovals(approverId: string): Promise<OvertimeRequest[]> {
  const data = await read();
  const pendingSteps = data.approvalSteps.filter(s => s.approverId === approverId && s.status === 'pending');
  const requestIds = [...new Set(pendingSteps.map(s => s.requestId))];
  return data.requests.filter(r => requestIds.includes(r.id) && r.status === 'pending')
    .map(r => ({
      ...r,
      approvalSteps: data.approvalSteps.filter(s => s.requestId === r.id).sort((a, b) => a.level - b.level),
    }));
}

export async function approveStep(stepId: string, comment?: string): Promise<OvertimeRequest | null> {
  const data = await read();
  const step = data.approvalSteps.find(s => s.id === stepId);
  if (!step) return null;
  step.status = 'approved';
  step.comment = comment;
  step.actionedAt = new Date().toISOString();

  const reqIdx = data.requests.findIndex(r => r.id === step.requestId);
  if (reqIdx === -1) return null;
  const allStepsForRequest = data.approvalSteps.filter(s => s.requestId === step.requestId);
  const allApproved = allStepsForRequest.every(s => s.status === 'approved');

  if (allApproved) {
    data.requests[reqIdx].status = 'approved';
    data.requests[reqIdx].approvedBy = step.approverId;
    data.requests[reqIdx].approvedAt = new Date().toISOString();
  }
  await write(data);
  return data.requests[reqIdx];
}

export async function rejectStep(stepId: string, comment?: string): Promise<OvertimeRequest | null> {
  const data = await read();
  const step = data.approvalSteps.find(s => s.id === stepId);
  if (!step) return null;
  step.status = 'rejected';
  step.comment = comment;
  step.actionedAt = new Date().toISOString();

  const reqIdx = data.requests.findIndex(r => r.id === step.requestId);
  if (reqIdx === -1) return null;
  data.requests[reqIdx].status = 'rejected';
  await write(data);
  return data.requests[reqIdx];
}

// ============ Monthly Summary ============

export async function getMonthlySummaries(employeeId?: string, month?: number, year?: number): Promise<OvertimeMonthlySummary[]> {
  const data = await read();
  let result = data.summaries;
  if (employeeId) result = result.filter(s => s.employeeId === employeeId);
  if (month) result = result.filter(s => s.month === month);
  if (year) result = result.filter(s => s.year === year);
  return result;
}
