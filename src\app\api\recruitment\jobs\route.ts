import { NextResponse } from 'next/server';
import { getAllJobs, createJob } from '@/lib/recruitment-store';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const filters = {
    status: searchParams.get('status') as any || undefined,
    departmentId: searchParams.get('departmentId') || undefined,
    search: searchParams.get('search') || undefined,
  };
  const jobs = await getAllJobs(Object.values(filters).some(Boolean) ? filters : undefined);
  return NextResponse.json(jobs);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.title || !body.companyId) {
      return NextResponse.json({ error: 'Missing required fields: title, companyId' }, { status: 400 });
    }
    const job = await createJob({
      companyId: body.companyId,
      departmentId: body.departmentId,
      title: body.title,
      location: body.location,
      type: body.type,
      description: body.description,
      requirements: body.requirements,
      salaryMin: body.salaryMin,
      salaryMax: body.salaryMax,
      postedBy: body.postedBy,
      closesAt: body.closesAt,
    });
    return NextResponse.json(job, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
