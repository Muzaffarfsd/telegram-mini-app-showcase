import { Redis } from '@upstash/redis';
import type { Request, Response, NextFunction } from 'express';
import { getRedis } from './redis';

// ============================================================================
// ТИПЫ И ИНТЕРФЕЙСЫ
// ============================================================================

interface RateLimitConfig {
  windowMs: number;        // Окно в миллисекундах (60000 = 1 минута)
  maxRequests: number;     // Максимум запросов в окне
  keyPrefix?: string;      // Префикс в Redis для разных лимитов
}

interface RateLimitResult {
  allowed: boolean;        // Разрешён ли запрос
  remaining: number;       // Сколько запросов осталось
  resetTime: number;       // Когда сбросится лимит (timestamp)
  totalRequests: number;   // Сколько запросов уже сделано
  flagged?: boolean;       // Обнаружена аномалия
}

interface AnomalyData {
  requestCount: number;
  lastRequestTime: number;
  burstCount: number;
  flagged: boolean;
}

// ============================================================================
// TELEGRAM RATE LIMITER
// Использует Redis Sorted Set для sliding window algorithm
// ============================================================================

export class TelegramRateLimiter {
  private redis: Redis;
  private config: Required<RateLimitConfig>;

  constructor(redis: Redis, config: RateLimitConfig) {
    this.redis = redis;
    this.config = {
      keyPrefix: 'ratelimit:',
      ...config,
    };
  }

  /**
   * Проверяет лимит для идентификатора (Telegram ID или IP)
   * 
   * Использует Redis Sorted Set для точного sliding window:
   * - Каждый запрос записывается с timestamp как score
   * - Удаляются записи вне текущего окна
   * - Считаем сколько записей осталось
   * 
   * @param identifier - Telegram ID пользователя или IP
   * @returns Результат проверки лимита
   */
  async checkLimit(identifier: string | number): Promise<RateLimitResult> {
    const key = `${this.config.keyPrefix}${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Pipeline для атомарного выполнения всех операций
    const pipeline = this.redis.pipeline();
    
    // 1. Удаляем старые записи (вне текущего окна)
    pipeline.zremrangebyscore(key, 0, windowStart);
    
    // 2. Добавляем текущий запрос с уникальным ID
    //    Уникальный ID нужен чтобы несколько запросов в одну миллисекунду не перезаписали друг друга
    pipeline.zadd(key, { 
      score: now, 
      member: `${now}-${Math.random().toString(36).slice(2, 9)}` 
    });
    
    // 3. Считаем количество запросов в окне
    pipeline.zcard(key);
    
    // 4. Устанавливаем TTL чтобы ключ автоматически удалился
    pipeline.pexpire(key, this.config.windowMs);

    const results = await pipeline.exec();
    const count = results[2] as number;

    // Проверяем на аномальное поведение (burst, скрипты)
    const anomalyResult = await this.checkAnomaly(identifier, count);

    return {
      allowed: count <= this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - count),
      resetTime: now + this.config.windowMs,
      totalRequests: count,
      flagged: anomalyResult.flagged,
    };
  }

  /**
   * Детекция аномального поведения:
   * - Burst: много запросов за короткое время (< 100ms между запросами)
   * - Скрипты: высокая частота запросов в течение длительного времени
   * - Приближение к лимиту: использование > 90% лимита
   */
  private async checkAnomaly(
    identifier: string | number, 
    currentCount: number
  ): Promise<{ flagged: boolean }> {
    const anomalyKey = `anomaly:${identifier}`;
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
      
      // Детекция burst: запросы чаще чем раз в 100ms
      if (timeSinceLastRequest < 100) {
        data.burstCount += 1;
      } else if (timeSinceLastRequest > 5000) {
        // Если прошло больше 5 секунд — уменьшаем счётчик burst
        data.burstCount = Math.max(0, data.burstCount - 1);
      }

      data.requestCount += 1;
      data.lastRequestTime = now;

      // Условия для флага аномалии:
      const shouldFlag = 
        data.burstCount > 20 ||                              // 20+ burst запросов
        currentCount > this.config.maxRequests * 0.9 ||      // > 90% лимита
        (data.requestCount > 500 && timeSinceLastRequest < 50); // 500+ запросов с <50ms интервалом

      if (shouldFlag && !data.flagged) {
        data.flagged = true;
        console.warn(`[RateLimiter] Anomaly detected for ${identifier}:`, {
          burstCount: data.burstCount,
          requestCount: data.requestCount,
          timeSinceLastRequest,
          currentWindowCount: currentCount,
          maxRequests: this.config.maxRequests,
        });
      }

      // Сохраняем данные аномалии на 1 час
      await this.redis.set(anomalyKey, data, { ex: 3600 });

      return { flagged: data.flagged };
    } catch (error) {
      console.error('[RateLimiter] Anomaly check error:', error);
      return { flagged: false };
    }
  }

  /**
   * Сбрасывает флаг аномалии для пользователя
   * Используется когда администратор проверил пользователя
   */
  async resetAnomaly(identifier: string | number): Promise<void> {
    const anomalyKey = `anomaly:${identifier}`;
    await this.redis.del(anomalyKey);
  }

  /**
   * Возвращает конфигурацию лимитера
   */
  getConfig(): Required<RateLimitConfig> {
    return this.config;
  }
}

// ============================================================================
// ТИРЫ ЛИМИТОВ
// Разные эндпоинты требуют разных уровней защиты
// ============================================================================

export const RateLimitTiers = {
  // Обычные запросы — 100 в минуту достаточно для активного использования
  STANDARD: {
    windowMs: 60 * 1000,      // 1 минута
    maxRequests: 100,
    keyPrefix: 'rl:std:',
  },
  
  // Чувствительные операции — 10 в минуту защищает от брутфорса
  // Платежи, реферальные коды, изменение профиля
  SENSITIVE: {
    windowMs: 60 * 1000,      // 1 минута
    maxRequests: 10,
    keyPrefix: 'rl:sens:',
  },
  
  // Аналитика — 30 в минуту (много данных, но не критично)
  ANALYTICS: {
    windowMs: 60 * 1000,      // 1 минута
    maxRequests: 30,
    keyPrefix: 'rl:analytics:',
  },
  
  // Burst protection — 10 в секунду против скриптов
  // Защита от автоматизированных атак
  BURST: {
    windowMs: 1 * 1000,       // 1 секунда
    maxRequests: 10,
    keyPrefix: 'rl:burst:',
  },
} as const;

// ============================================================================
// ИНИЦИАЛИЗАЦИЯ ЛИМИТЕРОВ
// Ленивая инициализация при первом использовании
// ============================================================================

let standardLimiter: TelegramRateLimiter | null = null;
let sensitiveLimiter: TelegramRateLimiter | null = null;
let analyticsLimiter: TelegramRateLimiter | null = null;
let burstLimiter: TelegramRateLimiter | null = null;

function initializeLimiters(): boolean {
  const redis = getRedis();
  if (!redis) {
    console.log('[RateLimiter] Redis not available - rate limiting disabled');
    return false;
  }

  standardLimiter = new TelegramRateLimiter(redis, RateLimitTiers.STANDARD);
  sensitiveLimiter = new TelegramRateLimiter(redis, RateLimitTiers.SENSITIVE);
  analyticsLimiter = new TelegramRateLimiter(redis, RateLimitTiers.ANALYTICS);
  burstLimiter = new TelegramRateLimiter(redis, RateLimitTiers.BURST);
  
  console.log('[RateLimiter] Initialized with tiers:');
  console.log('  - Standard: 100 req/min');
  console.log('  - Sensitive: 10 req/min');
  console.log('  - Analytics: 30 req/min');
  console.log('  - Burst: 10 req/sec');
  
  return true;
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
    case 'BURST':
      return burstLimiter;
    default:
      return standardLimiter;
  }
}

// ============================================================================
// MIDDLEWARE FACTORY
// Создаёт Express middleware для разных тиров
// ============================================================================

/**
 * Создаёт middleware для rate limiting
 * 
 * @param limiter - Инстанс TelegramRateLimiter
 * @param tierName - Название тира для логов и заголовков
 * 
 * @example
 * app.use('/api/payment', createTelegramRateLimitMiddleware(getLimiter('SENSITIVE'), 'sensitive'));
 */
export function createTelegramRateLimitMiddleware(
  limiter: TelegramRateLimiter | null,
  tierName: string = 'standard'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Если Redis недоступен — пропускаем (fail-open)
    // Лучше пропустить лишний запрос чем заблокировать всех пользователей
    if (!limiter) {
      return next();
    }

    try {
      // Используем Telegram ID если авторизован, иначе IP
      // Telegram ID лучше — один человек = один лимит независимо от IP/VPN
      const telegramId = (req as any).telegramUser?.id;
      const identifier = telegramId || req.ip || 'anonymous';
      
      const result = await limiter.checkLimit(identifier);
      const config = limiter.getConfig();

      // Устанавливаем информативные заголовки
      // Клиент видит сколько запросов осталось и когда сбросится
      res.setHeader('X-RateLimit-Limit', config.maxRequests);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
      res.setHeader('X-RateLimit-Tier', tierName);

      // Предупреждение если обнаружена аномалия
      if (result.flagged) {
        res.setHeader('X-RateLimit-Warning', 'anomaly-detected');
        console.warn(`[RateLimiter] Flagged request from ${identifier} on ${tierName} tier`);
      }

      // Превышен лимит — возвращаем 429
      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
        res.setHeader('Retry-After', retryAfter);
        
        return res.status(429).json({
          code: 'RATE_LIMITED',
          message: 'Слишком много запросов. Подождите.',
          tier: tierName,
          retryAfter,
          resetTime: result.resetTime,
        });
      }

      next();
    } catch (error) {
      // ВАЖНО: При ошибке Redis — пропускаем (fail-open)
      // Лучше пропустить лишний запрос чем заблокировать всех
      console.error('[RateLimiter] Middleware error:', error);
      next();
    }
  };
}

// ============================================================================
// ГОТОВЫЕ MIDDLEWARE ДЛЯ РАЗНЫХ ТИРОВ
// ============================================================================

/** Standard: 100 запросов в минуту */
export function createStandardRateLimitMiddleware() {
  return createTelegramRateLimitMiddleware(getLimiter('STANDARD'), 'standard');
}

/** Sensitive: 10 запросов в минуту (платежи, реферальные коды) */
export function createSensitiveRateLimitMiddleware() {
  return createTelegramRateLimitMiddleware(getLimiter('SENSITIVE'), 'sensitive');
}

/** Analytics: 30 запросов в минуту */
export function createAnalyticsRateLimitMiddleware() {
  return createTelegramRateLimitMiddleware(getLimiter('ANALYTICS'), 'analytics');
}

/** Burst: 10 запросов в секунду (защита от скриптов) */
export function createBurstRateLimitMiddleware() {
  return createTelegramRateLimitMiddleware(getLimiter('BURST'), 'burst');
}

// ============================================================================
// УТИЛИТЫ
// ============================================================================

/**
 * Получает статус rate limit для пользователя по всем тирам
 * Полезно для отладки и мониторинга
 */
export async function getRateLimitStatus(telegramId: string | number): Promise<{
  standard: RateLimitResult | null;
  sensitive: RateLimitResult | null;
  analytics: RateLimitResult | null;
  burst: RateLimitResult | null;
}> {
  const [standard, sensitive, analytics, burst] = await Promise.all([
    standardLimiter?.checkLimit(telegramId) ?? null,
    sensitiveLimiter?.checkLimit(telegramId) ?? null,
    analyticsLimiter?.checkLimit(telegramId) ?? null,
    burstLimiter?.checkLimit(telegramId) ?? null,
  ]);

  return { standard, sensitive, analytics, burst };
}

/**
 * Проверяет доступность Redis для rate limiting
 */
export function isRateLimitingEnabled(): boolean {
  return standardLimiter !== null;
}
