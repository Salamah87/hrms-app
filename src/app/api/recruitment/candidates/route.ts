import { NextResponse } from 'next/server';
import { getOrCreateCandidate } from '@/lib/recruitment-store';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.companyId || !body.firstName || !body.lastName || !body.email) {
      return NextResponse.json({ error: 'Missing required fields: companyId, firstName, lastName, email' }, { status: 400 });
    }
    const candidate = await getOrCreateCandidate({
      companyId: body.companyId,
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      linkedinUrl: body.linkedinUrl,
      currentTitle: body.currentTitle,
      currentCompany: body.currentCompany,
      location: body.location,
      source: body.source,
    });
    return NextResponse.json(candidate, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
