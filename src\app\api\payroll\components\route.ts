import { NextResponse } from 'next/server';
import { getAllComponents, updateComponent, createComponent } from '@/lib/data-store';
import type { NextRequest } from 'next/server';

export async function GET() {
  const components = await getAllComponents();
  return NextResponse.json(components);
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) {
      return NextResponse.json({ error: 'Missing component id' }, { status: 400 });
    }
    const updated = await updateComponent(id, updates);
    if (!updated) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const component = await request.json();
    if (!component.name) {
      return NextResponse.json({ error: 'Component name is required' }, { status: 400 });
    }
    const created = await createComponent({ ...component, id: `comp-${Date.now()}` });
    return NextResponse.json(created, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
}