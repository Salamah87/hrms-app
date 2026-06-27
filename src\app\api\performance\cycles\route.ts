import { NextResponse } from 'next/server';
import { getCycles, createCycle } from '@/lib/performance-store';
import type { NextRequest } from 'next/server';

export async function GET() {
  const cycles = await getCycles();
  return NextResponse.json(cycles);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.companyId || !body.name || !body.startDate || !body.endDate) {
      return NextResponse.json({ error: 'Missing required fields: companyId, name, startDate, endDate' }, { status: 400 });
    }
    const cycle = await createCycle({
      companyId: body.companyId,
      name: body.name,
      type: body.type || 'quarterly',
      startDate: body.startDate,
      endDate: body.endDate,
      reviewStyle: body.reviewStyle || 'manager_only',
      createdBy: body.createdBy,
    });
    return NextResponse.json(cycle, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
