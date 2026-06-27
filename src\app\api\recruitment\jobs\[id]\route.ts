import { NextResponse } from 'next/server';
import { getJobById, updateJob, publishJob, closeJob } from '@/lib/recruitment-store';
import type { NextRequest } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = await getJobById(id);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  return NextResponse.json(job);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const job = await updateJob(id, body);
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  return NextResponse.json(job);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  let job;
  if (body.action === 'publish') {
    job = await publishJob(id);
  } else if (body.action === 'close') {
    job = await closeJob(id);
  } else {
    return NextResponse.json({ error: 'Invalid action. Use "publish" or "close".' }, { status: 400 });
  }
  if (!job) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }
  return NextResponse.json(job);
}
