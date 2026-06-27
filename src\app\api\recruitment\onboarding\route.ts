import { NextResponse } from 'next/server';
import { getTasks, createOnboardingTasks, updateTask } from '@/lib/onboarding-store';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const employeeId = new URL(request.url).searchParams.get('employeeId') || undefined;
  const tasks = await getTasks(employeeId);
  return NextResponse.json(tasks);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.employeeId) {
      return NextResponse.json({ error: 'Missing employeeId' }, { status: 400 });
    }
    const tasks = await createOnboardingTasks(body.employeeId);
    return NextResponse.json(tasks, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.taskId) {
      return NextResponse.json({ error: 'Missing taskId' }, { status: 400 });
    }
    const updated = await updateTask(body.taskId, body.updates);
    if (!updated) return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
