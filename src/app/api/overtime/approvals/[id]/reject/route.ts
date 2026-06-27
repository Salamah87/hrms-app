import { NextResponse } from 'next/server';
import { rejectStep } from '@/lib/overtime-store';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const { comment } = await req.json();
  const updated = await rejectStep(params.id, comment);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}
