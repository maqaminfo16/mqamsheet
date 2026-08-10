import React from 'react';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Toggle } from '../ui/Toggle';
import { TagInput } from '../ui/TagInput';

// Define fallbacks inline since we are purely dealing with components
const PROPERTY_TYPES = [
  { value: 'villa', label: 'فيلا' },
  { value: 'duplex', label: 'دوبلكس' },
  { value: 'mansion', label: 'قصر' },
  { value: 'townhouse', label: 'تاون هاوس' },
  { value: 'tower_apartment', label: 'شقة برج' },
  { value: 'building_apartment', label: 'شقة عمارة' },
  { value: 'villa_apartment', label: 'شقة فيلا' },
  { value: 'tower_studio', label: 'استوديو برج' },
  { value: 'building_studio', label: 'استوديو عمارة' },
  { value: 'tower', label: 'برج' },
  { value: 'floor', label: 'طابق' },
  { value: 'building', label: 'عمارة' },
  { value: 'compound', label: 'مجمع سكني' },
  { value: 'land', label: 'أرض' },
  { value: 'farm', label: 'مزرعة' },
  { value: 'istraha', label: 'استراحة' },
  { value: 'resort', label: 'منتجع' },
  { value: 'hotel', label: 'فندق' },
  { value: 'room', label: 'غرفة' },
  { value: 'office', label: 'مكتب' },
  { value: 'store', label: 'محل' },
  { value: 'showroom', label: 'معرض' },
  { value: 'storage', label: 'مستودع' },
  { value: 'factory', label: 'مصنع' },
  { value: 'workshop', label: 'ورشة' },
  { value: 'parking', label: 'موقف' },
  { value: 'kiosk', label: 'كشك' },
  { value: 'station', label: 'محطة' },
  { value: 'school', label: 'مدرسة' },
  { value: 'hospital', label: 'مستشفى' },
  { value: 'cinema', label: 'سينما' },
  { value: 'atm', label: 'صراف آلي' },
];

const PURPOSES = [
  { value: 'buy', label: 'شراء' },
  { value: 'rent', label: 'إيجار' },
];

export interface StepCRMProps {
  data: any;
  onChange: (data: any) => void;
  errors?: Record<string, string>;
}

export function StepCRM({ data, onChange, errors }: StepCRMProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>إعدادات Maqam CRM</h3>
      
      <div className="input-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>الملاحظة (اختياري)</label>
        <textarea
          className="input"
          style={{ minHeight: '80px', resize: 'vertical' }}
          value={data.note || ''}
          onChange={(e) => onChange({ ...data, note: e.target.value })}
          placeholder="ملاحظة ثابتة ترسل مع كل عميل"
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Input
          label="المصدر (اختياري)"
          placeholder="مثال: snapchat"
          value={data.source || ''}
          onChange={(e) => onChange({ ...data, source: e.target.value })}
        />
        
        <Input
          type="number"
          label="معرف المشروع (اختياري)"
          value={data.project_id || ''}
          onChange={(e) => onChange({ ...data, project_id: e.target.value ? Number(e.target.value) : '' })}
          error={errors?.project_id}
        />
      </div>

      {data.project_id && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '16px', backgroundColor: 'rgba(0,0,0,0.03)', borderRadius: 'var(--radius-md)' }}>
          <Select
            label="نوع العقار (مطلوب)"
            options={PROPERTY_TYPES}
            value={data.lead_type || ''}
            onChange={(e) => onChange({ ...data, lead_type: e.target.value })}
            error={errors?.lead_type}
            placeholder="اختر نوع العقار..."
          />
          <Select
            label="الغرض (مطلوب)"
            options={PURPOSES}
            value={data.purpose || ''}
            onChange={(e) => onChange({ ...data, purpose: e.target.value })}
            error={errors?.purpose}
            placeholder="اختر الغرض..."
          />
          <Input
            label="معرف نموذج المشروع (اختياري)"
            value={data.project_model_id || ''}
            onChange={(e) => onChange({ ...data, project_model_id: e.target.value })}
          />
        </div>
      )}

      <Input
        type="number"
        label="معرف العقار (اختياري)"
        value={data.property_id || ''}
        onChange={(e) => onChange({ ...data, property_id: e.target.value ? Number(e.target.value) : '' })}
        error={errors?.property_id}
        hint="إذا لم تدخل معرف مشروع، يجب إدخال معرف العقار."
      />

      <TagInput
        label="الأوسمة (Tag IDs)"
        values={data.tag_ids || []}
        onChange={(values) => onChange({ ...data, tag_ids: values })}
      />

      <div style={{ marginTop: '12px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
        <Toggle
          label="المزامنة التلقائية"
          description="إرسال البيانات فوراً إلى Maqam CRM عند وصولها"
          checked={data.auto_sync !== false}
          onChange={(checked) => onChange({ ...data, auto_sync: checked })}
        />
      </div>
    </div>
  );
}
