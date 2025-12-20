import { Redis } from '@upstash/redis';
import type { Request, Response, NextFunction } from 'express';
import { getRedis } from './redis';

interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyPrefix?: string;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  flagged?: boolean;
}

interface AnomalyData {
  requestCount: number;
  lastRequestTime: number;
  burstCount: number;
  flagged: boolean;
}

export class TelegramRateLimiter {
  private redis: Redis;
  private config: RateLimitConfig;

  constructor(redis: Redis, config: RateLimitConfig) {
    this.redis = redis;
    this.config = {
      keyPrefix: 'ratelimit:',
      ...config,
    };
  }

  async checkLimit(telegramId: string | number): Promise<RateLimitResult> {
    const key = `${this.config.keyPrefix}${telegramId}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    const pipeline = this.redis.pipeline();
    pipeline.zremrangebyscore(key, 0, windowStart);
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random().toString(36).slice(2, 8)}` });
    pipeline.zcard(key);
    pipeline.pexpire(key, this.config.windowMs);

    const results = await pipeline.exec();
    const count = results[2] as number;

    const anomalyResult = await this.checkAnomaly(telegramId, count);

    return {
      allowed: count <= this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - count),
      resetTime: now + this.config.windowMs,
      flagged: anomalyResult.flagged,
    };
  }

  private async checkAnomaly(telegramId: string | number, currentCount: number): Promise<{ flagged: boolean }> {
    const anomalyKey = `anomaly:${telegramId}`;
    const now = Date.now();

    try {
      const existing = await this.redis.get<AnomalyData>(anomalyKey);
      
      let data: AnomalyData = existing || {
        requestCount: 0,
        lastRequestTime: now,
        burstCount: 0,
        flagged: false,
      };

      const timeSinceLastRequest = now - data.lastRequestTime;
      
      if (timeSinceLastRequest < 100) {
        data.burstCount += 1;
      } else if (timeSinceLastRequest > 5000) {
        data.burstCount = Math.max(0, data.burstCount - 1);
      }

      data.requestCount += 1;
      data.lastRequestTime = now;

      const shouldFlag = 
        data.burstCount > 20 ||
        currentCount > this.config.maxRequests * 0.9 ||
        (data.requestCount > 500 && timeSinceLastRequest < 50);

      if (shouldFlag && !data.flagged) {
        data.flagged = true;
        console.warn(`[RateLimiter] Anomaly detected for Telegram ID ${telegramId}:`, {
          burstCount: data.burstCount,
          requestCount: data.requestCount,
          timeSinceLastRequest,
          currentWindowCount: currentCount,
        });
      }

      await this.redis.set(anomalyKey, data, { ex: 3600 });

      return { flagged: data.flagged };
    } catch (error) {
      console.error('[RateLimiter] Anomaly check error:', error);
      return { flagged: false };
    }
  }

  async resetAnomaly(telegramId: string | number): Promise<void> {
    const anomalyKey = `anomaly:${telegramId}`;
    await this.redis.del(anomalyKey);
  }
}

export const RateLimitTiers = {
  STANDARD: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    keyPrefix: 'ratelimit:standard:',
  },
  SENSITIVE: {
    windowMs: 60 * 1000,
    maxRequests: 10,
    keyPrefix: 'ratelimit:sensitive:',
  },
  ANALYTICS: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    keyPrefix: 'ratelimit:analytics:',
  },
} as const;

let standardLimiter: TelegramRateLimiter | null = null;
let sensitiveLimiter: TelegramRateLimiter | null = null;
let analyticsLimiter: TelegramRateLimiter | null = null;

function initializeLimiters(): void {
  const redis = getRedis();
  if (!redis) {
    console.log('[RateLimiter] Redis not available - rate limiting disabled');
    return;
  }

  standardLimiter = new TelegramRateLimiter(redis, RateLimitTiers.STANDARD);
  sensitiveLimiter = new TelegramRateLimiter(redis, RateLimitTiers.SENSITIVE);
  analyticsLimiter = new TelegramRateLimiter(redis, RateLimitTiers.ANALYTICS);
  
  console.log('[RateLimiter] Initialized with tiers: Standard (100/min), Sensitive (10/min), Analytics (30/min)');
}

export function getLimiter(tier: keyof typeof RateLimitTiers): TelegramRateLimiter | null {
  if (!standardLimiter) {
    initializeLimiters();
  }

  switch (tier) {
    case 'STANDARD':
      return standardLimiter;
    case 'SENSITIVE':
      return sensitiveLimiter;
    case 'ANALYTICS':
      return analyticsLimiter;
    default:
      return standardLimiter;
  }
}

export function createTelegramRateLimitMiddleware(
  limiter: TelegramRateLimiter | null,
  tier: string = 'standard'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!limiter) {
      return next();
    }

    try {
      const telegramId = (req as any).telegramUser?.id || req.ip || 'anonymous';
      const result = await limiter.checkLimit(telegramId);

      res.setHeader('X-RateLimit-Limit', result.remaining + (result.allowed ? 1 : 0));
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', result.resetTime);
      res.setHeader('X-RateLimit-Tier', tier);

      if (result.flagged) {
        res.setHeader('X-RateLimit-Warning', 'anomaly-detected');
        console.warn(`[RateLimiter] Flagged request from ${telegramId} on ${tier} tier`);
      }

      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
        res.setHeader('Retry-After', retryAfter);
        
        return res.status(429).json({
          error: 'Rate limit exceeded',
          code: 'RATE_LIMITED',
          tier,
          retryAfter,
          resetTime: result.resetTime,
        });
      }

      next();
    } catch (error) {
      console.error('[RateLimiter] Middleware error:', error);
      next();
    }
  };
}

export function createStandardRateLimitMiddleware() {
  return createTelegramRateLimitMiddleware(getLimiter('STANDARD'), 'standard');
}

export function createSensitiveRateLimitMiddleware() {
  return createTelegramRateLimitMiddleware(getLimiter('SENSITIVE'), 'sensitive');
}

export function createAnalyticsRateLimitMiddleware() {
  return createTelegramRateLimitMiddleware(getLimiter('ANALYTICS'), 'analytics');
}

export async function getRateLimitStatus(telegramId: string | number): Promise<{
  standard: RateLimitResult | null;
  sensitive: RateLimitResult | null;
  analytics: RateLimitResult | null;
}> {
  const [standard, sensitive, analytics] = await Promise.all([
    standardLimiter?.checkLimit(telegramId) ?? null,
    sensitiveLimiter?.checkLimit(telegramId) ?? null,
    analyticsLimiter?.checkLimit(telegramId) ?? null,
  ]);

  return { standard, sensitive, analytics };
}
