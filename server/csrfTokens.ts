import crypto from 'node:crypto';

const MAX_AGE_SECONDS = 3600;

function signature(secret: string, session: string, issued: string, nonce: string): string {
  const key = crypto.createHmac('sha256', secret).update('web4tg-csrf-v1').digest();
  const sessionHash = crypto.createHash('sha256').update(session).digest('hex');
  return crypto.createHmac('sha256', key).update(`${sessionHash}.${issued}.${nonce}`).digest('hex');
}

export function createSignedCsrfToken(secret: string, session: string, now = Date.now()): string {
  const issued = String(Math.floor(now / 1000));
  const nonce = crypto.randomBytes(32).toString('hex');
  return `v1.${issued}.${nonce}.${signature(secret, session, issued, nonce)}`;
}

export function verifySignedCsrfToken(secret: string, session: string, token: string, now = Date.now()): boolean {
  const match = /^v1\.(\d{1,12})\.([0-9a-f]{64})\.([0-9a-f]{64})$/.exec(token);
  if (!match || !secret || !session) return false;
  const issued = Number(match[1]);
  const age = Math.floor(now / 1000) - issued;
  if (!Number.isSafeInteger(issued) || age < 0 || age > MAX_AGE_SECONDS) return false;
  const expected = Buffer.from(signature(secret, session, match[1], match[2]), 'hex');
  const supplied = Buffer.from(match[3], 'hex');
  return crypto.timingSafeEqual(expected, supplied);
}
