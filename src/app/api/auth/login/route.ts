import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { signToken, generateRefreshToken } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit-store';
import type { NextRequest } from 'next/server';

const DATA_DIR = path.join(process.cwd(), 'data');
const CREDENTIALS_FILE = path.join(DATA_DIR, 'credentials.json');
const EMPLOYEES_FILE = path.join(DATA_DIR, 'employees.json');
const RATE_LIMIT_FILE = path.join(DATA_DIR, 'rate-limits.json');

const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

// In-memory rate limit store (falls back when filesystem is read-only)
const rateLimitStore: Record<string, { attempts: number; lastAttempt: number }> = {};
let rateLimitStoreLoaded = false;

async function ensureRateStore(): Promise<void> {
  if (rateLimitStoreLoaded) return;
  try {
    const raw = await fs.readFile(RATE_LIMIT_FILE, 'utf-8');
    const fileLimits = JSON.parse(raw);
    for (const [email, data] of Object.entries(fileLimits)) {
      rateLimitStore[email] = { attempts: data.attempts, lastAttempt: new Date(data.lastAttempt).getTime() };
    }
  } catch {}
  rateLimitStoreLoaded = true;
}

async function persistRateStore(): Promise<void> {
  try {
    const obj: Record<string, { attempts: number; lastAttempt: string }> = {};
    for (const [email, data] of Object.entries(rateLimitStore)) {
      obj[email] = { attempts: data.attempts, lastAttempt: new Date(data.lastAttempt).toISOString() };
    }
    await fs.writeFile(RATE_LIMIT_FILE, JSON.stringify(obj, null, 2), 'utf-8');
  } catch {
    // read-only filesystem - in-memory only is fine
  }
}

async function checkRateLimit(email: string): Promise<{ allowed: boolean; remaining: number }> {
  await ensureRateStore();
  const entry = rateLimitStore[email];
  const now = Date.now();

  if (entry) {
    const elapsed = (now - entry.lastAttempt) / 60000;
    if (elapsed > LOCKOUT_MINUTES) {
      entry.attempts = 0;
    }
    if (entry.attempts >= MAX_ATTEMPTS) {
      return { allowed: false, remaining: 0 };
    }
  }

  return { allowed: true, remaining: MAX_ATTEMPTS - (entry?.attempts || 0) };
}

async function recordAttempt(email: string, success: boolean): Promise<void> {
  await ensureRateStore();
  if (success) {
    delete rateLimitStore[email];
  } else {
    const entry = rateLimitStore[email] || { attempts: 0, lastAttempt: 0 };
    entry.attempts += 1;
    entry.lastAttempt = Date.now();
    rateLimitStore[email] = entry;
  }
  await persistRateStore();
}

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const { allowed } = await checkRateLimit(email);
    if (!allowed) {
      await logAudit({ userId: 'unknown', email, action: 'LOGIN_LOCKED', resource: 'auth', resourceId: null, success: false, ip: request.headers.get('x-forwarded-for') || 'unknown' });
      return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 });
    }

    const credentialsRaw = await fs.readFile(CREDENTIALS_FILE, 'utf-8');
    const { credentials } = JSON.parse(credentialsRaw);
    const credential = credentials.find((c: { email: string }) => c.email === email);

    if (!credential) {
      await recordAttempt(email, false);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const passwordHash = crypto.createHash('sha256').update(password).digest('hex');
    if (passwordHash !== credential.passwordHash) {
      await recordAttempt(email, false);
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    await recordAttempt(email, true);

    const employeesRaw = await fs.readFile(EMPLOYEES_FILE, 'utf-8');
    const { employees } = JSON.parse(employeesRaw);
    const employee = employees.find((e: { id: string }) => e.id === credential.employeeId);

    const accessToken = signToken({
      sub: credential.employeeId,
      companyId: 'company-1',
      role: credential.role,
      managerId: employee?.managerId || null,
      email: credential.email,
    });

    const refreshToken = await generateRefreshToken(credential.employeeId);

    await logAudit({ userId: credential.employeeId, email: credential.email, action: 'LOGIN_SUCCESS', resource: 'auth', resourceId: null, success: true, ip: request.headers.get('x-forwarded-for') || 'unknown' });

    return NextResponse.json({
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      user: {
        id: credential.employeeId,
        companyId: 'company-1',
        email: credential.email,
        role: credential.role,
        managerId: employee?.managerId || null,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        employee: employee || null,
      },
    });
  } catch (err) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }
}