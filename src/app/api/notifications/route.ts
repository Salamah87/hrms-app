import { NextResponse } from 'next/server';
import { getNotifications, createNotification, markAllAsRead } from '@/lib/notification-store';
import { withAuth, forbidden } from '@/lib/with-auth';
import { buildScope, canAccessEmployee } from '@/lib/scope-query';
import type { NextRequest } from 'next/server';
import type { AuthUser } from '@/lib/auth-middleware';

async function handleGET(request: NextRequest, user: AuthUser) {
  const url = new URL(request.url);
  const employeeId = url.searchParams.get('employeeId') || user.id;
  const scope = await buildScope(user);
  if (!canAccessEmployee(user, employeeId, scope)) return forbidden();

  const notifications = await getNotifications(employeeId);
  // Filter to only the employee's own notifications
  if (scope.allAccess) return NextResponse.json(notifications);
  return NextResponse.json(notifications.filter((n: any) => n.employeeId === employeeId));
}

async function handlePOST(request: NextRequest, user: AuthUser) {
  const body = await request.json();
  if (body.action === 'read-all') {
    const scope = await buildScope(user);
    if (!canAccessEmployee(user, body.employeeId, scope)) return forbidden();
    await markAllAsRead(body.employeeId);
    return NextResponse.json({ success: true });
  }
  if (!body.employeeId || !body.title) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const scope = await buildScope(user);
  if (!canAccessEmployee(user, body.employeeId, scope)) return forbidden();
  const notif = await createNotification(body);
  return NextResponse.json(notif, { status: 201 });
}

export const GET = withAuth(handleGET);
export const POST = withAuth(handlePOST);