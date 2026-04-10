import type { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { z } from 'zod';
import { getCached, setCache } from '../redis';
import {
  validateTelegramInitData,
} from '../telegramAuth';
import type { TelegramUserData } from '../types/api';
import Stripe from 'stripe';

const XSS_SANITIZE_FIELDS = new Set(['text', 'comment', 'message', 'description', 'bio', 'content']);

export function sanitizeHtmlString(input: string): string {
  if (typeof input !== 'string') return input;
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

export function sanitizeUserInput(obj: unknown, parentKey?: string): unknown {
  if (typeof obj === 'string') {
    if (parentKey && XSS_SANITIZE_FIELDS.has(parentKey.toLowerCase())) {
      return sanitizeHtmlString(obj);
    }
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeUserInput(item, parentKey));
  }
  if (obj && typeof obj === 'object') {
    const sanitized: Record<string, unknown> = {};
    for (const key of Object.keys(obj)) {
      sanitized[key] = sanitizeUserInput((obj as Record<string, unknown>)[key], key);
    }
    return sanitized;
  }
  return obj;
}

export function sanitizeBodyMiddleware(req: Request, res: Response, next: NextFunction) {
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeUserInput(req.body);
  }
  next();
}

export async function generateCSRFToken(sessionId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString('hex');
  const key = `csrf:${sessionId}`;
  await setCache(key, token, 3600);
  return token;
}

export function validateCSRF(req: Request, res: Response, next: NextFunction) {
  const excludedPaths = [
    '/telegram/webhook',
    '/vitals',
    '/stripe/webhook',
    '/analytics',
    '/error',
    '/user-action',
    '/webhooks',
    '/ai/chat',
    '/ai/tts',
    '/ai/voices',
    '/ai/followup',
  ];
  
  if (excludedPaths.some(path => req.path.startsWith(path))) {
    return next();
  }
  
  if (!['POST', 'PATCH', 'DELETE', 'PUT'].includes(req.method)) {
    return next();
  }
  
  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionId = req.headers['x-telegram-init-data'] as string || req.ip || 'anonymous';
  
  if (!csrfToken) {
    return res.status(403).json({ error: 'Missing CSRF token' });
  }
  
  (async () => {
    const key = `csrf:${sessionId}`;
    const storedToken = await getCached(key);
    
    if (!storedToken || storedToken !== csrfToken) {
      return res.status(403).json({ error: 'Invalid or expired CSRF token' });
    }
    
    next();
  })().catch(err => {
    console.error('CSRF validation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  });
}

export function verifyTelegramUser(req: Request, res: Response, next: NextFunction): void {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  if (!botToken) {
    res.status(503).json({ error: 'Telegram bot not configured' });
    return;
  }

  const initData = (req.headers['x-telegram-init-data'] as string) || req.body?.initData;
  if (!initData) {
    res.status(401).json({ error: 'Missing Telegram init data' });
    return;
  }

  const validated = validateTelegramInitData(initData, botToken);
  if (!validated || !validated.user) {
    res.status(401).json({ error: 'Invalid Telegram init data' });
    return;
  }

  req.telegramUser = validated.user as TelegramUserData;
  req.telegramAuthDate = validated.auth_date;
  next();
}

export let stripeClient: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY);
}

export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

export const MAX_FILE_SIZE = 5 * 1024 * 1024;
export const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const referralApplySchema = z.object({
  referralCode: z.string().min(1),
  userId: z.number().optional(),
});

export const awardXpSchema = z.object({
  telegramId: z.number(),
  xpAmount: z.number(),
  action: z.string(),
});

export const uploadUrlSchema = z.object({
  fileSize: z.number().optional(),
  fileType: z.string().optional(),
});

export const notificationSendSchema = z.object({
  chatId: z.number(),
  message: z.string().min(1).max(4096),
  parseMode: z.enum(['HTML', 'Markdown', 'MarkdownV2']).optional().default('HTML'),
});

export const notificationBroadcastSchema = z.object({
  userIds: z.array(z.number()).min(1).max(100),
  message: z.string().min(1).max(4096),
  parseMode: z.enum(['HTML', 'Markdown', 'MarkdownV2']).optional().default('HTML'),
});

export const notificationInteractiveSchema = z.object({
  chatId: z.number(),
  message: z.string().min(1).max(4096),
  buttons: z.array(z.array(z.object({
    text: z.string().min(1).max(64),
    url: z.string().url().optional(),
    callback_data: z.string().max(64).optional(),
  }))).optional(),
  parseMode: z.enum(['HTML', 'Markdown', 'MarkdownV2']).optional().default('HTML'),
});

export const tasksStartSchema = z.object({
  task_id: z.string().min(1),
  platform: z.string().max(50).optional(),
  task_type: z.string().max(50).optional(),
  coins_reward: z.number().min(0).max(1000).optional(),
});

export const tasksVerifySchema = z.object({
  task_id: z.string().min(1),
});

export function generateReferralCode(): string {
  return 'WEB4TG' + Math.random().toString(36).substring(2, 8).toUpperCase();
}

export function calculateTier(totalReferrals: number): string {
  if (totalReferrals >= 100) return 'Platinum';
  if (totalReferrals >= 30) return 'Gold';
  if (totalReferrals >= 10) return 'Silver';
  return 'Bronze';
}

export function calculateXpToNextLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1));
}
