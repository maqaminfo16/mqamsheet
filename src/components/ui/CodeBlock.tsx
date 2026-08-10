"use client";
import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

export interface CodeBlockProps {
  code: string;
  language?: string;
}

export function CodeBlock({ code, language = 'javascript' }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code', err);
    }
  };

  return (
    <div style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border)', backgroundColor: '#000' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px', backgroundColor: 'rgba(255,255,255,0.1)', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>{language}</span>
        <button 
          onClick={handleCopy}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: copied ? 'var(--success)' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem', padding: '4px 8px', borderRadius: '4px', transition: 'all 0.2s' }}
        >
          {copied ? (
            <>
              <Check size={14} />
              <span>تم النسخ</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>نسخ الكود</span>
            </>
          )}
        </button>
      </div>
      <div style={{ padding: '16px', overflowX: 'auto', direction: 'ltr', textAlign: 'left' }}>
        <pre style={{ margin: 0, fontSize: '0.9rem', color: '#e2e8f0', fontFamily: 'monospace', lineHeight: '1.5' }}>
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
}
