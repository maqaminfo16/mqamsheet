import { NextResponse, after } from 'next/server';
import { verifyWebhookSignature, verifyWebhookToken } from '@/lib/meta/webhook-security';
import { processMetaLead } from '@/lib/meta/lead-processor';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && verifyWebhookToken(token)) {
    console.log('[META] webhook_verified');
    return new NextResponse(challenge, { status: 200 });
  }

  console.warn('[META] webhook_verification_failed');
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get('x-hub-signature-256');

    if (!verifyWebhookSignature(rawBody, signature)) {
      console.warn('[META] invalid_signature');
      return new NextResponse('Invalid signature', { status: 401 });
    }

    const body = JSON.parse(rawBody);

    if (body.object === 'page') {
      console.log('[META] webhook_received');
      
      after(async () => {
        try {
          if (body.entry && Array.isArray(body.entry)) {
            for (const entry of body.entry) {
              if (entry.changes && Array.isArray(entry.changes)) {
                for (const change of entry.changes) {
                  if (change.value && change.field === 'leadgen') {
                    const value = change.value;
                    await processMetaLead(
                      value.leadgen_id,
                      value.page_id,
                      value.form_id,
                      value.ad_id,
                      value.created_time,
                      body
                    );
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error('[META] Background processing error:', err);
        }
      });

      return new NextResponse('EVENT_RECEIVED', { status: 200 });
    }

    return new NextResponse('Not Found', { status: 404 });
  } catch (err) {
    console.error('[META] Webhook error:', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
