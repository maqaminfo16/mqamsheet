'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { RefreshCw, Activity } from 'lucide-react';
import Link from 'next/link';

export default function MetaLeadsPage() {
  const [leads, setLeads] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/meta/leads?limit=20');
      if (res.ok) {
        const { data } = await res.json();
        setLeads(data || []);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleRetryFailed = async () => {
    setSyncing(true);
    try {
      const res = await fetch('/api/meta/retry', { method: 'POST' });
      if (res.ok) {
        await fetchLeads();
      }
    } finally {
      setSyncing(false);
    }
  };

  const columns = [
    { key: 'meta_lead_id', header: 'Lead ID' },
    { key: 'form_name', header: 'النموذج', render: (row: Record<string, unknown>) => ((row.meta_form_mappings as Record<string, unknown>)?.form_name as string) || (row.form_id as string) },
    { key: 'status', header: 'الحالة', render: (row: Record<string, unknown>) => {
      const s = row.status;
      if (s === 'synced') return <Badge variant="success">✅ تمت المزامنة</Badge>;
      if (s === 'failed') return <Badge variant="danger">❌ فشل</Badge>;
      if (s === 'waiting_mapping') return <Badge variant="warning">⏳ بانتظار الربط</Badge>;
      return <Badge variant="info">🔄 جار المعالجة</Badge>;
    }},
    { key: 'attempts', header: 'المحاولات' },
    { key: 'last_error', header: 'آخر خطأ', render: (row: Record<string, unknown>) => row.last_error ? <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{row.last_error as string}</span> : '-' },
    { key: 'meta_created_time', header: 'وقت الإنشاء', render: (row: Record<string, unknown>) => new Date(row.meta_created_time as string).toLocaleString('en-GB') }
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Header title="Meta Leads" />

      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <Link href="/meta/mappings" style={{ textDecoration: 'none' }}>
          <Button variant="secondary" icon={<Activity size={18} />}>إدارة نماذج Meta (Mappings)</Button>
        </Link>
        <Button variant="primary" icon={<RefreshCw size={18} />} onClick={handleRetryFailed} loading={syncing}>
          إعادة معالجة الفاشلة
        </Button>
      </div>

      <Card title="آخر العملاء (Meta)">
        <Table columns={columns} data={leads} loading={loading} emptyMessage="لا يوجد عملاء من Meta حالياً" />
      </Card>
    </div>
  );
}
