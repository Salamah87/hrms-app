import { NextResponse } from 'next/server';
import { getRequests, createRequest } from '@/lib/overtime-store';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const employeeId = url.searchParams.get('employeeId') || undefined;
  const status = url.searchParams.get('status') || undefined;
  const month = url.searchParams.get('month') ? parseInt(url.searchParams.get('month')!) : undefined;
  const year = url.searchParams.get('year') ? parseInt(url.searchParams.get('year')!) : undefined;
  const requests = await getRequests({ employeeId, status, month, year });
  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  const body = await req.json();
  const request = await createRequest(body);
  return NextResponse.json(request, { status: 201 });
}
