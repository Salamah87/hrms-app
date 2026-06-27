import { NextResponse } from 'next/server';
import { getCycleById, updateCycle, launchCycle, closeCycle } from '@/lib/performance-store';
import type { NextRequest } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const cycle = await getCycleById(id);
  if (!cycle) return NextResponse.json({ error: 'Cycle not found' }, { status: 404 });
  return NextResponse.json(cycle);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  let cycle;
  if (body.action === 'launch') {
    cycle = await launchCycle(id);
  } else if (body.action === 'close') {
    cycle = await closeCycle(id);
  } else {
    cycle = await updateCycle(id, body);
  }
  if (!cycle) return NextResponse.json({ error: 'Cycle not found' }, { status: 404 });
  return NextResponse.json(cycle);
}
