import { NextResponse } from 'next/server';
import { getPolicyById, updatePolicy } from '@/lib/overtime-store';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const policy = await getPolicyById(params.id);
  if (!policy) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(policy);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const policy = await updatePolicy(params.id, body);
  if (!policy) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(policy);
}
