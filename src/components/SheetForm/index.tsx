"use client";
import React, { useState } from 'react';
import { Stepper } from '../ui/Stepper';
import { Button } from '../ui/Button';
import { StepInfo } from './StepInfo';
import { StepColumns } from './StepColumns';
import { StepCRM } from './StepCRM';
import { StepScript } from './StepScript';
import { ChevronRight, ChevronLeft, Save } from 'lucide-react';

export interface SheetFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<any>;
  onFinish?: () => void;
}

export function SheetForm({ initialData = { auto_sync: true }, onSubmit, onFinish }: SheetFormProps) {
  const [step, setStep] = useState(0);
  const [data, setData] = useState<any>(initialData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [script, setScript] = useState<string>('');

  const steps = ['معلومات الملف', 'ربط الأعمدة', 'إعدادات CRM', 'تثبيت الكود'];

  const validateStep = () => {
    const newErrors: Record<string, string> = {};
    if (step === 0) {
      if (!data.name) newErrors.name = 'هذا الحقل مطلوب';
      if (!data.sheet_url) newErrors.sheet_url = 'هذا الحقل مطلوب';
    } else if (step === 1) {
      if (!data.name_column) newErrors.name_column = 'هذا الحقل مطلوب';
      if (!data.phone_column) newErrors.phone_column = 'هذا الحقل مطلوب';
    } else if (step === 2) {
      if (data.project_id) {
        if (!data.lead_type) newErrors.lead_type = 'مطلوب عند اختيار مشروع';
        if (!data.purpose) newErrors.purpose = 'مطلوب عند اختيار مشروع';
      } else if (!data.property_id) {
        newErrors.property_id = 'يجب تحديد معرف مشروع أو معرف عقار';
        newErrors.project_id = 'يجب تحديد معرف مشروع أو معرف عقار';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;
    
    if (step === 2) {
      setLoading(true);
      try {
        const result = await onSubmit(data);
        if (result && result.script) {
          setScript(result.script);
          setStep(3);
        } else {
          if (onFinish) onFinish();
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setStep(s => s + 1);
    }
  };

  const handlePrev = () => {
    setStep(s => Math.max(0, s - 1));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <Stepper steps={steps} currentStep={step} />
      
      <div className="glass" style={{ padding: '32px', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
        <div style={{ flex: 1 }}>
          {step === 0 && <StepInfo data={data} onChange={setData} errors={errors} />}
          {step === 1 && <StepColumns data={data} onChange={setData} errors={errors} />}
          {step === 2 && <StepCRM data={data} onChange={setData} errors={errors} />}
          {step === 3 && <StepScript script={script} />}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border)' }}>
          {step > 0 && step < 3 ? (
            <Button variant="secondary" icon={<ChevronRight size={18} />} onClick={handlePrev}>
              السابق
            </Button>
          ) : <div></div>}
          
          {step < 2 ? (
            <Button variant="primary" onClick={handleNext}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                التالي <ChevronLeft size={18} />
              </span>
            </Button>
          ) : step === 2 ? (
            <Button variant="primary" loading={loading} onClick={handleNext} icon={<Save size={18} />}>
              حفظ وتوليد الكود
            </Button>
          ) : (
            <Button variant="primary" onClick={() => onFinish && onFinish()}>
              إنهاء
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
