'use client';

import { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Table } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import Link from 'next/link';

export default function MetaMappingsPage() {
  const [mappings, setMappings] = useState<Record<string, unknown>[]>([]);
  // loading state omitted since it's unused or not necessary for simple display


  const fetchMappings = async () => {
    try {
      const res = await fetch('/api/meta/form-mappings');
      if (res.ok) {
        const { data } = await res.json();
        setMappings(data || []);
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    fetchMappings();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('هل أنت متأكد من رغبتك في حذف هذا النموذج؟ لا يمكن التراجع عن هذا الإجراء.')) return;
    
    try {
      const res = await fetch(`/api/meta/form-mappings/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setMappings(prev => prev.filter(m => m.id !== id));
      } else {
        const error = await res.json();
        alert('حدث خطأ أثناء الحذف: ' + (error.error || 'Unknown error'));
      }
    } catch (e: unknown) {
      const err = e as Error;
      alert('حدث خطأ: ' + err.message);
    }
  };

  const columns = [
    { key: 'form_id', header: 'Form ID' },
    { key: 'form_name', header: 'اسم النموذج' },
    { key: 'project_id', header: 'Project ID', render: (row: Record<string, unknown>) => (row.project_id as string) || '-' },
    { key: 'property_id', header: 'Property ID', render: (row: Record<string, unknown>) => (row.property_id as string) || '-' },
    { key: 'is_active', header: 'الحالة', render: (row: Record<string, unknown>) => (
      <Badge variant={row.is_active ? 'success' : 'danger'}>
        {row.is_active ? 'نشط' : 'متوقف'}
      </Badge>
    )},
    { key: 'actions', header: 'إجراءات', render: (row: Record<string, unknown>) => (
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link href={`/meta/mappings/${row.id}/details`} style={{ textDecoration: 'none' }}>
          <Button variant="secondary" icon={<Eye size={16} />}>تفاصيل</Button>
        </Link>
        <Link href={`/meta/mappings/${row.id}`} style={{ textDecoration: 'none' }}>
          <Button variant="secondary" icon={<Edit size={16} />}>تعديل</Button>
        </Link>
        <Button variant="danger" icon={<Trash2 size={16} />} onClick={() => handleDelete(row.id as string)}>
          حذف
        </Button>
      </div>
    )}
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Header title="نماذج Meta (Mappings)" />

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <p style={{ color: 'var(--text-secondary)' }}>
          اربط Form ID الخاص بـ Meta مع إعدادات Nuzul CRM.
        </p>
        <Link href="/meta/mappings/new" style={{ textDecoration: 'none' }}>
          <Button variant="primary" icon={<Plus size={18} />}>إضافة ربط جديد</Button>
        </Link>
      </div>

      <Card>
        <Table columns={columns} data={mappings} emptyMessage="لا يوجد نماذج مربوطة" />
      </Card>
    </div>
  );
}
