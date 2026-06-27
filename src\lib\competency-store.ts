import { promises as fs } from 'fs';
import path from 'path';
import type { Competency } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const FILE = path.join(DATA_DIR, 'competencies.json');

const DEFAULT_COMPETENCIES: Competency[] = [
  { id: 'comp-1', name: 'Teamwork', description: 'Collaborates effectively with team members', category: 'Behavioural', isActive: true, createdAt: new Date().toISOString() },
  { id: 'comp-2', name: 'Communication', description: 'Communicates clearly and effectively', category: 'Behavioural', isActive: true, createdAt: new Date().toISOString() },
  { id: 'comp-3', name: 'Leadership', description: 'Leads and inspires others', category: 'Leadership', isActive: true, createdAt: new Date().toISOString() },
  { id: 'comp-4', name: 'Problem Solving', description: 'Analyses and resolves complex problems', category: 'Cognitive', isActive: true, createdAt: new Date().toISOString() },
  { id: 'comp-5', name: 'Adaptability', description: 'Adapts to changing circumstances', category: 'Behavioural', isActive: true, createdAt: new Date().toISOString() },
  { id: 'comp-6', name: 'Technical Skills', description: 'Applies technical knowledge effectively', category: 'Technical', isActive: true, createdAt: new Date().toISOString() },
  { id: 'comp-7', name: 'Initiative', description: 'Takes proactive action without waiting', category: 'Behavioural', isActive: true, createdAt: new Date().toISOString() },
  { id: 'comp-8', name: 'Customer Focus', description: 'Puts customer needs first', category: 'Behavioural', isActive: true, createdAt: new Date().toISOString() },
  { id: 'comp-9', name: 'Quality of Work', description: 'Delivers high-quality output consistently', category: 'Performance', isActive: true, createdAt: new Date().toISOString() },
  { id: 'comp-10', name: 'Time Management', description: 'Manages time and priorities effectively', category: 'Performance', isActive: true, createdAt: new Date().toISOString() },
];

async function ensureDir() {
  try { await fs.access(DATA_DIR); }
  catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
}

export async function getCompetencies(): Promise<Competency[]> {
  await ensureDir();
  try {
    const raw = await fs.readFile(FILE, 'utf-8');
    return JSON.parse(raw);
  } catch {
    await fs.writeFile(FILE, JSON.stringify(DEFAULT_COMPETENCIES, null, 2), 'utf-8');
    return DEFAULT_COMPETENCIES;
  }
}

export async function updateCompetencies(competencies: Competency[]): Promise<Competency[]> {
  await ensureDir();
  await fs.writeFile(FILE, JSON.stringify(competencies, null, 2), 'utf-8');
  return competencies;
}
