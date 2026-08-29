import React from 'react';
import { Skeleton, SkeletonSheetCard } from '@/components/ui/Loading';

export default function SheetsLoading() {
  return (
    <div className="gap-sm-mobile animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header and Add Button Skeleton */}
      <div className="flex-col-mobile gap-sm-mobile" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Skeleton width="150px" height="32px" borderRadius="var(--radius-md)" />
        <Skeleton width="140px" height="40px" borderRadius="var(--radius-md)" />
      </div>

      {/* Grid of Sheet Cards Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SkeletonSheetCard key={i} />
        ))}
      </div>
    </div>
  );
}
