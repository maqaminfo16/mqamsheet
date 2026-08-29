/**
 * يحوّل الأرقام العربية المشرقية (٠-٩) والفارسية (۰-۹) إلى أرقام إنجليزية (0-9)
 */
export function convertArabicToEnglishDigits(str: string): string {
  const arabicDigits = '٠١٢٣٤٥٦٧٨٩';
  const persianDigits = '۰۱۲۳۴۵۶۷۸۹';
  return str
    .replace(/[٠-٩]/g, (d) => String(arabicDigits.indexOf(d)))
    .replace(/[۰-۹]/g, (d) => String(persianDigits.indexOf(d)));
}

/**
 * ينظّف رقم الجوال ويحوّله للصيغة السعودية: 966XXXXXXXXX
 * بدون + أو 00 في البداية — هذا شرط Nuzul CRM.
 */
export function cleanSaudiPhone(phone: string | number | null | undefined): string {
  if (!phone) return '';

  let cleaned = String(phone).trim();

  // الخطوة 0: تحويل الأرقام العربية المشرقية والفارسية إلى أرقام إنجليزية
  cleaned = convertArabicToEnglishDigits(cleaned);

  // الخطوة 1: إزالة كل شيء ما عدا الأرقام و + البادئة
  cleaned = cleaned.replace(/[^\d+]/g, '');

  // الخطوة 2: إزالة + أو 00 من البداية
  cleaned = cleaned.replace(/^\+/, '');
  cleaned = cleaned.replace(/^00/, '');

  // الخطوة 3: التحويل للصيغة 966XXXXXXXXX

  // حالة 1: يبدأ بـ 966 + 9 أرقام = جاهز
  if (/^966\d{9}$/.test(cleaned)) {
    return cleaned;
  }

  // حالة 2: رقم محلي يبدأ بـ 0 (مثل 0501234567)
  if (/^0[1-9]\d{8}$/.test(cleaned)) {
    return '966' + cleaned.substring(1);
  }

  // حالة 3: بدون مقدمة (مثل 501234567)
  if (/^[1-9]\d{8}$/.test(cleaned)) {
    return '966' + cleaned;
  }

  // حالة 4: لا يطابق أي نمط سعودي — نرجعه كما هو بعد التنظيف
  return cleaned;
}

/**
 * يتحقق من صحة الرقم السعودي بعد التنظيف.
 * رقم صحيح = 12 رقم يبدأ بـ 9665 (جوال) أو 9661 (أرضي)
 */
export function isValidSaudiPhone(phone: string): boolean {
  const mobileRegex = /^9665[0-9]{8}$/;
  const landlineRegex = /^9661[1-7][0-9]{7}$/;
  return mobileRegex.test(phone) || landlineRegex.test(phone);
}
