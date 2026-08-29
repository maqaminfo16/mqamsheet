import React from 'react';
import { Skeleton, SkeletonStats, SkeletonTable } from '@/components/ui/Loading';
import { Card } from '@/components/ui/Card';

export default function DashboardLoading() {
  return (
    <div className="gap-sm-mobile animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <Skeleton width="180px" height="32px" borderRadius="var(--radius-md)" />
      </div>

      {/* Stats Cards Skeleton */}
      <SkeletonStats count={4} />

      {/* Recent Leads Skeleton */}
      <div style={{ marginTop: '1rem' }}>
        <Skeleton width="160px" height="24px" style={{ marginBottom: '1rem' }} />
        <Card>
          <div className="glass" style={{ padding: '20px' }}>
            <SkeletonTable rows={5} cols={7} />
          </div>
        </Card>
      </div>
    </div>
  );
}
