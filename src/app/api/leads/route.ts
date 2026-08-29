import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const sheet_config_id = searchParams.get('sheet_config_id')
  const status = searchParams.get('status')
  const page = parseInt(searchParams.get('page') || '1')
  const limitParam = searchParams.get('limit')
  const limit = limitParam ? parseInt(limitParam) : 1000
  const offset = (page - 1) * limit

  const supabase = await createClient()

  let query = supabase
    .from('leads')
    .select('*, sheet_configs(name)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (sheet_config_id) {
    query = query.eq('sheet_config_id', sheet_config_id)
  }
  if (status) {
    query = query.eq('sync_status', status)
  }

  const { data, count, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({
    data,
    total: count || 0,
    page,
    totalPages: Math.ceil((count || 0) / limit)
  })
}
