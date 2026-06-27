import { promises as fs } from 'fs';
import path from 'path';
import type { LeaveTypeCode } from '@/types';
import { isDbAvailable, pgGetCollection, pgSetCollection } from '@/lib/pg-store';

const DATA_DIR = path.join(process.cwd(), 'data');
const LEAVE_TYPES_FILE = path.join(DATA_DIR, 'leave-types.json');
const LEAVE_BALANCES_FILE = path.join(DATA_DIR, 'leave-balances.json');

export interface LeaveTypeConfig {
  id: string;
  code: LeaveTypeCode;
  name: string;
  paid: boolean;
  daysPerYear: number;
  maxConsecutive: number;
  accrual: boolean;
  carryForward: number;
  encashable: boolean;
  active: boolean;
}

export interface LeaveBalanceRow {
  employeeId: string;
  leaveType: LeaveTypeCode;
  year: number;
  entitlement: number;
  used: number;
  pending: number;
  carriedOver: number;
}

export interface CarryOverRule {
  leaveType: LeaveTypeCode;
  maxCarryDays: number;
  carryExpiryMonths: number;
  enabled: boolean;
}

async function ensureDataDir() {
  try { await fs.access(DATA_DIR); } catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
}

export async function getLeaveTypes(): Promise<LeaveTypeConfig[]> {
  if (await isDbAvailable()) {
    const data = await pgGetCollection<{ leaveTypes: LeaveTypeConfig[] }>('leave-types');
    return data.leaveTypes || [];
  }
  await ensureDataDir();
  try {
    const raw = await fs.readFile(LEAVE_TYPES_FILE, 'utf-8');
    return JSON.parse(raw).leaveTypes || [];
  } catch { return []; }
}

export async function saveLeaveTypes(types: LeaveTypeConfig[]): Promise<void> {
  if (await isDbAvailable()) {
    await pgSetCollection('leave-types', { leaveTypes: types });
    return;
  }
  await ensureDataDir();
  await fs.writeFile(LEAVE_TYPES_FILE, JSON.stringify({ leaveTypes: types }, null, 2), 'utf-8');
}

export async function getLeaveBalances(employeeId?: string): Promise<LeaveBalanceRow[]> {
  let list: LeaveBalanceRow[];
  if (await isDbAvailable()) {
    const data = await pgGetCollection<{ balances: LeaveBalanceRow[] }>('leave-balances');
    list = data.balances || [];
  } else {
    await ensureDataDir();
    try {
      const raw = await fs.readFile(LEAVE_BALANCES_FILE, 'utf-8');
      list = JSON.parse(raw).balances || [];
    } catch { return []; }
  }
  return employeeId ? list.filter((b) => b.employeeId === employeeId) : list;
}

export async function saveLeaveBalances(balances: LeaveBalanceRow[]): Promise<void> {
  if (await isDbAvailable()) {
    await pgSetCollection('leave-balances', { balances });
    return;
  }
  await ensureDataDir();
  await fs.writeFile(LEAVE_BALANCES_FILE, JSON.stringify({ balances }, null, 2), 'utf-8');
}

export async function processCarryOver(year: number): Promise<{ processed: number; entries: LeaveBalanceRow[] }> {
  const types = await getLeaveTypes();
  const balances = await getLeaveBalances();
  const carryRules: CarryOverRule[] = types
    .filter((t) => t.carryForward > 0 && t.active)
    .map((t) => ({ leaveType: t.code, maxCarryDays: t.carryForward, carryExpiryMonths: 12, enabled: true }));

  const employeeIds = [...new Set(balances.map((b) => b.employeeId))];
  const newEntries: LeaveBalanceRow[] = [];

  for (const employeeId of employeeIds) {
    for (const rule of carryRules) {
      const currentYearBal = balances.find(
        (b) => b.employeeId === employeeId && b.leaveType === rule.leaveType && b.year === year
      );
      if (!currentYearBal) continue;

      const unused = Math.max(0, currentYearBal.entitlement + currentYearBal.carriedOver - currentYearBal.used - currentYearBal.pending);
      const carryAmount = Math.min(unused, rule.maxCarryDays);

      if (carryAmount <= 0) continue;

      const existingNextYear = balances.find(
        (b) => b.employeeId === employeeId && b.leaveType === rule.leaveType && b.year === year + 1
      );

      if (existingNextYear) {
        existingNextYear.carriedOver += carryAmount;
        existingNextYear.entitlement += carryAmount;
      } else {
        newEntries.push({
          employeeId,
          leaveType: rule.leaveType,
          year: year + 1,
          entitlement: carryAmount,
          used: 0,
          pending: 0,
          carriedOver: carryAmount,
        });
      }
    }
  }

  const updatedBalances = [...balances, ...newEntries];
  await saveLeaveBalances(updatedBalances);

  return { processed: newEntries.length, entries: newEntries };
}
