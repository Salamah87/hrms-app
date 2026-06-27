import { NextResponse } from 'next/server';
import { getApplications, createApplication, getPipelineStages } from '@/lib/recruitment-store';
import { getOrCreateCandidate } from '@/lib/recruitment-store';
import type { NextRequest } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const applications = await getApplications(id);
  return NextResponse.json(applications);
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!body.candidate) {
      return NextResponse.json({ error: 'Missing candidate data' }, { status: 400 });
    }

    const candidate = await getOrCreateCandidate({
      companyId: body.candidate.companyId,
      firstName: body.candidate.firstName,
      lastName: body.candidate.lastName,
      email: body.candidate.email,
      phone: body.candidate.phone,
      linkedinUrl: body.candidate.linkedinUrl,
      currentTitle: body.candidate.currentTitle,
      currentCompany: body.candidate.currentCompany,
      location: body.candidate.location,
      source: body.candidate.source || 'portal',
    });

    const stages = await getPipelineStages(id);
    const firstStage = stages.find(s => s.stageOrder === 1) || stages[0];

    const application = await createApplication({
      jobId: id,
      candidateId: candidate.id,
      source: body.source || 'portal',
      stageId: firstStage?.id,
      resumeUrl: body.resumeUrl,
      coverLetter: body.coverLetter,
    });

    return NextResponse.json(application, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
