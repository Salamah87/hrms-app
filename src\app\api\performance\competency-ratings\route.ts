import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import type { NextRequest } from 'next/server';
import type { CompetencyRating } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'competency-ratings.json');

async function readRatings(): Promise<CompetencyRating[]> {
  try { return JSON.parse(await fs.readFile(FILE, 'utf-8')); }
  catch { return []; }
}

async function writeRatings(data: CompetencyRating[]) {
  await fs.writeFile(FILE, JSON.stringify(data, null, 2), 'utf-8');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const reviewId = searchParams.get('reviewId');
  const ratings = await readRatings();
  if (reviewId) return NextResponse.json(ratings.filter(r => r.reviewId === reviewId));
  return NextResponse.json(ratings);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.reviewId || !body.competencyId || body.rating == null) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const ratings = await readRatings();
    const existing = ratings.findIndex(r => r.reviewId === body.reviewId && r.competencyId === body.competencyId);
    const rating: CompetencyRating = {
      id: `cr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      reviewId: body.reviewId,
      competencyId: body.competencyId,
      rating: body.rating,
      comment: body.comment,
    };
    if (existing >= 0) {
      ratings[existing] = { ...ratings[existing], rating: body.rating, comment: body.comment };
    } else {
      ratings.push(rating);
    }
    await writeRatings(ratings);
    return NextResponse.json(rating, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}
