import crypto from 'crypto';

export function verifyWebhookSignature(payload: string, signature: string | null): boolean {
  const secret = process.env.META_APP_SECRET;
  if (!secret) {
    console.warn('META_APP_SECRET is not configured.');
    return false;
  }
  if (!signature) return false;

  const expectedSignature = `sha256=${crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex')}`;

  try {
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  } catch {
    return false;
  }
}

export function verifyWebhookToken(token: string | null): boolean {
  const expectedToken = process.env.META_WEBHOOK_VERIFY_TOKEN;
  if (!expectedToken) {
    console.warn('META_WEBHOOK_VERIFY_TOKEN is not configured.');
    return false;
  }
  return token === expectedToken;
}
