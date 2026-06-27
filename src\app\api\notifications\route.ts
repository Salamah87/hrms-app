import { NextResponse } from 'next/server';
import { getNotifications, createNotification, markAllAsRead } from '@/lib/notification-store';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const employeeId = new URL(request.url).searchParams.get('employeeId') || undefined;
  const notifications = await getNotifications(employeeId);
  return NextResponse.json(notifications);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (body.action === 'read-all') {
      await markAllAsRead(body.employeeId);
      return NextResponse.json({ success: true });
    }
    if (!body.employeeId || !body.title) {
      return NextResponse.json({ error: 'Missing required fields: employeeId, title' }, { status: 400 });
    }
    const notif = await createNotification(body);
    return NextResponse.json(notif, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
