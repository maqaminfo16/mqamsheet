'use client';

import React, { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Card } from './Card';

// -------------------------------------------------------------
// 1. Primitive Skeleton Component
// -------------------------------------------------------------
export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({
  width = '100%',
  height = '1rem',
  borderRadius = 'var(--radius-sm, 8px)',
  className = '',
  style
}: SkeletonProps) {
  const formattedWidth = typeof width === 'number' ? `${width}px` : width;
  const formattedHeight = typeof height === 'number' ? `${height}px` : height;
  const formattedRadius = typeof borderRadius === 'number' ? `${borderRadius}px` : borderRadius;

  return (
    <span
      className={`skeleton ${className}`}
      style={{
        width: formattedWidth,
        height: formattedHeight,
        borderRadius: formattedRadius,
        ...style
      }}
      aria-hidden="true"
    />
  );
}

// -------------------------------------------------------------
// 2. Loading Spinner
// -------------------------------------------------------------
export interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  text?: string;
  className?: string;
  color?: string;
}

export function LoadingSpinner({
  size = 'md',
  text,
  className = '',
  color = 'var(--accent-primary)'
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 18,
    md: 28,
    lg: 42,
    xl: 56
  };

  return (
    <div
      className={`animate-fade-in ${className}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        padding: '24px'
      }}
      role="status"
    >
      <Loader2
        size={sizeMap[size]}
        style={{
          color,
          animation: 'spin 0.8s linear infinite'
        }}
      />
      {text && (
        <span
          style={{
            fontSize: size === 'sm' ? '0.85rem' : '0.95rem',
            color: 'var(--text-secondary)',
            fontWeight: 500
          }}
        >
          {text}
        </span>
      )}
      <span style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
        جاري التحميل...
      </span>
    </div>
  );
}

// -------------------------------------------------------------
// 3. Skeleton Stats Cards (Dashboard)
// -------------------------------------------------------------
export function SkeletonStats({ count = 4 }: { count?: number }) {
  return (
    <div
      className="gap-sm-mobile"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '24px',
        marginBottom: '32px'
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '60%' }}>
              <Skeleton width="70%" height="14px" />
              <Skeleton width="50%" height="36px" borderRadius="6px" />
            </div>
            <Skeleton width="48px" height="48px" borderRadius="var(--radius-md)" />
          </div>
        </Card>
      ))}
    </div>
  );
}

// -------------------------------------------------------------
// 4. Skeleton Sheet Card (Sheets List)
// -------------------------------------------------------------
export function SkeletonSheetCard() {
  return (
    <Card style={{ padding: '20px' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Header line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Skeleton width="50%" height="20px" />
          <Skeleton width="60px" height="24px" borderRadius="12px" />
        </div>

        {/* Sync status line */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Skeleton width="18px" height="18px" borderRadius="50%" />
          <Skeleton width="40%" height="14px" />
        </div>

        {/* 3 mini stats */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            backgroundColor: 'rgba(0,0,0,0.03)',
            padding: '12px',
            borderRadius: 'var(--radius-md)'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <Skeleton width="45px" height="12px" />
            <Skeleton width="30px" height="18px" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <Skeleton width="45px" height="12px" />
            <Skeleton width="30px" height="18px" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <Skeleton width="45px" height="12px" />
            <Skeleton width="30px" height="18px" />
          </div>
        </div>

        {/* Action button */}
        <Skeleton width="100%" height="40px" borderRadius="var(--radius-md)" />
      </div>
    </Card>
  );
}

// -------------------------------------------------------------
// 5. Skeleton Table Rows & Skeleton Table
// -------------------------------------------------------------
export function SkeletonTable({
  rows = 5,
  cols = 6,
  showHeader = true
}: {
  rows?: number;
  cols?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="table-container">
      <table className="table" style={{ width: '100%' }}>
        {showHeader && (
          <thead>
            <tr>
              {Array.from({ length: cols }).map((_, i) => (
                <th key={i}>
                  <Skeleton width={`${Math.max(50, 80 - (i % 3) * 15)}%`} height="16px" />
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {Array.from({ length: rows }).map((_, r) => (
            <tr key={r}>
              {Array.from({ length: cols }).map((_, c) => (
                <td key={c}>
                  <Skeleton
                    width={
                      c === 0 ? '75%' :
                      c === cols - 1 ? '55px' :
                      c === 2 ? '85%' :
                      '65%'
                    }
                    height="16px"
                    borderRadius={c === cols - 1 ? '6px' : '4px'}
                  />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// -------------------------------------------------------------
// 6. Skeleton Form (Settings, Edits, Create)
// -------------------------------------------------------------
export function SkeletonForm({ fields = 4 }: { fields?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Skeleton width="25%" height="16px" />
          <Skeleton width="100%" height="44px" borderRadius="var(--radius-md)" />
        </div>
      ))}
      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
        <Skeleton width="120px" height="42px" borderRadius="var(--radius-md)" />
        <Skeleton width="80px" height="42px" borderRadius="var(--radius-md)" />
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 7. Skeleton Details Page (Header + 2 Cards + Table)
// -------------------------------------------------------------
export function SkeletonDetails() {
  return (
    <div className="gap-sm-mobile animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '40%' }}>
          <Skeleton width="36px" height="36px" borderRadius="var(--radius-md)" />
          <Skeleton width="65%" height="28px" />
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Skeleton width="60px" height="26px" borderRadius="12px" />
          <Skeleton width="90px" height="26px" borderRadius="12px" />
        </div>
      </div>

      {/* 2 Info Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <Card>
          <Skeleton width="40%" height="20px" style={{ marginBottom: '1.5rem' }} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <Skeleton width="80%" height="16px" />
            <Skeleton width="80%" height="16px" />
            <Skeleton width="80%" height="16px" />
            <Skeleton width="80%" height="16px" />
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Skeleton width="80px" height="36px" borderRadius="var(--radius-md)" />
            <Skeleton width="120px" height="36px" borderRadius="var(--radius-md)" />
            <Skeleton width="70px" height="36px" borderRadius="var(--radius-md)" />
          </div>
        </Card>

        <Card>
          <Skeleton width="40%" height="20px" style={{ marginBottom: '1.5rem' }} />
          <Skeleton width="90%" height="16px" style={{ marginBottom: '1.5rem' }} />
          <div style={{ display: 'flex', gap: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.03)', borderRadius: '8px' }}>
            <Skeleton width="22%" height="18px" />
            <Skeleton width="22%" height="18px" />
            <Skeleton width="22%" height="18px" />
            <Skeleton width="22%" height="18px" />
          </div>
        </Card>
      </div>

      {/* Leads Table Card */}
      <div>
        <Skeleton width="120px" height="24px" style={{ marginBottom: '1rem' }} />
        <Card>
          <div className="glass" style={{ padding: '20px' }}>
            <SkeletonTable rows={5} cols={6} />
          </div>
        </Card>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 8. Top Route Transition Progress Bar
// -------------------------------------------------------------
export function TopProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('a');
      if (
        target &&
        target.href &&
        target.target !== '_blank' &&
        !target.href.startsWith('javascript:') &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.shiftKey &&
        !e.altKey
      ) {
        const url = new URL(target.href);
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          setIsNavigating(true);
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);
    return () => {
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  if (!isNavigating) return null;

  return <div className="top-progress-bar" role="progressbar" aria-label="جاري التحميل" />;
}
