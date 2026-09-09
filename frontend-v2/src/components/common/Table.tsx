import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string | number;
  emptyText?: string;
  className?: string;
  onRowClick?: (row: T) => void;
}

export function Table<T>({
  columns,
  data,
  keyExtractor,
  emptyText = 'No data available',
  className,
  onRowClick,
}: TableProps<T>) {
  return (
    <div
      className={twMerge(
        'w-full overflow-x-auto rounded-nlip-sm border border-nlip-border bg-black/20',
        className
      )}
    >
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-nlip-border bg-white/[0.02]">
            {columns.map((col, idx) => (
              <th
                key={idx}
                className={clsx(
                  'px-4 py-3 text-xs font-mono font-medium text-nlip-text-soft uppercase tracking-wider',
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-nlip-border">
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-8 text-center text-sm text-nlip-text-faint font-mono"
              >
                {emptyText}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={keyExtractor(row, rowIdx)}
                onClick={() => onRowClick && onRowClick(row)}
                className={clsx(
                  'transition-colors',
                  onRowClick
                    ? 'cursor-pointer hover:bg-nlip-amber/[0.06]'
                    : 'hover:bg-white/[0.02]'
                )}
              >
                {columns.map((col, colIdx) => (
                  <td
                    key={colIdx}
                    className={clsx('px-4 py-3 text-nlip-text', col.className)}
                  >
                    {col.cell
                      ? col.cell(row, rowIdx)
                      : col.accessorKey
                      ? (row[col.accessorKey] as React.ReactNode)
                      : null}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
