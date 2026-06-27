'use client';

import {
  useState,
  useRef,
  useEffect,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';

interface DropdownItem {
  label?: string;
  labelAr?: string;
  icon?: ReactNode;
  onClick?: () => void;
  divider?: boolean;
  disabled?: boolean;
  danger?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
  isRtl?: boolean;
}

export function Dropdown({
  trigger,
  items,
  align = 'left',
  className,
  isRtl = false,
}: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const effectiveAlign = isRtl
    ? (align === 'left' ? 'right' : 'left')
    : align;

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen((p) => !p)}>{trigger}</div>
      {open && (
        <div
          className={cn(
            'absolute top-full z-50 mt-1 min-w-[180px] rounded-lg border bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800',
            effectiveAlign === 'right' ? 'right-0' : 'left-0',
            className
          )}
        >
          {items.map((item, i) =>
            item.divider ? (
              <hr key={i} className="my-1 dark:border-gray-700" />
            ) : (
              <button
                key={i}
                disabled={item.disabled}
                onClick={() => {
                  item.onClick?.();
                  setOpen(false);
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-2 text-sm transition-colors',
                  item.danger
                    ? 'text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700',
                  item.disabled && 'cursor-not-allowed opacity-50'
                )}
              >
                {item.icon && <span className="h-4 w-4">{item.icon}</span>}
                {item.labelAr && isRtl ? item.labelAr : item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
