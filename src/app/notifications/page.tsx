'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck, Trash2, Clock, User, CalendarDays, Briefcase, Send, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/ui/empty-state';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Notification } from '@/types';

const typeIcons: Record<string, any> = {
  leave: CalendarDays,
  attendance: Clock,
  employee: User,
  payroll: Briefcase,
  recruitment: User,
  offer: Send,
  system: Bell,
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) setNotifications(await res.json());
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const handleMarkRead = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'PATCH' });
      if (!res.ok) throw new Error();
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
    } catch { toast.error('Failed to update'); }
  };

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read-all' }),
      });
      if (!res.ok) throw new Error();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('All marked as read');
    } catch { toast.error('Failed to mark all as read'); }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/notifications/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    } catch { toast.error('Failed to delete'); }
  };

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{unreadCount} unread notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4" /> Mark All Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <Card>
          <CardContent className="py-16">
            <EmptyState icon={Bell} title="No notifications" description="You'll see notifications here when something requires your attention" />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-1">
          {notifications.map((n) => {
            const Icon = typeIcons[n.type] || Bell;
            return (
              <div
                key={n.id}
                className={cn(
                  'flex items-start gap-4 rounded-lg border px-5 py-4 transition-colors dark:border-gray-700',
                  n.isRead ? 'bg-white dark:bg-gray-900' : 'bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                )}
              >
                <div className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-xl',
                  n.isRead ? 'bg-gray-100 text-gray-400 dark:bg-gray-800' : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className={cn('text-sm', n.isRead ? 'text-gray-700 dark:text-gray-300' : 'font-semibold text-gray-900 dark:text-white')}>
                        {n.title}
                      </p>
                      {n.body && <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">{n.body}</p>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!n.isRead && (
                        <Button variant="ghost" size="sm" onClick={() => handleMarkRead(n.id)} title="Mark as read">
                          <CheckCheck className="h-4 w-4 text-gray-400" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(n.id)} title="Delete">
                        <Trash2 className="h-4 w-4 text-gray-400" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-1 flex items-center gap-3">
                    <span className="text-xs text-gray-400">{formatDate(n.createdAt)}</span>
                    {n.link && (
                      <Link href={n.link} className="text-xs text-blue-600 hover:underline dark:text-blue-400">View details</Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
