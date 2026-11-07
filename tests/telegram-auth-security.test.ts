import test from 'node:test';
import assert from 'node:assert/strict';
import { createHmac, createHash } from 'node:crypto';
import { exposedBotCredentialFingerprints, isUsableBotCredential } from '../server/revokedCredentialFingerprints';
import { validateTelegramInitData } from '../server/telegramAuth';
import { configuredAdminTelegramIds, isAdminTelegramId, isSelfTelegramId, isValidTelegramWebhookSecret, telegramWebhookSecret, hasAllowedMediaSignature } from '../server/securityAccess';

const token = 'synthetic-bot-token-not-a-real-credential';
function signed(extra: Record<string, string> = {}, repeated = '') {
  const params = new URLSearchParams({ auth_date: String(Math.floor(Date.now() / 1000)), user: JSON.stringify({ id: 123, first_name: 'Test' }), ...extra });
  if (repeated) params.append(repeated, params.get(repeated)!);
  const check = [...params].sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, value]) => `${key}=${value}`).join('\n');
  const key = createHmac('sha256', 'WebAppData').update(token).digest();
  params.set('hash', createHmac('sha256', key).update(check).digest('hex'));
  return params.toString();
}
test('valid signed identity is accepted and a changed identity cannot reuse its signature', () => {
  const good = signed(); assert.equal(validateTelegramInitData(good, token)?.user?.id, 123);
  const bad = new URLSearchParams(good); bad.set('user', JSON.stringify({ id: 456, first_name: 'Other' }));
  assert.equal(validateTelegramInitData(bad.toString(), token), null);
});

test('historically exposed credentials and production placeholders cannot authorize a user or a webhook', () => {
  const fingerprint = createHash('sha256').update(token).digest('hex');
  exposedBotCredentialFingerprints.add(fingerprint);
  try {
    assert.equal(validateTelegramInitData(signed(), token), null);
    assert.equal(telegramWebhookSecret(token), '');
    assert.equal(isUsableBotCredential('your_bot_token_here', true), false);
  } finally { exposedBotCredentialFingerprints.delete(fingerprint); }
});
test('rejects signed future, stale, duplicated and malformed identity payloads', () => {
  const now = Math.floor(Date.now() / 1000);
  for (const input of [signed({ auth_date: String(now + 300) }), signed({ auth_date: String(now - 3601) }), signed({}, 'user'), signed({ auth_date: `${now}trailing` }), signed({ user: JSON.stringify({ id: -1, first_name: 'Invalid' }) }), signed({ user: JSON.stringify({ id: 1.5, first_name: 'Invalid' }) }), signed({ user: 'null' })]) assert.equal(validateTelegramInitData(input, token), null);
});
test('rejects non-hex, short hashes and oversized input without throwing', () => {
  for (const hash of ['abc', 'z'.repeat(64), 'a'.repeat(63)]) {
    const input = new URLSearchParams(signed()); input.set('hash', hash);
    assert.equal(validateTelegramInitData(input.toString(), token), null);
  }
  assert.equal(validateTelegramInitData('x'.repeat(16385), token), null);
});
test('admin access is explicit, exact, safe and fails closed', () => {
  assert.equal(isAdminTelegramId(123, ''), false);
  assert.equal(isAdminTelegramId(123, '1234, 12'), false);
  assert.equal(isAdminTelegramId(123, '12, 123'), true);
  assert.equal(isAdminTelegramId('123', '123'), false);
  assert.equal(isSelfTelegramId(123, '123'), true);
  assert.equal(isSelfTelegramId(123, '0123'), false);
  assert.equal(isSelfTelegramId(123, 124), false);
});
test('previous private admin chat is retained unless an explicit allowlist overrides it', () => {
  const previousIds = process.env.ADMIN_TELEGRAM_IDS;
  const previousLegacy = process.env.TELEGRAM_ADMIN_CHAT_ID;
  try {
    delete process.env.ADMIN_TELEGRAM_IDS;
    delete process.env.TELEGRAM_ADMIN_CHAT_ID;
    assert.equal(isAdminTelegramId(123), false);
    process.env.TELEGRAM_ADMIN_CHAT_ID = ' 123 ';
    assert.equal(isAdminTelegramId(123), true);
    assert.equal(isAdminTelegramId(456), false);
    assert.equal(isAdminTelegramId('123'), false);
    process.env.ADMIN_TELEGRAM_IDS = '456';
    assert.equal(isAdminTelegramId(123), false);
    assert.equal(isAdminTelegramId(456), true);
    process.env.ADMIN_TELEGRAM_IDS = '';
    assert.equal(isAdminTelegramId(123), false);
    assert.equal(isAdminTelegramId(456), false);
  } finally {
    if (previousIds === undefined) delete process.env.ADMIN_TELEGRAM_IDS; else process.env.ADMIN_TELEGRAM_IDS = previousIds;
    if (previousLegacy === undefined) delete process.env.TELEGRAM_ADMIN_CHAT_ID; else process.env.TELEGRAM_ADMIN_CHAT_ID = previousLegacy;
  }
});
test('legacy admin chat never grants access to a group, multiple IDs or malformed account', () => {
  for (const value of ['', '-123', '-1001234567890', '0', '00123', '+123', '123,456', '123\n456', '1.23e2', '123.0', 'NaN', '9007199254740992']) {
    const configured = configuredAdminTelegramIds({ TELEGRAM_ADMIN_CHAT_ID: value });
    assert.equal(configured, '');
    assert.equal(isAdminTelegramId(123, configured), false);
  }
});
test('webhook authentication has domain separation and exact constant-time comparison', () => {
  const previous = process.env.TELEGRAM_WEBHOOK_SECRET; delete process.env.TELEGRAM_WEBHOOK_SECRET;
  try {
    const secret = telegramWebhookSecret(token);
    assert.match(secret, /^[0-9a-f]{64}$/);
    assert.notEqual(secret, token);
    assert.equal(isValidTelegramWebhookSecret(secret, secret), true);
    assert.equal(isValidTelegramWebhookSecret(`${secret}a`, secret), false);
    assert.equal(isValidTelegramWebhookSecret(undefined, secret), false);
    assert.equal(isValidTelegramWebhookSecret('', ''), false);
    process.env.TELEGRAM_WEBHOOK_SECRET = 'weak';
    assert.equal(telegramWebhookSecret(token), '');
    process.env.TELEGRAM_WEBHOOK_SECRET = 'x'.repeat(31);
    assert.equal(telegramWebhookSecret(token), '');
    process.env.TELEGRAM_WEBHOOK_SECRET = 'x'.repeat(32);
    assert.equal(telegramWebhookSecret(token), 'x'.repeat(32));
  } finally { if (previous !== undefined) process.env.TELEGRAM_WEBHOOK_SECRET = previous; else delete process.env.TELEGRAM_WEBHOOK_SECRET; }
});
test('media type is checked against bytes, not just a client MIME label', () => {
  const html = Buffer.from('<html><script>alert(1)</script>');
  for (const mime of ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'video/mp4', 'video/webm']) assert.equal(hasAllowedMediaSignature(mime, html), false);
  assert.equal(hasAllowedMediaSignature('image/png', Buffer.from([137,80,78,71,13,10,26,10])), true);
  assert.equal(hasAllowedMediaSignature('image/jpeg', Buffer.from([255,216,255,224])), true);
  assert.equal(hasAllowedMediaSignature('image/webp', Buffer.from('RIFFxxxxWEBP')), true);
  assert.equal(hasAllowedMediaSignature('image/svg+xml', Buffer.from('<svg></svg>')), false);
});
