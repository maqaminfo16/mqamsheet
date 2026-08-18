import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'سياسة الخصوصية - مقام',
  description: 'سياسة الخصوصية لبرنامج مقام - نظام استقبال بيانات العملاء',
};

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--bg-primary)' }}>
      {/* Header */}
      <header style={{ 
        padding: '24px 32px', 
        backgroundColor: 'var(--bg-card)', 
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', color: 'var(--accent-primary)', fontWeight: 700 }}>
            مقام
          </h1>
        </div>
        <a href="/" className="btn-secondary" style={{ textDecoration: 'none' }}>
          العودة للرئيسية
        </a>
      </header>

      {/* Content */}
      <main style={{ 
        flex: 1, 
        maxWidth: '800px', 
        margin: '40px auto', 
        padding: '0 24px',
        width: '100%'
      }}>
        <div className="glass" style={{ padding: '40px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ color: 'var(--text-primary)', fontSize: '2.5rem', marginBottom: '8px' }}>سياسة الخصوصية</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>تاريخ آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
          </div>

          <section>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              1. مقدمة
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              نحن في "مقام" نولي أهمية قصوى لخصوصية مستخدمينا. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدامك لخدماتنا ونظام إدارة العملاء.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              2. المعلومات التي نجمعها
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '12px' }}>
              قد نقوم بجمع المعلومات التالية:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingRight: '24px', listStyleType: 'disc' }}>
              <li>المعلومات الشخصية مثل الاسم، البريد الإلكتروني، ورقم الهاتف.</li>
              <li>بيانات العملاء التي تقوم بإدخالها أو استيرادها إلى النظام.</li>
              <li>بيانات الاستخدام ومعلومات الدخول للنظام (سجلات النظام).</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              3. كيف نستخدم المعلومات
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '12px' }}>
              نستخدم المعلومات التي نجمعها للأغراض التالية:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingRight: '24px', listStyleType: 'disc' }}>
              <li>تقديم وصيانة وتحسين خدماتنا.</li>
              <li>تخصيص تجربتك وتلبية احتياجاتك الفردية.</li>
              <li>التواصل معك بخصوص التحديثات والدعم الفني.</li>
              <li>الوفاء بالالتزامات القانونية.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              4. حماية البيانات
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              نحن نتخذ إجراءات أمنية مناسبة لحماية معلوماتك من الوصول غير المصرح به أو التعديل أو الإفصاح أو الإتلاف. بياناتك مخزنة في بيئة آمنة ولا يتم مشاركتها مع أطراف ثالثة إلا وفقاً لما تقتضيه القوانين أو لتقديم خدماتنا.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              5. التغييرات على سياسة الخصوصية
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              نحتفظ بالحق في تحديث سياسة الخصوصية من وقت لآخر. سنقوم بإعلامك بأي تغييرات جوهرية عن طريق نشر السياسة الجديدة على هذه الصفحة أو إرسال إشعار لك.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              6. الاتصال بنا
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              إذا كان لديك أي أسئلة أو استفسارات حول سياسة الخصوصية هذه، يرجى التواصل معنا عبر القنوات الرسمية للدعم الفني.
            </p>
          </section>

        </div>
      </main>

      {/* Footer */}
      <footer style={{ 
        padding: '24px', 
        textAlign: 'center', 
        color: 'var(--text-muted)',
        borderTop: '1px solid var(--border)',
        marginTop: 'auto'
      }}>
        <p>© {new Date().getFullYear()} مقام. جميع الحقوق محفوظة.</p>
      </footer>
    </div>
  );
}
