import { NextResponse } from 'next/server';
import { getAllEmployees } from '@/lib/data-store';
import { withAuth, forbidden, notFound } from '@/lib/with-auth';
import { buildScope, canAccessEmployee } from '@/lib/scope-query';
import type { NextRequest } from 'next/server';
import type { AuthUser } from '@/lib/auth-middleware';

async function handleGET(request: NextRequest, user: AuthUser) {
  const id = request.url.split('/employees/')[1]?.split('/')[0]?.split('?')[0];
  if (!id) return NextResponse.json({ error: 'Missing employee id' }, { status: 400 });

  const scope = await buildScope(user);
  if (!canAccessEmployee(user, id, scope)) return notFound();

  const employees = await getAllEmployees();
  const employee = employees.find((e: { id: string }) => e.id === id);
  if (!employee) return notFound();
  return NextResponse.json(employee);
}

async function handlePUT(request: NextRequest, user: AuthUser) {
  const id = request.url.split('/employees/')[1]?.split('/')[0]?.split('?')[0];
  if (!id) return NextResponse.json({ error: 'Missing employee id' }, { status: 400 });

  const scope = await buildScope(user);
  if (!canAccessEmployee(user, id, scope)) return forbidden();

  const body = await request.json();
  const { updateEmployee } = await import('@/lib/data-store');
  const updated = await updateEmployee(id, body);
  if (!updated) return notFound();
  return NextResponse.json(updated);
}

export const GET = withAuth(handleGET);
export const PUT = withAuth(handlePUT);