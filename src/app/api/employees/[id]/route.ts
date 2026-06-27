import { NextResponse } from 'next/server';
import { getEmployeeById, updateEmployee } from '@/lib/data-store';
import type { NextRequest } from 'next/server';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const employee = await getEmployeeById(id);
  if (!employee) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }
  return NextResponse.json(employee);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const updated = await updateEmployee(id, body);
  if (!updated) {
    return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
  }
  return NextResponse.json(updated);
}
