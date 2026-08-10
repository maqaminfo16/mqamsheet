"use client";
import React from 'react';
import { Menu } from 'lucide-react';

export function MobileMenuButton() {
  return (
    <button 
      className="mobile-menu-btn"
      onClick={() => window.dispatchEvent(new CustomEvent('toggle-sidebar'))}
      style={{ 
        display: 'none', 
        background: 'none', 
        border: 'none', 
        cursor: 'pointer', 
        padding: '4px'
      }}
      aria-label="Toggle Menu"
    >
      <Menu size={24} />
    </button>
  );
}
