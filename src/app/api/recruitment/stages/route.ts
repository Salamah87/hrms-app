import { NextResponse } from 'next/server';
import { getPipelineStages } from '@/lib/recruitment-store';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const jobId = new URL(request.url).searchParams.get('jobId');
  if (!jobId) {
    return NextResponse.json({ error: 'jobId query parameter is required' }, { status: 400 });
  }
  const stages = await getPipelineStages(jobId);
  return NextResponse.json(stages);
}
