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

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await query('SELECT * FROM interviews WHERE id = $1', [id]);
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const interview = result.rows[0];
    return NextResponse.json({
      id: interview.id,
      applicationId: interview.application_id,
      stageId: interview.stage_id,
      interviewerIds: interview.interviewer_ids,
      scheduledAt: interview.scheduled_at ? new Date(interview.scheduled_at).toISOString() : null,
      durationMins: interview.duration_mins || 60,
      type: interview.type,
      locationLink: interview.location_link,
      status: interview.status,
      feedback: interview.feedback,
      rating: interview.rating,
      createdAt: new Date(interview.created_at).toISOString(),
    });
  } catch {
    const data = await readFallback();
    const interview = data.interviews.find((i) => i.id === id);
    if (!interview) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(interview);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  try {
    let sql = 'UPDATE interviews SET';
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (body.feedback !== undefined) { fields.push(`feedback = $${idx++}`); values.push(body.feedback); }
    if (body.rating !== undefined) { fields.push(`rating = $${idx++}`); values.push(body.rating); }
    if (body.status !== undefined) { fields.push(`status = $${idx++}`); values.push(body.status); }
    if (body.scheduledAt !== undefined) { fields.push(`scheduled_at = $${idx++}`); values.push(body.scheduledAt); }
    if (body.locationLink !== undefined) { fields.push(`location_link = $${idx++}`); values.push(body.locationLink); }
    if (body.type !== undefined) { fields.push(`type = $${idx++}`); values.push(body.type); }
    if (body.durationMins !== undefined) { fields.push(`duration_mins = $${idx++}`); values.push(body.durationMins); }

    if (fields.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

    sql += ` ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    values.push(id);

    const result = await query(sql, values);
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const row = result.rows[0];
    return NextResponse.json({
      id: row.id,
      applicationId: row.application_id,
      stageId: row.stage_id,
      interviewerIds: row.interviewer_ids,
      scheduledAt: row.scheduled_at ? new Date(row.scheduled_at).toISOString() : null,
      durationMins: row.duration_mins || 60,
      type: row.type,
      locationLink: row.location_link,
      status: row.status,
      feedback: row.feedback,
      rating: row.rating,
      createdAt: new Date(row.created_at).toISOString(),
    });
  } catch {
    const data = await readFallback();
    const idx = data.interviews.findIndex((i) => i.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    data.interviews[idx] = { ...data.interviews[idx], ...body };
    await writeFallback(data as unknown as Record<string, unknown>);
    return NextResponse.json(data.interviews[idx]);
  }
}
