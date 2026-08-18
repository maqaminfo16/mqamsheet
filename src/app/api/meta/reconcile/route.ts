import { NextResponse } from 'next/server';
import { reconcileMetaLeads } from '@/lib/meta/reconciliation';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { form_id, since, until, limit } = body;

    if (!form_id) {
      return NextResponse.json({ error: 'form_id is required' }, { status: 400 });
    }

    const result = await reconcileMetaLeads(form_id, since, until, limit);

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
