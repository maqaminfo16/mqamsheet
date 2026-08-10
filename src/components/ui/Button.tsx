import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  loading = false, 
  icon, 
  children, 
  disabled,
  className = '',
  ...props 
}: ButtonProps) {
  const baseClasses = 'btn';
  const variantClass = `btn-${variant}`;
  const sizeClass = `btn-${size}`;
  const loadingClass = loading ? 'btn-loading' : '';

  const classes = [baseClasses, variantClass, sizeClass, loadingClass, className].filter(Boolean).join(' ');

  return (
    <button 
      className={classes} 
      disabled={disabled || loading}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        opacity: (disabled || loading) ? 0.7 : 1,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer'
      }}
      {...props}
    >
      {loading && <Loader2 className="spinner" size={18} style={{ animation: 'spin 1s linear infinite' }} />}
      {!loading && icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
