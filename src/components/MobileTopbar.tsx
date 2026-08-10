import React from 'react';
import { MobileMenuButton } from './MobileMenuButton';

export function MobileTopbar() {
  return (
    <div className="mobile-topbar" style={{ 
      display: 'none', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '12px 20px', 
      backgroundColor: 'var(--bg-card)', 
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Maqam
      </h1>
      <MobileMenuButton />
    </div>
  );
}
