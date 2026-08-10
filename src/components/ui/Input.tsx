import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, icon, className = '', ...props }, ref) => {
    return (
      <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {label && <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{label}</label>}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          {icon && <span style={{ position: 'absolute', right: '12px', color: 'var(--text-muted)' }}>{icon}</span>}
          <input
            ref={ref}
            className={`input ${error ? 'input-error' : ''} ${className}`}
            style={{ paddingRight: icon ? '40px' : '16px', ...props.style }}
            {...props}
          />
        </div>
        {error && <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{error}</span>}
        {hint && !error && <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{hint}</span>}
      </div>
    );
  }
);
Input.displayName = 'Input';
