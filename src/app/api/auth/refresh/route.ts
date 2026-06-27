import { NextResponse } from 'next/server';
import { rotateRefreshToken } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit-store';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { refreshToken } = await request.json();
    if (!refreshToken) {
      return NextResponse.json({ error: 'Refresh token required' }, { status: 400 });
    }

    const result = await rotateRefreshToken(refreshToken);
    if (!result) {
      return NextResponse.json({ error: 'Invalid or expired refresh token' }, { status: 401 });
    }

    return NextResponse.json({
      accessToken: result.accessToken,
      refreshToken: result.refreshToken,
      tokenType: 'Bearer',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}