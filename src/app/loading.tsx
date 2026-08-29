import React from 'react';
import { LoadingSpinner } from '@/components/ui/Loading';

export default function RootLoading() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--bg-primary)'
      }}
    >
      <LoadingSpinner size="lg" text="جاري تحميل الصفحة..." />
    </div>
  );
}
