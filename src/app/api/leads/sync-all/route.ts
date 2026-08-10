import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { buildNuzulPayload, sendToNuzul } from '@/lib/nuzul-sender'

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}))
    const { sheet_config_id } = body

    let query = supabaseAdmin
      .from('leads')
      .select('*, sheet_configs(*)')
      .in('sync_status', ['pending', 'failed'])

    if (sheet_config_id) {
      query = query.eq('sheet_config_id', sheet_config_id)
    }

    const { data: leads, error: leadsError } = await query

    if (leadsError) {
      return NextResponse.json({ error: leadsError.message }, { status: 500 })
    }

    if (!leads || leads.length === 0) {
      return NextResponse.json({ sent: 0, failed: 0, results: [] })
    }

    let sentCount = 0
    let failedCount = 0
    const results = []

    for (const lead of leads) {
      const config = lead.sheet_configs

      if (!config) {
        failedCount++
        results.push({ leadId: lead.id, status: 'failed', error: 'Missing config' })
        continue
      }

      const payload = buildNuzulPayload(
        { full_name: lead.full_name, phone_cleaned: lead.phone_cleaned, email: lead.email },
        config
      )

      const nuzulResponse = await sendToNuzul(payload)
      const actionStatus = nuzulResponse.success ? 'sent' : 'failed'

      if (nuzulResponse.success) {
        sentCount++
      } else {
        failedCount++
      }

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
            action: 'manual_sync_all',
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

    return NextResponse.json({ sent: sentCount, failed: failedCount, results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
