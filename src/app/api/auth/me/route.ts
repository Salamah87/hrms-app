import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { authenticate, getTokenFromHeader } from '@/lib/auth-middleware';
import type { NextRequest } from 'next/server';

const DATA_DIR = path.join(process.cwd(), 'data');
const EMPLOYEES_FILE = path.join(DATA_DIR, 'employees.json');

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromHeader(request.headers.get('Authorization'));
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = authenticate(token);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const raw = await fs.readFile(EMPLOYEES_FILE, 'utf-8');
    const { employees } = JSON.parse(raw);
    const employee = employees.find((e: { id: string }) => e.id === user.id);

    return NextResponse.json({
      id: user.id,
      companyId: user.companyId,
      email: user.email,
      role: user.role,
      managerId: user.managerId,
      isActive: true,
      employee: employee || null,
    });
  } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}