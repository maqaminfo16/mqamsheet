import React from 'react';

export interface HeaderProps {
  title: string;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  return (
    <header style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 10 }}>
      <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600 }}>{title}</h2>
      {actions && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {actions}
        </div>
      )}
    </header>
  );
}
