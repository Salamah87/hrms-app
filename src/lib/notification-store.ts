import { promises as fs } from 'fs';
import path from 'path';
import type { Notification } from '@/types';
import { isDbAvailable, pgGetCollection, pgSetCollection } from '@/lib/pg-store';

const DATA_DIR = path.join(process.cwd(), 'data');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

async function ensureDataDir() {
  try { await fs.access(DATA_DIR); } catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
}

export async function getNotifications(employeeId?: string): Promise<Notification[]> {
  let list: Notification[];
  if (await isDbAvailable()) {
    const data = await pgGetCollection<{ notifications: Notification[] }>('notifications');
    list = data.notifications || [];
  } else {
    await ensureDataDir();
    try {
      const raw = await fs.readFile(NOTIFICATIONS_FILE, 'utf-8');
      const data = JSON.parse(raw);
      list = data.notifications || [];
    } catch { return []; }
  }
  if (employeeId) list = list.filter((n) => n.employeeId === employeeId);
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function createNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
  const existing = await getNotifications();
  const newNotif: Notification = { ...notif, id: 
otif--, isRead: false, createdAt: new Date().toISOString() };
  existing.push(newNotif);
  if (await isDbAvailable()) { await pgSetCollection('notifications', { notifications: existing }); }
  else { await ensureDataDir(); await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify({ notifications: existing }, null, 2), 'utf-8'); }
  return newNotif;
}

export async function markAsRead(id: string, ownerId?: string): Promise<Notification | null> {
  const existing = await getNotifications();
  const idx = existing.findIndex((n) => n.id === id && (!ownerId || n.employeeId === ownerId));
  if (idx === -1) return null;
  existing[idx].isRead = true;
  if (await isDbAvailable()) { await pgSetCollection('notifications', { notifications: existing }); }
  else { await ensureDataDir(); await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify({ notifications: existing }, null, 2), 'utf-8'); }
  return existing[idx];
}

export async function markAllAsRead(employeeId?: string): Promise<void> {
  const existing = await getNotifications();
  for (const n of existing) { if (!employeeId || n.employeeId === employeeId) n.isRead = true; }
  if (await isDbAvailable()) { await pgSetCollection('notifications', { notifications: existing }); }
  else { await ensureDataDir(); await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify({ notifications: existing }, null, 2), 'utf-8'); }
}

export async function deleteNotification(id: string, ownerId?: string): Promise<boolean> {
  const existing = await getNotifications();
  const filtered = existing.filter((n) => n.id !== id && (!ownerId || n.employeeId !== ownerId));
  if (ownerId) {
    const target = existing.find((n) => n.id === id);
    if (!target || (ownerId && target.employeeId !== ownerId)) return false;
  }
  const result = existing.filter((n) => n.id !== id);
  if (result.length === existing.length) return false;
  if (await isDbAvailable()) { await pgSetCollection('notifications', { notifications: result }); }
  else { await ensureDataDir(); await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify({ notifications: result }, null, 2), 'utf-8'); }
  return true;
}

export async function updateNotification(id: string, updates: Partial<Notification>, ownerId?: string): Promise<Notification | null> {
  const existing = await getNotifications();
  const idx = existing.findIndex((n) => n.id === id && (!ownerId || n.employeeId === ownerId));
  if (idx === -1) return null;
  existing[idx] = { ...existing[idx], ...updates };
  if (await isDbAvailable()) { await pgSetCollection('notifications', { notifications: existing }); }
  else { await ensureDataDir(); await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify({ notifications: existing }, null, 2), 'utf-8'); }
  return existing[idx];
}