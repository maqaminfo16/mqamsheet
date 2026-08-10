import React from 'react';

export interface BadgeProps {
  variant?: 'success' | 'warning' | 'danger' | 'info';
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = 'info', children, className = '' }: BadgeProps) {
  const colors = {
    success: { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--success)', border: 'rgba(16, 185, 129, 0.2)' },
    warning: { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--warning)', border: 'rgba(245, 158, 11, 0.2)' },
    danger: { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', border: 'rgba(239, 68, 68, 0.2)' },
    info: { bg: 'rgba(59, 130, 246, 0.1)', color: 'var(--info)', border: 'rgba(59, 130, 246, 0.2)' }
  };

  const style = colors[variant];

  return (
    <span 
      className={`badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        borderRadius: '999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        whiteSpace: 'nowrap'
      }}
    >
      {children}
    </span>
  );
}
