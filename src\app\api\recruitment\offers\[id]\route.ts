import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { promises as fs } from 'fs';
import path from 'path';
import { getAllEmployees, updateAllEmployees } from '@/lib/data-store';
import type { NextRequest } from 'next/server';
import type { Offer, Employee } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const RECRUITMENT_FILE = path.join(DATA_DIR, 'recruitment.json');

async function readFallback(): Promise<{ offers: Offer[]; applications: any[]; candidates: any[]; jobs: any[] }> {
  try {
    const raw = await fs.readFile(RECRUITMENT_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { offers: [], applications: [], candidates: [], jobs: [] };
  }
}

async function writeFallback(data: any) {
  try { await fs.access(DATA_DIR); } catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
  await fs.writeFile(RECRUITMENT_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const result = await query('SELECT * FROM offers WHERE id = $1', [id]);
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({
      id: result.rows[0].id,
      applicationId: result.rows[0].application_id,
      salary: result.rows[0].salary ? Number(result.rows[0].salary) : null,
      currency: result.rows[0].currency,
      startDate: result.rows[0].start_date,
      contractType: result.rows[0].contract_type,
      benefits: result.rows[0].benefits,
      status: result.rows[0].status,
      offerLetterUrl: result.rows[0].offer_letter_url,
      sentAt: result.rows[0].sent_at,
      respondedAt: result.rows[0].responded_at,
      createdAt: result.rows[0].created_at,
    });
  } catch {
    const data = await readFallback();
    const offer = data.offers.find((o: Offer) => o.id === id);
    if (!offer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json(offer);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const now = new Date().toISOString();

  try {
    let sql = 'UPDATE offers SET';
    const fields: string[] = [];
    const values: unknown[] = [];
    let idx = 1;

    if (body.salary !== undefined) { fields.push(`salary = $${idx++}`); values.push(body.salary); }
    if (body.currency !== undefined) { fields.push(`currency = $${idx++}`); values.push(body.currency); }
    if (body.startDate !== undefined) { fields.push(`start_date = $${idx++}`); values.push(body.startDate); }
    if (body.contractType !== undefined) { fields.push(`contract_type = $${idx++}`); values.push(body.contractType); }
    if (body.benefits !== undefined) { fields.push(`benefits = $${idx++}`); values.push(body.benefits); }
    if (body.offerLetterUrl !== undefined) { fields.push(`offer_letter_url = $${idx++}`); values.push(body.offerLetterUrl); }

    if (body.action === 'send') {
      fields.push(`status = $${idx++}`, `sent_at = $${idx++}`);
      values.push('sent', now);
    } else if (body.action === 'accept') {
      fields.push(`status = $${idx++}`, `responded_at = $${idx++}`);
      values.push('accepted', now);
    } else if (body.action === 'reject') {
      fields.push(`status = $${idx++}`, `responded_at = $${idx++}`);
      values.push('rejected', now);
    }

    if (fields.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });

    sql += ` ${fields.join(', ')} WHERE id = $${idx} RETURNING *`;
    values.push(id);

    const result = await query(sql, values);
    if (result.rows.length === 0) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = result.rows[0];

    if (body.action === 'accepted' || body.action === 'accept') {
      await autoCreateEmployee(updated.application_id);
    }

    return NextResponse.json({
      id: updated.id,
      applicationId: updated.application_id,
      salary: updated.salary ? Number(updated.salary) : null,
      currency: updated.currency,
      startDate: updated.start_date,
      contractType: updated.contract_type,
      benefits: updated.benefits,
      status: updated.status,
      offerLetterUrl: updated.offer_letter_url,
      sentAt: updated.sent_at,
      respondedAt: updated.responded_at,
      createdAt: updated.created_at,
    });
  } catch {
    const data = await readFallback();
    const idx = data.offers.findIndex((o: Offer) => o.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const offer = data.offers[idx];
    if (body.action === 'send') { offer.status = 'sent'; offer.sentAt = now; }
    else if (body.action === 'accept' || body.action === 'accepted') { offer.status = 'accepted'; offer.respondedAt = now; }
    else if (body.action === 'reject') { offer.status = 'rejected'; offer.respondedAt = now; }
    else { Object.assign(offer, body); }

    await writeFallback(data);

    if (body.action === 'accepted' || body.action === 'accept') {
      await autoCreateEmployee(offer.applicationId);
    }

    return NextResponse.json(offer);
  }
}

async function autoCreateEmployee(applicationId: string) {
  try {
    const data = await readFallback();
    const app = data.applications.find((a: any) => a.id === applicationId);
    if (!app) return;
    const candidate = data.candidates.find((c: any) => c.id === app.candidateId);
    if (!candidate) return;
    const job = data.jobs.find((j: any) => j.id === app.jobId);
    if (!job) return;

    const existing = await getAllEmployees();
    const maxNum = existing.reduce((max: number, e: Employee) => {
      const num = parseInt(e.employeeNumber.replace('EMP', ''), 10);
      return isNaN(num) ? max : Math.max(max, num);
    }, 0);

    const newEmployee: Employee = {
      id: `emp-${Date.now()}`,
      employeeNumber: `EMP${String(maxNum + 1).padStart(4, '0')}`,
      firstName: candidate.firstName,
      lastName: candidate.lastName,
      fullName: `${candidate.firstName} ${candidate.lastName}`,
      email: candidate.email,
      phone: candidate.phone,
      address: candidate.location,
      employmentType: 'full_time',
      status: 'active',
      joiningDate: new Date().toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await updateAllEmployees([...existing, newEmployee]);
  } catch (err) {
    console.error('Failed to auto-create employee:', err);
  }
}
