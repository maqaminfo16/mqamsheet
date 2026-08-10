import React from 'react';
import { Input } from '../ui/Input';
import { Toggle } from '../ui/Toggle';

export interface StepColumnsProps {
  data: any;
  onChange: (data: any) => void;
  errors?: Record<string, string>;
}

export function StepColumns({ data, onChange, errors }: StepColumnsProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>ربط الأعمدة (يجب أن تتطابق مع الشيت)</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <Input
          label="عمود الاسم (مطلوب)"
          value={data.name_column || ''}
          placeholder="مثال: Name"
          onChange={(e) => onChange({ ...data, name_column: e.target.value })}
          error={errors?.name_column}
        />
        
        <Input
          label="عمود رقم الجوال (مطلوب)"
          value={data.phone_column || ''}
          placeholder="مثال: Mobile Number"
          onChange={(e) => onChange({ ...data, phone_column: e.target.value })}
          error={errors?.phone_column}
        />
      </div>

      <Toggle
        label="يوجد عمود اسم ثاني"
        checked={data.has_last_name || false}
        onChange={(checked) => onChange({ ...data, has_last_name: checked })}
      />

      {data.has_last_name && (
        <Input
          label="عمود الاسم الثاني"
          value={data.last_name_column || ''}
          placeholder="مثال: Last Name"
          onChange={(e) => onChange({ ...data, last_name_column: e.target.value })}
          error={errors?.last_name_column}
        />
      )}

      <Input
        label="عمود البريد الإلكتروني (اختياري)"
        value={data.email_column || ''}
        placeholder="مثال: Email"
        onChange={(e) => onChange({ ...data, email_column: e.target.value })}
        error={errors?.email_column}
      />
    </div>
  );
}
