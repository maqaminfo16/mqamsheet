import React from 'react';

export interface HeaderProps {
  title: React.ReactNode;
  actions?: React.ReactNode;
}

export function Header({ title, actions }: HeaderProps) {
  return (
    <header className="page-header" style={{ padding: '24px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderBottom: '1px solid var(--border)', backgroundColor: 'rgba(248, 250, 252, 0.8)', backdropFilter: 'blur(16px)', position: 'sticky', top: 0, zIndex: 10 }}>
      <h2 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 600, flex: 1, minWidth: '200px' }}>{title}</h2>
      {actions && (
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
          {actions}
        </div>
      )}
    </header>
  );
}
