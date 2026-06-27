import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';
import type { NextRequest } from 'next/server';
import type { Interview } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const RECRUITMENT_FILE = path.join(DATA_DIR, 'recruitment.json');

async function readFallback(): Promise<{ interviews: Interview[] }> {
  try {
    const raw = await fs.readFile(RECRUITMENT_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { interviews: [] };
  }
}

async function writeFallback(data: Record<string, unknown>) {
  try { await fs.access(DATA_DIR); } catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
  await fs.writeFile(RECRUITMENT_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

function mapInterview(row: Record<string, unknown>): Interview {
  return {
    id: row.id as string,
    applicationId: row.application_id as string,
    stageId: row.stage_id as string || undefined,
    interviewerIds: row.interviewer_ids as string[] || undefined,
    scheduledAt: row.scheduled_at ? new Date(row.scheduled_at as string).toISOString() : undefined,
    durationMins: row.duration_mins ? Number(row.duration_mins) : 60,
    type: row.type as Interview['type'],
    locationLink: row.location_link as string || undefined,
    status: (row.status as Interview['status']) || 'scheduled',
    feedback: row.feedback as string || undefined,
    rating: row.rating ? Number(row.rating) : undefined,
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const applicationId = searchParams.get('applicationId');

  try {
    let sql = 'SELECT * FROM interviews WHERE 1=1';
    const params: unknown[] = [];
    let idx = 1;
    if (applicationId) { sql += ` AND application_id = $${idx++}`; params.push(applicationId); }
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    return NextResponse.json(result.rows.map(mapInterview));
  } catch {
    const data = await readFallback();
    let interviews = data.interviews;
    if (applicationId) interviews = interviews.filter((i) => i.applicationId === applicationId);
    return NextResponse.json(interviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.applicationId || !body.scheduledAt) {
      return NextResponse.json({ error: 'Missing required fields: applicationId, scheduledAt' }, { status: 400 });
    }

    try {
      const result = await query(
        `INSERT INTO interviews (application_id, stage_id, interviewer_ids, scheduled_at, duration_mins, type, location_link)
         VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
        [body.applicationId, body.stageId || null, body.interviewerIds || null,
         body.scheduledAt, body.durationMins || 60, body.type || 'video', body.locationLink || null]
      );
      return NextResponse.json(mapInterview(result.rows[0]), { status: 201 });
    } catch {
      const data = await readFallback();
      const interview: Interview = {
        id: `int-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        applicationId: body.applicationId,
        stageId: body.stageId,
        interviewerIds: body.interviewerIds,
        scheduledAt: body.scheduledAt,
        durationMins: body.durationMins || 60,
        type: body.type || 'video',
        locationLink: body.locationLink,
        status: 'scheduled',
        createdAt: new Date().toISOString(),
      };
      data.interviews.push(interview);
      await writeFallback(data as unknown as Record<string, unknown>);
      return NextResponse.json(interview, { status: 201 });
    }
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
