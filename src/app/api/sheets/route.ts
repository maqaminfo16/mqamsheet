import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export async function GET() {
  const supabase = await createClient()

  // جلب الملفات
  const { data: sheets, error: sheetsError } = await supabase
    .from('sheet_configs')
    .select('*')
    .order('created_at', { ascending: false })

  if (sheetsError) {
    return NextResponse.json({ error: sheetsError.message }, { status: 500 })
  }

  // جلب إحصائيات من leads لكل ملف
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('sheet_config_id, sync_status')

  if (leadsError) {
    return NextResponse.json({ error: leadsError.message }, { status: 500 })
  }

  // تجميع الإحصائيات
  const statsMap = new Map()
  
  if (leads) {
    leads.forEach((lead) => {
      const sheetId = lead.sheet_config_id
      if (!statsMap.has(sheetId)) {
        statsMap.set(sheetId, { total: 0, sent: 0, failed: 0, pending: 0 })
      }
      
      const stats = statsMap.get(sheetId)
      stats.total += 1
      
      if (lead.sync_status === 'sent') stats.sent += 1
      else if (lead.sync_status === 'failed') stats.failed += 1
      else if (lead.sync_status === 'pending') stats.pending += 1
    })
  }

  const dataWithStats = sheets.map((sheet) => ({
    ...sheet,
    total_leads: statsMap.get(sheet.id)?.total || 0,
    sent_leads: statsMap.get(sheet.id)?.sent || 0,
    failed_leads: statsMap.get(sheet.id)?.failed || 0,
    pending_leads: statsMap.get(sheet.id)?.pending || 0,
  }))

  return NextResponse.json({ data: dataWithStats })
}

export async function POST(request: Request) {
  const supabase = await createClient()

  try {
    const body = await request.json()
    
    // استخراج sheet_id
    const sheetIdMatch = body.sheet_url?.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
    const sheet_id = sheetIdMatch ? sheetIdMatch[1] : 'unknown'
    
    // توليد webhook_secret
    const webhook_secret = uuidv4()

    const { data, error } = await supabase
      .from('sheet_configs')
      .insert([
        {
          name: body.name,
          sheet_url: body.sheet_url,
          sheet_id: sheet_id,
          webhook_secret: webhook_secret,
          name_column: body.name_column || 'Name',
          has_last_name: body.has_last_name || false,
          last_name_column: body.last_name_column,
          phone_column: body.phone_column || 'Mobile Number',
          email_column: body.email_column,
          note: body.note,
          source: body.source,
          property_id: body.property_id || null,
          project_id: body.project_id || null,
          lead_type: body.lead_type || null,
          purpose: body.purpose || null,
          project_model_id: body.project_model_id || null,
          tag_ids: body.tag_ids || [],
          auto_sync: body.auto_sync !== undefined ? body.auto_sync : true,
          is_active: true
        }
      ])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
