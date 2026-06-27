import { NextResponse } from 'next/server';
import { updateApplicationStage, rejectApplication, updateApplication } from '@/lib/recruitment-store';
import type { NextRequest } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  let application;

  if (body.action === 'reject') {
    application = await rejectApplication(id);
  } else if (body.stageId) {
    application = await updateApplicationStage(id, body.stageId);
  } else if (body.aiScore !== undefined || body.aiSummary !== undefined) {
    application = await updateApplication(id, { aiScore: body.aiScore, aiSummary: body.aiSummary });
  } else {
    return NextResponse.json({ error: 'Provide stageId, aiScore, or action: "reject"' }, { status: 400 });
  }

  if (!application) {
    return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  }
  return NextResponse.json(application);
}
