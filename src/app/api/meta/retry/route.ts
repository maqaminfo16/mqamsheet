import { NextResponse } from 'next/server';
import { retryFailedMetaLeads } from '@/lib/meta/retry';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const limit = body.limit || 50;

    const result = await retryFailedMetaLeads(limit);

    return NextResponse.json({ success: true, ...result });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
