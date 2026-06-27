import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const HOLIDAYS_FILE = path.join(DATA_DIR, 'holidays.json');

export interface Holiday {
  id: string;
  name: string;
  date: string;
  country: string;
  recurring: boolean;
  paid: boolean;
  createdAt: string;
}

async function ensureDataDir() {
  try { await fs.access(DATA_DIR); } catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
}

export async function getHolidays(country?: string): Promise<Holiday[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(HOLIDAYS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    let list: Holiday[] = data.holidays || [];
    if (country) list = list.filter((h) => h.country === country);
    return list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch {
    return [];
  }
}

export async function createHoliday(holiday: Omit<Holiday, 'id' | 'createdAt'>): Promise<Holiday> {
  await ensureDataDir();
  const existing = await getHolidays();
  const newHoliday: Holiday = {
    ...holiday,
    id: `hol-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    createdAt: new Date().toISOString(),
  };
  existing.push(newHoliday);
  await fs.writeFile(HOLIDAYS_FILE, JSON.stringify({ holidays: existing }, null, 2), 'utf-8');
  return newHoliday;
}

export async function updateHoliday(id: string, updates: Partial<Holiday>): Promise<Holiday | null> {
  const existing = await getHolidays();
  const idx = existing.findIndex((h) => h.id === id);
  if (idx === -1) return null;
  existing[idx] = { ...existing[idx], ...updates };
  await fs.writeFile(HOLIDAYS_FILE, JSON.stringify({ holidays: existing }, null, 2), 'utf-8');
  return existing[idx];
}

export async function deleteHoliday(id: string): Promise<boolean> {
  const existing = await getHolidays();
  const filtered = existing.filter((h) => h.id !== id);
  if (filtered.length === existing.length) return false;
  await fs.writeFile(HOLIDAYS_FILE, JSON.stringify({ holidays: filtered }, null, 2), 'utf-8');
  return true;
}
