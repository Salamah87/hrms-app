import { promises as fs } from 'fs';
import path from 'path';
import type { Notification } from '@/types';

const DATA_DIR = path.join(process.cwd(), 'data');
const NOTIFICATIONS_FILE = path.join(DATA_DIR, 'notifications.json');

async function ensureDataDir() {
  try { await fs.access(DATA_DIR); } catch { await fs.mkdir(DATA_DIR, { recursive: true }); }
}

export async function getNotifications(employeeId?: string): Promise<Notification[]> {
  await ensureDataDir();
  try {
    const raw = await fs.readFile(NOTIFICATIONS_FILE, 'utf-8');
    const data = JSON.parse(raw);
    let list = data.notifications || [];
    if (employeeId) list = list.filter((n: Notification) => n.employeeId === employeeId);
    return list.sort((a: Notification, b: Notification) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  } catch {
    return [];
  }
}

export async function createNotification(notif: Omit<Notification, 'id' | 'createdAt' | 'isRead'>): Promise<Notification> {
  await ensureDataDir();
  const existing = await getNotifications();
  const newNotif: Notification = {
    ...notif,
    id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    isRead: false,
    createdAt: new Date().toISOString(),
  };
  existing.push(newNotif);
  await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify({ notifications: existing }, null, 2), 'utf-8');
  return newNotif;
}

export async function markAsRead(id: string): Promise<Notification | null> {
  const existing = await getNotifications();
  const idx = existing.findIndex((n) => n.id === id);
  if (idx === -1) return null;
  existing[idx].isRead = true;
  await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify({ notifications: existing }, null, 2), 'utf-8');
  return existing[idx];
}

export async function markAllAsRead(employeeId?: string): Promise<void> {
  const existing = await getNotifications();
  for (const n of existing) {
    if (!employeeId || n.employeeId === employeeId) n.isRead = true;
  }
  await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify({ notifications: existing }, null, 2), 'utf-8');
}

export async function deleteNotification(id: string): Promise<boolean> {
  const existing = await getNotifications();
  const filtered = existing.filter((n) => n.id !== id);
  if (filtered.length === existing.length) return false;
  await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify({ notifications: filtered }, null, 2), 'utf-8');
  return true;
}
