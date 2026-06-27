import { NextResponse } from 'next/server';
import { getCompetencies, updateCompetencies } from '@/lib/competency-store';
import type { NextRequest } from 'next/server';

export async function GET() {
  const competencies = await getCompetencies();
  return NextResponse.json(competencies);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!Array.isArray(body)) {
      return NextResponse.json({ error: 'Body must be an array of competencies' }, { status: 400 });
    }
    const result = await updateCompetencies(body);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
