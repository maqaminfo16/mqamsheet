import React from 'react';

export interface CardProps {
  title?: React.ReactNode;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function Card({ title, children, actions, className = '', style }: CardProps) {
  return (
    <div className={`glass ${className}`} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', ...style }}>
      {(title || actions) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', flexWrap: 'wrap', borderBottom: '1px solid var(--border)', paddingBottom: '12px', marginBottom: '8px' }}>
          {title && <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600, flex: 1, minWidth: 0 }}>{title}</h3>}
          {actions && <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>{actions}</div>}
        </div>
      )}
      <div style={{ flex: 1 }}>
        {children}
      </div>
    </div>
  );
}
