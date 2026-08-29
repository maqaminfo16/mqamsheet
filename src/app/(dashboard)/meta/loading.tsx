import React from 'react';
import { Skeleton, SkeletonTable } from '@/components/ui/Loading';
import { Card } from '@/components/ui/Card';

export default function MetaLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      {/* Header Skeleton */}
      <Skeleton width="160px" height="32px" borderRadius="var(--radius-md)" />

      {/* Action Buttons Skeleton */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Skeleton width="220px" height="40px" borderRadius="var(--radius-md)" />
        <Skeleton width="160px" height="40px" borderRadius="var(--radius-md)" />
      </div>

      {/* Table Card Skeleton */}
      <Card title={<Skeleton width="180px" height="22px" />}>
        <div style={{ marginTop: '0.5rem' }}>
          <SkeletonTable rows={6} cols={6} />
        </div>
      </Card>
    </div>
  );
}
