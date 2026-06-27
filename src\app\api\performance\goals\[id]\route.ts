import { NextResponse } from 'next/server';
import { updateGoal, deleteGoal, getGoalById } from '@/lib/performance-store';
import type { NextRequest } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const goal = await updateGoal(id, body);
  if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  return NextResponse.json(goal);
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const deleted = await deleteGoal(id);
  if (!deleted) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  return NextResponse.json({ success: true });
}
