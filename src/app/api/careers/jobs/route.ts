import { NextResponse } from 'next/server';
import { getAllJobs } from '@/lib/recruitment-store';

export async function GET() {
  const jobs = await getAllJobs({ status: 'open' });
  return NextResponse.json(jobs);
}
