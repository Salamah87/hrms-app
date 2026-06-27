import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/with-auth';
import type { NextRequest } from 'next/server';
import type { AuthUser } from '@/lib/auth-middleware';

async function handleDELETE(request: NextRequest, user: AuthUser) {
  const url = new URL(request.url);
  const id = url.pathname.split('/notifications/')[1]?.split('/')[0];
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const { deleteNotification } = await import('@/lib/notification-store');
  await deleteNotification(id, user.id);
  return NextResponse.json({ success: true });
}

async function handlePATCH(request: NextRequest, user: AuthUser) {
  const url = new URL(request.url);
  const id = url.pathname.split('/notifications/')[1]?.split('/')[0];
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  const body = await request.json();
  const { updateNotification } = await import('@/lib/notification-store');
  const updated = await updateNotification(id, body, user.id);
  return NextResponse.json(updated || { error: 'Not found' }, { status: updated ? 200 : 404 });
}

export const DELETE = withAuth(handleDELETE);
export const PATCH = withAuth(handlePATCH);