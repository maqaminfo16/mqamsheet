import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { buildNuzulPayload, sendToNuzul } from '@/lib/nuzul-sender'

export async function POST(request: Request) {
  try {
    const { lead_ids } = await request.json()

    if (!lead_ids || !Array.isArray(lead_ids) || lead_ids.length === 0) {
      return NextResponse.json({ error: 'No lead_ids provided' }, { status: 400 })
    }

    // جلب العملاء مع إعدادات الملف
    const { data: leads, error: leadsError } = await supabaseAdmin
      .from('leads')
      .select('*, sheet_configs(*)')
      .in('id', lead_ids)

    if (leadsError || !leads) {
      return NextResponse.json({ error: leadsError?.message || 'Failed to fetch leads' }, { status: 500 })
    }

    const results = []

    for (const lead of leads) {
      const config = lead.sheet_configs

      if (!config) {
        results.push({ leadId: lead.id, status: 'failed', error: 'Missing config' })
        continue
      }

      const payload = buildNuzulPayload(
        { full_name: lead.full_name, phone_cleaned: lead.phone_cleaned, email: lead.email },
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
            sheet_config_id: config.id,
            action: 'manual_sync',
            status: actionStatus,
            request_payload: payload,
            response_code: nuzulResponse.httpCode,
            response_body: nuzulResponse.rawResponse,
            error_message: nuzulResponse.error || null
          }
        ])

      results.push({
        leadId: lead.id,
        status: actionStatus,
        dealId: nuzulResponse.dealId,
        error: nuzulResponse.error
      })
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
