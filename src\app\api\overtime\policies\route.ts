import { NextResponse } from 'next/server';
import { getPolicies, createPolicy } from '@/lib/overtime-store';

export async function GET() {
  const policies = await getPolicies();
  return NextResponse.json(policies);
}

export async function POST(req: Request) {
  const body = await req.json();
  const policy = await createPolicy(body);
  return NextResponse.json(policy, { status: 201 });
}
