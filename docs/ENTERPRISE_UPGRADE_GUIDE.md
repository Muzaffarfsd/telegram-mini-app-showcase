# Enterprise Upgrade Guide 2025-2026

Полное руководство по улучшению Telegram Mini App до enterprise-уровня.

---

## Содержание

1. [Безопасность](#1-безопасность)
2. [Производительность](#2-производительность)
3. [Offline & PWA](#3-offline--pwa)
4. [Аналитика & A/B тесты](#4-аналитика--ab-тесты)
5. [Gamification Engine](#5-gamification-engine)
6. [AI Integration](#6-ai-integration)
7. [Мобильная оптимизация](#7-мобильная-оптимизация)
8. [CI/CD Pipeline](#8-cicd-pipeline)
9. [Архитектура](#9-архитектура)
10. [Мониторинг](#10-мониторинг)

---

## 1. Безопасность

### 1.1 Telegram initData Validation

**Зачем:** Проверка подлинности пользователя через криптографическую подпись Telegram.

**Файл:** `server/telegramAuth.ts`

```typescript
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// Типы
interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
  is_premium?: boolean;
}

interface ParsedInitData {
  user?: TelegramUser;
  auth_date: number;
  hash: string;
  query_id?: string;
  chat_type?: string;
  start_param?: string;
}

// Валидация HMAC-SHA256
export function validateTelegramInitData(
  initData: string, 
  botToken: string,
  maxAgeSeconds: number = 86400 // 24 часа
): ParsedInitData | null {
  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;
    
    // Удаляем hash для проверки
    params.delete('hash');
    
    // Сортируем и создаём data-check-string
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Создаём secret key
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Вычисляем hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // Timing-safe сравнение (защита от timing attacks)
    const hashBuffer = Buffer.from(hash, 'hex');
    const calculatedBuffer = Buffer.from(calculatedHash, 'hex');
    
    if (hashBuffer.length !== calculatedBuffer.length) return null;
    if (!crypto.timingSafeEqual(hashBuffer, calculatedBuffer)) return null;
    
    // Проверяем возраст auth_date
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > maxAgeSeconds) return null;
    
    // Парсим user
    const userStr = params.get('user');
    const user = userStr ? JSON.parse(userStr) : undefined;
    
    return {
      user,
      auth_date: authDate,
      hash,
      query_id: params.get('query_id') || undefined,
      chat_type: params.get('chat_type') || undefined,
      start_param: params.get('start_param') || undefined,
    };
  } catch {
    return null;
  }
}

// Middleware
export function telegramAuthMiddleware(botToken: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const initData = req.headers['x-telegram-init-data'] as string;
    
    if (!initData) {
      return res.status(401).json({ 
        code: 'UNAUTHORIZED',
        message: 'Missing Telegram authentication' 
      });
    }
    
    const validated = validateTelegramInitData(initData, botToken);
    if (!validated) {
      return res.status(401).json({ 
        code: 'UNAUTHORIZED',
        message: 'Invalid Telegram authentication' 
      });
    }
    
    // Прикрепляем к request
    (req as any).telegramUser = validated.user;
    (req as any).telegramAuthDate = validated.auth_date;
    
    next();
  };
}

// Опциональная аутентификация (для публичных эндпоинтов)
export function optionalTelegramAuth(botToken: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const initData = req.headers['x-telegram-init-data'] as string;
    
    if (initData) {
      const validated = validateTelegramInitData(initData, botToken);
      if (validated?.user) {
        (req as any).telegramUser = validated.user;
      }
    }
    
    next();
  };
}
```

**Использование в routes.ts:**

```typescript
import { telegramAuthMiddleware, optionalTelegramAuth } from './telegramAuth';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

// Защищённые эндпоинты
app.use('/api/user', telegramAuthMiddleware(BOT_TOKEN));
app.use('/api/referral', telegramAuthMiddleware(BOT_TOKEN));
app.use('/api/gamification', telegramAuthMiddleware(BOT_TOKEN));

// Публичные с опциональной авторизацией
app.use('/api/demos', optionalTelegramAuth(BOT_TOKEN));
```

---

### 1.2 Enhanced Rate Limiting per Telegram ID

**Файл:** `server/rateLimiter.ts`

```typescript
import { Redis } from '@upstash/redis';
import { Request, Response, NextFunction } from 'express';

interface RateLimitConfig {
  windowMs: number;        // Окно в миллисекундах
  maxRequests: number;     // Максимум запросов
  keyPrefix?: string;      // Префикс ключа в Redis
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  totalRequests: number;
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
  
  async checkLimit(identifier: string | number): Promise<RateLimitResult> {
    const key = `${this.config.keyPrefix}${identifier}`;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // Sliding window через Redis sorted set
    const pipeline = this.redis.pipeline();
    
    // Удаляем старые записи
    pipeline.zremrangebyscore(key, 0, windowStart);
    // Добавляем текущий запрос
    pipeline.zadd(key, { score: now, member: `${now}-${Math.random()}` });
    // Считаем количество
    pipeline.zcard(key);
    // Устанавливаем TTL
    pipeline.pexpire(key, this.config.windowMs);
    
    const results = await pipeline.exec();
    const count = results[2] as number;
    
    return {
      allowed: count <= this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - count),
      resetTime: now + this.config.windowMs,
      totalRequests: count,
    };
  }
}

// Тиры лимитов
export const RATE_LIMIT_TIERS = {
  standard: { windowMs: 60_000, maxRequests: 100 },   // 100/мин
  sensitive: { windowMs: 60_000, maxRequests: 10 },   // 10/мин
  analytics: { windowMs: 60_000, maxRequests: 30 },   // 30/мин
  burst: { windowMs: 1_000, maxRequests: 10 },        // 10/сек
} as const;

// Middleware factory
export function createRateLimitMiddleware(
  limiter: TelegramRateLimiter,
  tierName: string = 'standard'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Используем Telegram ID или IP
      const telegramId = (req as any).telegramUser?.id;
      const identifier = telegramId || req.ip || 'anonymous';
      
      const result = await limiter.checkLimit(identifier);
      
      // Устанавливаем заголовки
      res.setHeader('X-RateLimit-Limit', limiter['config'].maxRequests);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
      res.setHeader('X-RateLimit-Tier', tierName);
      
      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
        res.setHeader('Retry-After', retryAfter);
        
        return res.status(429).json({
          code: 'RATE_LIMITED',
          message: 'Too many requests',
          retryAfter,
        });
      }
      
      next();
    } catch (error) {
      // При ошибке Redis - пропускаем (fail-open)
      console.error('Rate limit error:', error);
      next();
    }
  };
}
```

**Anomaly Detection (опционально):**

```typescript
interface AnomalyData {
  burstCount: number;      // Количество burst-запросов
  lastRequestTime: number;
  flagged: boolean;
}

export class AnomalyDetector {
  private redis: Redis;
  private readonly BURST_THRESHOLD_MS = 100;  // <100ms между запросами
  private readonly BURST_LIMIT = 5;           // 5 burst = флаг
  
  constructor(redis: Redis) {
    this.redis = redis;
  }
  
  async checkAnomaly(telegramId: number): Promise<boolean> {
    const key = `anomaly:${telegramId}`;
    const now = Date.now();
    
    const data = await this.redis.get<AnomalyData>(key);
    
    if (!data) {
      await this.redis.set(key, {
        burstCount: 0,
        lastRequestTime: now,
        flagged: false,
      }, { ex: 3600 }); // 1 час
      return false;
    }
    
    const timeDiff = now - data.lastRequestTime;
    let newBurstCount = data.burstCount;
    
    if (timeDiff < this.BURST_THRESHOLD_MS) {
      newBurstCount++;
    } else {
      newBurstCount = Math.max(0, newBurstCount - 1);
    }
    
    const flagged = newBurstCount >= this.BURST_LIMIT;
    
    await this.redis.set(key, {
      burstCount: newBurstCount,
      lastRequestTime: now,
      flagged,
    }, { ex: 3600 });
    
    if (flagged) {
      console.warn(`[Anomaly] User ${telegramId} flagged for suspicious activity`);
    }
    
    return flagged;
  }
}
```

---

### 1.3 Audit Logging

**Файл:** `server/auditLog.ts`

```typescript
import { db } from './db';
import { sql } from 'drizzle-orm';

interface AuditEntry {
  telegramId: number;
  action: string;
  resource: string;
  resourceId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

// Таблица в schema.ts
/*
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  telegramId: bigint("telegram_id", { mode: "number" }).notNull(),
  action: varchar("action", { length: 50 }).notNull(),
  resource: varchar("resource", { length: 100 }).notNull(),
  resourceId: varchar("resource_id", { length: 100 }),
  metadata: jsonb("metadata"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
*/

export async function logAudit(entry: AuditEntry): Promise<void> {
  try {
    await db.execute(sql`
      INSERT INTO audit_logs (telegram_id, action, resource, resource_id, metadata, ip_address, user_agent)
      VALUES (
        ${entry.telegramId},
        ${entry.action},
        ${entry.resource},
        ${entry.resourceId || null},
        ${entry.metadata ? JSON.stringify(entry.metadata) : null}::jsonb,
        ${entry.ipAddress || null},
        ${entry.userAgent || null}
      )
    `);
  } catch (error) {
    console.error('Audit log error:', error);
  }
}

// Middleware для автоматического логирования
export function auditMiddleware(action: string, resource: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const telegramUser = (req as any).telegramUser;
    
    if (telegramUser) {
      // Логируем после ответа
      res.on('finish', () => {
        if (res.statusCode < 400) {
          logAudit({
            telegramId: telegramUser.id,
            action,
            resource,
            resourceId: req.params.id,
            metadata: {
              method: req.method,
              path: req.path,
              statusCode: res.statusCode,
            },
            ipAddress: req.ip,
            userAgent: req.get('user-agent'),
          });
        }
      });
    }
    
    next();
  };
}
```

---

## 2. Производительность

### 2.1 Optimized Code-Splitting

**Файл:** `vite.config.ts` (обновление manualChunks)

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks(id) {
        if (!id.includes('node_modules')) return;
        
        // КРИТИЧНО: React ecosystem ВМЕСТЕ
        if (
          id.includes('react') ||
          id.includes('react-dom') ||
          id.includes('scheduler') ||
          id.includes('@tanstack/react-query') ||
          id.includes('wouter')
        ) {
          return 'react-core';
        }
        
        // UI Framework
        if (
          id.includes('@radix-ui') ||
          id.includes('lucide-react') ||
          id.includes('class-variance-authority') ||
          id.includes('clsx') ||
          id.includes('tailwind-merge')
        ) {
          return 'ui-framework';
        }
        
        // Тяжёлые визуализации (lazy load)
        if (id.includes('recharts') || id.includes('d3')) {
          return 'charts';
        }
        
        // Анимации
        if (id.includes('framer-motion')) {
          return 'animations';
        }
        
        // Swiper (тяжёлый)
        if (id.includes('swiper')) {
          return 'swiper';
        }
        
        // Утилиты
        if (
          id.includes('date-fns') ||
          id.includes('zod') ||
          id.includes('nanoid')
        ) {
          return 'utils';
        }
        
        // Telegram SDK
        if (id.includes('@twa-dev')) {
          return 'telegram';
        }
      },
    },
  },
  
  // Целевые размеры
  chunkSizeWarningLimit: 500,
  
  // Минификация
  minify: 'terser',
  terserOptions: {
    compress: {
      drop_console: true,
      drop_debugger: true,
    },
  },
},
```

### 2.2 Speculative Prefetch

**Файл:** `client/src/lib/prefetch.ts`

```typescript
// Кэш загруженных модулей
const prefetchedModules = new Set<string>();
const prefetchedRoutes = new Set<string>();

// Prefetch модуля
export function prefetchModule(moduleLoader: () => Promise<any>): void {
  const key = moduleLoader.toString();
  if (prefetchedModules.has(key)) return;
  
  prefetchedModules.add(key);
  
  // Используем requestIdleCallback для неблокирующей загрузки
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      moduleLoader().catch(() => {
        prefetchedModules.delete(key);
      });
    }, { timeout: 2000 });
  } else {
    setTimeout(() => {
      moduleLoader().catch(() => {
        prefetchedModules.delete(key);
      });
    }, 100);
  }
}

// Prefetch route (link prefetch)
export function prefetchRoute(href: string): void {
  if (prefetchedRoutes.has(href)) return;
  prefetchedRoutes.add(href);
  
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = href;
  link.as = 'document';
  document.head.appendChild(link);
}

// Prefetch on hover/touch
export function usePrefetchOnInteraction(
  ref: React.RefObject<HTMLElement>,
  loader: () => Promise<any>
): void {
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    let prefetched = false;
    
    const handleInteraction = () => {
      if (!prefetched) {
        prefetched = true;
        prefetchModule(loader);
      }
    };
    
    element.addEventListener('mouseenter', handleInteraction, { once: true });
    element.addEventListener('touchstart', handleInteraction, { once: true, passive: true });
    element.addEventListener('focus', handleInteraction, { once: true });
    
    return () => {
      element.removeEventListener('mouseenter', handleInteraction);
      element.removeEventListener('touchstart', handleInteraction);
      element.removeEventListener('focus', handleInteraction);
    };
  }, [ref, loader]);
}

// Демо-приложения prefetch map
export const DEMO_LOADERS = {
  restaurant: () => import('@/demos/RestaurantDemo'),
  fitness: () => import('@/demos/FitnessDemo'),
  ecommerce: () => import('@/demos/EcommerceDemo'),
  // ... другие демо
} as const;

// Preload критичных демо
export function preloadCriticalDemos(): void {
  // Загружаем топ-3 популярных демо
  prefetchModule(DEMO_LOADERS.restaurant);
  prefetchModule(DEMO_LOADERS.fitness);
  prefetchModule(DEMO_LOADERS.ecommerce);
}
```

### 2.3 Priority Hints

**Файл:** `client/index.html` (добавления в head)

```html
<head>
  <!-- Preconnect к критичным доменам -->
  <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  
  <!-- DNS prefetch для API -->
  <link rel="dns-prefetch" href="https://api.telegram.org">
  
  <!-- Preload критичных шрифтов -->
  <link 
    rel="preload" 
    href="/fonts/inter-var.woff2" 
    as="font" 
    type="font/woff2" 
    crossorigin
    fetchpriority="high"
  >
  
  <!-- Preload критичного CSS -->
  <link rel="preload" href="/src/index.css" as="style" fetchpriority="high">
  
  <!-- Modulepreload для критичного JS -->
  <link rel="modulepreload" href="/src/main.tsx" fetchpriority="high">
</head>
```

### 2.4 Image Optimization

**Файл:** `client/src/components/OptimizedImage.tsx`

```typescript
import { useState, useRef, useEffect } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  placeholder?: 'blur' | 'empty';
  blurDataURL?: string;
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  priority = false,
  placeholder = 'empty',
  blurDataURL,
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(priority);
  const imgRef = useRef<HTMLImageElement>(null);
  
  // Intersection Observer для lazy loading
  useEffect(() => {
    if (priority) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px' }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [priority]);
  
  // Генерация srcset для responsive images
  const generateSrcSet = (baseSrc: string): string => {
    const widths = [320, 640, 960, 1280, 1920];
    return widths
      .map(w => `${baseSrc}?w=${w} ${w}w`)
      .join(', ');
  };
  
  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Blur placeholder */}
      {placeholder === 'blur' && blurDataURL && !isLoaded && (
        <img
          src={blurDataURL}
          alt=""
          className="absolute inset-0 w-full h-full object-cover filter blur-lg scale-110"
          aria-hidden="true"
        />
      )}
      
      {/* Main image */}
      {isInView && (
        <img
          src={src}
          srcSet={generateSrcSet(src)}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding={priority ? 'sync' : 'async'}
          fetchPriority={priority ? 'high' : 'auto'}
          onLoad={() => setIsLoaded(true)}
          className={`
            w-full h-full object-cover
            transition-opacity duration-300
            ${isLoaded ? 'opacity-100' : 'opacity-0'}
          `}
        />
      )}
    </div>
  );
}
```

---

## 3. Offline & PWA

### 3.1 Service Worker с Workbox

**Файл:** `client/public/sw.js`

```javascript
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { 
  NetworkFirst, 
  CacheFirst, 
  StaleWhileRevalidate 
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Precache static assets
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// Cache names
const CACHE_NAMES = {
  static: 'static-v1',
  images: 'images-v1',
  api: 'api-v1',
  fonts: 'fonts-v1',
};

// === NAVIGATION (SPA) ===
registerRoute(
  new NavigationRoute(
    new NetworkFirst({
      cacheName: CACHE_NAMES.static,
      networkTimeoutSeconds: 3,
    })
  )
);

// === STATIC ASSETS ===
registerRoute(
  ({ request }) => 
    request.destination === 'style' ||
    request.destination === 'script',
  new StaleWhileRevalidate({
    cacheName: CACHE_NAMES.static,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 60, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// === IMAGES ===
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: CACHE_NAMES.images,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 100, maxAgeSeconds: 30 * 24 * 60 * 60 }),
    ],
  })
);

// === FONTS ===
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: CACHE_NAMES.fonts,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 20, maxAgeSeconds: 365 * 24 * 60 * 60 }),
    ],
  })
);

// === API REQUESTS ===
// GET requests - Network first with cache fallback
registerRoute(
  ({ url, request }) => 
    url.pathname.startsWith('/api/') && 
    request.method === 'GET',
  new NetworkFirst({
    cacheName: CACHE_NAMES.api,
    networkTimeoutSeconds: 5,
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 50, maxAgeSeconds: 5 * 60 }),
    ],
  })
);

// === BACKGROUND SYNC ===
const bgSyncPlugin = new BackgroundSyncPlugin('apiQueue', {
  maxRetentionTime: 24 * 60, // 24 hours
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request.clone());
        console.log('[SW] Background sync success:', entry.request.url);
      } catch (error) {
        console.error('[SW] Background sync failed:', error);
        await queue.unshiftRequest(entry);
        throw error;
      }
    }
  },
});

// POST/PUT/DELETE requests - Queue for background sync
registerRoute(
  ({ url, request }) => 
    url.pathname.startsWith('/api/') && 
    ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method),
  new NetworkFirst({
    plugins: [bgSyncPlugin],
  }),
  'POST'
);

// === OFFLINE FALLBACK ===
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAMES.static).then((cache) => {
      return cache.addAll([
        '/',
        '/offline.html',
        '/manifest.json',
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Serve offline page for failed navigations
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/offline.html');
      })
    );
  }
});
```

### 3.2 IndexedDB для Offline Data

**Файл:** `client/src/lib/offlineStorage.ts`

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface OfflineDB extends DBSchema {
  pendingActions: {
    key: string;
    value: {
      id: string;
      action: string;
      payload: any;
      timestamp: number;
      retries: number;
    };
    indexes: { 'by-timestamp': number };
  };
  cachedData: {
    key: string;
    value: {
      key: string;
      data: any;
      timestamp: number;
      expiresAt: number;
    };
  };
  userState: {
    key: string;
    value: any;
  };
}

let db: IDBPDatabase<OfflineDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<OfflineDB>> {
  if (db) return db;
  
  db = await openDB<OfflineDB>('app-offline', 1, {
    upgrade(db) {
      // Pending actions store
      const actionsStore = db.createObjectStore('pendingActions', { keyPath: 'id' });
      actionsStore.createIndex('by-timestamp', 'timestamp');
      
      // Cached data store
      db.createObjectStore('cachedData', { keyPath: 'key' });
      
      // User state store
      db.createObjectStore('userState');
    },
  });
  
  return db;
}

// === PENDING ACTIONS ===

export async function queueAction(action: string, payload: any): Promise<string> {
  const db = await getDB();
  const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  await db.put('pendingActions', {
    id,
    action,
    payload,
    timestamp: Date.now(),
    retries: 0,
  });
  
  return id;
}

export async function getPendingActions(): Promise<any[]> {
  const db = await getDB();
  return db.getAllFromIndex('pendingActions', 'by-timestamp');
}

export async function removePendingAction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('pendingActions', id);
}

export async function incrementRetry(id: string): Promise<void> {
  const db = await getDB();
  const action = await db.get('pendingActions', id);
  if (action) {
    action.retries++;
    await db.put('pendingActions', action);
  }
}

// === CACHED DATA ===

export async function setCachedData(
  key: string, 
  data: any, 
  ttlMs: number = 5 * 60 * 1000
): Promise<void> {
  const db = await getDB();
  await db.put('cachedData', {
    key,
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttlMs,
  });
}

export async function getCachedData<T>(key: string): Promise<T | null> {
  const db = await getDB();
  const cached = await db.get('cachedData', key);
  
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    await db.delete('cachedData', key);
    return null;
  }
  
  return cached.data as T;
}

// === SYNC MANAGER ===

export async function syncPendingActions(): Promise<void> {
  const actions = await getPendingActions();
  
  for (const action of actions) {
    if (action.retries >= 3) {
      console.error('[Sync] Max retries reached for action:', action.id);
      await removePendingAction(action.id);
      continue;
    }
    
    try {
      const response = await fetch(`/api/${action.action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(action.payload),
      });
      
      if (response.ok) {
        await removePendingAction(action.id);
        console.log('[Sync] Action synced:', action.id);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error('[Sync] Action failed:', action.id, error);
      await incrementRetry(action.id);
    }
  }
}

// Auto-sync when online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    console.log('[Sync] Online - syncing pending actions');
    syncPendingActions();
  });
}
```

### 3.3 Optimistic UI Hook

**Файл:** `client/src/hooks/useOptimisticMutation.ts`

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queueAction } from '@/lib/offlineStorage';

interface OptimisticConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: string[];
  optimisticUpdate: (old: TData | undefined, variables: TVariables) => TData;
  rollback?: (old: TData | undefined, variables: TVariables) => TData;
  offlineAction?: string;
}

export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  queryKey,
  optimisticUpdate,
  rollback,
  offlineAction,
}: OptimisticConfig<TData, TVariables>) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      // Если офлайн - очередь
      if (!navigator.onLine && offlineAction) {
        await queueAction(offlineAction, variables);
        return optimisticUpdate(
          queryClient.getQueryData<TData>(queryKey),
          variables
        );
      }
      
      return mutationFn(variables);
    },
    
    onMutate: async (variables: TVariables) => {
      // Отменяем текущие запросы
      await queryClient.cancelQueries({ queryKey });
      
      // Сохраняем предыдущее состояние
      const previousData = queryClient.getQueryData<TData>(queryKey);
      
      // Оптимистично обновляем
      queryClient.setQueryData<TData>(queryKey, (old) =>
        optimisticUpdate(old, variables)
      );
      
      return { previousData };
    },
    
    onError: (error, variables, context) => {
      // Откат при ошибке
      if (context?.previousData !== undefined) {
        if (rollback) {
          queryClient.setQueryData<TData>(queryKey, (old) =>
            rollback(old, variables)
          );
        } else {
          queryClient.setQueryData(queryKey, context.previousData);
        }
      }
    },
    
    onSettled: () => {
      // Инвалидируем для свежих данных
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

// Пример использования:
/*
const { mutate: addTask } = useOptimisticMutation({
  mutationFn: (task) => api.createTask(task),
  queryKey: ['tasks'],
  optimisticUpdate: (old, newTask) => [...(old || []), { ...newTask, id: 'temp' }],
  offlineAction: 'tasks/create',
});
*/
```

---

## 4. Аналитика & A/B тесты

### 4.1 Event Taxonomy

**Файл:** `shared/analytics.ts`

```typescript
// Стандартизированная схема событий
export const EVENT_CATEGORIES = {
  PAGE: 'page',
  USER: 'user',
  DEMO: 'demo',
  ENGAGEMENT: 'engagement',
  CONVERSION: 'conversion',
  ERROR: 'error',
  PERFORMANCE: 'performance',
} as const;

export const EVENT_ACTIONS = {
  // Page events
  VIEW: 'view',
  LEAVE: 'leave',
  SCROLL: 'scroll',
  
  // User events
  REGISTER: 'register',
  LOGIN: 'login',
  LOGOUT: 'logout',
  PROFILE_UPDATE: 'profile_update',
  
  // Demo events
  DEMO_START: 'demo_start',
  DEMO_COMPLETE: 'demo_complete',
  DEMO_INTERACT: 'demo_interact',
  
  // Engagement
  CLICK: 'click',
  SHARE: 'share',
  BOOKMARK: 'bookmark',
  
  // Conversion
  REFERRAL_CLICK: 'referral_click',
  REFERRAL_SIGNUP: 'referral_signup',
  PAYMENT_START: 'payment_start',
  PAYMENT_COMPLETE: 'payment_complete',
  
  // Error
  JS_ERROR: 'js_error',
  API_ERROR: 'api_error',
  
  // Performance
  FCP: 'fcp',
  LCP: 'lcp',
  FID: 'fid',
  CLS: 'cls',
  TTFB: 'ttfb',
} as const;

export interface AnalyticsEvent {
  category: typeof EVENT_CATEGORIES[keyof typeof EVENT_CATEGORIES];
  action: typeof EVENT_ACTIONS[keyof typeof EVENT_ACTIONS];
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
  timestamp: number;
  sessionId: string;
  telegramId?: number;
}

// Валидация события
export function validateEvent(event: Partial<AnalyticsEvent>): boolean {
  return !!(
    event.category &&
    event.action &&
    event.timestamp &&
    event.sessionId
  );
}
```

### 4.2 Analytics Client

**Файл:** `client/src/lib/analytics.ts`

```typescript
import { AnalyticsEvent, EVENT_CATEGORIES, EVENT_ACTIONS } from '@shared/analytics';
import { queueAction, getCachedData, setCachedData } from './offlineStorage';

// Session ID
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session', sessionId);
  }
  return sessionId;
};

// Telegram ID
const getTelegramId = (): number | undefined => {
  try {
    return window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  } catch {
    return undefined;
  }
};

// Event queue
const eventQueue: AnalyticsEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

// Track event
export function track(
  category: AnalyticsEvent['category'],
  action: AnalyticsEvent['action'],
  label?: string,
  value?: number,
  metadata?: Record<string, any>
): void {
  const event: AnalyticsEvent = {
    category,
    action,
    label,
    value,
    metadata,
    timestamp: Date.now(),
    sessionId: getSessionId(),
    telegramId: getTelegramId(),
  };
  
  eventQueue.push(event);
  
  // Debounced flush
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flushEvents, 1000);
}

// Flush events to server
async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0) return;
  
  const events = [...eventQueue];
  eventQueue.length = 0;
  
  try {
    if (navigator.onLine) {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      });
    } else {
      // Queue for background sync
      await queueAction('analytics/events', { events });
    }
  } catch (error) {
    console.error('[Analytics] Flush error:', error);
    // Re-queue events
    eventQueue.push(...events);
  }
}

// Convenience methods
export const analytics = {
  pageView: (path: string, title?: string) =>
    track(EVENT_CATEGORIES.PAGE, EVENT_ACTIONS.VIEW, path, undefined, { title }),
  
  demoStart: (demoId: string, demoName: string) =>
    track(EVENT_CATEGORIES.DEMO, EVENT_ACTIONS.DEMO_START, demoId, undefined, { demoName }),
  
  demoComplete: (demoId: string, durationMs: number) =>
    track(EVENT_CATEGORIES.DEMO, EVENT_ACTIONS.DEMO_COMPLETE, demoId, durationMs),
  
  click: (element: string, context?: Record<string, any>) =>
    track(EVENT_CATEGORIES.ENGAGEMENT, EVENT_ACTIONS.CLICK, element, undefined, context),
  
  error: (message: string, stack?: string, context?: Record<string, any>) =>
    track(EVENT_CATEGORIES.ERROR, EVENT_ACTIONS.JS_ERROR, message, undefined, { stack, ...context }),
  
  performance: (metric: string, value: number) =>
    track(EVENT_CATEGORIES.PERFORMANCE, metric as any, undefined, value),
};

// Auto-track page views
if (typeof window !== 'undefined') {
  // Initial page view
  analytics.pageView(window.location.pathname, document.title);
  
  // SPA navigation
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    analytics.pageView(window.location.pathname, document.title);
  };
  
  window.addEventListener('popstate', () => {
    analytics.pageView(window.location.pathname, document.title);
  });
}

// Auto-track Web Vitals
if (typeof window !== 'undefined') {
  import('web-vitals').then(({ onCLS, onFCP, onFID, onLCP, onTTFB }) => {
    onCLS((metric) => analytics.performance('cls', metric.value));
    onFCP((metric) => analytics.performance('fcp', metric.value));
    onFID((metric) => analytics.performance('fid', metric.value));
    onLCP((metric) => analytics.performance('lcp', metric.value));
    onTTFB((metric) => analytics.performance('ttfb', metric.value));
  });
}
```

### 4.3 A/B Testing Infrastructure

**Файл:** `client/src/lib/experiments.ts`

```typescript
import { getCachedData, setCachedData } from './offlineStorage';

interface Experiment {
  id: string;
  name: string;
  variants: string[];
  weights: number[];  // Веса вариантов (сумма = 1)
  active: boolean;
}

interface UserAssignment {
  experimentId: string;
  variant: string;
  assignedAt: number;
}

// Experiments configuration
const EXPERIMENTS: Experiment[] = [
  {
    id: 'homepage_cta',
    name: 'Homepage CTA Button',
    variants: ['control', 'variant_a', 'variant_b'],
    weights: [0.34, 0.33, 0.33],
    active: true,
  },
  {
    id: 'demo_flow',
    name: 'Demo Onboarding Flow',
    variants: ['standard', 'simplified'],
    weights: [0.5, 0.5],
    active: true,
  },
];

// Deterministic hash for user assignment
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Get user bucket (0-99)
function getUserBucket(userId: string, experimentId: string): number {
  return hashString(`${userId}:${experimentId}`) % 100;
}

// Assign variant based on weights
function assignVariant(experiment: Experiment, bucket: number): string {
  let cumulative = 0;
  for (let i = 0; i < experiment.variants.length; i++) {
    cumulative += experiment.weights[i] * 100;
    if (bucket < cumulative) {
      return experiment.variants[i];
    }
  }
  return experiment.variants[0];
}

// Get user's variant for experiment
export async function getVariant(experimentId: string): Promise<string | null> {
  const experiment = EXPERIMENTS.find(e => e.id === experimentId);
  if (!experiment || !experiment.active) return null;
  
  // Check cached assignment
  const cacheKey = `experiment:${experimentId}`;
  const cached = await getCachedData<UserAssignment>(cacheKey);
  if (cached) {
    return cached.variant;
  }
  
  // Get user ID
  const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  const userId = telegramId?.toString() || 
    localStorage.getItem('anonymous_id') ||
    `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  if (!telegramId) {
    localStorage.setItem('anonymous_id', userId);
  }
  
  // Assign variant
  const bucket = getUserBucket(userId, experimentId);
  const variant = assignVariant(experiment, bucket);
  
  // Cache assignment
  const assignment: UserAssignment = {
    experimentId,
    variant,
    assignedAt: Date.now(),
  };
  await setCachedData(cacheKey, assignment, 30 * 24 * 60 * 60 * 1000); // 30 days
  
  // Track assignment
  analytics.track('experiment', 'assign', experimentId, undefined, { variant });
  
  return variant;
}

// React hook for experiments
export function useExperiment(experimentId: string): {
  variant: string | null;
  isLoading: boolean;
} {
  const [variant, setVariant] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    getVariant(experimentId)
      .then(setVariant)
      .finally(() => setIsLoading(false));
  }, [experimentId]);
  
  return { variant, isLoading };
}

// Track conversion
export function trackConversion(experimentId: string, conversionType: string): void {
  getVariant(experimentId).then(variant => {
    if (variant) {
      analytics.track('experiment', 'convert', experimentId, undefined, {
        variant,
        conversionType,
      });
    }
  });
}
```

---

## 5. Gamification Engine

### 5.1 Rules Engine

**Файл:** `server/gamification/engine.ts`

```typescript
import { db } from '../db';
import { users, dailyTasks, tasksProgress } from '@shared/schema';
import { eq, and, sql } from 'drizzle-orm';

// === ТИПЫ ===

interface GamificationRule {
  id: string;
  name: string;
  trigger: RuleTrigger;
  conditions: RuleCondition[];
  rewards: RuleReward[];
  cooldownMs?: number;
  maxExecutions?: number;
}

type RuleTrigger = 
  | { type: 'event'; eventName: string }
  | { type: 'schedule'; cron: string }
  | { type: 'threshold'; metric: string; value: number };

interface RuleCondition {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

interface RuleReward {
  type: 'xp' | 'coins' | 'badge' | 'level_up';
  amount?: number;
  badgeId?: string;
}

// === XP И УРОВНИ ===

const XP_PER_LEVEL = [
  0,      // Level 1
  100,    // Level 2
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5
  2000,   // Level 6
  4000,   // Level 7
  7500,   // Level 8
  12000,  // Level 9
  20000,  // Level 10
];

export function calculateLevel(totalXp: number): { level: number; currentXp: number; nextLevelXp: number } {
  let level = 1;
  let remainingXp = totalXp;
  
  for (let i = 1; i < XP_PER_LEVEL.length; i++) {
    if (totalXp >= XP_PER_LEVEL[i]) {
      level = i + 1;
      remainingXp = totalXp - XP_PER_LEVEL[i];
    } else {
      break;
    }
  }
  
  const nextLevelXp = XP_PER_LEVEL[level] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1] * 2;
  const currentLevelXp = XP_PER_LEVEL[level - 1] || 0;
  
  return {
    level,
    currentXp: totalXp - currentLevelXp,
    nextLevelXp: nextLevelXp - currentLevelXp,
  };
}

// === НАГРАДЫ ===

export async function awardXp(telegramId: number, amount: number, reason: string): Promise<{
  newXp: number;
  leveledUp: boolean;
  newLevel: number;
}> {
  const user = await db.query.users.findFirst({
    where: eq(users.telegramId, telegramId),
  });
  
  if (!user) throw new Error('User not found');
  
  const oldLevel = calculateLevel(user.xp || 0).level;
  const newXp = (user.xp || 0) + amount;
  const { level: newLevel } = calculateLevel(newXp);
  
  await db.update(users)
    .set({ 
      xp: newXp,
      level: newLevel,
    })
    .where(eq(users.telegramId, telegramId));
  
  // Логируем
  console.log(`[Gamification] User ${telegramId} earned ${amount} XP for: ${reason}`);
  
  return {
    newXp,
    leveledUp: newLevel > oldLevel,
    newLevel,
  };
}

export async function awardCoins(telegramId: number, amount: number, reason: string): Promise<number> {
  const result = await db.update(users)
    .set({
      coins: sql`COALESCE(coins, 0) + ${amount}`,
    })
    .where(eq(users.telegramId, telegramId))
    .returning({ coins: users.coins });
  
  console.log(`[Gamification] User ${telegramId} earned ${amount} coins for: ${reason}`);
  
  return result[0]?.coins || 0;
}

// === STREAK ===

export async function updateStreak(telegramId: number): Promise<{
  streak: number;
  streakBonus: number;
}> {
  const user = await db.query.users.findFirst({
    where: eq(users.telegramId, telegramId),
  });
  
  if (!user) throw new Error('User not found');
  
  const now = new Date();
  const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
  
  let newStreak = 1;
  
  if (lastActive) {
    const daysDiff = Math.floor(
      (now.getTime() - lastActive.getTime()) / (24 * 60 * 60 * 1000)
    );
    
    if (daysDiff === 1) {
      // Продолжаем streak
      newStreak = (user.streak || 0) + 1;
    } else if (daysDiff === 0) {
      // Тот же день
      newStreak = user.streak || 1;
    }
    // Иначе streak сбрасывается на 1
  }
  
  // Бонус за streak
  const streakBonus = Math.min(newStreak * 5, 50); // Max +50 XP
  
  await db.update(users)
    .set({
      streak: newStreak,
      lastActiveAt: now,
    })
    .where(eq(users.telegramId, telegramId));
  
  if (streakBonus > 0) {
    await awardXp(telegramId, streakBonus, `Daily streak bonus (${newStreak} days)`);
  }
  
  return { streak: newStreak, streakBonus };
}

// === ПРАВИЛА ===

const RULES: GamificationRule[] = [
  {
    id: 'demo_view',
    name: 'View Demo',
    trigger: { type: 'event', eventName: 'demo_view' },
    conditions: [],
    rewards: [{ type: 'xp', amount: 10 }],
  },
  {
    id: 'demo_complete',
    name: 'Complete Demo',
    trigger: { type: 'event', eventName: 'demo_complete' },
    conditions: [],
    rewards: [
      { type: 'xp', amount: 25 },
      { type: 'coins', amount: 5 },
    ],
  },
  {
    id: 'referral_signup',
    name: 'Referral Sign Up',
    trigger: { type: 'event', eventName: 'referral_signup' },
    conditions: [],
    rewards: [
      { type: 'xp', amount: 100 },
      { type: 'coins', amount: 50 },
    ],
  },
  {
    id: 'first_demo',
    name: 'First Demo Badge',
    trigger: { type: 'event', eventName: 'demo_complete' },
    conditions: [
      { field: 'demos_completed', operator: 'eq', value: 1 },
    ],
    rewards: [
      { type: 'badge', badgeId: 'first_demo' },
      { type: 'xp', amount: 50 },
    ],
    maxExecutions: 1,
  },
];

export async function executeRule(
  telegramId: number,
  eventName: string,
  eventData: Record<string, any>
): Promise<void> {
  const matchingRules = RULES.filter(
    rule => rule.trigger.type === 'event' && rule.trigger.eventName === eventName
  );
  
  for (const rule of matchingRules) {
    try {
      // Check conditions
      let allConditionsMet = true;
      for (const condition of rule.conditions) {
        const value = eventData[condition.field];
        if (!evaluateCondition(value, condition.operator, condition.value)) {
          allConditionsMet = false;
          break;
        }
      }
      
      if (!allConditionsMet) continue;
      
      // Execute rewards
      for (const reward of rule.rewards) {
        switch (reward.type) {
          case 'xp':
            await awardXp(telegramId, reward.amount!, rule.name);
            break;
          case 'coins':
            await awardCoins(telegramId, reward.amount!, rule.name);
            break;
          case 'badge':
            await awardBadge(telegramId, reward.badgeId!);
            break;
        }
      }
      
      console.log(`[Gamification] Rule "${rule.name}" executed for user ${telegramId}`);
    } catch (error) {
      console.error(`[Gamification] Rule "${rule.name}" failed:`, error);
    }
  }
}

function evaluateCondition(value: any, operator: string, expected: any): boolean {
  switch (operator) {
    case 'eq': return value === expected;
    case 'ne': return value !== expected;
    case 'gt': return value > expected;
    case 'gte': return value >= expected;
    case 'lt': return value < expected;
    case 'lte': return value <= expected;
    case 'in': return Array.isArray(expected) && expected.includes(value);
    case 'contains': return String(value).includes(expected);
    default: return false;
  }
}

async function awardBadge(telegramId: number, badgeId: string): Promise<void> {
  // Implement badge storage
  console.log(`[Gamification] Badge "${badgeId}" awarded to user ${telegramId}`);
}
```

---

## 6. AI Integration

### 6.1 AI Orchestration Layer

**Файл:** `server/ai/orchestrator.ts`

```typescript
import OpenAI from 'openai';

interface AIConfig {
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface AIResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  latencyMs: number;
}

// === ORCHESTRATOR ===

export class AIOrchestrator {
  private openai: OpenAI;
  private configs: Map<string, AIConfig> = new Map();
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.initializeConfigs();
  }
  
  private initializeConfigs(): void {
    // Разные конфигурации для разных сценариев
    this.configs.set('demo_assistant', {
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 500,
      systemPrompt: `Ты — помощник в демо-приложении. 
Отвечай кратко и по делу. 
Максимум 2-3 предложения.
Язык ответа: русский.`,
    });
    
    this.configs.set('support', {
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 1000,
      systemPrompt: `Ты — служба поддержки Telegram Mini App.
Помогай пользователям с вопросами о приложении.
Будь вежлив и профессионален.`,
    });
    
    this.configs.set('creative', {
      model: 'gpt-4o',
      temperature: 0.9,
      maxTokens: 2000,
      systemPrompt: `Ты — креативный помощник.
Генерируй интересный и оригинальный контент.`,
    });
  }
  
  async chat(
    configName: string,
    messages: ConversationMessage[],
    options?: Partial<AIConfig>
  ): Promise<AIResponse> {
    const baseConfig = this.configs.get(configName);
    if (!baseConfig) {
      throw new Error(`Unknown AI config: ${configName}`);
    }
    
    const config = { ...baseConfig, ...options };
    const startTime = Date.now();
    
    try {
      const response = await this.openai.chat.completions.create({
        model: config.model,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        messages: [
          { role: 'system', content: config.systemPrompt },
          ...messages,
        ],
      });
      
      const latencyMs = Date.now() - startTime;
      
      return {
        content: response.choices[0]?.message?.content || '',
        usage: {
          promptTokens: response.usage?.prompt_tokens || 0,
          completionTokens: response.usage?.completion_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0,
        },
        latencyMs,
      };
    } catch (error) {
      console.error('[AI] Chat error:', error);
      throw error;
    }
  }
  
  // Streaming response
  async *chatStream(
    configName: string,
    messages: ConversationMessage[]
  ): AsyncGenerator<string> {
    const config = this.configs.get(configName);
    if (!config) throw new Error(`Unknown config: ${configName}`);
    
    const stream = await this.openai.chat.completions.create({
      model: config.model,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      messages: [
        { role: 'system', content: config.systemPrompt },
        ...messages,
      ],
      stream: true,
    });
    
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }
}

// Singleton instance
export const aiOrchestrator = new AIOrchestrator();
```

### 6.2 AI Safety & Rate Limiting

**Файл:** `server/ai/safety.ts`

```typescript
// Запрещённые паттерны
const BLOCKED_PATTERNS = [
  /ignore\s+(?:all\s+)?(?:previous\s+)?instructions/i,
  /ignore\s+(?:the\s+)?system\s+prompt/i,
  /you\s+are\s+now\s+/i,
  /pretend\s+(?:you\s+are|to\s+be)/i,
  /act\s+as\s+(?:if|though)/i,
  /jailbreak/i,
  /bypass\s+(?:security|filters)/i,
];

// Токсичные слова (базовый список)
const TOXIC_WORDS = new Set([
  // Добавьте нежелательные слова
]);

interface SafetyResult {
  safe: boolean;
  reason?: string;
  flaggedPatterns?: string[];
}

export function checkInputSafety(input: string): SafetyResult {
  const flaggedPatterns: string[] = [];
  
  // Проверяем запрещённые паттерны
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(input)) {
      flaggedPatterns.push(pattern.source);
    }
  }
  
  if (flaggedPatterns.length > 0) {
    return {
      safe: false,
      reason: 'Potentially harmful prompt detected',
      flaggedPatterns,
    };
  }
  
  // Проверяем длину
  if (input.length > 4000) {
    return {
      safe: false,
      reason: 'Input too long',
    };
  }
  
  // Проверяем токсичные слова
  const words = input.toLowerCase().split(/\s+/);
  for (const word of words) {
    if (TOXIC_WORDS.has(word)) {
      return {
        safe: false,
        reason: 'Inappropriate content detected',
      };
    }
  }
  
  return { safe: true };
}

// Rate limiting для AI
const AI_RATE_LIMITS = new Map<number, { count: number; resetAt: number }>();
const AI_DAILY_LIMIT = 50;
const AI_WINDOW_MS = 24 * 60 * 60 * 1000;

export function checkAIRateLimit(telegramId: number): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const userData = AI_RATE_LIMITS.get(telegramId);
  
  if (!userData || userData.resetAt < now) {
    AI_RATE_LIMITS.set(telegramId, {
      count: 1,
      resetAt: now + AI_WINDOW_MS,
    });
    return { allowed: true, remaining: AI_DAILY_LIMIT - 1 };
  }
  
  if (userData.count >= AI_DAILY_LIMIT) {
    return { allowed: false, remaining: 0 };
  }
  
  userData.count++;
  return { allowed: true, remaining: AI_DAILY_LIMIT - userData.count };
}
```

---

## 7. Мобильная оптимизация

### 7.1 Telegram Viewport Hook

**Файл:** `client/src/hooks/useTelegramViewport.ts`

```typescript
import { useState, useEffect, useCallback } from 'react';

interface ViewportState {
  height: number;
  stableHeight: number;
  isExpanded: boolean;
  safeAreaInsets: {
    top: number;
    bottom: number;
    left: number;
    right: number;
  };
}

export function useTelegramViewport(): ViewportState {
  const [viewport, setViewport] = useState<ViewportState>({
    height: window.innerHeight,
    stableHeight: window.innerHeight,
    isExpanded: false,
    safeAreaInsets: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  
  useEffect(() => {
    const WebApp = window.Telegram?.WebApp;
    if (!WebApp) return;
    
    const updateViewport = () => {
      setViewport({
        height: WebApp.viewportHeight || window.innerHeight,
        stableHeight: WebApp.viewportStableHeight || window.innerHeight,
        isExpanded: WebApp.isExpanded || false,
        safeAreaInsets: {
          top: WebApp.safeAreaInset?.top || 0,
          bottom: WebApp.safeAreaInset?.bottom || 0,
          left: WebApp.safeAreaInset?.left || 0,
          right: WebApp.safeAreaInset?.right || 0,
        },
      });
    };
    
    // Initial update
    updateViewport();
    
    // Listen for viewport changes
    WebApp.onEvent('viewportChanged', updateViewport);
    
    // Expand on mount
    WebApp.expand();
    
    return () => {
      WebApp.offEvent('viewportChanged', updateViewport);
    };
  }, []);
  
  return viewport;
}

// CSS custom properties hook
export function useTelegramCSSVars(): void {
  const viewport = useTelegramViewport();
  
  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--tg-viewport-height', `${viewport.height}px`);
    root.style.setProperty('--tg-viewport-stable-height', `${viewport.stableHeight}px`);
    root.style.setProperty('--tg-safe-area-top', `${viewport.safeAreaInsets.top}px`);
    root.style.setProperty('--tg-safe-area-bottom', `${viewport.safeAreaInsets.bottom}px`);
  }, [viewport]);
}
```

### 7.2 Haptic Feedback

**Файл:** `client/src/lib/haptics.ts`

```typescript
type HapticType = 
  | 'impact_light' 
  | 'impact_medium' 
  | 'impact_heavy' 
  | 'notification_success' 
  | 'notification_warning' 
  | 'notification_error'
  | 'selection_changed';

export function triggerHaptic(type: HapticType): void {
  const WebApp = window.Telegram?.WebApp;
  if (!WebApp?.HapticFeedback) return;
  
  try {
    switch (type) {
      case 'impact_light':
        WebApp.HapticFeedback.impactOccurred('light');
        break;
      case 'impact_medium':
        WebApp.HapticFeedback.impactOccurred('medium');
        break;
      case 'impact_heavy':
        WebApp.HapticFeedback.impactOccurred('heavy');
        break;
      case 'notification_success':
        WebApp.HapticFeedback.notificationOccurred('success');
        break;
      case 'notification_warning':
        WebApp.HapticFeedback.notificationOccurred('warning');
        break;
      case 'notification_error':
        WebApp.HapticFeedback.notificationOccurred('error');
        break;
      case 'selection_changed':
        WebApp.HapticFeedback.selectionChanged();
        break;
    }
  } catch (error) {
    console.warn('[Haptics] Not supported:', error);
  }
}

// React hook
export function useHaptic() {
  return {
    light: () => triggerHaptic('impact_light'),
    medium: () => triggerHaptic('impact_medium'),
    heavy: () => triggerHaptic('impact_heavy'),
    success: () => triggerHaptic('notification_success'),
    warning: () => triggerHaptic('notification_warning'),
    error: () => triggerHaptic('notification_error'),
    selection: () => triggerHaptic('selection_changed'),
  };
}
```

---

## 8. CI/CD Pipeline

### 8.1 GitHub Actions Workflow

**Файл:** `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  # ========== LINT & TYPE CHECK ==========
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: TypeScript check
        run: npm run typecheck
      
      - name: ESLint
        run: npm run lint

  # ========== UNIT TESTS ==========
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info

  # ========== BUILD ==========
  build:
    runs-on: ubuntu-latest
    needs: [lint, test]
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build
        run: npm run build
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  # ========== LIGHTHOUSE ==========
  lighthouse:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v11
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true

  # ========== E2E TESTS ==========
  e2e:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Install Playwright
        run: npx playwright install --with-deps chromium
      
      - name: Download build
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      
      - name: Run E2E tests
        run: npm run test:e2e
      
      - name: Upload test results
        uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: playwright-report/

  # ========== DEPLOY TO RAILWAY ==========
  deploy:
    runs-on: ubuntu-latest
    needs: [build, lighthouse, e2e]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Railway
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: ${{ secrets.RAILWAY_SERVICE_ID }}
```

### 8.2 Lighthouse Config

**Файл:** `lighthouserc.json`

```json
{
  "ci": {
    "collect": {
      "numberOfRuns": 3,
      "startServerCommand": "npm run preview",
      "url": ["http://localhost:4173/"]
    },
    "assert": {
      "assertions": {
        "categories:performance": ["error", { "minScore": 0.8 }],
        "categories:accessibility": ["error", { "minScore": 0.9 }],
        "categories:best-practices": ["error", { "minScore": 0.9 }],
        "categories:seo": ["error", { "minScore": 0.9 }],
        "first-contentful-paint": ["error", { "maxNumericValue": 1800 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 2500 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }],
        "total-blocking-time": ["error", { "maxNumericValue": 300 }]
      }
    },
    "upload": {
      "target": "temporary-public-storage"
    }
  }
}
```

---

## 9. Архитектура

### 9.1 Модульная структура

```
project/
├── client/
│   ├── src/
│   │   ├── core/              # Ядро приложения
│   │   │   ├── App.tsx
│   │   │   ├── Router.tsx
│   │   │   └── providers/
│   │   │
│   │   ├── features/          # Feature-slices
│   │   │   ├── auth/
│   │   │   ├── demos/
│   │   │   ├── gamification/
│   │   │   ├── referral/
│   │   │   └── analytics/
│   │   │
│   │   ├── shared/            # Shared UI & utils
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   │
│   │   └── pages/             # Route pages
│   │
│   └── public/
│
├── server/
│   ├── core/                  # Server core
│   │   ├── index.ts
│   │   ├── app.ts
│   │   └── middleware/
│   │
│   ├── features/              # Feature modules
│   │   ├── auth/
│   │   ├── analytics/
│   │   ├── gamification/
│   │   └── ai/
│   │
│   └── shared/                # Shared utils
│       ├── db/
│       ├── redis/
│       └── utils/
│
├── shared/                    # Shared types & schemas
│   ├── schema.ts
│   ├── types.ts
│   └── analytics.ts
│
└── docs/                      # Documentation
    └── ENTERPRISE_UPGRADE_GUIDE.md
```

---

## 10. Мониторинг

### 10.1 Error Tracking (Sentry)

**Файл:** `client/src/lib/errorTracking.ts`

```typescript
import * as Sentry from '@sentry/react';

export function initErrorTracking(): void {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    
    // Performance monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
    
    // Sample rates
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    
    // Filter events
    beforeSend(event) {
      // Фильтруем известные ошибки
      if (event.exception?.values?.[0]?.value?.includes('ResizeObserver')) {
        return null;
      }
      return event;
    },
  });
}

// Set user context
export function setUserContext(telegramId: number, username?: string): void {
  Sentry.setUser({
    id: telegramId.toString(),
    username,
  });
}

// Capture custom error
export function captureError(error: Error, context?: Record<string, any>): void {
  Sentry.captureException(error, {
    extra: context,
  });
}
```

### 10.2 Performance Monitoring

**Файл:** `client/src/lib/performanceMonitor.ts`

```typescript
interface PerformanceMetrics {
  fcp: number | null;
  lcp: number | null;
  fid: number | null;
  cls: number | null;
  ttfb: number | null;
}

const metrics: PerformanceMetrics = {
  fcp: null,
  lcp: null,
  fid: null,
  cls: null,
  ttfb: null,
};

export function initPerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;
  
  import('web-vitals').then(({ onCLS, onFCP, onFID, onLCP, onTTFB }) => {
    onFCP((metric) => {
      metrics.fcp = metric.value;
      reportMetric('FCP', metric.value);
    });
    
    onLCP((metric) => {
      metrics.lcp = metric.value;
      reportMetric('LCP', metric.value);
    });
    
    onFID((metric) => {
      metrics.fid = metric.value;
      reportMetric('FID', metric.value);
    });
    
    onCLS((metric) => {
      metrics.cls = metric.value;
      reportMetric('CLS', metric.value);
    });
    
    onTTFB((metric) => {
      metrics.ttfb = metric.value;
      reportMetric('TTFB', metric.value);
    });
  });
}

function reportMetric(name: string, value: number): void {
  // Отправляем в аналитику
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/vitals', JSON.stringify({
      name,
      value,
      timestamp: Date.now(),
      url: window.location.pathname,
    }));
  }
  
  // Логируем в dev
  if (import.meta.env.DEV) {
    console.log(`[Performance] ${name}: ${value.toFixed(2)}`);
  }
}

export function getMetrics(): PerformanceMetrics {
  return { ...metrics };
}
```

---

## Checklist для внедрения

### Фаза 1: Безопасность (1-2 недели)
- [ ] Telegram initData validation
- [ ] Enhanced rate limiting
- [ ] Audit logging
- [ ] CSRF rotation

### Фаза 2: Производительность (1-2 недели)
- [ ] Optimized code-splitting
- [ ] Speculative prefetch
- [ ] Image optimization
- [ ] Priority hints

### Фаза 3: Offline & PWA (1 неделя)
- [ ] Workbox service worker
- [ ] Background sync
- [ ] IndexedDB storage
- [ ] Optimistic UI

### Фаза 4: Аналитика (1-2 недели)
- [ ] Event taxonomy
- [ ] A/B testing infra
- [ ] Real-time dashboard
- [ ] Web Vitals tracking

### Фаза 5: Gamification (1-2 недели)
- [ ] Rules engine
- [ ] XP/Level system
- [ ] Streak tracking
- [ ] Achievements

### Фаза 6: AI (1-2 недели)
- [ ] Orchestration layer
- [ ] Safety filters
- [ ] Rate limiting
- [ ] Streaming responses

### Фаза 7: CI/CD (1 неделя)
- [ ] GitHub Actions
- [ ] Lighthouse CI
- [ ] E2E tests
- [ ] Automated deploy

---

**Общая оценка времени:** 8-12 недель для полного внедрения.

**Приоритет:** Безопасность → Производительность → Offline → Аналитика
