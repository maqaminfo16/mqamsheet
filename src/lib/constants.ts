// أنواع العقارات — تُعرض كقائمة منسدلة في إعدادات الملف
export const PROPERTY_TYPES = [
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
] as const;

// أغراض الصفقة
export const PURPOSES = [
  { value: 'buy', label: 'شراء' },
  { value: 'rent', label: 'إيجار' },
] as const;

// حالات المزامنة
export const SYNC_STATUSES = {
  pending: { label: 'في الانتظار', color: '#F59E0B', icon: '⏳' },
  sent: { label: 'مُرسَل', color: '#10B981', icon: '✅' },
  failed: { label: 'فشل', color: '#EF4444', icon: '❌' },
} as const;

// ترجمة أسماء الحقول
export const FIELD_LABELS: Record<string, string> = {
  name: 'الاسم',
  first_name: 'الاسم الأول',
  last_name: 'الاسم الثاني',
  phone: 'رقم الجوال',
  email: 'البريد الإلكتروني',
  note: 'الملاحظة',
  source: 'المصدر',
  property_id: 'معرّف العقار',
  project_id: 'معرّف المشروع',
  type: 'نوع العقار',
  purpose: 'الغرض',
  project_model_id: 'معرّف نموذج المشروع',
  tag_ids: 'الأوسمة',
  status: 'الحالة',
  deal_id: 'معرّف الصفقة',
  auto_sync: 'مزامنة تلقائية',
  sheet_name: 'اسم الملف',
  sheet_url: 'رابط الملف',
  webhook_secret: 'المفتاح السري',
};
