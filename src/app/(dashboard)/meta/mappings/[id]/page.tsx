'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Skeleton, SkeletonForm } from '@/components/ui/Loading';
import { StepCRM } from '@/components/SheetForm/StepCRM';

export default function EditMetaMappingPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const { id } = resolvedParams;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [data, setData] = useState<Record<string, unknown>>({
    form_id: '',
    form_name: '',
    source: 'Meta',
    auto_sync: true
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchMapping = async () => {
      try {
        const res = await fetch(`/api/meta/form-mappings/${id}`);
        if (res.ok) {
          const { data: mappingData } = await res.json();
          setData({
            ...mappingData,
            auto_sync: mappingData.is_active
          });
        } else {
          alert('تعذر جلب تفاصيل النموذج.');
          router.push('/meta/mappings');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    fetchMapping();
  }, [id, router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!data.form_id) newErrors.form_id = 'هذا الحقل مطلوب';
    if (!data.form_name) newErrors.form_name = 'هذا الحقل مطلوب';
    
    if (data.project_id) {
      if (!data.lead_type) newErrors.lead_type = 'مطلوب عند اختيار مشروع';
      if (!data.purpose) newErrors.purpose = 'مطلوب عند اختيار مشروع';
    } else if (!data.property_id) {
      newErrors.property_id = 'يجب تحديد معرف مشروع أو معرف عقار';
      newErrors.project_id = 'يجب تحديد معرف مشروع أو معرف عقار';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/meta/form-mappings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          is_active: data.auto_sync !== false
        })
      });

      if (res.ok) {
        router.push('/meta/mappings');
      } else {
        const error = await res.json();
        alert('حدث خطأ: ' + (error.error || 'Unknown error'));
      }
    } catch (e: unknown) {
      const err = e as Error;
      alert('حدث خطأ: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <Skeleton width="200px" height="32px" borderRadius="var(--radius-md)" />
        <div style={{ maxWidth: '800px' }}>
          <Card>
            <div style={{ padding: '12px' }}>
              <SkeletonForm fields={4} />
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <Header title="تعديل نموذج Meta" />

      <div style={{ maxWidth: '800px' }}>
        <Card title="بيانات النموذج (Meta)">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Input
                label="Form ID (مطلوب)"
                value={(data.form_id as string) || ''}
                onChange={(e) => setData({ ...data, form_id: e.target.value })}
                error={errors.form_id}
                hint="معرف النموذج من Meta"
              />
              <Input
                label="اسم النموذج (مطلوب)"
                value={(data.form_name as string) || ''}
                onChange={(e) => setData({ ...data, form_name: e.target.value })}
                error={errors.form_name}
                hint="اسم للتعرف على النموذج داخلياً"
              />
            </div>
            
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.5rem', marginTop: '0.5rem' }}>
              <StepCRM data={data} onChange={setData} errors={errors} />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <Button variant="primary" loading={loading} onClick={handleSave}>
                حفظ التعديلات
              </Button>
              <Button variant="secondary" onClick={() => router.push('/meta/mappings')} disabled={loading}>
                إلغاء
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
