import crypto from 'node:crypto';
import type { Request, Response, NextFunction } from 'express';
import { isUsableBotCredential } from './revokedCredentialFingerprints';

/** Preserve the operator's previous private admin chat when no new allowlist is set. */
export function configuredAdminTelegramIds(env: NodeJS.ProcessEnv = process.env): string {
  if (env.ADMIN_TELEGRAM_IDS !== undefined) return env.ADMIN_TELEGRAM_IDS;
  const legacyId = env.TELEGRAM_ADMIN_CHAT_ID?.trim() || '';
  return /^[1-9]\d*$/.test(legacyId) && Number.isSafeInteger(Number(legacyId)) ? legacyId : '';
}

/** Administrative access is explicit and never inferred from a client-supplied ID. */
export function isAdminTelegramId(id: unknown, configuredIds = configuredAdminTelegramIds()): boolean {
  if (!Number.isSafeInteger(id) || Number(id) <= 0) return false;
  return configuredIds.split(',').map(value => value.trim()).filter(value => /^[1-9]\d*$/.test(value)).some(value => value === String(id));
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.telegramUser) { res.status(401).json({ error: 'Authentication required' }); return; }
  if (!isAdminTelegramId(req.telegramUser.id)) { res.status(403).json({ error: 'Administrator access required' }); return; }
  next();
}

export function isSelfTelegramId(authenticatedId: unknown, suppliedId: unknown): boolean {
  return Number.isSafeInteger(authenticatedId) && Number(authenticatedId) > 0 &&
    /^(?:[1-9]\d*)$/.test(String(suppliedId)) && String(authenticatedId) === String(suppliedId);
}

/** Deterministic fallback permits provisioning without storing another secret. */
export function telegramWebhookSecret(botToken = process.env.TELEGRAM_BOT_TOKEN || ''): string {
  if (!isUsableBotCredential(botToken)) return '';
  const configured = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (configured !== undefined) return /^[A-Za-z0-9_-]{32,256}$/.test(configured) ? configured : '';
  return botToken ? crypto.createHmac('sha256', botToken).update('web4tg-telegram-webhook-v1').digest('hex') : '';
}

export function isValidTelegramWebhookSecret(supplied: unknown, expected = telegramWebhookSecret()): boolean {
  if (typeof supplied !== 'string' || !/^[A-Za-z0-9_-]{32,256}$/.test(expected) || supplied.length > 256) return false;
  const left = Buffer.from(supplied);
  const right = Buffer.from(expected);
  return left.length === right.length && crypto.timingSafeEqual(left, right);
}

export function verifyTelegramWebhook(req: Request, res: Response, next: NextFunction): void {
  if (!telegramWebhookSecret()) { res.status(503).json({ error: 'Webhook not configured' }); return; }
  if (!isValidTelegramWebhookSecret(req.headers['x-telegram-bot-api-secret-token'])) {
    res.status(403).json({ error: 'Invalid webhook authentication' }); return;
  }
  next();
}

export function hasAllowedMediaSignature(mimeType: string, bytes: Buffer): boolean {
  if (mimeType === 'image/jpeg') return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (mimeType === 'image/png') return bytes.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (mimeType === 'image/webp') return bytes.length >= 12 && bytes.toString('ascii', 0, 4) === 'RIFF' && bytes.toString('ascii', 8, 12) === 'WEBP';
  if (mimeType === 'image/gif') return ['GIF87a', 'GIF89a'].includes(bytes.toString('ascii', 0, 6));
  if (mimeType === 'video/mp4') return bytes.length >= 12 && bytes.toString('ascii', 4, 8) === 'ftyp';
  if (mimeType === 'video/webm') return bytes.length >= 4 && bytes.subarray(0, 4).equals(Buffer.from([0x1a,0x45,0xdf,0xa3]));
  return false;
}
