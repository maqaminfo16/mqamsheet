import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('meta_form_mappings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data || [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('meta_form_mappings')
      .insert([{
        form_id: body.form_id,
        form_name: body.form_name,
        project_id: body.project_id || null,
        property_id: body.property_id || null,
        tag_ids: body.tag_ids || [],
        lead_type: body.lead_type || null,
        purpose: body.purpose || null,
        project_model_id: body.project_model_id || null,
        source: body.source || 'Meta',
        note: body.note || null,
        is_active: body.is_active !== undefined ? body.is_active : true
      }])
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ data });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
