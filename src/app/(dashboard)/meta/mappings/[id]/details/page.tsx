'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowRight } from 'lucide-react';

export default function MetaMappingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  const [fetching, setFetching] = useState(true);
  const [mapping, setMapping] = useState<Record<string, unknown> | null>(null);
  const [leads, setLeads] = useState<Record<string, unknown>[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch Mapping details
        const mappingRes = await fetch(`/api/meta/form-mappings/${id}`);
        if (!mappingRes.ok) {
          alert('النموذج غير موجود.');
          router.push('/meta/mappings');
          return;
        }
        const { data: mappingData } = await mappingRes.json();
        setMapping(mappingData);

        // Fetch Leads for this form_id
        if (mappingData && mappingData.form_id) {
          const leadsRes = await fetch(`/api/meta/leads?form_id=${mappingData.form_id}&limit=100`);
          if (leadsRes.ok) {
            const { data: leadsData } = await leadsRes.json();
            setLeads(leadsData || []);
          }
        }

      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchData();
  }, [id, router]);

  const leadColumns = [
    { key: 'meta_lead_id', header: 'Lead ID' },
    { key: 'full_name', header: 'اسم العميل', render: (row: Record<string, unknown>) => (row.lead_data as any)?.full_name || (row.raw_payload as any)?.entry?.[0]?.changes?.[0]?.value?.full_name || '-' },
    { key: 'status', header: 'الحالة', render: (row: Record<string, unknown>) => {
      const s = row.status;
      if (s === 'synced') return <Badge variant="success">✅ تمت المزامنة</Badge>;
      if (s === 'failed') return <Badge variant="danger">❌ فشل</Badge>;
      if (s === 'waiting_mapping') return <Badge variant="warning">⏳ بانتظار الربط</Badge>;
      return <Badge variant="info">🔄 جار المعالجة</Badge>;
    }},
    { key: 'meta_created_time', header: 'وقت الإنشاء', render: (row: Record<string, unknown>) => new Date(row.meta_created_time as string).toLocaleString('en-GB') },
    { key: 'last_error', header: 'توضيح', render: (row: Record<string, unknown>) => row.last_error ? <span style={{ color: 'var(--danger)', fontSize: '0.8rem' }}>{row.last_error as string}</span> : '-' }
  ];

  if (fetching) {
    return <div style={{ padding: '2rem' }}>جاري التحميل...</div>;
  }

  if (!mapping) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Button variant="secondary" icon={<ArrowRight size={18} />} onClick={() => router.push('/meta/mappings')}>رجوع</Button>
        <Header title={`تفاصيل النموذج: ${mapping.form_name}`} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <Card title="معلومات النموذج الأساسية">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <div><strong>Form ID:</strong> {mapping.form_id as string}</div>
            <div><strong>الاسم:</strong> {mapping.form_name as string}</div>
            <div><strong>المصدر:</strong> {mapping.source as string}</div>
            <div><strong>الحالة:</strong> <Badge variant={mapping.is_active ? 'success' : 'danger'}>{mapping.is_active ? 'نشط' : 'متوقف'}</Badge></div>
          </div>
        </Card>

        <Card title="إعدادات Nuzul CRM">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
            <div><strong>Project ID:</strong> {mapping.project_id ? (mapping.project_id as string) : '-'}</div>
            <div><strong>Property ID:</strong> {mapping.property_id ? (mapping.property_id as string) : '-'}</div>
            <div><strong>نوع العميل:</strong> {mapping.lead_type ? (mapping.lead_type as string) : '-'}</div>
            <div><strong>الغرض:</strong> {mapping.purpose ? (mapping.purpose as string) : '-'}</div>
          </div>
        </Card>
      </div>

      <Card title={`العملاء (Leads) الواردة عبر هذا النموذج (${leads.length})`}>
        <div style={{ marginTop: '1rem' }}>
          <Table columns={leadColumns} data={leads} emptyMessage="لم يتم استلام أي عملاء عبر هذا النموذج بعد" />
        </div>
      </Card>
    </div>
  );
}
