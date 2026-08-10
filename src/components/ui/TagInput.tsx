"use client";
import React from 'react';
import { X, Plus } from 'lucide-react';

export interface TagInputProps {
  label: string;
  values: number[];
  onChange: (values: number[]) => void;
}

export function TagInput({ label, values, onChange }: TagInputProps) {
  const handleAdd = () => {
    onChange([...values, 0]);
  };

  const handleRemove = (index: number) => {
    const newValues = [...values];
    newValues.splice(index, 1);
    onChange(newValues);
  };

  const handleChange = (index: number, value: string) => {
    const numValue = parseInt(value, 10);
    const newValues = [...values];
    newValues[index] = isNaN(numValue) ? 0 : numValue;
    onChange(newValues);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>{label}</label>
      
      {values.map((val, index) => (
        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="number"
            value={val || ''}
            onChange={(e) => handleChange(index, e.target.value)}
            className="input"
            style={{ flex: 1 }}
            placeholder="أدخل رقم الوسم..."
          />
          <button
            type="button"
            onClick={() => handleRemove(index)}
            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', cursor: 'pointer', padding: '8px', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            title="حذف الوسم"
          >
            <X size={18} />
          </button>
        </div>
      ))}
      
      <button
        type="button"
        onClick={handleAdd}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'rgba(255,255,255,0.05)', border: '1px dashed var(--border)', color: 'var(--text-secondary)', cursor: 'pointer', padding: '10px', borderRadius: 'var(--radius-md)', transition: 'all 0.2s', marginTop: '4px' }}
        onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--border-focus)'}
        onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--border)'}
      >
        <Plus size={16} />
        <span>إضافة وسم</span>
      </button>
    </div>
  );
}
