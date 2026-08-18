import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'شروط الخدمة - مقام',
  description: 'شروط الخدمة والاستخدام لبرنامج مقام - نظام استقبال بيانات العملاء',
};

export default function TermsOfServicePage() {
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
            <h1 style={{ color: 'var(--text-primary)', fontSize: '2.5rem', marginBottom: '8px' }}>شروط الخدمة</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>تاريخ آخر تحديث: {new Date().toLocaleDateString('ar-EG')}</p>
          </div>

          <section>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              1. قبول الشروط
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              بمجرد دخولك واستخدامك لنظام "مقام"، فإنك توافق على الالتزام بشروط الخدمة هذه. إذا كنت لا توافق على أي جزء من هذه الشروط، يرجى عدم استخدام النظام.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              2. وصف الخدمة
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              "مقام" هو نظام مصمم لاستقبال وإدارة بيانات العملاء، ويوفر أدوات لتنظيم البيانات وتحليلها. نحتفظ بالحق في تعديل أو إيقاف أي جزء من الخدمة في أي وقت دون إشعار مسبق.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              3. حساب المستخدم
            </h2>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingRight: '24px', listStyleType: 'disc' }}>
              <li>أنت مسؤول عن الحفاظ على سرية معلومات حسابك وكلمة المرور الخاصة بك.</li>
              <li>أنت توافق على إبلاغنا فوراً بأي استخدام غير مصرح به لحسابك.</li>
              <li>لا نتحمل أي مسؤولية عن أي خسارة أو ضرر ناتج عن عدم امتثالك لهذا الالتزام الأمني.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              4. الاستخدام المقبول
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '12px' }}>
              أنت توافق على عدم استخدام النظام في أي مما يلي:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingRight: '24px', listStyleType: 'disc' }}>
              <li>أي نشاط غير قانوني أو ينتهك حقوق الآخرين.</li>
              <li>نقل أي برامج ضارة أو فيروسات أو أي رمز ذو طبيعة مدمرة.</li>
              <li>محاولة الحصول على وصول غير مصرح به إلى أنظمتنا أو شبكاتنا.</li>
              <li>استخدام النظام بطريقة قد تؤدي إلى تعطيل أو إثقال خوادمنا.</li>
            </ul>
          </section>

          <section>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              5. إخلاء المسؤولية
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              يتم توفير النظام "كما هو" و "كما هو متاح". لا نقدم أي ضمانات، صريحة أو ضمنية، بشأن تشغيل الخدمة أو دقة وموثوقية المعلومات التي يوفرها النظام. أنت تتحمل المسؤولية الكاملة عن استخدامك للنظام.
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              6. التعديلات على شروط الخدمة
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              نحتفظ بالحق في تعديل هذه الشروط في أي وقت. استمرارك في استخدام النظام بعد نشر التعديلات يشكل قبولاً منك للشروط الجديدة.
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
