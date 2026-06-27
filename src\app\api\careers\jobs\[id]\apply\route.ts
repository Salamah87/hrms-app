import { NextResponse } from 'next/server';
import { getJobById, getOrCreateCandidate, createApplication, getPipelineStages } from '@/lib/recruitment-store';
import type { NextRequest } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await getJobById(id);
    if (!job || job.status !== 'open') {
      return NextResponse.json({ error: 'Job not found or no longer accepting applications' }, { status: 404 });
    }

    const body = await request.json();
    if (!body.firstName || !body.lastName || !body.email) {
      return NextResponse.json({ error: 'Missing required fields: firstName, lastName, email' }, { status: 400 });
    }

    const candidate = await getOrCreateCandidate({
      companyId: job.companyId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      currentTitle: body.currentTitle,
      currentCompany: body.currentCompany,
      location: body.location,
      source: 'careers-page',
    });

    const stages = await getPipelineStages(id);
    const firstStage = stages.find(s => s.stageOrder === 1) || stages[0];

    const application = await createApplication({
      jobId: id,
      candidateId: candidate.id,
      source: 'careers-page',
      stageId: firstStage?.id,
      resumeUrl: body.resumeUrl,
      coverLetter: body.coverLetter || body.message,
    });

    return NextResponse.json({ success: true, applicationId: application.id }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Failed to submit application' }, { status: 500 });
  }
}
