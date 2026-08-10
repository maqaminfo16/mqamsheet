"use client";
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, FileSpreadsheet, Settings, LogOut } from 'lucide-react';

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'الرئيسية', icon: <Home size={20} /> },
    { href: '/sheets', label: 'ملفات الشيت', icon: <FileSpreadsheet size={20} /> },
    { href: '/settings', label: 'الإعدادات', icon: <Settings size={20} /> },
  ];

  return (
    <aside className="glass" style={{ width: '260px', height: '100vh', position: 'sticky', top: 0, display: 'flex', flexDirection: 'column', borderRadius: 0, borderRight: 'none', borderLeft: '1px solid var(--border)' }}>
      <div style={{ padding: '24px', borderBottom: '1px solid var(--border)' }}>
        <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Maqam
        </h1>
      </div>
      
      <nav style={{ flex: 1, padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {links.map(link => {
          const isActive = pathname === link.href || (link.href !== '/' && pathname?.startsWith(link.href));
          return (
            <Link 
              key={link.href} 
              href={link.href}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: 'var(--radius-md)',
                color: isActive ? 'white' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                textDecoration: 'none', transition: 'all 0.2s', fontWeight: isActive ? 600 : 500
              }}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ padding: '24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
            AD
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontWeight: 600 }}>Admin</span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>مدير النظام</span>
          </div>
        </div>
        
        <form action="/api/auth/logout" method="POST">
          <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', padding: '8px 0', fontWeight: 500 }}>
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
        </form>
      </div>
    </aside>
  );
}
