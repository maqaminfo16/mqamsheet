import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { cleanSaudiPhone } from '@/lib/phone-cleaner'
import { buildNuzulPayload, sendToNuzul } from '@/lib/nuzul-sender'

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sheetConfigId: string }> }
) {
  const sheetConfigId = (await params).sheetConfigId
  const webhookSecret = request.headers.get('x-webhook-secret')

  if (!webhookSecret) {
    return NextResponse.json({ error: 'Missing webhook secret' }, { status: 401 })
  }

  // 1. جلب الإعدادات باستخدام Admin client لتجاوز RLS في الـ Webhook
  const { data: config, error: configError } = await supabaseAdmin
    .from('sheet_configs')
    .select('*')
    .eq('id', sheetConfigId)
    .single()

  // 2. التحقق من وجود الملف
  if (configError || !config) {
    return NextResponse.json({ error: 'Sheet config not found' }, { status: 404 })
  }

  // 3. التحقق من التفعيل
  if (!config.is_active) {
    return NextResponse.json({ error: 'Sheet sync is disabled' }, { status: 403 })
  }

  // 4. مطابقة المفتاح السري
  if (config.webhook_secret !== webhookSecret) {
    return NextResponse.json({ error: 'Invalid webhook secret' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { rowData } = body

    if (!rowData) {
      return NextResponse.json({ error: 'Invalid payload: missing rowData' }, { status: 400 })
    }

    // 5. استخراج البيانات
    const firstName = String(rowData[config.name_column] || '').trim()
    const lastName = config.has_last_name && config.last_name_column 
      ? String(rowData[config.last_name_column] || '').trim() 
      : ''
    
    const fullName = lastName ? `${firstName} ${lastName}`.trim() : firstName
    const phoneRaw = String(rowData[config.phone_column] || '').trim()
    const email = config.email_column ? String(rowData[config.email_column] || '').trim() : ''

    // 6. تنظيف رقم الجوال
    const phoneCleaned = cleanSaudiPhone(phoneRaw)

    if (!fullName || !phoneCleaned) {
      return NextResponse.json({ error: 'Missing name or phone after parsing' }, { status: 400 })
    }

    // 6.5 Prevent duplicates in the last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
    const { data: existingLeads } = await supabaseAdmin
      .from('leads')
      .select('id, sync_status')
      .eq('sheet_config_id', sheetConfigId)
      .eq('phone_cleaned', phoneCleaned)
      .gte('created_at', fiveMinutesAgo)
      .limit(1)

    if (existingLeads && existingLeads.length > 0) {
      return NextResponse.json({ 
        success: true, 
        leadId: existingLeads[0].id, 
        syncStatus: existingLeads[0].sync_status,
        message: 'Lead duplicated within 5 minutes, ignored.'
      })
    }

    // 7. حفظ العميل
    const { data: lead, error: leadError } = await supabaseAdmin
      .from('leads')
      .insert([
        {
          sheet_config_id: sheetConfigId,
          first_name: firstName,
          last_name: lastName,
          full_name: fullName,
          phone_raw: phoneRaw,
          phone_cleaned: phoneCleaned,
          email: email,
          raw_data: body,
          sync_status: 'pending'
        }
      ])
      .select()
      .single()

    if (leadError || !lead) {
      return NextResponse.json({ error: leadError?.message || 'Failed to save lead' }, { status: 500 })
    }

    // 8. المزامنة التلقائية إذا كانت مفعلة
    if (config.auto_sync) {
      const payload = buildNuzulPayload(
        { full_name: fullName, phone_cleaned: phoneCleaned, email },
        config
      )

      const nuzulResponse = await sendToNuzul(payload)
      const actionStatus = nuzulResponse.success ? 'sent' : 'failed'

      // تحديث العميل
      await supabaseAdmin
        .from('leads')
        .update({
          sync_status: actionStatus,
          deal_id: nuzulResponse.dealId || null,
          sync_error: nuzulResponse.error || null,
          crm_response: nuzulResponse.rawResponse,
          synced_at: new Date().toISOString()
        })
        .eq('id', lead.id)

      // تسجيل في logs
      await supabaseAdmin
        .from('sync_logs')
        .insert([
          {
            lead_id: lead.id,
            sheet_config_id: sheetConfigId,
            action: 'auto_sync',
            status: actionStatus,
            request_payload: payload,
            response_code: nuzulResponse.httpCode,
            response_body: nuzulResponse.rawResponse,
            error_message: nuzulResponse.error || null
          }
        ])

      return NextResponse.json({ 
        success: true, 
        leadId: lead.id, 
        syncStatus: actionStatus,
        dealId: nuzulResponse.dealId 
      })
    }

    // إذا لم تكن المزامنة مفعلة، نجاح الحفظ فقط
    return NextResponse.json({ success: true, leadId: lead.id, syncStatus: 'pending' })

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
