import React from 'react';
import { Input } from '../ui/Input';

export interface StepInfoProps {
  data: any;
  onChange: (data: any) => void;
  errors?: Record<string, string>;
}

export function StepInfo({ data, onChange, errors }: StepInfoProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>معلومات الملف الأساسية</h3>
      
      <Input
        label="اسم الملف"
        placeholder="مثال: إعلانات سناب شات - فلل الرياض"
        value={data.name || ''}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        error={errors?.name}
        required
      />
      
      <Input
        label="رابط Google Sheet"
        placeholder="https://docs.google.com/spreadsheets/d/..."
        value={data.sheet_url || ''}
        onChange={(e) => onChange({ ...data, sheet_url: e.target.value })}
        error={errors?.sheet_url}
        hint="انسخ الرابط الكامل للملف من المتصفح"
        required
      />
    </div>
  );
}
