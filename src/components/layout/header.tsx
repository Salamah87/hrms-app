'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  Menu, Search, Bell, ChevronDown, Settings, User, LogOut, Globe, X, CheckCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/use-auth';
import { Avatar } from '@/components/ui/avatar';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface HeaderProps {
  onMenuToggle: () => void;
}

interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export function Header({ onMenuToggle }: HeaderProps) {
  const { user, logout } = useAuth();
  const [isRtl, setIsRtl] = useLocalStorage('rtl', false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
    document.documentElement.lang = isRtl ? 'ar' : 'en';
  }, [isRtl]);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications?limit=5');
      if (res.ok) setNotifications((await res.json()).slice(0, 5));
    } catch { /* ignore */ }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const toggleLang = () => {
    setIsRtl((prev) => {
      const next = !prev;
      document.documentElement.dir = next ? 'rtl' : 'ltr';
      document.documentElement.lang = next ? 'ar' : 'en';
      document.cookie = `NEXT_LOCALE=${next ? 'ar' : 'en'};path=/;max-age=31536000`;
      return next;
    });
  };

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'read-all' }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch { /* ignore */ }
  };

  return (
    <header dir={isRtl ? 'rtl' : 'ltr'} className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-white px-4 dark:border-gray-800 dark:bg-gray-900 lg:px-6">
      <button onClick={onMenuToggle} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden dark:hover:bg-gray-800">
        <Menu className="h-5 w-5" />
      </button>

      <div className={cn(
        'hidden md:flex flex-1 max-w-md items-center gap-2 rounded-lg border bg-gray-50 px-3 py-2 dark:border-gray-700 dark:bg-gray-800',
        searchOpen && 'border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800'
      )}>
        <Search className="h-4 w-4 text-gray-400" />
        <input type="text" placeholder={isRtl ? 'بحث...' : 'Search...'} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchOpen(true)} onBlur={() => setSearchOpen(false)}
          className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400 dark:text-gray-200" />
      </div>

      <button onClick={() => setSearchOpen(!searchOpen)} className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 md:hidden dark:hover:bg-gray-800">
        {searchOpen ? <X className="h-5 w-5" onClick={() => setSearchQuery('')} /> : <Search className="h-5 w-5" />}
      </button>

      <div className={cn('flex items-center gap-2', isRtl ? 'mr-auto' : 'ml-auto')}>
        <button onClick={toggleLang} className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800">
          <Globe className="h-4 w-4" />{isRtl ? 'EN' : 'AR'}
        </button>

        <div className="relative" ref={notifRef}>
          <button onClick={() => setNotifOpen((p) => !p)} className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className={cn('absolute -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white', isRtl ? '-left-0.5' : '-right-0.5')}>
                {unreadCount}
              </span>
            )}
          </button>
          {notifOpen && (
            <div className={cn('absolute top-full mt-2 w-80 rounded-lg border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800', isRtl ? 'left-0' : 'right-0')}>
              <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-700">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{isRtl ? 'الإشعارات' : 'Notifications'}</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline dark:text-blue-400">
                    <CheckCheck className={cn('h-3.5 w-3.5 inline', isRtl ? 'ml-1' : 'mr-1')} />{isRtl ? 'تعيين الكل مقروء' : 'Mark all read'}
                  </button>
                )}
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-gray-400">{isRtl ? 'لا توجد إشعارات' : 'No notifications'}</div>
                ) : (
                  notifications.map((n) => (
                    <Link key={n.id} href={n.link || '/notifications'} onClick={() => setNotifOpen(false)}
                      className={cn('flex items-start gap-3 border-b px-4 py-3 last:border-0 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/50', !n.isRead && 'bg-blue-50/50 dark:bg-blue-900/10')}>
                      <div className={cn('mt-1 h-2 w-2 flex-shrink-0 rounded-full', n.isRead ? 'bg-gray-300' : 'bg-blue-500')} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{n.title}</p>
                        {n.body && <p className="mt-0.5 text-xs text-gray-400 truncate">{n.body}</p>}
                        <p className="mt-0.5 text-[10px] text-gray-400">
                          {n.createdAt ? new Date(n.createdAt).toLocaleDateString(isRtl ? 'ar-LY' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                        </p>
                      </div>
                    </Link>
                  ))
                )}
              </div>
              <div className="border-t px-4 py-2 dark:border-gray-700">
                <Link href="/notifications" onClick={() => setNotifOpen(false)} className="block text-center text-xs font-medium text-blue-600 hover:underline dark:text-blue-400">
                  {isRtl ? 'عرض كل الإشعارات' : 'View all notifications'}
                </Link>
              </div>
            </div>
          )}
        </div>

        <div className="relative" ref={profileRef}>
          <button onClick={() => setProfileOpen((p) => !p)} className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Avatar src={user?.employee?.avatar} name={user?.employee?.fullName || user?.email || ''} size="sm" />
            <ChevronDown className="hidden h-4 w-4 text-gray-500 sm:block" />
          </button>
          {profileOpen && (
            <div className={cn('absolute top-full mt-2 w-48 rounded-lg border bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800', isRtl ? 'left-0' : 'right-0')}>
              <div className="border-b px-4 py-3 dark:border-gray-700">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.employee?.fullName || user?.email}</p>
                <p className="text-xs text-gray-500 capitalize">{user?.role?.replace(/_/g, ' ')}</p>
              </div>
              <div className="py-1">
                <Link href={`/employees/${user?.employeeId || ''}`} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                  <User className="h-4 w-4" /> {isRtl ? 'الملف الشخصي' : 'Profile'}
                </Link>
                <Link href="/settings" className="flex w-full items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                  <Settings className="h-4 w-4" /> {isRtl ? 'الإعدادات' : 'Settings'}
                </Link>
                <hr className="my-1 dark:border-gray-700" />
                <button onClick={logout} className="flex w-full items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                  <LogOut className="h-4 w-4" /> {isRtl ? 'تسجيل الخروج' : 'Sign Out'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
