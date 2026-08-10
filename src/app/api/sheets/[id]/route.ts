import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id
  const supabase = await createClient()

  const { data: config, error } = await supabase
    .from('sheet_configs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }

  // إحصائيات
  const { data: leads, error: leadsError } = await supabase
    .from('leads')
    .select('sync_status')
    .eq('sheet_config_id', id)

  let stats = { total: 0, sent: 0, failed: 0, pending: 0 }
  if (leads && !leadsError) {
    stats.total = leads.length
    leads.forEach((l) => {
      if (l.sync_status === 'sent') stats.sent++
      else if (l.sync_status === 'failed') stats.failed++
      else if (l.sync_status === 'pending') stats.pending++
    })
  }

  return NextResponse.json({ data: { config, stats } })
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id
  const supabase = await createClient()

  try {
    const body = await request.json()

    // إذا تم تعديل sheet_url نستخرج الـ ID من جديد
    if (body.sheet_url) {
      const sheetIdMatch = body.sheet_url.match(/\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/)
      if (sheetIdMatch) {
        body.sheet_id = sheetIdMatch[1]
      }
    }

    body.updated_at = new Date().toISOString()

    const { data, error } = await supabase
      .from('sheet_configs')
      .update(body)
      .eq('id', id)
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

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const id = (await params).id
  const supabase = await createClient()

  const { error } = await supabase
    .from('sheet_configs')
    .delete()
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
