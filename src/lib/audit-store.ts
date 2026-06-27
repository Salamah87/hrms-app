import { promises as fs } from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const AUDIT_FILE = path.join(DATA_DIR, 'audit-log.json');

interface AuditEntry {
  id: string;
  timestamp: string;
  userId: string;
  email: string;
  action: string;
  resource: string;
  resourceId: string | null;
  success: boolean;
  ip: string;
  details?: string;
}

export async function logAudit(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void> {
  try {
    const log: AuditEntry = {
      id: 'audit-' + Date.now() + '-' + Math.random().toString(36).slice(2, 8),
      timestamp: new Date().toISOString(),
      ...entry,
    };
    let entries: AuditEntry[] = [];
    try {
      const raw = await fs.readFile(AUDIT_FILE, 'utf-8');
      entries = JSON.parse(raw);
    } catch {
      entries = [];
    }
    entries.push(log);
    if (entries.length > 1000) entries = entries.slice(-1000);
    await fs.writeFile(AUDIT_FILE, JSON.stringify(entries, null, 2), 'utf-8');
  } catch {
    // silently fail
  }
}