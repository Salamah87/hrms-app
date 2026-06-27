import { NextResponse } from 'next/server';
import { getAllEmployees, updateEmployee } from '@/lib/data-store';
import { withAuth, forbidden } from '@/lib/with-auth';
import { buildScope, filterEmployeesByScope, canAccessEmployee } from '@/lib/scope-query';
import type { NextRequest } from 'next/server';
import type { AuthUser } from '@/lib/auth-middleware';

async function handleGET(request: NextRequest, user: AuthUser) {
  const allEmployees = await getAllEmployees();
  const scoped = await filterEmployeesByScope(user, allEmployees);
  return NextResponse.json(scoped);
}

async function handlePUT(request: NextRequest, user: AuthUser) {
  const body = await request.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: 'Missing employee id' }, { status: 400 });

  const scope = await buildScope(user);
  if (!canAccessEmployee(user, id, scope)) return forbidden();

  const updated = await updateEmployee(id, updates);
  if (!updated) return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  return NextResponse.json(updated);
}

export const GET = withAuth(handleGET);
export const PUT = withAuth(handlePUT);