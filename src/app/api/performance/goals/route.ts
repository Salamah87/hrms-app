import { NextResponse } from 'next/server';
import { getGoals, createGoal } from '@/lib/performance-store';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters = {
    employeeId: searchParams.get('employeeId') || undefined,
    cycleId: searchParams.get('cycleId') || undefined,
  };
  const goals = await getGoals(filters.employeeId || filters.cycleId ? filters : undefined);
  return NextResponse.json(goals);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.employeeId || !body.cycleId || !body.title) {
      return NextResponse.json({ error: 'Missing required fields: employeeId, cycleId, title' }, { status: 400 });
    }
    const goal = await createGoal({
      employeeId: body.employeeId,
      cycleId: body.cycleId,
      title: body.title,
      description: body.description,
      type: body.type || 'objective',
      parentId: body.parentId,
      targetValue: body.targetValue,
      unit: body.unit,
      weight: body.weight,
      dueDate: body.dueDate,
    });
    return NextResponse.json(goal, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
