import { NextResponse } from 'next/server';
import { getRequestById, updateRequest } from '@/lib/overtime-store';

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const req = await getRequestById(params.id);
  if (!req) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(req);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const updated = await updateRequest(params.id, body);
  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(updated);
}
