'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  ChevronLeft,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { cn, getDir } from '@/lib/utils';
import { NAV_ITEMS, type NavItem } from '@/lib/constants';
import { useAuth } from '@/hooks/use-auth';
import { Avatar } from '@/components/ui/avatar';
import { useLocalStorage } from '@/hooks/use-local-storage';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [hovered, setHovered] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>(() =>
    NAV_ITEMS.filter((n) => n.children?.some((c) => pathname === c.href || pathname.startsWith(c.href + '/'))).map((n) => n.label)
  );
  const [isDark, setIsDark] = useLocalStorage('theme', 'light');
  const [isRtl, setIsRtl] = useLocalStorage('rtl', false);

  const toggleSubmenu = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((i) => i !== label)
        : [...prev, label]
    );
  };

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

  const isItemActive = (item: NavItem) => {
    if (isActive(item.href)) return true;
    if (item.children) return item.children.some((c) => isActive(c.href));
    return false;
  };

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      document.documentElement.classList.toggle('dark', next === 'dark');
      return next;
    });
  };

  const toggleRtl = () => {
    setIsRtl((prev) => {
      const next = !prev;
      const nextLocale = next ? 'ar' : 'en';
      document.documentElement.dir = next ? 'rtl' : 'ltr';
      document.documentElement.lang = nextLocale;
      document.cookie = `NEXT_LOCALE=${nextLocale};path=/;max-age=31536000`;
      return next;
    });
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={cn(
          'fixed top-0 left-0 z-50 flex h-full flex-col border-r bg-white transition-all duration-300 dark:bg-gray-900 dark:border-gray-800',
          isOpen ? 'w-64 translate-x-0' : hovered ? 'w-64' : 'w-16',
          '-translate-x-full',
          'lg:translate-x-0 lg:static lg:z-auto'
        )}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <div className={cn('flex h-16 items-center border-b dark:border-gray-800', isOpen || hovered ? 'gap-2.5 px-6' : 'justify-center px-0')}>
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 text-white">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          {(isOpen || hovered) && <span className="text-lg font-bold text-gray-900 dark:text-white">PulseHR</span>}
        </div>

        <nav className="flex-1 overflow-y-auto p-2 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = isItemActive(item);
            return (
              <div key={item.href}>
                {item.children ? (
                  <>
                    <button
                      onClick={() => (isOpen || hovered) && toggleSubmenu(item.label)}
                      title={!(isOpen || hovered) ? (isRtl ? item.labelAr : item.label) : undefined}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                        !(isOpen || hovered) ? 'justify-center' : '',
                        active
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {(isOpen || hovered) && (
                        <>
                          <span className="flex-1 text-left">
                            {isRtl ? item.labelAr : item.label}
                          </span>
                          {isRtl ? (
                            <ChevronLeft
                              className={cn(
                                'h-4 w-4 transition-transform',
                                expandedItems.includes(item.label) && '-rotate-90'
                              )}
                            />
                          ) : (
                            <ChevronDown
                              className={cn(
                                'h-4 w-4 transition-transform',
                                expandedItems.includes(item.label) && 'rotate-180'
                              )}
                            />
                          )}
                        </>
                      )}
                    </button>
                    {(isOpen || hovered) && expandedItems.includes(item.label) && (
                      <div className="ml-4 mt-1 space-y-1 border-l pl-3 dark:border-gray-700">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            onClick={onClose}
                            className={cn(
                              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                              isActive(child.href)
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                : 'text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                            )}
                          >
                            <child.icon className="h-4 w-4 flex-shrink-0" />
                            {isRtl ? child.labelAr : child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href={item.href}
                    onClick={onClose}
                    title={!(isOpen || hovered) ? (isRtl ? item.labelAr : item.label) : undefined}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      !(isOpen || hovered) ? 'justify-center' : '',
                      active
                        ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    {(isOpen || hovered) && (isRtl ? item.labelAr : item.label)}
                  </Link>
                )}
              </div>
            );
          })}
        </nav>

        <div className="border-t p-2 dark:border-gray-800 space-y-2">
          {(isOpen || hovered) && (
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <Avatar
                src={user?.employee?.avatar}
                name={user?.employee?.fullName || user?.email || ''}
                size="sm"
              />
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                  {user?.employee?.fullName || user?.email}
                </p>
                <p className="truncate text-xs text-gray-500 dark:text-gray-400 capitalize">
                  {user?.role?.replace(/_/g, ' ')}
                </p>
              </div>
            </div>
          )}

          <div className={cn('flex items-center gap-2', !(isOpen || hovered) && 'flex-col')}>
            <button
              onClick={toggleTheme}
              className={cn(
                'flex items-center justify-center rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
                isOpen || hovered ? 'flex-1 gap-2' : 'w-full'
              )}
              title={!(isOpen || hovered) ? (isDark === 'dark' ? 'Light mode' : 'Dark mode') : undefined}
            >
              {isDark === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              {(isOpen || hovered) && (isDark === 'dark' ? 'Light' : 'Dark')}
            </button>
            <button
              onClick={toggleRtl}
              className={cn(
                'flex items-center justify-center rounded-lg px-3 py-2 text-xs text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800',
                isOpen || hovered ? 'flex-1 gap-2' : 'w-full'
              )}
              title={!(isOpen || hovered) ? (isRtl ? 'English' : 'العربية') : undefined}
            >
              {isRtl ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              {(isOpen || hovered) && (isRtl ? 'EN' : 'AR')}
            </button>
          </div>

          <button
            onClick={logout}
            className={cn(
              'flex w-full items-center rounded-lg px-3 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20',
              isOpen || hovered ? 'gap-3' : 'justify-center'
            )}
            title={!(isOpen || hovered) ? 'Sign Out' : undefined}
          >
            <LogOut className="h-5 w-5 flex-shrink-0" />
            {(isOpen || hovered) && 'Sign Out'}
          </button>
        </div>
      </aside>
    </>
  );
}
