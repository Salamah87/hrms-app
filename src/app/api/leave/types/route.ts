import { NextResponse } from 'next/server';
import { getLeaveTypes, saveLeaveTypes } from '@/lib/leave-store';
import type { NextRequest } from 'next/server';
import type { LeaveTypeCode } from '@/types';

const defaultLeaveTypes: { code: LeaveTypeCode; name: string; paid: boolean; daysPerYear: number; maxConsecutive: number; accrual: boolean; carryForward: number; encashable: boolean }[] = [
  { code: 'annual', name: 'Annual Leave', paid: true, daysPerYear: 30, maxConsecutive: 30, accrual: true, carryForward: 10, encashable: true },
  { code: 'sick', name: 'Sick Leave', paid: true, daysPerYear: 14, maxConsecutive: 14, accrual: false, carryForward: 0, encashable: false },
  { code: 'personal', name: 'Personal Leave', paid: true, daysPerYear: 5, maxConsecutive: 5, accrual: false, carryForward: 0, encashable: false },
  { code: 'emergency', name: 'Emergency Leave', paid: true, daysPerYear: 3, maxConsecutive: 3, accrual: false, carryForward: 0, encashable: false },
  { code: 'maternity', name: 'Maternity Leave', paid: true, daysPerYear: 90, maxConsecutive: 90, accrual: false, carryForward: 0, encashable: false },
  { code: 'paternity', name: 'Paternity Leave', paid: true, daysPerYear: 3, maxConsecutive: 3, accrual: false, carryForward: 0, encashable: false },
  { code: 'hajj', name: 'Hajj Leave', paid: true, daysPerYear: 15, maxConsecutive: 15, accrual: false, carryForward: 0, encashable: false },
  { code: 'unpaid', name: 'Unpaid Leave', paid: false, daysPerYear: 30, maxConsecutive: 30, accrual: false, carryForward: 0, encashable: false },
  { code: 'study', name: 'Study Leave', paid: true, daysPerYear: 10, maxConsecutive: 10, accrual: false, carryForward: 0, encashable: false },
];

export async function GET() {
  let types = await getLeaveTypes();
  if (types.length === 0) {
    types = defaultLeaveTypes.map((t, i) => ({
      id: `lt-${i + 1}`,
      ...t,
      active: true,
    }));
    await saveLeaveTypes(types);
  }
  return NextResponse.json(types);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Expected array of leave types' }, { status: 400 });
    }
    await saveLeaveTypes(body);
    return NextResponse.json(body);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
