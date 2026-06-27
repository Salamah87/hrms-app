import { NextResponse } from 'next/server';
import { getAllEmployees, updateEmployee } from '@/lib/data-store';
import type { NextRequest } from 'next/server';

export async function GET() {
  const employees = await getAllEmployees();
  return NextResponse.json(employees);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing employee id' }, { status: 400 });
    }
    const updated = await updateEmployee(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}
