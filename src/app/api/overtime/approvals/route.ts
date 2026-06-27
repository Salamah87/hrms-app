import { NextResponse } from 'next/server';
import { getPendingApprovals } from '@/lib/overtime-store';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const approverId = url.searchParams.get('approverId') || 'manager-1';
  const pending = await getPendingApprovals(approverId);
  return NextResponse.json(pending);
}
