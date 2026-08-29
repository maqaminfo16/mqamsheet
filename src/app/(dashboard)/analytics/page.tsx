'use client';

import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart3,
  TrendingUp,
  Download,
  RefreshCw,
  Search,
  Copy,
  Check,
  Send,
  Calendar,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Skeleton, SkeletonChart, SkeletonSourceBreakdown } from '@/components/ui/Loading';

interface SummaryStats {
  total: number;
  sent: number;
  failed: number;
  pending: number;
  successRate: number;
  failureRate: number;
  pendingRate: number;
}

interface DailyStat {
  date: string;
  formattedDate: string;
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

interface SourceStat {
  name: string;
  total: number;
  sent: number;
  failed: number;
  pending: number;
  successRate: number;
  sharePercentage: number;
}

interface SheetStat {
  id: string;
  name: string;
  source: string;
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

interface LeadItem {
  id: string;
  full_name: string;
  phone_raw: string;
  phone_cleaned: string;
  email?: string;
  sync_status: 'sent' | 'failed' | 'pending';
  sync_error?: string | null;
  deal_id?: string | null;
  created_at: string;
  synced_at?: string | null;
  source: string;
  campaign: string;
  campaign_id: string;
  sheet_config_id?: string | null;
}

function getRiyadhDateStr(d: Date): string {
  return d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Riyadh' });
}

function getPresetDates(preset: string): { start: string; end: string } {
  const now = new Date();
  const todayStr = getRiyadhDateStr(now);

  if (preset === 'today') {
    return { start: todayStr, end: todayStr };
  }
  if (preset === 'yesterday') {
    const yest = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const yestStr = getRiyadhDateStr(yest);
    return { start: yestStr, end: yestStr };
  }
  if (preset === 'last7') {
    const d = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
    return { start: getRiyadhDateStr(d), end: todayStr };
  }
  if (preset === 'last30') {
    const d = new Date(now.getTime() - 29 * 24 * 60 * 60 * 1000);
    return { start: getRiyadhDateStr(d), end: todayStr };
  }
  if (preset === 'thisMonth') {
    const [y, m] = todayStr.split('-').map(Number);
    const firstDay = `${y}-${String(m).padStart(2, '0')}-01`;
    return { start: firstDay, end: todayStr };
  }
  if (preset === 'lastMonth') {
    const [y, m] = todayStr.split('-').map(Number);
    const prevYear = m === 1 ? y - 1 : y;
    const prevMonth = m === 1 ? 12 : m - 1;
    const firstDay = `${prevYear}-${String(prevMonth).padStart(2, '0')}-01`;
    const lastDayNum = new Date(prevYear, prevMonth, 0).getDate();
    const lastDay = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(lastDayNum).padStart(2, '0')}`;
    return { start: firstDay, end: lastDay };
  }
  if (preset === 'all') {
    return { start: '', end: '' };
  }
  return { start: todayStr, end: todayStr };
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      title="نسخ"
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '2px 4px',
        color: copied ? 'var(--success, #10b981)' : 'var(--text-secondary, #6b7280)',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '2px',
        borderRadius: '4px',
        fontSize: '0.75rem'
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      <span>{copied ? 'تم' : ''}</span>
    </button>
  );
}

export default function AnalyticsPage() {
  // الفلاتر
  const [datePreset, setDatePreset] = useState<string>('last30');
  const [startDate, setStartDate] = useState<string>(() => getPresetDates('last30').start);
  const [endDate, setEndDate] = useState<string>(() => getPresetDates('last30').end);
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedSheet, setSelectedSheet] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [search, setSearch] = useState<string>('');

  // البيانات
  const [summary, setSummary] = useState<SummaryStats>({
    total: 0,
    sent: 0,
    failed: 0,
    pending: 0,
    successRate: 0,
    failureRate: 0,
    pendingRate: 0
  });
  const [dailyTrend, setDailyTrend] = useState<DailyStat[]>([]);
  const [sourceBreakdown, setSourceBreakdown] = useState<SourceStat[]>([]);
  const [sheetBreakdown, setSheetBreakdown] = useState<SheetStat[]>([]);
  const [availableSources, setAvailableSources] = useState<string[]>([]);
  const [availableSheets, setAvailableSheets] = useState<{ id: string; name: string; source: string }[]>([]);
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [exporting, setExporting] = useState<boolean>(false);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState<boolean>(false);

  // الترقيم
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(30);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalFilteredLeads, setTotalFilteredLeads] = useState<number>(0);

  // حالة التحويم على الرسم البياني
  const [hoveredDay, setHoveredDay] = useState<DailyStat | null>(null);

  // جلب البيانات
  const fetchAnalytics = async (pageToFetch = currentPage) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (selectedSource && selectedSource !== 'all') params.set('source', selectedSource);
      if (selectedSheet && selectedSheet !== 'all') params.set('sheet_config_id', selectedSheet);
      if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus);
      if (search) params.set('search', search);
      params.set('page', String(pageToFetch));
      params.set('limit', String(itemsPerPage));

      const res = await fetch(`/api/analytics?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setSummary(json.summary || {
          total: 0,
          sent: 0,
          failed: 0,
          pending: 0,
          successRate: 0,
          failureRate: 0,
          pendingRate: 0
        });
        setDailyTrend(json.dailyTrend || []);
        setSourceBreakdown(json.sourceBreakdown || []);
        setSheetBreakdown(json.sheetBreakdown || []);
        setAvailableSources(json.availableSources || []);
        setAvailableSheets(json.availableSheets || []);
        setLeads(json.leads || []);
        setTotalPages(json.pagination?.totalPages || 1);
        setTotalFilteredLeads(json.pagination?.total || 0);
      }
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(1);
    setCurrentPage(1);
  }, [startDate, endDate, selectedSource, selectedSheet, selectedStatus, search, itemsPerPage]);

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    fetchAnalytics(newPage);
  };

  const handlePresetSelect = (preset: string) => {
    setDatePreset(preset);
    const { start, end } = getPresetDates(preset);
    setStartDate(start);
    setEndDate(end);
  };

  const handleManualDateChange = (start: string, end: string) => {
    setDatePreset('custom');
    setStartDate(start);
    setEndDate(end);
  };

  // المزامنة الفردية
  const handleSingleSync = async (leadId: string) => {
    setSyncingId(leadId);
    try {
      const res = await fetch('/api/leads/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_ids: [leadId] })
      });
      if (res.ok) {
        await fetchAnalytics(currentPage);
      }
    } finally {
      setSyncingId(null);
    }
  };

  // مزامنة جميع المعلقين/الفاشلين في التصفية الحالية
  const handleSyncAllInFilter = async () => {
    const unSyncedLeads = leads.filter(l => l.sync_status !== 'sent');
    if (unSyncedLeads.length === 0) return;

    setSyncingAll(true);
    try {
      await fetch('/api/leads/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lead_ids: unSyncedLeads.map(l => l.id) })
      });
      await fetchAnalytics(currentPage);
    } finally {
      setSyncingAll(false);
    }
  };

  // تصدير CSV
  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (selectedSource && selectedSource !== 'all') params.set('source', selectedSource);
      if (selectedSheet && selectedSheet !== 'all') params.set('sheet_config_id', selectedSheet);
      if (selectedStatus && selectedStatus !== 'all') params.set('status', selectedStatus);
      if (search) params.set('search', search);
      params.set('exportAll', 'true');

      const res = await fetch(`/api/analytics?${params.toString()}`);
      if (!res.ok) throw new Error('فشل جلب بيانات التصدير');

      const json = await res.json();
      const exportData: LeadItem[] = json.leads || [];

      // تجهيز ملف CSV بترميز UTF-8 مع BOM لفتح العربية في Excel بشكل سليم
      const headers = ['الاسم', 'رقم الجوال المنظف', 'رقم الجوال الأصلي', 'البريد الإلكتروني', 'المصدر', 'الحملة / الملف', 'الحالة', 'معرف الصفقة في نزول', 'تاريخ التسجيل', 'ملاحظات الخطأ'];
      
      const statusLabels: Record<string, string> = {
        sent: 'مُرسل بنجاح',
        failed: 'فشل الإرسال',
        pending: 'في الانتظار'
      };

      const rows = exportData.map(l => {
        const d = new Date(l.created_at);
        const dateFormatted = d.toLocaleString('ar-SA', { timeZone: 'Asia/Riyadh' });
        return [
          `"${(l.full_name || '').replace(/"/g, '""')}"`,
          `"${l.phone_cleaned || ''}"`,
          `"${l.phone_raw || ''}"`,
          `"${l.email || ''}"`,
          `"${l.source || ''}"`,
          `"${(l.campaign || '').replace(/"/g, '""')}"`,
          `"${statusLabels[l.sync_status] || l.sync_status}"`,
          `"${l.deal_id || ''}"`,
          `"${dateFormatted}"`,
          `"${(l.sync_error || '').replace(/"/g, '""')}"`
        ].join(',');
      });

      const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      const dateName = startDate && endDate ? `${startDate}_to_${endDate}` : 'all_time';
      link.setAttribute('download', `maqam_analytics_${dateName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      alert('حدث خطأ أثناء تصدير البيانات');
    } finally {
      setExporting(false);
    }
  };

  // أعلى قيمة في الرسم البياني لحساب ارتفاع الأعمدة
  const maxDayTotal = Math.max(...dailyTrend.map(d => d.total), 1);

  // حساب معدل التسجيل اليومي
  const totalDaysWithData = dailyTrend.length || 1;
  const avgDailyLeads = (summary.total / totalDaysWithData).toFixed(1);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <Header
        title={
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px rgba(10, 59, 84, 0.25)'
              }}
            >
              <BarChart3 size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                الإحصائيات والتقارير
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                تحليل أداء التسجيل والمصادر ونسب الإرسال لـ Maqam CRM بدقة
              </p>
            </div>
          </div>
        }
        actions={
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="secondary"
              icon={<Download size={16} />}
              onClick={handleExportCSV}
              loading={exporting}
              disabled={loading || summary.total === 0}
            >
              تصدير CSV
            </Button>
            <Button
              variant="primary"
              icon={<RefreshCw size={16} />}
              onClick={() => fetchAnalytics(currentPage)}
              loading={loading}
            >
              تحديث
            </Button>
          </div>
        }
      />

      {/* شريط الفلاتر والتحكم المتكامل */}
      <Card style={{ padding: '20px', background: 'var(--bg-card)', border: '1px solid var(--border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          
          {/* أزرار الاختيار السريع للتواريخ */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
              <Calendar size={16} color="var(--accent-primary)" />
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>الفترة الزمنية:</span>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[
                { id: 'today', label: 'اليوم' },
                { id: 'yesterday', label: 'أمس' },
                { id: 'last7', label: 'آخر 7 أيام' },
                { id: 'last30', label: 'آخر 30 يوماً' },
                { id: 'thisMonth', label: 'هذا الشهر' },
                { id: 'lastMonth', label: 'الشهر الماضي' },
                { id: 'all', label: 'جميع الأوقات' }
              ].map(p => {
                const isActive = datePreset === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => handlePresetSelect(p.id)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.85rem',
                      fontWeight: isActive ? 600 : 500,
                      cursor: 'pointer',
                      border: isActive ? '1px solid var(--accent-primary)' : '1px solid var(--border)',
                      backgroundColor: isActive ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.7)',
                      color: isActive ? '#ffffff' : 'var(--text-secondary)',
                      transition: 'all 0.2s',
                      boxShadow: isActive ? '0 2px 8px rgba(10, 59, 84, 0.2)' : 'none'
                    }}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ height: '1px', background: 'var(--border)' }} />

          {/* مدخلات التاريخ المخصص والمصادر والملفات */}
          <div
            className="flex-col-mobile"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '14px',
              alignItems: 'flex-end'
            }}
          >
            {/* من تاريخ */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                من تاريخ:
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => handleManualDateChange(e.target.value, endDate)}
                className="input"
                style={{ padding: '9px 12px', fontSize: '0.9rem' }}
              />
            </div>

            {/* إلى تاريخ */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                إلى تاريخ:
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => handleManualDateChange(startDate, e.target.value)}
                className="input"
                style={{ padding: '9px 12px', fontSize: '0.9rem' }}
              />
            </div>

            {/* فلتر المصدر */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                مصدر العميل:
              </label>
              <select
                value={selectedSource}
                onChange={e => setSelectedSource(e.target.value)}
                className="input"
                style={{ padding: '9px 12px', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                <option value="all">جميع المصادر ({availableSources.length})</option>
                {availableSources.map(src => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>

            {/* فلتر الملف / النموذج */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                الملف / النموذج:
              </label>
              <select
                value={selectedSheet}
                onChange={e => setSelectedSheet(e.target.value)}
                className="input"
                style={{ padding: '9px 12px', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                <option value="all">جميع الملفات والنماذج</option>
                {availableSheets.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} {s.source ? `(${s.source})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* فلتر حالة المزامنة */}
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-secondary)' }}>
                حالة الإرسال:
              </label>
              <select
                value={selectedStatus}
                onChange={e => setSelectedStatus(e.target.value)}
                className="input"
                style={{ padding: '9px 12px', fontSize: '0.9rem', cursor: 'pointer' }}
              >
                <option value="all">جميع الحالات</option>
                <option value="sent">مُرسل بنجاح</option>
                <option value="failed">فشل الإرسال</option>
                <option value="pending">في الانتظار</option>
              </select>
            </div>
          </div>

          {/* ملخص الفلاتر النشطة */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '10px',
              paddingTop: '6px',
              fontSize: '0.85rem',
              color: 'var(--text-muted)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 500 }}>الفلترة الحالية:</span>
              <Badge variant="info">
                {startDate && endDate ? `${startDate} إلى ${endDate}` : 'جميع الأوقات'}
              </Badge>
              {selectedSource !== 'all' && <Badge variant="warning">المصدر: {selectedSource}</Badge>}
              {selectedSheet !== 'all' && (
                <Badge variant="info">
                  الملف: {availableSheets.find(s => s.id === selectedSheet)?.name || selectedSheet}
                </Badge>
              )}
              {selectedStatus !== 'all' && (
                <Badge variant={selectedStatus === 'sent' ? 'success' : selectedStatus === 'failed' ? 'danger' : 'warning'}>
                  الحالة: {selectedStatus === 'sent' ? 'مُرسل' : selectedStatus === 'failed' ? 'فشل' : 'انتظار'}
                </Badge>
              )}
            </div>

            {(selectedSource !== 'all' || selectedSheet !== 'all' || selectedStatus !== 'all' || datePreset !== 'last30' || search) && (
              <button
                onClick={() => {
                  setDatePreset('last30');
                  const { start, end } = getPresetDates('last30');
                  setStartDate(start);
                  setEndDate(end);
                  setSelectedSource('all');
                  setSelectedSheet('all');
                  setSelectedStatus('all');
                  setSearch('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--danger)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                إعادة ضبط الفلاتر ↺
              </button>
            )}
          </div>

        </div>
      </Card>

      {/* بطاقات الإحصائيات الرقمية KPI Cards */}
      <div
        className="gap-sm-mobile"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '20px'
        }}
      >
        {/* إجمالي المسجلين */}
        <Card style={{ padding: '20px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '65%' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                إجمالي المسجلين
              </span>
              <div style={{ minHeight: '38px', display: 'flex', alignItems: 'center' }}>
                {loading ? (
                  <Skeleton width="90px" height="34px" borderRadius="6px" />
                ) : (
                  <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                    {summary.total.toLocaleString()}
                  </span>
                )}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                {selectedSource !== 'all' ? `من مصدر ${selectedSource}` : 'من جميع المصادر'}
              </span>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(10, 59, 84, 0.1)',
                color: 'var(--accent-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Users size={24} />
            </div>
          </div>
        </Card>

        {/* تم الإرسال بنجاح */}
        <Card style={{ padding: '20px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '65%' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                تم الإرسال بنجاح
              </span>
              <div style={{ minHeight: '38px', display: 'flex', alignItems: 'center' }}>
                {loading ? (
                  <Skeleton width="90px" height="34px" borderRadius="6px" />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--success)', lineHeight: 1.1 }}>
                      {summary.sent.toLocaleString()}
                    </span>
                    <Badge variant="success">
                      {summary.successRate}%
                    </Badge>
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                تم الربط بـ Maqam CRM
              </span>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(5, 150, 105, 0.12)',
                color: 'var(--success)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CheckCircle2 size={24} />
            </div>
          </div>
        </Card>

        {/* فشل الإرسال */}
        <Card style={{ padding: '20px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '65%' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                فشل الإرسال
              </span>
              <div style={{ minHeight: '38px', display: 'flex', alignItems: 'center' }}>
                {loading ? (
                  <Skeleton width="90px" height="34px" borderRadius="6px" />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--danger)', lineHeight: 1.1 }}>
                      {summary.failed.toLocaleString()}
                    </span>
                    {summary.failed > 0 && (
                      <Badge variant="danger">
                        {summary.failureRate}%
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                بحاجة لإعادة محاولة
              </span>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(220, 38, 38, 0.12)',
                color: 'var(--danger)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <XCircle size={24} />
            </div>
          </div>
        </Card>

        {/* في الانتظار */}
        <Card style={{ padding: '20px', border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '65%' }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: 500 }}>
                في الانتظار
              </span>
              <div style={{ minHeight: '38px', display: 'flex', alignItems: 'center' }}>
                {loading ? (
                  <Skeleton width="90px" height="34px" borderRadius="6px" />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
                    <span style={{ fontSize: '2.2rem', fontWeight: 800, color: 'var(--warning)', lineHeight: 1.1 }}>
                      {summary.pending.toLocaleString()}
                    </span>
                    {summary.pending > 0 && (
                      <Badge variant="warning">
                        {summary.pendingRate}%
                      </Badge>
                    )}
                  </div>
                )}
              </div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                قيد المعالجة أو الإرسال اليدوي
              </span>
            </div>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: 'rgba(217, 119, 6, 0.12)',
                color: 'var(--warning)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock size={24} />
            </div>
          </div>
        </Card>
      </div>

      {/* قسم التحليلات البيانية والرسم الزمني */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px' }}>
        
        {/* مخطط التسجيل الزمني اليومي */}
        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                مخطط التسجيل اليومي
              </h2>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              المعدل: <strong>{avgDailyLeads}</strong> عميل/يوم
            </span>
          </div>

          {loading ? (
            <SkeletonChart bars={dailyTrend.length > 0 ? dailyTrend.length : 18} />
          ) : dailyTrend.length === 0 ? (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              لا توجد بيانات تسجيل في هذه الفترة
            </div>
          ) : (
            <div>
              {/* الرسوم البيانية التفاعلية للأيام */}
              <div
                style={{
                  height: '180px',
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: dailyTrend.length > 30 ? '2px' : '6px',
                  paddingTop: '20px',
                  paddingBottom: '8px',
                  borderBottom: '1px solid var(--border)',
                  position: 'relative'
                }}
              >
                {dailyTrend.map((d, idx) => {
                  const heightPercent = Math.max(8, (d.total / maxDayTotal) * 100);
                  const isHovered = hoveredDay?.date === d.date;

                  return (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredDay(d)}
                      onMouseLeave={() => setHoveredDay(null)}
                      style={{
                        flex: 1,
                        height: `${heightPercent}%`,
                        backgroundColor: d.total > 0 ? (d.failed > 0 ? 'var(--accent-gold)' : 'var(--accent-primary)') : 'rgba(0,0,0,0.05)',
                        borderRadius: '4px 4px 0 0',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        transform: isHovered ? 'scaleY(1.08)' : 'scaleY(1)',
                        opacity: isHovered ? 1 : 0.85,
                        position: 'relative'
                      }}
                    />
                  );
                })}
              </div>

              {/* تفاصيل اليوم المحوم عليه (Tooltip) */}
              <div style={{ minHeight: '34px', marginTop: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                {hoveredDay ? (
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      📅 {hoveredDay.date} ({hoveredDay.formattedDate}):
                    </span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <Badge variant="info">إجمالي: {hoveredDay.total}</Badge>
                      <Badge variant="success">مُرسل: {hoveredDay.sent}</Badge>
                      {hoveredDay.failed > 0 && <Badge variant="danger">فشل: {hoveredDay.failed}</Badge>}
                      {hoveredDay.pending > 0 && <Badge variant="warning">انتظار: {hoveredDay.pending}</Badge>}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    <span>{dailyTrend[0]?.formattedDate || ''}</span>
                    <span>مرر مؤشر الماوس على الأعمدة لعرض التفاصيل اليومية</span>
                    <span>{dailyTrend[dailyTrend.length - 1]?.formattedDate || ''}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* تحليل أداء وتوزيع المصادر */}
        <Card style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={20} color="var(--accent-primary)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
                توزيع وأداء المصادر
              </h2>
            </div>
            <Badge variant="info">
              {sourceBreakdown.length} مصادر مسجلة
            </Badge>
          </div>

          {loading ? (
            <SkeletonSourceBreakdown items={sourceBreakdown.length > 0 ? sourceBreakdown.length : 4} />
          ) : sourceBreakdown.length === 0 ? (
            <div style={{ height: '220px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              لا توجد مصادر مطابقة
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '250px', overflowY: 'auto', paddingRight: '4px' }}>
              {sourceBreakdown.map((src, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedSource(selectedSource === src.name ? 'all' : src.name)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: selectedSource === src.name ? '1px solid var(--accent-primary)' : '1px solid var(--border)',
                    backgroundColor: selectedSource === src.name ? 'rgba(10, 59, 84, 0.06)' : 'rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{src.name}</span>
                      <Badge variant="info">{src.sharePercentage}% من الإجمالي</Badge>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
                      <strong>{src.total}</strong> عميل
                    </div>
                  </div>

                  {/* شريط نسبة الإرسال */}
                  <div style={{ width: '100%', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden', display: 'flex' }}>
                    <div style={{ width: `${(src.sent / Math.max(1, src.total)) * 100}%`, background: 'var(--success)' }} />
                    <div style={{ width: `${(src.failed / Math.max(1, src.total)) * 100}%`, background: 'var(--danger)' }} />
                    <div style={{ width: `${(src.pending / Math.max(1, src.total)) * 100}%`, background: 'var(--warning)' }} />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    <span style={{ color: 'var(--success)' }}>مُرسل: {src.sent} ({src.successRate}%)</span>
                    {src.failed > 0 && <span style={{ color: 'var(--danger)' }}>فشل: {src.failed}</span>}
                    {src.pending > 0 && <span style={{ color: 'var(--warning)' }}>انتظار: {src.pending}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* جدول تفاصيل العملاء المسجلين في الفترة والمصدر */}
      <Card style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          {/* شريط التحكم بالجدول والبحث */}
          <div
            className="flex-col-mobile"
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '14px'
            }}
          >
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
                قائمة العملاء المسجلين ({totalFilteredLeads.toLocaleString()})
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0 0' }}>
                عرض تفصيلي لجميع العملاء الذين سجلوا في النطاق المحدد
              </p>
            </div>

            <div
              className="flex-col-mobile"
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                flexWrap: 'wrap'
              }}
            >
              {/* حقل البحث */}
              <div style={{ width: '260px' }} className="search-input-mobile">
                <Input
                  placeholder="بحث بالاسم أو الجوال..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  icon={<Search size={16} />}
                />
              </div>

              {/* زر مزامنة الكل للعملاء غير المرسلون */}
              <Button
                variant="primary"
                size="sm"
                icon={<Send size={15} />}
                onClick={handleSyncAllInFilter}
                loading={syncingAll}
                disabled={loading || syncingAll || leads.filter(l => l.sync_status !== 'sent').length === 0}
              >
                إرسال المعلقين ({leads.filter(l => l.sync_status !== 'sent').length})
              </Button>
            </div>
          </div>

          {/* جدول البيانات */}
          <div className="table-container" style={{ overflowX: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>الاسم</th>
                  <th>رقم الجوال</th>
                  <th>المصدر</th>
                  <th>الملف / النموذج</th>
                  <th>الحالة</th>
                  <th className="hide-on-mobile">معرف الصفقة</th>
                  <th className="hide-on-mobile">تاريخ التسجيل</th>
                  <th>الإجراء</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 6 }).map((_, r) => (
                    <tr key={`sk-lead-row-${r}`}>
                      <td><Skeleton width="75%" height="16px" /></td>
                      <td><Skeleton width="85%" height="16px" /></td>
                      <td><Skeleton width="60px" height="22px" borderRadius="10px" /></td>
                      <td><Skeleton width="70%" height="16px" /></td>
                      <td><Skeleton width="70px" height="22px" borderRadius="10px" /></td>
                      <td className="hide-on-mobile"><Skeleton width="60px" height="16px" /></td>
                      <td className="hide-on-mobile"><Skeleton width="80px" height="16px" /></td>
                      <td><Skeleton width="65px" height="30px" borderRadius="var(--radius-md)" /></td>
                    </tr>
                  ))
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                      لا يوجد عملاء مطابقين لمعايير البحث والفترة المحددة
                    </td>
                  </tr>
                ) : (
                  leads.map(lead => {
                    const d = new Date(lead.created_at);
                    const dateStr = d.toLocaleDateString('en-GB', { timeZone: 'Asia/Riyadh' });
                    const timeStr = d.toLocaleTimeString('en-US', {
                      timeZone: 'Asia/Riyadh',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    }).replace('AM', 'ص').replace('PM', 'م');

                    return (
                      <tr key={lead.id}>
                        {/* الاسم */}
                        <td style={{ fontWeight: 600 }}>{lead.full_name}</td>

                        {/* رقم الجوال */}
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', direction: 'ltr', justifyContent: 'flex-end' }}>
                            <span style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>{lead.phone_cleaned || lead.phone_raw}</span>
                            <CopyButton text={lead.phone_cleaned || lead.phone_raw} />
                          </div>
                        </td>

                        {/* المصدر */}
                        <td>
                          <Badge variant="info">{lead.source}</Badge>
                        </td>

                        {/* الحملة / الملف */}
                        <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={lead.campaign}>
                          {lead.campaign}
                        </td>

                        {/* الحالة */}
                        <td>
                          {lead.sync_status === 'sent' && <Badge variant="success">✅ مُرسل</Badge>}
                          {lead.sync_status === 'failed' && (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                              <Badge variant="danger">❌ فشل</Badge>
                              {lead.sync_error && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                                  <span
                                    style={{
                                      fontSize: '0.7rem',
                                      color: 'var(--danger)',
                                      maxWidth: '110px',
                                      overflow: 'hidden',
                                      textOverflow: 'ellipsis',
                                      whiteSpace: 'nowrap'
                                    }}
                                    title={lead.sync_error}
                                  >
                                    {lead.sync_error}
                                  </span>
                                  <CopyButton text={lead.sync_error} />
                                </div>
                              )}
                            </div>
                          )}
                          {lead.sync_status === 'pending' && <Badge variant="warning">⏳ بالانتظار</Badge>}
                        </td>

                        {/* معرف الصفقة */}
                        <td className="hide-on-mobile" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>
                          {lead.deal_id ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <span>{lead.deal_id}</span>
                              <CopyButton text={String(lead.deal_id)} />
                            </div>
                          ) : (
                            '-'
                          )}
                        </td>

                        {/* تاريخ التسجيل */}
                        <td className="hide-on-mobile" style={{ whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <span style={{ fontSize: '0.85rem' }}>{dateStr}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{timeStr}</span>
                          </div>
                        </td>

                        {/* الإجراء */}
                        <td>
                          {lead.sync_status !== 'sent' ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSingleSync(lead.id)}
                              loading={syncingId === lead.id}
                              disabled={loading || syncingId !== null}
                            >
                              إرسال
                            </Button>
                          ) : (
                            <span style={{ fontSize: '0.8rem', color: 'var(--success)' }}>✓ تمت المزامنة</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* الترقيم والتحكم بعدد العناصر */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              paddingTop: '8px'
            }}
          >
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              إجمالي النتائج: <strong>{totalFilteredLeads.toLocaleString()}</strong> | الصفحة {currentPage} من {totalPages}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>بالصفحة:</span>
                <select
                  value={itemsPerPage}
                  onChange={e => setItemsPerPage(Number(e.target.value))}
                  style={{
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border)',
                    background: 'white',
                    color: 'inherit',
                    outline: 'none',
                    cursor: 'pointer'
                  }}
                >
                  <option value={10}>10</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {totalPages > 1 && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1 || loading}
                  >
                    <ChevronRight size={16} /> السابق
                  </Button>
                  <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '0.9rem', fontWeight: 600 }}>
                    {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages || loading}
                  >
                    التالي <ChevronLeft size={16} />
                  </Button>
                </div>
              )}
            </div>
          </div>

        </div>
      </Card>
    </div>
  );
}
