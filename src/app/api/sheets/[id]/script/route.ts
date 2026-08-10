import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateAppsScript } from '@/lib/apps-script-generator'
import { headers } from 'next/headers'

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

  if (error || !config) {
    return NextResponse.json({ error: 'Config not found' }, { status: 404 })
  }

  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http'
  const webhookUrl = `${protocol}://${host}/api/webhook/${id}`

  const script = generateAppsScript({
    webhookUrl,
    webhookSecret: config.webhook_secret,
    nameColumn: config.name_column,
    phoneColumn: config.phone_column,
    emailColumn: config.email_column,
    hasLastName: config.has_last_name,
    lastNameColumn: config.last_name_column,
  })

  return NextResponse.json({ script })
}
