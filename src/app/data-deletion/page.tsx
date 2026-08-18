import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'تعليمات حذف البيانات - مقام',
  description: 'إرشادات وتعليمات حذف البيانات الشخصية من نظام مقام',
};

export default function DataDeletionPage() {
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
            <h1 style={{ color: 'var(--text-primary)', fontSize: '2.5rem', marginBottom: '8px' }}>تعليمات حذف البيانات</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>كيفية طلب حذف بياناتك الشخصية من نظامنا</p>
          </div>

          <section>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              1. حقوق البيانات الخاصة بك
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8' }}>
              نحن نحترم حقك في الخصوصية والتحكم في بياناتك. وفقاً لسياسة الخصوصية الخاصة بنا، يحق لك في أي وقت طلب حذف جميع بياناتك الشخصية المسجلة في نظام "مقام".
            </p>
          </section>

          <section>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '8px' }}>
              2. ما هي البيانات التي يتم حذفها؟
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '12px' }}>
              عند تقديم طلب حذف البيانات، سنقوم بمسح المعلومات التالية:
            </p>
            <ul style={{ color: 'var(--text-secondary)', lineHeight: '1.8', paddingRight: '24px', listStyleType: 'disc' }}>
              <li>معلومات الحساب الأساسية (الاسم، البريد الإلكتروني، رقم الهاتف).</li>
              <li>سجلات الأنشطة المرتبطة بحسابك.</li>
              <li>أي بيانات أخرى قمت بإدخالها أو ربطها بحسابك في النظام.</li>
            </ul>
          </section>

          <section style={{ backgroundColor: 'rgba(25, 118, 210, 0.05)', padding: '24px', borderRadius: 'var(--radius-md)', border: '1px solid rgba(25, 118, 210, 0.2)' }}>
            <h2 style={{ color: 'var(--accent-primary)', fontSize: '1.5rem', marginBottom: '12px' }}>
              3. كيفية طلب حذف البيانات
            </h2>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', marginBottom: '16px' }}>
              لتقديم طلب لحذف بياناتك بشكل نهائي من النظام، يرجى التواصل مع فريق الدعم الفني الخاص بنا عبر الرقم الموحد التالي:
            </p>
            <div style={{ textAlign: 'center', margin: '24px 0' }}>
              <a href="tel:920001122" style={{ 
                display: 'inline-block',
                backgroundColor: 'var(--accent-primary)', 
                color: 'white', 
                padding: '16px 32px', 
                borderRadius: 'var(--radius-md)',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(10, 59, 84, 0.2)'
              }} dir="ltr">
                920001122
              </a>
            </div>
            <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', textAlign: 'center' }}>
              سيقوم فريقنا بالتحقق من هويتك ومن ثم تنفيذ طلب الحذف خلال المدة الزمنية المحددة.
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
