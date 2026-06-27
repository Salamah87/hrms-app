import { NextResponse } from 'next/server';
import { getHolidays, createHoliday } from '@/lib/holiday-store';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const country = new URL(request.url).searchParams.get('country') || undefined;
  const holidays = await getHolidays(country);
  return NextResponse.json(holidays);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.name || !body.date) {
      return NextResponse.json({ error: 'Missing required fields: name, date' }, { status: 400 });
    }
    const holiday = await createHoliday({
      name: body.name,
      date: body.date,
      country: body.country || '',
      recurring: body.recurring ?? false,
      paid: body.paid ?? true,
    });
    return NextResponse.json(holiday, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
