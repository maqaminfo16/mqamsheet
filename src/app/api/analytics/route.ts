import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export interface DailyStat {
  date: string;
  formattedDate: string;
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

export interface SourceStat {
  name: string;
  total: number;
  sent: number;
  failed: number;
  pending: number;
  successRate: number;
  sharePercentage: number;
}

export interface SheetStat {
  id: string;
  name: string;
  source: string;
  total: number;
  sent: number;
  failed: number;
  pending: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDateParam = searchParams.get('startDate');
    const endDateParam = searchParams.get('endDate');
    const sourceParam = searchParams.get('source');
    const sheetConfigIdParam = searchParams.get('sheet_config_id');
    const statusParam = searchParams.get('status');
    const searchParam = searchParams.get('search')?.trim().toLowerCase() || '';
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '50'));
    const exportAll = searchParams.get('exportAll') === 'true';

    // 1. جلب الملفات والنماذج لمعرفة المصادر المتاحة
    const [sheetsRes, mappingsRes] = await Promise.all([
      supabaseAdmin.from('sheet_configs').select('id, name, source, is_active'),
      supabaseAdmin.from('meta_form_mappings').select('id, form_id, form_name, source, is_active')
    ]);

    const sheetConfigs = sheetsRes.data || [];
    const metaMappings = mappingsRes.data || [];

    const sheetMap = new Map<string, { id: string; name: string; source: string }>();
    sheetConfigs.forEach(s => {
      sheetMap.set(s.id, { id: s.id, name: s.name, source: s.source || 'ملف شيت' });
    });

    const mappingMap = new Map<string, { id: string; name: string; source: string }>();
    metaMappings.forEach(m => {
      mappingMap.set(m.id, { id: m.id, name: m.form_name || m.form_id, source: m.source || 'Meta' });
      mappingMap.set(m.form_id, { id: m.id, name: m.form_name || m.form_id, source: m.source || 'Meta' });
    });

    // بناء قائمة المصادر المتاحة
    const sourceSet = new Set<string>();
    sheetConfigs.forEach(s => { if (s.source?.trim()) sourceSet.add(s.source.trim()); });
    metaMappings.forEach(m => { if (m.source?.trim()) sourceSet.add(m.source.trim()); });
    sourceSet.add('Meta');

    // 2. بناء استعلام العملاء
    let leadsQuery = supabaseAdmin
      .from('leads')
      .select('*, sheet_configs(id, name, source), meta_leads(id, form_id, form_mapping_id, meta_form_mappings(id, form_name, source))')
      .order('created_at', { ascending: false });

    // تصفية التاريخ
    if (startDateParam) {
      // إذا كان التاريخ بصيغة YYYY-MM-DD نحوله لبداية اليوم بتوقيت مكة/الرياض (+03:00)
      const startIso = startDateParam.includes('T')
        ? startDateParam
        : new Date(`${startDateParam}T00:00:00+03:00`).toISOString();
      leadsQuery = leadsQuery.gte('created_at', startIso);
    }

    if (endDateParam) {
      // إذا كان التاريخ بصيغة YYYY-MM-DD نحوله لنهاية اليوم بتوقيت مكة/الرياض (+03:00)
      const endIso = endDateParam.includes('T')
        ? endDateParam
        : new Date(`${endDateParam}T23:59:59.999+03:00`).toISOString();
      leadsQuery = leadsQuery.lte('created_at', endIso);
    }

    if (sheetConfigIdParam && sheetConfigIdParam !== 'all') {
      leadsQuery = leadsQuery.eq('sheet_config_id', sheetConfigIdParam);
    }

    const { data: rawLeads, error: leadsError } = await leadsQuery;

    if (leadsError) {
      return NextResponse.json({ error: leadsError.message }, { status: 500 });
    }

    const allLeads = rawLeads || [];

    // 3. تطبيع بيانات العميل وتحديد المصدر واسم الملف لكل عميل
    const processedLeads = allLeads.map((lead: any) => {
      let resolvedSource = 'غير محدد';
      let resolvedCampaign = 'غير محدد';
      let campaignId = lead.sheet_config_id || '';

      if (lead.sheet_configs) {
        resolvedSource = lead.sheet_configs.source || 'ملف شيت';
        resolvedCampaign = lead.sheet_configs.name || 'ملف غير مسمى';
        campaignId = lead.sheet_configs.id;
      } else if (lead.meta_leads && lead.meta_leads.length > 0) {
        const ml = lead.meta_leads[0];
        if (ml.meta_form_mappings) {
          resolvedSource = ml.meta_form_mappings.source || 'Meta';
          resolvedCampaign = ml.meta_form_mappings.form_name || ml.form_id || 'Meta Form';
          campaignId = ml.meta_form_mappings.id;
        } else if (ml.form_id && mappingMap.has(ml.form_id)) {
          const m = mappingMap.get(ml.form_id)!;
          resolvedSource = m.source;
          resolvedCampaign = m.name;
          campaignId = m.id;
        } else {
          resolvedSource = 'Meta';
          resolvedCampaign = ml.form_id || 'Meta Lead Ads';
        }
      } else if (lead.dedup_key?.startsWith('meta:')) {
        resolvedSource = 'Meta';
        resolvedCampaign = 'Meta Leads';
      }

      if (resolvedSource && resolvedSource !== 'غير محدد') {
        sourceSet.add(resolvedSource);
      }

      return {
        id: lead.id,
        full_name: lead.full_name || `${lead.first_name || ''} ${lead.last_name || ''}`.trim() || 'بدون اسم',
        phone_raw: lead.phone_raw || '',
        phone_cleaned: lead.phone_cleaned || '',
        email: lead.email || '',
        sync_status: lead.sync_status || 'pending',
        sync_error: lead.sync_error || null,
        deal_id: lead.deal_id || null,
        created_at: lead.created_at,
        synced_at: lead.synced_at || null,
        source: resolvedSource,
        campaign: resolvedCampaign,
        campaign_id: campaignId,
        sheet_config_id: lead.sheet_config_id || null
      };
    });

    // 4. تطبيق فلتر المصدر والبحث والحالة على البيانات
    let filteredLeads = processedLeads;

    if (sourceParam && sourceParam !== 'all') {
      filteredLeads = filteredLeads.filter(l => l.source.toLowerCase() === sourceParam.toLowerCase());
    }

    if (statusParam && statusParam !== 'all') {
      filteredLeads = filteredLeads.filter(l => l.sync_status === statusParam);
    }

    if (searchParam) {
      filteredLeads = filteredLeads.filter(l =>
        l.full_name.toLowerCase().includes(searchParam) ||
        l.phone_cleaned.includes(searchParam) ||
        l.phone_raw.includes(searchParam) ||
        l.source.toLowerCase().includes(searchParam) ||
        l.campaign.toLowerCase().includes(searchParam) ||
        (l.deal_id && String(l.deal_id).includes(searchParam))
      );
    }

    // 5. حساب الإحصائيات الشاملة
    const totalLeads = filteredLeads.length;
    let sentLeads = 0;
    let failedLeads = 0;
    let pendingLeads = 0;

    filteredLeads.forEach(l => {
      if (l.sync_status === 'sent') sentLeads++;
      else if (l.sync_status === 'failed') failedLeads++;
      else pendingLeads++;
    });

    const successRate = totalLeads > 0 ? Number(((sentLeads / totalLeads) * 100).toFixed(1)) : 0;
    const failureRate = totalLeads > 0 ? Number(((failedLeads / totalLeads) * 100).toFixed(1)) : 0;
    const pendingRate = totalLeads > 0 ? Number(((pendingLeads / totalLeads) * 100).toFixed(1)) : 0;

    // 6. حساب توزيع المصادر (Source Breakdown)
    const sourceMap = new Map<string, { total: number; sent: number; failed: number; pending: number }>();
    filteredLeads.forEach(l => {
      const src = l.source || 'غير محدد';
      const curr = sourceMap.get(src) || { total: 0, sent: 0, failed: 0, pending: 0 };
      curr.total++;
      if (l.sync_status === 'sent') curr.sent++;
      else if (l.sync_status === 'failed') curr.failed++;
      else curr.pending++;
      sourceMap.set(src, curr);
    });

    const sourceBreakdown: SourceStat[] = Array.from(sourceMap.entries()).map(([name, counts]) => ({
      name,
      total: counts.total,
      sent: counts.sent,
      failed: counts.failed,
      pending: counts.pending,
      successRate: counts.total > 0 ? Number(((counts.sent / counts.total) * 100).toFixed(1)) : 0,
      sharePercentage: totalLeads > 0 ? Number(((counts.total / totalLeads) * 100).toFixed(1)) : 0
    })).sort((a, b) => b.total - a.total);

    // 7. حساب توزيع الحملات والملفات (Sheet/Campaign Breakdown)
    const campaignStatsMap = new Map<string, { id: string; name: string; source: string; total: number; sent: number; failed: number; pending: number }>();
    filteredLeads.forEach(l => {
      const key = `${l.campaign_id || l.campaign}`;
      const curr = campaignStatsMap.get(key) || {
        id: l.campaign_id,
        name: l.campaign,
        source: l.source,
        total: 0,
        sent: 0,
        failed: 0,
        pending: 0
      };
      curr.total++;
      if (l.sync_status === 'sent') curr.sent++;
      else if (l.sync_status === 'failed') curr.failed++;
      else curr.pending++;
      campaignStatsMap.set(key, curr);
    });

    const sheetBreakdown: SheetStat[] = Array.from(campaignStatsMap.values()).sort((a, b) => b.total - a.total);

    // 8. حساب التوزيع الزمني اليومي (Daily Trend)
    const dayMap = new Map<string, { total: number; sent: number; failed: number; pending: number }>();

    filteredLeads.forEach(l => {
      // استخراج تاريخ اليوم بتوقيت مكة المكرمة
      const d = new Date(l.created_at);
      const dateKey = d.toLocaleDateString('sv-SE', { timeZone: 'Asia/Riyadh' }); // صيغة YYYY-MM-DD
      const curr = dayMap.get(dateKey) || { total: 0, sent: 0, failed: 0, pending: 0 };
      curr.total++;
      if (l.sync_status === 'sent') curr.sent++;
      else if (l.sync_status === 'failed') curr.failed++;
      else curr.pending++;
      dayMap.set(dateKey, curr);
    });

    // إنشاء الأيام في النطاق لضمان عدم وجود فراغات في الرسم البياني
    const dailyTrend: DailyStat[] = [];
    const sortedDateKeys = Array.from(dayMap.keys()).sort();

    if (sortedDateKeys.length > 0) {
      const minDateStr = startDateParam || sortedDateKeys[0];
      const maxDateStr = endDateParam || sortedDateKeys[sortedDateKeys.length - 1];

      const start = new Date(minDateStr);
      const end = new Date(maxDateStr);

      // إذا كان النطاق أقل من 90 يوم نملأ الفراغات
      const dayDiff = Math.ceil(Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

      if (dayDiff <= 90 && !isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const iter = new Date(start);
        while (iter <= end) {
          const dateStr = iter.toLocaleDateString('sv-SE', { timeZone: 'Asia/Riyadh' });
          const counts = dayMap.get(dateStr) || { total: 0, sent: 0, failed: 0, pending: 0 };
          const formattedDate = iter.toLocaleDateString('ar-SA', {
            timeZone: 'Asia/Riyadh',
            day: 'numeric',
            month: 'short'
          });

          dailyTrend.push({
            date: dateStr,
            formattedDate,
            total: counts.total,
            sent: counts.sent,
            failed: counts.failed,
            pending: counts.pending
          });

          iter.setDate(iter.getDate() + 1);
        }
      } else {
        // إذا كان النطاق كبير نعرض الأيام التي تحتوي بيانات فقط
        sortedDateKeys.forEach(dateStr => {
          const counts = dayMap.get(dateStr)!;
          const [y, m, d] = dateStr.split('-').map(Number);
          const dt = new Date(y, m - 1, d);
          const formattedDate = dt.toLocaleDateString('ar-SA', {
            day: 'numeric',
            month: 'short'
          });
          dailyTrend.push({
            date: dateStr,
            formattedDate,
            total: counts.total,
            sent: counts.sent,
            failed: counts.failed,
            pending: counts.pending
          });
        });
      }
    }

    // 9. تجهيز العملاء المعروضين بالصفحة أو التصدير
    let responseLeads = filteredLeads;
    if (!exportAll) {
      const offset = (page - 1) * limit;
      responseLeads = filteredLeads.slice(offset, offset + limit);
    }

    return NextResponse.json({
      summary: {
        total: totalLeads,
        sent: sentLeads,
        failed: failedLeads,
        pending: pendingLeads,
        successRate,
        failureRate,
        pendingRate
      },
      dailyTrend,
      sourceBreakdown,
      sheetBreakdown,
      availableSources: Array.from(sourceSet).filter(Boolean).sort(),
      availableSheets: sheetConfigs.map(s => ({ id: s.id, name: s.name, source: s.source })),
      leads: responseLeads,
      pagination: {
        page,
        limit,
        total: totalLeads,
        totalPages: Math.ceil(totalLeads / limit) || 1
      }
    });

  } catch (error: any) {
    console.error('Analytics API error:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
