import { promises as fs } from 'fs';
import path from 'path';
import { query, testConnection } from '@/lib/db';
import type {
  Job, Candidate, PipelineStage, Application, Interview, Offer,
  JobStatus, ApplicationStatus, OfferStatus, JobType,
} from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const RECRUITMENT_FILE = path.join(DATA_DIR, 'recruitment.json');
let dbAvailable: boolean | null = null;

async function isDbAvailable(): Promise<boolean> {
  if (dbAvailable !== null) return dbAvailable;
  const result = await testConnection();
  dbAvailable = result.connected;
  return dbAvailable;
}

async function ensureDataDir() {
  try { await fs.access(DATA_DIR); }
  catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
}

async function readJsonFallback(): Promise<{
  jobs: Job[]; candidates: Candidate[]; pipelineStages: PipelineStage[];
  applications: Application[]; interviews: Interview[]; offers: Offer[];
}> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(RECRUITMENT_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    return { jobs: [], candidates: [], pipelineStages: [], applications: [], interviews: [], offers: [] };
  }
}

async function writeJsonFallback(data: Record<string, unknown>) {
  await ensureDataDir();
  await fs.writeFile(RECRUITMENT_FILE, JSON.stringify(data, null, 2), 'utf-8');
}

// ============ Default Pipeline Stages ============

const DEFAULT_STAGES: { name: string; order: number }[] = [
  { name: 'Applied', order: 1 },
  { name: 'AI Screening', order: 2 },
  { name: 'CV Review', order: 3 },
  { name: 'Phone Screen', order: 4 },
  { name: 'Technical Interview', order: 5 },
  { name: 'Final Interview', order: 6 },
  { name: 'Reference Check', order: 7 },
  { name: 'Offer Sent', order: 8 },
  { name: 'Hired', order: 9 },
  { name: 'Rejected', order: 10 },
];

// ============ Jobs ============

export async function getAllJobs(filters?: {
  status?: JobStatus; departmentId?: string; search?: string;
}): Promise<Job[]> {
  if (await isDbAvailable()) {
    let sql = 'SELECT * FROM jobs WHERE 1=1';
    const params: unknown[] = [];
    let idx = 1;
    if (filters?.status) { sql += ` AND status = $${idx++}`; params.push(filters.status); }
    if (filters?.departmentId) { sql += ` AND department_id = $${idx++}`; params.push(filters.departmentId); }
    if (filters?.search) { sql += ` AND (title ILIKE $${idx} OR description ILIKE $${idx})`; params.push(`%${filters.search}%`); idx++; }
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);
    return mapJobs(result.rows);
  }
  const data = await readJsonFallback();
  let jobs = data.jobs;
  if (filters?.status) jobs = jobs.filter(j => j.status === filters.status);
  if (filters?.departmentId) jobs = jobs.filter(j => j.departmentId === filters.departmentId);
  if (filters?.search) {
    const s = filters.search.toLowerCase();
    jobs = jobs.filter(j => j.title.toLowerCase().includes(s) || (j.description || '').toLowerCase().includes(s));
  }
  return jobs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getJobById(id: string): Promise<Job | null> {
  if (await isDbAvailable()) {
    const result = await query('SELECT * FROM jobs WHERE id = $1', [id]);
    if (result.rows.length === 0) return null;
    return mapJob(result.rows[0]);
  }
  const data = await readJsonFallback();
  return data.jobs.find(j => j.id === id) || null;
}

export async function createJob(input: {
  companyId: string; departmentId?: string; title: string; location?: string;
  type?: JobType; description?: string; requirements?: string;
  salaryMin?: number; salaryMax?: number; postedBy?: string; closesAt?: string;
}): Promise<Job> {
  if (await isDbAvailable()) {
    const result = await query(
      `INSERT INTO jobs (company_id, department_id, title, location, type, description, requirements, salary_min, salary_max, posted_by, closes_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [input.companyId, input.departmentId || null, input.title, input.location || null,
       input.type || 'full_time', input.description || null, input.requirements || null,
       input.salaryMin || null, input.salaryMax || null, input.postedBy || null, input.closesAt || null]
    );
    const job = mapJob(result.rows[0]);
    await ensureDefaultStages(input.companyId, job.id);
    return job;
  }
  const data = await readJsonFallback();
  const job: Job = {
    id: `job-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    companyId: input.companyId,
    departmentId: input.departmentId,
    title: input.title,
    location: input.location,
    type: input.type || 'full_time',
    description: input.description,
    requirements: input.requirements,
    salaryMin: input.salaryMin,
    salaryMax: input.salaryMax,
    status: 'draft',
    postedBy: input.postedBy,
    closesAt: input.closesAt,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.jobs.push(job);
  data.pipelineStages.push(...DEFAULT_STAGES.map((s, i) => ({
    id: `stage-${job.id}-${i}`,
    companyId: input.companyId,
    jobId: job.id,
    name: s.name,
    stageOrder: s.order,
    autoAdvance: false,
    disqualifyOnFail: false,
    createdAt: new Date().toISOString(),
  })));
  await writeJsonFallback(data as unknown as Record<string, unknown>);
  return job;
}

export async function updateJob(id: string, updates: Partial<Job>): Promise<Job | null> {
  if (await isDbAvailable()) {
    const fields: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    const fieldMap: Record<string, string> = {
      title: 'title', location: 'location', type: 'type', description: 'description',
      requirements: 'requirements', salaryMin: 'salary_min', salaryMax: 'salary_max',
      status: 'status', closesAt: 'closes_at', departmentId: 'department_id',
    };
    for (const [key, col] of Object.entries(fieldMap)) {
      if (updates[key as keyof typeof updates] !== undefined) {
        fields.push(`${col} = $${idx++}`);
        params.push(updates[key as keyof typeof updates]);
      }
    }
    if (fields.length === 0) return getJobById(id);
    params.push(id);
    const result = await query(
      `UPDATE jobs SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    if (result.rows.length === 0) return null;
    return mapJob(result.rows[0]);
  }
  const data = await readJsonFallback();
  const idx = data.jobs.findIndex(j => j.id === id);
  if (idx === -1) return null;
  data.jobs[idx] = { ...data.jobs[idx], ...updates, updatedAt: new Date().toISOString() };
  await writeJsonFallback(data as unknown as Record<string, unknown>);
  return data.jobs[idx];
}

export async function publishJob(id: string): Promise<Job | null> {
  return updateJob(id, {
    status: 'open',
    publishedAt: new Date().toISOString(),
  } as Partial<Job>);
}

export async function closeJob(id: string): Promise<Job | null> {
  return updateJob(id, { status: 'closed' } as Partial<Job>);
}

// ============ Pipeline Stages ============

async function ensureDefaultStages(companyId: string, jobId: string) {
  const existing = await query('SELECT COUNT(*) FROM pipeline_stages WHERE job_id = $1', [jobId]);
  if (parseInt(existing.rows[0].count, 10) > 0) return;
  for (const stage of DEFAULT_STAGES) {
    await query(
      `INSERT INTO pipeline_stages (company_id, job_id, name, stage_order) VALUES ($1,$2,$3,$4)`,
      [companyId, jobId, stage.name, stage.order]
    );
  }
}

export async function getPipelineStages(jobId: string): Promise<PipelineStage[]> {
  if (await isDbAvailable()) {
    const result = await query(
      'SELECT * FROM pipeline_stages WHERE job_id = $1 ORDER BY stage_order', [jobId]
    );
    return result.rows.map(mapPipelineStage);
  }
  const data = await readJsonFallback();
  return data.pipelineStages.filter(s => s.jobId === jobId).sort((a, b) => a.stageOrder - b.stageOrder);
}

// ============ Candidates ============

export async function getOrCreateCandidate(input: {
  companyId: string; firstName: string; lastName: string; email: string;
  phone?: string; linkedinUrl?: string; currentTitle?: string;
  currentCompany?: string; location?: string; source?: string;
}): Promise<Candidate> {
  if (await isDbAvailable()) {
    const existing = await query(
      'SELECT * FROM candidates WHERE company_id = $1 AND email = $2',
      [input.companyId, input.email]
    );
    if (existing.rows.length > 0) return mapCandidate(existing.rows[0]);
    const result = await query(
      `INSERT INTO candidates (company_id, first_name, last_name, email, phone, linkedin_url, current_title, current_company, location, source)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [input.companyId, input.firstName, input.lastName, input.email,
       input.phone || null, input.linkedinUrl || null, input.currentTitle || null,
       input.currentCompany || null, input.location || null, input.source || null]
    );
    return mapCandidate(result.rows[0]);
  }
  const data = await readJsonFallback();
  const existing = data.candidates.find(c => c.companyId === input.companyId && c.email === input.email);
  if (existing) return existing;
  const candidate: Candidate = {
    id: `cand-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    companyId: input.companyId,
    firstName: input.firstName,
    lastName: input.lastName,
    email: input.email,
    phone: input.phone,
    linkedinUrl: input.linkedinUrl,
    currentTitle: input.currentTitle,
    currentCompany: input.currentCompany,
    location: input.location,
    source: input.source,
    createdAt: new Date().toISOString(),
  };
  data.candidates.push(candidate);
  await writeJsonFallback(data as unknown as Record<string, unknown>);
  return candidate;
}

// ============ Applications ============

export async function getApplications(jobId: string): Promise<Application[]> {
  if (await isDbAvailable()) {
    const result = await query(
      `SELECT a.*, row_to_json(c.*) as candidate, row_to_json(ps.*) as stage
       FROM applications a
       LEFT JOIN candidates c ON c.id = a.candidate_id
       LEFT JOIN pipeline_stages ps ON ps.id = a.stage_id
       WHERE a.job_id = $1 ORDER BY a.created_at DESC`,
      [jobId]
    );
    return result.rows.map(r => mapApplication(r, r.candidate, r.stage));
  }
  const data = await readJsonFallback();
  return data.applications
    .filter(a => a.jobId === jobId)
    .map(a => ({
      ...a,
      candidate: data.candidates.find(c => c.id === a.candidateId),
      stage: data.pipelineStages.find(s => s.id === a.stageId),
    }))
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createApplication(input: {
  jobId: string; candidateId: string; source?: string;
  stageId?: string; resumeUrl?: string; coverLetter?: string;
}): Promise<Application> {
  if (await isDbAvailable()) {
    const result = await query(
      `INSERT INTO applications (job_id, candidate_id, source, stage_id, resume_url, cover_letter)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [input.jobId, input.candidateId, input.source || null,
       input.stageId || null, input.resumeUrl || null, input.coverLetter || null]
    );
    return mapApplication(result.rows[0]);
  }
  const data = await readJsonFallback();
  const application: Application = {
    id: `app-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    jobId: input.jobId,
    candidateId: input.candidateId,
    source: input.source,
    stageId: input.stageId,
    status: 'active',
    resumeUrl: input.resumeUrl,
    coverLetter: input.coverLetter,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  data.applications.push(application);
  await writeJsonFallback(data as unknown as Record<string, unknown>);
  return application;
}

export async function updateApplicationStage(
  id: string, stageId: string
): Promise<Application | null> {
  if (await isDbAvailable()) {
    const result = await query(
      'UPDATE applications SET stage_id = $1, updated_at = now() WHERE id = $2 RETURNING *',
      [stageId, id]
    );
    if (result.rows.length === 0) return null;
    return mapApplication(result.rows[0]);
  }
  const data = await readJsonFallback();
  const idx = data.applications.findIndex(a => a.id === id);
  if (idx === -1) return null;
  data.applications[idx].stageId = stageId;
  data.applications[idx].updatedAt = new Date().toISOString();
  await writeJsonFallback(data as unknown as Record<string, unknown>);
  return data.applications[idx];
}

export async function rejectApplication(id: string): Promise<Application | null> {
  if (await isDbAvailable()) {
    const result = await query(
      'UPDATE applications SET status = $1, updated_at = now() WHERE id = $2 RETURNING *',
      ['rejected', id]
    );
    if (result.rows.length === 0) return null;
    return mapApplication(result.rows[0]);
  }
  const data = await readJsonFallback();
  const idx = data.applications.findIndex(a => a.id === id);
  if (idx === -1) return null;
  data.applications[idx].status = 'rejected';
  data.applications[idx].updatedAt = new Date().toISOString();
  await writeJsonFallback(data as unknown as Record<string, unknown>);
  return data.applications[idx];
}

export async function updateApplication(
  id: string, updates: Partial<Application>
): Promise<Application | null> {
  if (await isDbAvailable()) {
    const fields: string[] = [];
    const params: unknown[] = [];
    let idx = 1;
    const fieldMap: Record<string, string> = {
      stageId: 'stage_id', aiScore: 'ai_score', aiSummary: 'ai_summary',
      status: 'status', source: 'source', resumeUrl: 'resume_url',
      coverLetter: 'cover_letter',
    };
    for (const [key, col] of Object.entries(fieldMap)) {
      if (updates[key as keyof typeof updates] !== undefined) {
        fields.push(`${col} = $${idx++}`);
        params.push(updates[key as keyof typeof updates]);
      }
    }
    if (fields.length === 0) return null;
    fields.push(`updated_at = now()`);
    params.push(id);
    const result = await query(
      `UPDATE applications SET ${fields.join(', ')} WHERE id = $${idx} RETURNING *`,
      params
    );
    if (result.rows.length === 0) return null;
    return mapApplication(result.rows[0]);
  }
  const data = await readJsonFallback();
  const appIdx = data.applications.findIndex(a => a.id === id);
  if (appIdx === -1) return null;
  data.applications[appIdx] = { ...data.applications[appIdx], ...updates, updatedAt: new Date().toISOString() };
  await writeJsonFallback(data as unknown as Record<string, unknown>);
  return data.applications[appIdx];
}

// ============ Mappers ============

function mapJob(row: Record<string, unknown>): Job {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    departmentId: row.department_id as string || undefined,
    title: row.title as string,
    location: row.location as string || undefined,
    type: row.type as JobType,
    description: row.description as string || undefined,
    requirements: row.requirements as string || undefined,
    salaryMin: row.salary_min ? Number(row.salary_min) : undefined,
    salaryMax: row.salary_max ? Number(row.salary_max) : undefined,
    status: row.status as JobStatus,
    postedBy: row.posted_by as string || undefined,
    publishedAt: row.published_at ? new Date(row.published_at as string).toISOString() : undefined,
    closesAt: row.closes_at ? new Date(row.closes_at as string).toISOString() : undefined,
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
  };
}

function mapJobs(rows: Record<string, unknown>[]): Job[] {
  return rows.map(mapJob);
}

function mapCandidate(row: Record<string, unknown>): Candidate {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    firstName: row.first_name as string,
    lastName: row.last_name as string,
    email: row.email as string,
    phone: row.phone as string || undefined,
    linkedinUrl: row.linkedin_url as string || undefined,
    avatarUrl: row.avatar_url as string || undefined,
    currentTitle: row.current_title as string || undefined,
    currentCompany: row.current_company as string || undefined,
    location: row.location as string || undefined,
    tags: row.tags as string[] || undefined,
    source: row.source as string || undefined,
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

function mapPipelineStage(row: Record<string, unknown>): PipelineStage {
  return {
    id: row.id as string,
    companyId: row.company_id as string,
    jobId: row.job_id as string || undefined,
    name: row.name as string,
    stageOrder: row.stage_order as number,
    autoAdvance: row.auto_advance as boolean || false,
    disqualifyOnFail: row.disqualify_on_fail as boolean || false,
    createdAt: new Date(row.created_at as string).toISOString(),
  };
}

function mapApplication(
  row: Record<string, unknown>,
  candidateRow?: Record<string, unknown> | null,
  stageRow?: Record<string, unknown> | null,
): Application {
  return {
    id: row.id as string,
    jobId: row.job_id as string,
    candidateId: row.candidate_id as string,
    source: row.source as string || undefined,
    stageId: row.stage_id as string || undefined,
    status: row.status as ApplicationStatus,
    aiScore: row.ai_score ? Number(row.ai_score) : undefined,
    aiSummary: row.ai_summary as string || undefined,
    resumeUrl: row.resume_url as string || undefined,
    coverLetter: row.cover_letter as string || undefined,
    createdAt: new Date(row.created_at as string).toISOString(),
    updatedAt: new Date(row.updated_at as string).toISOString(),
    candidate: candidateRow ? mapCandidate(candidateRow) : undefined,
    stage: stageRow ? mapPipelineStage(stageRow) : undefined,
  };
}
