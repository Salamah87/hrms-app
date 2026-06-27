import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  },
  locale = 'en'
): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString(locale === 'ar' ? 'ar-LY' : 'en-US', options);
}

export function formatCurrency(
  amount: number | null | undefined,
  currency = 'LYD',
  locale = 'en'
): string {
  if (amount == null) return '—';
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-LY' : 'en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatNumber(
  num: number | null | undefined,
  options: Intl.NumberFormatOptions = {},
  locale = 'en'
): string {
  if (num == null) return '—';
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-LY' : 'en-US', options).format(num);
}

export function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function truncate(str: string | null | undefined, length = 50): string {
  if (!str) return '';
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + '…';
}

export function classMerge(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export function getDir(locale: string): 'rtl' | 'ltr' {
  return locale === 'ar' ? 'rtl' : 'ltr';
}

export function isRtlLocale(locale: string): boolean {
  return locale === 'ar';
}
