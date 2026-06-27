import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { signToken } from '@/lib/auth-utils';
import type { NextRequest } from 'next/server';

const DATA_DIR = path.join(process.cwd(), 'data');
const CREDENTIALS_FILE = path.join(DATA_DIR, 'credentials.json');
const EMPLOYEES_FILE = path.join(DATA_DIR, 'employees.json');

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const credentialsRaw = await fs.readFile(CREDENTIALS_FILE, 'utf-8');
    const { credentials } = JSON.parse(credentialsRaw);

    const credential = credentials.find(
      (c: { email: string }) => c.email === email
    );

    if (!credential) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const passwordHash = crypto
      .createHash('sha256')
      .update(password)
      .digest('hex');

    if (passwordHash !== credential.passwordHash) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const employeesRaw = await fs.readFile(EMPLOYEES_FILE, 'utf-8');
    const { employees } = JSON.parse(employeesRaw);
    const employee = employees.find(
      (e: { id: string }) => e.id === credential.employeeId
    );

    const accessToken = signToken({
      userId: credential.employeeId,
      email: credential.email,
      role: credential.role,
    });

    return NextResponse.json({
      accessToken,
      tokenType: 'Bearer',
      user: {
        id: credential.employeeId,
        email: credential.email,
        role: credential.role,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        employee: employee || null,
      },
    });
  } catch {
    return NextResponse.json(
      { error: 'Invalid email or password' },
      { status: 401 }
    );
  }
}
