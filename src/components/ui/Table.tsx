import React from 'react';
import { Skeleton } from './Loading';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  hideOnMobile?: boolean;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  emptyMessage?: string;
  className?: string;
  loading?: boolean;
  loadingRows?: number;
}

export function Table<T extends Record<string, any>>({
  columns,
  data,
  emptyMessage = 'لا توجد بيانات',
  className = '',
  loading = false,
  loadingRows = 5
}: TableProps<T>) {
  return (
    <div className="table-container">
      <table className={`table ${className}`}>
        <thead>
          <tr>
            {columns.map(col => (
              <th key={col.key} className={col.hideOnMobile ? 'hide-on-mobile' : ''}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            Array.from({ length: loadingRows }).map((_, r) => (
              <tr key={`loading-row-${r}`}>
                {columns.map((col, c) => (
                  <td key={`loading-cell-${c}`} className={col.hideOnMobile ? 'hide-on-mobile' : ''}>
                    <Skeleton
                      width={
                        c === 0 ? '70%' :
                        c === columns.length - 1 ? '60px' :
                        c === 1 ? '80%' :
                        '60%'
                      }
                      height="18px"
                      borderRadius={c === columns.length - 1 ? '6px' : '4px'}
                    />
                  </td>
                ))}
              </tr>
            ))
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={row.id || i}>
                {columns.map(col => (
                  <td key={col.key} className={col.hideOnMobile ? 'hide-on-mobile' : ''}>
                    {col.render ? col.render(row) : row[col.key]}
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
