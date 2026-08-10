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

  if (!sheets || sheets.length === 0) {
    return NextResponse.json({ data: [] })
  }

  // جلب الإحصائيات بكفاءة - استخدام count queries لكل ملف بالتوازي
  const dataWithStats = await Promise.all(
    sheets.map(async (sheet) => {
      const [totalRes, sentRes, failedRes, pendingRes] = await Promise.all([
        supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('sheet_config_id', sheet.id),
        supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('sheet_config_id', sheet.id)
          .eq('sync_status', 'sent'),
        supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('sheet_config_id', sheet.id)
          .eq('sync_status', 'failed'),
        supabase
          .from('leads')
          .select('*', { count: 'exact', head: true })
          .eq('sheet_config_id', sheet.id)
          .eq('sync_status', 'pending'),
      ])

      return {
        ...sheet,
        total_leads: totalRes.count || 0,
        sent_leads: sentRes.count || 0,
        failed_leads: failedRes.count || 0,
        pending_leads: pendingRes.count || 0,
      }
    })
  )

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
