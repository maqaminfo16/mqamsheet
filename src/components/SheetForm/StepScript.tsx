import React from 'react';
import { CodeBlock } from '../ui/CodeBlock';
import { AlertCircle } from 'lucide-react';

export interface StepScriptProps {
  script: string;
}

export function StepScript({ script }: StepScriptProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>كود Apps Script الجاهز</h3>
      
      <div style={{ display: 'flex', gap: '12px', padding: '16px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)' }}>
        <AlertCircle style={{ color: 'var(--info)', flexShrink: 0 }} />
        <div>
          <h4 style={{ margin: 0, marginBottom: '8px', fontSize: '1rem' }}>تعليمات التثبيت:</h4>
          <ol style={{ margin: 0, paddingRight: '20px', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.9rem' }}>
            <li>افتح ملف Google Sheet الخاص بك.</li>
            <li>اذهب إلى: <strong>الإضافات (Extensions)</strong> ← <strong>Apps Script</strong>.</li>
            <li>احذف أي كود موجود والصق الكود الموجود بالأسفل بالكامل.</li>
            <li>اضغط على أيقونة الحفظ 💾 (أو Ctrl+S).</li>
            <li>من القائمة المنسدلة في الأعلى (بجانب زر تشغيل)، اختر الدالة <strong>setupTrigger</strong> واضغط تشغيل ▶️.</li>
            <li>وافق على الأذونات المطلوبة من جوجل.</li>
          </ol>
        </div>
      </div>

      <CodeBlock code={script} />
    </div>
  );
}
