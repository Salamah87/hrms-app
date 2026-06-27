import { NextResponse } from 'next/server';
import { getLeaveTypes, processCarryOver } from '@/lib/leave-store';
import type { NextRequest } from 'next/server';

export async function GET() {
  const types = await getLeaveTypes();
  const rules = types
    .filter((t) => t.active)
    .map((t) => ({
      leaveType: t.code,
      name: t.name,
      maxCarryDays: t.carryForward,
      carryExpiryMonths: 12,
      enabled: t.carryForward > 0,
    }));
  return NextResponse.json(rules);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const year = body.year || new Date().getFullYear();
    const result = await processCarryOver(year);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Carry-over processing failed' }, { status: 500 });
  }
}
