import * as crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
}

export interface ParsedInitData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  query_id?: string;
  chat_type?: string;
  chat_instance?: string;
  start_param?: string;
}

export interface TelegramAuthRequest extends Request {
  telegramUser?: TelegramUser;
  telegramAuthDate?: number;
  telegramQueryId?: string;
}

export interface ValidationOptions {
  maxAuthAge?: number;
  allowMissingUser?: boolean;
}

const DEFAULT_MAX_AUTH_AGE = 86400;

export class TelegramAuthError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number = 401) {
    super(message);
    this.name = 'TelegramAuthError';
    this.code = code;
    this.statusCode = statusCode;
  }
}

export function validateTelegramInitData(
  initData: string,
  botToken: string,
  options: ValidationOptions = {}
): ParsedInitData | null {
  const { maxAuthAge = DEFAULT_MAX_AUTH_AGE, allowMissingUser = false } = options;

  if (!initData || typeof initData !== 'string') {
    return null;
  }

  if (!botToken || typeof botToken !== 'string') {
    console.error('TelegramAuth: Bot token is missing or invalid');
    return null;
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');

    if (!hash) {
      return null;
    }

    params.delete('hash');

    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();

    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');

    if (!crypto.timingSafeEqual(
      Buffer.from(calculatedHash, 'hex'),
      Buffer.from(hash, 'hex')
    )) {
      return null;
    }

    const authDateStr = params.get('auth_date');
    if (!authDateStr) {
      return null;
    }

    const authDate = parseInt(authDateStr, 10);
    if (isNaN(authDate) || authDate <= 0) {
      return null;
    }

    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > maxAuthAge) {
      return null;
    }

    const userStr = params.get('user');
    let user: TelegramUser | undefined;

    if (userStr) {
      try {
        user = JSON.parse(userStr) as TelegramUser;
        if (!user.id || typeof user.id !== 'number') {
          return null;
        }
      } catch {
        return null;
      }
    } else if (!allowMissingUser) {
      return null;
    }

    return {
      user,
      auth_date: authDate,
      hash,
      query_id: params.get('query_id') || undefined,
      chat_type: params.get('chat_type') || undefined,
      chat_instance: params.get('chat_instance') || undefined,
      start_param: params.get('start_param') || undefined,
    };
  } catch (error) {
    console.error('TelegramAuth: Error validating initData:', error);
    return null;
  }
}

export function validateTelegramInitDataOrThrow(
  initData: string,
  botToken: string,
  options: ValidationOptions = {}
): ParsedInitData {
  if (!initData || typeof initData !== 'string') {
    throw new TelegramAuthError('Missing Telegram init data', 'MISSING_INIT_DATA');
  }

  if (!botToken || typeof botToken !== 'string') {
    throw new TelegramAuthError(
      'Telegram bot not configured',
      'BOT_NOT_CONFIGURED',
      503
    );
  }

  const result = validateTelegramInitData(initData, botToken, options);

  if (!result) {
    throw new TelegramAuthError(
      'Invalid Telegram authentication',
      'INVALID_AUTH'
    );
  }

  return result;
}

export function telegramAuthMiddleware(
  botToken?: string,
  options: ValidationOptions = {}
) {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;

  return (req: TelegramAuthRequest, res: Response, next: NextFunction) => {
    if (!token) {
      return res.status(503).json({
        error: 'Telegram bot not configured',
        code: 'BOT_NOT_CONFIGURED',
      });
    }

    const initData =
      (req.headers['x-telegram-init-data'] as string) ||
      (req.body?.initData as string) ||
      (req.query?.initData as string);

    if (!initData) {
      return res.status(401).json({
        error: 'Missing Telegram init data',
        code: 'MISSING_INIT_DATA',
      });
    }

    const validated = validateTelegramInitData(initData, token, options);

    if (!validated) {
      return res.status(401).json({
        error: 'Invalid Telegram authentication',
        code: 'INVALID_AUTH',
      });
    }

    req.telegramUser = validated.user;
    req.telegramAuthDate = validated.auth_date;
    req.telegramQueryId = validated.query_id;

    next();
  };
}

export function optionalTelegramAuthMiddleware(
  botToken?: string,
  options: ValidationOptions = {}
) {
  const token = botToken || process.env.TELEGRAM_BOT_TOKEN;

  return (req: TelegramAuthRequest, res: Response, next: NextFunction) => {
    if (!token) {
      return next();
    }

    const initData =
      (req.headers['x-telegram-init-data'] as string) ||
      (req.body?.initData as string) ||
      (req.query?.initData as string);

    if (!initData) {
      return next();
    }

    const validated = validateTelegramInitData(initData, token, options);

    if (validated) {
      req.telegramUser = validated.user;
      req.telegramAuthDate = validated.auth_date;
      req.telegramQueryId = validated.query_id;
    }

    next();
  };
}

export function requireTelegramUser(
  req: TelegramAuthRequest,
  res: Response,
  next: NextFunction
) {
  if (!req.telegramUser) {
    return res.status(401).json({
      error: 'Telegram user required',
      code: 'USER_REQUIRED',
    });
  }
  next();
}

export function getBotToken(): string | undefined {
  return process.env.TELEGRAM_BOT_TOKEN;
}

export function isTelegramAuthenticated(req: TelegramAuthRequest): boolean {
  return !!req.telegramUser;
}
