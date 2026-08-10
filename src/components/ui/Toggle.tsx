"use client";
import React from 'react';

export interface ToggleProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  description?: string;
}

export function Toggle({ label, checked, onChange, description }: ToggleProps) {
  return (
    <label style={{ display: 'flex', alignItems: 'flex-start', cursor: 'pointer', gap: '12px' }}>
      <div style={{ position: 'relative', width: '44px', height: '24px', flexShrink: 0, marginTop: '2px' }}>
        <input 
          type="checkbox" 
          checked={checked} 
          onChange={e => onChange(e.target.checked)}
          style={{ opacity: 0, width: 0, height: 0, position: 'absolute' }}
        />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: checked ? 'var(--accent-primary)' : '#94A3B8',
          borderRadius: '999px',
          transition: 'background-color 0.3s',
          boxShadow: checked ? 'none' : 'inset 0 1px 3px rgba(0,0,0,0.1)'
        }}></div>
        <div style={{
          position: 'absolute', top: '2px', left: checked ? '2px' : '22px',
          width: '20px', height: '20px',
          backgroundColor: 'white',
          borderRadius: '50%',
          transition: 'left 0.3s',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}></div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{label}</span>
        {description && <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>{description}</span>}
      </div>
    </label>
  );
}
