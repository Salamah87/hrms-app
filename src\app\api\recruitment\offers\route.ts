import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';
import type { NextRequest } from 'next/server';
import type { Offer } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const RECRUITMENT_FILE = path.join(DATA_DIR, 'recruitment.json');

async function readFallback(): Promise<{ offers: Offer[] }> {
  try {
    const raw = await fs.readFile(RECRUITMENT_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { offers: [] };
  }
}

async function writeFallback(data: Record<string, unknown>) {
  try { await fs.access(DATA_DIR); } catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
  await fs.writeFile(RECRUITMENT_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function mapOffer(row: Record<string, unknown>): Offer {
  return {
    id: row.id as string,
    applicationId: row.application_id as string,
    salary: row.salary ? Number(row.salary) : undefined,
    currency: (row.currency as string) || 'USD',
    startDate: row.start_date ? new Date(row.start_date as string).toISOString() : undefined,
    contractType: row.contract_type as string || undefined,
    benefits: row.benefits as string || undefined,
    status: row.status as Offer['status'],
    offerLetterUrl: row.offer_letter_url as string || undefined,
    sentAt: row.sent_at ? new Date(row.sent_at as string).toISOString() : undefined,
    respondedAt: row.responded_at ? new Date(row.responded_at as string).toISOString() : undefined,
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get('applicationId');

  try {
    let sql = 'SELECT * FROM offers WHERE 1=1';
    const params: unknown[] = [];
    let idx = 1;
    if (applicationId) { sql += ` AND application_id = $${idx++}`; params.push(applicationId); }
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    return NextResponse.json(result.rows.map(mapOffer));
  } catch {
    const data = await readFallback();
    let offers = data.offers;
    if (applicationId) offers = offers.filter((o) => o.applicationId === applicationId);
    return NextResponse.json(offers.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.applicationId) {
      return NextResponse.json({ error: 'Missing required field: applicationId' }, { status: 400 });
    }

    const offerId = `off-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const now = new Date().toISOString();
    const offer: Offer = {
      id: offerId,
      applicationId: body.applicationId,
      salary: body.salary ? Number(body.salary) : undefined,
      currency: body.currency || 'USD',
      startDate: body.startDate || undefined,
      contractType: body.contractType || undefined,
      benefits: body.benefits || undefined,
      status: 'draft',
      createdAt: now,
    };

    try {
      const result = await query(
        `INSERT INTO offers (id, application_id, salary, currency, start_date, contract_type, benefits)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [offer.id, offer.applicationId, offer.salary || null, offer.currency,
         offer.startDate || null, offer.contractType || null, offer.benefits || null]
      );
      return NextResponse.json(mapOffer(result.rows[0]), { status: 201 });
    } catch {
      const data = await readFallback();
      data.offers.push(offer);
      await writeFallback(data as unknown as Record<string, unknown>);
      return NextResponse.json(offer, { status: 201 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
