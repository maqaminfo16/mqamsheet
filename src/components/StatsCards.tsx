import React from 'react';
import { Card } from './ui/Card';
import { SkeletonStats } from './ui/Loading';

export interface Stat {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  change?: string;
}

export interface StatsCardsProps {
  stats: Stat[];
  loading?: boolean;
}

export function StatsCards({ stats, loading = false }: StatsCardsProps) {
  if (loading) {
    return <SkeletonStats count={stats.length || 4} />;
  }

  return (
    <div className="gap-sm-mobile" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px', marginBottom: '32px' }}>
      {stats.map((stat, i) => (
        <Card key={i} style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{stat.title}</span>
              <span style={{ fontSize: '2rem', fontWeight: 700 }}>{stat.value}</span>
              {stat.change && (
                <span style={{ fontSize: '0.85rem', color: stat.change.includes('+') ? 'var(--success)' : 'var(--danger)' }}>
                  {stat.change}
                </span>
              )}
            </div>
            <div style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)', backgroundColor: `${stat.color}20`, color: stat.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {stat.icon}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
