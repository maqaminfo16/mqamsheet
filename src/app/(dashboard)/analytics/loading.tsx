import React from 'react';
import { Skeleton, SkeletonStats, SkeletonChart, SkeletonSourceBreakdown, SkeletonTable } from '@/components/ui/Loading';
import { Card } from '@/components/ui/Card';

export default function AnalyticsLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }} className="animate-fade-in">
      {/* Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Skeleton width="42px" height="42px" borderRadius="12px" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <Skeleton width="220px" height="28px" borderRadius="6px" />
            <Skeleton width="320px" height="14px" borderRadius="4px" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Skeleton width="120px" height="38px" borderRadius="var(--radius-md)" />
          <Skeleton width="90px" height="38px" borderRadius="var(--radius-md)" />
        </div>
      </div>

      {/* Filter Card Skeleton */}
      <Card style={{ padding: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div>
            <Skeleton width="120px" height="16px" style={{ marginBottom: '10px' }} />
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {Array.from({ length: 7 }).map((_, i) => (
                <Skeleton key={i} width="85px" height="34px" borderRadius="var(--radius-md)" />
              ))}
            </div>
          </div>
          <div style={{ height: '1px', background: 'var(--border)' }} />
          <div
            className="flex-col-mobile"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px'
            }}
          >
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <Skeleton width="45%" height="14px" />
                <Skeleton width="100%" height="40px" borderRadius="var(--radius-md)" />
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* KPI Stats Cards Skeleton */}
      <SkeletonStats count={4} />

      {/* Analytics Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        {/* Daily Trend Chart Card */}
        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Skeleton width="160px" height="22px" />
            <Skeleton width="120px" height="16px" />
          </div>
          <SkeletonChart bars={16} />
        </Card>

        {/* Source Breakdown Card */}
        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Skeleton width="170px" height="22px" />
            <Skeleton width="100px" height="20px" borderRadius="10px" />
          </div>
          <SkeletonSourceBreakdown items={4} />
        </Card>
      </div>

      {/* Leads Table Card Skeleton */}
      <Card style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Skeleton width="220px" height="24px" />
              <Skeleton width="280px" height="14px" />
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <Skeleton width="240px" height="38px" borderRadius="var(--radius-md)" />
              <Skeleton width="140px" height="38px" borderRadius="var(--radius-md)" />
            </div>
          </div>
          <div style={{ marginTop: '8px' }}>
            <SkeletonTable rows={6} cols={8} />
          </div>
        </div>
      </Card>
    </div>
  );
}
