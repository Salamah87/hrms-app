'use client';

import {
  useState,
  useMemo,
  type ReactNode,
  type TableHTMLAttributes,
  type ThHTMLAttributes,
} from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: any) => ReactNode;
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: ((item: T, index?: number) => string);
  onRowClick?: (item: T) => void;
  sortable?: boolean;
  selectable?: boolean;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
  emptyState?: ReactNode;
  isLoading?: boolean;
  className?: string;
}

export function Table<T extends Record<string, unknown>>({
  columns,
  data,
  keyExtractor,
  onRowClick,
  sortable = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  emptyState,
  isLoading,
  className,
}: TableProps<T>) {
  const [sort, setSort] = useState<SortConfig | null>(null);

  const sortedData = useMemo(() => {
    if (!sort) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      const cmp = String(aVal).localeCompare(String(bVal), undefined, { numeric: true });
      return sort.direction === 'asc' ? cmp : -cmp;
    });
  }, [data, sort]);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key === key) {
        return prev.direction === 'asc' ? { key, direction: 'desc' } : null;
      }
      return { key, direction: 'asc' };
    });
  };

  const toggleSelectAll = () => {
    if (!onSelectionChange) return;
    if (selectedIds.length === data.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(data.map((item) => keyExtractor(item)));
    }
  };

  const toggleSelect = (id: string) => {
    if (!onSelectionChange) return;
    onSelectionChange(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id]
    );
  };

  const SortIcon = ({ columnKey }: { columnKey: string }) => {
    if (sort?.key !== columnKey) return <ChevronsUpDown className="h-4 w-4 text-gray-400" />;
    return sort.direction === 'asc' ? (
      <ChevronUp className="h-4 w-4 text-blue-500" />
    ) : (
      <ChevronDown className="h-4 w-4 text-blue-500" />
    );
  };

  if (isLoading) {
    return (
      <div className={cn('overflow-x-auto rounded-lg border dark:border-gray-800', className)}>
        <table className="w-full">
          <thead>
            <tr className="border-b bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
              {selectable && <th className="w-10 p-3" />}
              {columns.map((col) => (
                <th key={col.key} className="p-3 text-left text-xs font-medium text-gray-500">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="border-b dark:border-gray-800">
                {selectable && <td className="p-3" />}
                {columns.map((col) => (
                  <td key={col.key} className="p-3">
                    <div className="h-4 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!data.length) {
    return emptyState || null;
  }

  return (
    <div className={cn('overflow-x-auto rounded-lg border dark:border-gray-800', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50 dark:border-gray-800 dark:bg-gray-900">
            {selectable && (
              <th className="w-10 p-3">
                <input
                  type="checkbox"
                  checked={selectedIds.length === data.length && data.length > 0}
                  onChange={toggleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
            )}
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  'p-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500',
                  col.sortable && sortable && 'cursor-pointer select-none',
                  col.headerClassName
                )}
                onClick={() => col.sortable && sortable && toggleSort(col.key)}
              >
                <div className="flex items-center gap-1">
                  {col.header}
                  {col.sortable && sortable && <SortIcon columnKey={col.key} />}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y dark:divide-gray-800">
          {sortedData.map((item) => {
            const id = keyExtractor(item);
            return (
              <tr
                key={id}
                className={cn(
                  'transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50',
                  onRowClick && 'cursor-pointer',
                  selectedIds.includes(id) && 'bg-blue-50 dark:bg-blue-900/10'
                )}
                onClick={() => onRowClick?.(item)}
              >
                {selectable && (
                  <td className="p-3">
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(id)}
                      onChange={() => toggleSelect(id)}
                      onClick={(e) => e.stopPropagation()}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td key={col.key} className={cn('p-3 text-sm text-gray-700 dark:text-gray-300', col.className)}>
                    {col.render ? col.render(item) : String(item[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
