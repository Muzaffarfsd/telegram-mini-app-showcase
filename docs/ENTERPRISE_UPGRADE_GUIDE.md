# Enterprise Upgrade Guide 2025-2026

Полное руководство по улучшению Telegram Mini App до enterprise-уровня с объяснениями ценности каждого улучшения.

---

## Содержание

1. [Безопасность: Telegram initData Validation](#1-безопасность-telegram-initdata-validation)
2. [Rate Limiting per Telegram ID](#2-rate-limiting-per-telegram-id)
3. [Code-Splitting (Оптимизация загрузки)](#3-code-splitting-оптимизация-загрузки)
4. [Offline & Background Sync](#4-offline--background-sync)
5. [Аналитика (Event Taxonomy)](#5-аналитика-event-taxonomy)
6. [A/B Тестирование](#6-ab-тестирование)
7. [Gamification Engine](#7-gamification-engine)
8. [AI Integration](#8-ai-integration)
9. [Telegram Viewport Optimization](#9-telegram-viewport-optimization)
10. [CI/CD Pipeline](#10-cicd-pipeline)

---

## 1. Безопасность: Telegram initData Validation

### Что это даёт

| Преимущество | Описание |
|--------------|----------|
| Защита от подделки | Злоумышленник не сможет притвориться другим пользователем |
| Защита от ботов | Только реальные пользователи Telegram смогут использовать API |
| Доверие клиентов | Enterprise-клиенты требуют проверенную аутентификацию |

**Бизнес-ценность:** Без этого любой может отправить запрос от имени любого пользователя. С этим — только настоящие пользователи Telegram.

**Риск без внедрения:** Кража данных пользователей, мошенничество с рефералами, накрутка XP.

### Как это работает

Telegram подписывает данные пользователя секретным ключом бота. Мы проверяем эту подпись на сервере.

```
Пользователь открывает Mini App
        ↓
Telegram формирует initData с подписью (hash)
        ↓
Приложение отправляет initData в заголовке x-telegram-init-data
        ↓
Сервер проверяет подпись через HMAC-SHA256
        ↓
Если подпись верна → пользователь настоящий
Если нет → запрос отклоняется
```

### Реализация

**Файл:** `server/telegramAuth.ts`

```typescript
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';

// === ТИПЫ ===

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

// === ГЛАВНАЯ ФУНКЦИЯ ВАЛИДАЦИИ ===

export function validateTelegramInitData(
  initData: string, 
  botToken: string,
  maxAgeSeconds: number = 86400 // 24 часа — данные старше отклоняются
): ParsedInitData | null {
  try {
    // Парсим строку параметров
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash) return null;
    
    // Удаляем hash для проверки
    params.delete('hash');
    
    // Сортируем параметры и создаём строку для проверки
    // Telegram требует именно такой формат
    const dataCheckString = Array.from(params.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Создаём секретный ключ из токена бота
    const secretKey = crypto
      .createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Вычисляем hash
    const calculatedHash = crypto
      .createHmac('sha256', secretKey)
      .update(dataCheckString)
      .digest('hex');
    
    // ВАЖНО: Timing-safe сравнение защищает от timing attacks
    // Обычное сравнение строк уязвимо — злоумышленник может
    // по времени ответа угадать правильный hash
    const hashBuffer = Buffer.from(hash, 'hex');
    const calculatedBuffer = Buffer.from(calculatedHash, 'hex');
    
    if (hashBuffer.length !== calculatedBuffer.length) return null;
    if (!crypto.timingSafeEqual(hashBuffer, calculatedBuffer)) return null;
    
    // Проверяем возраст данных
    // Старые данные могут быть украдены и переиспользованы
    const authDate = parseInt(params.get('auth_date') || '0', 10);
    const now = Math.floor(Date.now() / 1000);
    if (now - authDate > maxAgeSeconds) return null;
    
    // Парсим данные пользователя
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

// === MIDDLEWARE ДЛЯ ЗАЩИЩЁННЫХ ЭНДПОИНТОВ ===

export function telegramAuthMiddleware(botToken: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const initData = req.headers['x-telegram-init-data'] as string;
    
    if (!initData) {
      return res.status(401).json({ 
        code: 'UNAUTHORIZED',
        message: 'Требуется авторизация через Telegram' 
      });
    }
    
    const validated = validateTelegramInitData(initData, botToken);
    if (!validated) {
      return res.status(401).json({ 
        code: 'UNAUTHORIZED',
        message: 'Неверная подпись Telegram' 
      });
    }
    
    // Прикрепляем данные пользователя к запросу
    // Теперь в любом роуте доступен req.telegramUser
    (req as any).telegramUser = validated.user;
    (req as any).telegramAuthDate = validated.auth_date;
    
    next();
  };
}

// === ОПЦИОНАЛЬНАЯ АВТОРИЗАЦИЯ ===
// Для публичных эндпоинтов, где авторизация желательна но не обязательна

export function optionalTelegramAuth(botToken: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const initData = req.headers['x-telegram-init-data'] as string;
    
    if (initData) {
      const validated = validateTelegramInitData(initData, botToken);
      if (validated?.user) {
        (req as any).telegramUser = validated.user;
      }
    }
    
    next(); // Всегда пропускаем, даже без авторизации
  };
}
```

**Использование в routes.ts:**

```typescript
import { telegramAuthMiddleware, optionalTelegramAuth } from './telegramAuth';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN!;

// Защищённые эндпоинты — только для авторизованных
app.use('/api/user', telegramAuthMiddleware(BOT_TOKEN));
app.use('/api/referral', telegramAuthMiddleware(BOT_TOKEN));
app.use('/api/gamification', telegramAuthMiddleware(BOT_TOKEN));
app.use('/api/payment', telegramAuthMiddleware(BOT_TOKEN));

// Публичные с опциональной авторизацией
// Работают и без авторизации, но если есть — используем
app.use('/api/demos', optionalTelegramAuth(BOT_TOKEN));
app.use('/api/analytics', optionalTelegramAuth(BOT_TOKEN));
```

---

## 2. Rate Limiting per Telegram ID

### Что это даёт

| Преимущество | Описание |
|--------------|----------|
| Защита от DDoS | Один пользователь не сможет "положить" сервер |
| Экономия ресурсов | Меньше нагрузка на базу данных и API |
| Справедливость | Все пользователи получают равный доступ |
| Защита от парсинга | Нельзя массово выкачать данные |

**Бизнес-ценность:** Сервер остаётся стабильным даже при атаке. Экономия на серверах 30-50%.

**Метрика:** 99.9% uptime даже под нагрузкой.

### Как это работает

```
Запрос от пользователя
        ↓
Проверяем сколько запросов за последнюю минуту
        ↓
Если < лимита → пропускаем
Если >= лимита → отклоняем с 429 Too Many Requests
        ↓
Возвращаем заголовки X-RateLimit-Remaining и Retry-After
```

### Реализация

**Файл:** `server/rateLimiter.ts`

```typescript
import { Redis } from '@upstash/redis';
import { Request, Response, NextFunction } from 'express';

// === КОНФИГУРАЦИЯ ===

interface RateLimitConfig {
  windowMs: number;        // Окно в миллисекундах (обычно 60000 = 1 минута)
  maxRequests: number;     // Максимум запросов в окне
  keyPrefix?: string;      // Префикс в Redis для разных лимитов
}

interface RateLimitResult {
  allowed: boolean;        // Разрешён ли запрос
  remaining: number;       // Сколько запросов осталось
  resetTime: number;       // Когда сбросится лимит (timestamp)
  totalRequests: number;   // Сколько запросов уже сделано
}

// === КЛАСС ЛИМИТЕРА ===

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
    
    // Используем Redis sorted set для sliding window
    // Это точнее чем простой счётчик — учитывает КОГДА были запросы
    const pipeline = this.redis.pipeline();
    
    // Удаляем старые записи (вне окна)
    pipeline.zremrangebyscore(key, 0, windowStart);
    
    // Добавляем текущий запрос с уникальным ID
    pipeline.zadd(key, { 
      score: now, 
      member: `${now}-${Math.random().toString(36).substr(2, 9)}` 
    });
    
    // Считаем количество запросов в окне
    pipeline.zcard(key);
    
    // Устанавливаем TTL чтобы ключ автоматически удалился
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

// === ТИРЫ ЛИМИТОВ ===
// Разные эндпоинты требуют разных лимитов

export const RATE_LIMIT_TIERS = {
  // Обычные запросы — 100 в минуту достаточно для активного использования
  standard: { windowMs: 60_000, maxRequests: 100, keyPrefix: 'rl:std:' },
  
  // Чувствительные операции — 10 в минуту защищает от брутфорса
  sensitive: { windowMs: 60_000, maxRequests: 10, keyPrefix: 'rl:sens:' },
  
  // Аналитика — 30 в минуту (много данных, но не критично)
  analytics: { windowMs: 60_000, maxRequests: 30, keyPrefix: 'rl:analytics:' },
  
  // Burst protection — 10 в секунду против скриптов
  burst: { windowMs: 1_000, maxRequests: 10, keyPrefix: 'rl:burst:' },
} as const;

// === MIDDLEWARE FACTORY ===

export function createRateLimitMiddleware(
  limiter: TelegramRateLimiter,
  tierName: string = 'standard'
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Используем Telegram ID если авторизован, иначе IP
      // Telegram ID лучше — один человек = один лимит независимо от IP
      const telegramId = (req as any).telegramUser?.id;
      const identifier = telegramId || req.ip || 'anonymous';
      
      const result = await limiter.checkLimit(identifier);
      
      // Устанавливаем информативные заголовки
      // Клиент видит сколько запросов осталось и когда сбросится
      res.setHeader('X-RateLimit-Limit', limiter['config'].maxRequests);
      res.setHeader('X-RateLimit-Remaining', result.remaining);
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.resetTime / 1000));
      res.setHeader('X-RateLimit-Tier', tierName);
      
      if (!result.allowed) {
        const retryAfter = Math.ceil((result.resetTime - Date.now()) / 1000);
        res.setHeader('Retry-After', retryAfter);
        
        return res.status(429).json({
          code: 'RATE_LIMITED',
          message: 'Слишком много запросов. Подождите.',
          retryAfter,
        });
      }
      
      next();
    } catch (error) {
      // ВАЖНО: При ошибке Redis — пропускаем (fail-open)
      // Лучше пропустить лишний запрос чем заблокировать всех
      console.error('Rate limit error:', error);
      next();
    }
  };
}
```

---

## 3. Code-Splitting (Оптимизация загрузки)

### Что это даёт

| Преимущество | Описание |
|--------------|----------|
| Быстрый первый экран | Пользователь видит контент за 1.5 секунды вместо 4 |
| Меньше трафика | Загружается только нужный код, экономия мобильного интернета |
| Лучше конверсия | Каждая секунда задержки = -7% конверсии |

**Бизнес-ценность:** FCP с 3.5с до 1.8с = +15-20% удержания пользователей.

**Статистика:** 53% пользователей уходят если сайт загружается >3 секунд.

### Как это работает

```
БЕЗ code-splitting:
┌─────────────────────────────────────┐
│   Один огромный bundle.js (2MB)    │  ← Пользователь ждёт всё
└─────────────────────────────────────┘

С code-splitting:
┌──────────┐ ┌──────────┐ ┌──────────┐
│ react.js │ │ page1.js │ │ charts.js│
│  (150KB) │ │  (50KB)  │ │  (200KB) │
└──────────┘ └──────────┘ └──────────┘
     ↑            ↑            ↑
   Сразу     По требованию  Когда нужны
```

### Реализация

**Файл:** `vite.config.ts` — секция build.rollupOptions.output.manualChunks

```typescript
manualChunks(id) {
  // Только для node_modules
  if (!id.includes('node_modules')) return;
  
  // КРИТИЧНО: React и связанные библиотеки ВМЕСТЕ
  // Если разделить — получим ошибку "Cannot read properties of undefined"
  if (
    id.includes('react') ||
    id.includes('react-dom') ||
    id.includes('scheduler') ||
    id.includes('@tanstack/react-query') ||
    id.includes('wouter')
  ) {
    return 'react-core'; // ~150KB — загружается первым
  }
  
  // UI компоненты — нужны почти сразу
  if (
    id.includes('@radix-ui') ||
    id.includes('lucide-react') ||
    id.includes('class-variance-authority') ||
    id.includes('clsx') ||
    id.includes('tailwind-merge')
  ) {
    return 'ui-framework'; // ~80KB
  }
  
  // Графики — ТОЛЬКО когда открывают аналитику
  // Recharts очень тяжёлый, не грузим на главной
  if (id.includes('recharts') || id.includes('d3')) {
    return 'charts'; // ~300KB — lazy load
  }
  
  // Анимации — можно подгрузить позже
  if (id.includes('framer-motion')) {
    return 'animations'; // ~100KB
  }
  
  // Swiper — только для слайдеров
  if (id.includes('swiper')) {
    return 'swiper'; // ~150KB — lazy load
  }
  
  // Утилиты — маленькие, можно вместе
  if (
    id.includes('date-fns') ||
    id.includes('zod') ||
    id.includes('nanoid')
  ) {
    return 'utils'; // ~30KB
  }
  
  // Telegram SDK
  if (id.includes('@twa-dev')) {
    return 'telegram'; // ~20KB
  }
}
```

**Speculative Prefetch — загрузка заранее при hover:**

**Файл:** `client/src/lib/prefetch.ts`

```typescript
// Кэш чтобы не грузить дважды
const prefetchedModules = new Set<string>();

// Prefetch модуля в фоне
export function prefetchModule(moduleLoader: () => Promise<any>): void {
  const key = moduleLoader.toString();
  if (prefetchedModules.has(key)) return;
  
  prefetchedModules.add(key);
  
  // requestIdleCallback — грузим когда браузер свободен
  // Не блокирует основной поток, пользователь не заметит
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => {
      moduleLoader().catch(() => {
        prefetchedModules.delete(key); // Если ошибка — попробуем снова
      });
    }, { timeout: 2000 });
  } else {
    // Fallback для Safari
    setTimeout(() => {
      moduleLoader().catch(() => {
        prefetchedModules.delete(key);
      });
    }, 100);
  }
}

// Prefetch при наведении на элемент
export function prefetchOnHover(
  element: HTMLElement, 
  loader: () => Promise<any>
): void {
  let prefetched = false;
  
  const handleInteraction = () => {
    if (!prefetched) {
      prefetched = true;
      prefetchModule(loader);
    }
  };
  
  // Грузим при hover (desktop) или touch (mobile)
  element.addEventListener('mouseenter', handleInteraction, { once: true });
  element.addEventListener('touchstart', handleInteraction, { once: true, passive: true });
}

// Пример использования в компоненте:
// 
// const cardRef = useRef<HTMLDivElement>(null);
// 
// useEffect(() => {
//   if (cardRef.current) {
//     prefetchOnHover(cardRef.current, () => import('@/demos/RestaurantDemo'));
//   }
// }, []);
```

---

## 4. Offline & Background Sync

### Что это даёт

| Преимущество | Описание |
|--------------|----------|
| Работа без интернета | Приложение работает в метро, самолёте, при плохой связи |
| Не теряются действия | Заказ оформится когда появится сеть |
| Мгновенный отклик | Интерфейс реагирует сразу, не ждёт сервера |

**Бизнес-ценность:** 
- +40% вовлечённости в регионах с плохим интернетом
- 0 потерянных заказов из-за обрыва связи
- UX как у нативных приложений

**Статистика:** 60% пользователей мобильных приложений ожидают работу offline.

### Как это работает

```
Пользователь делает действие (например, лайк)
        ↓
Показываем результат СРАЗУ (optimistic UI)
        ↓
Пытаемся отправить на сервер
        ↓
┌─────────────────┐    ┌─────────────────┐
│   Есть сеть?    │    │    Нет сети     │
└────────┬────────┘    └────────┬────────┘
         ↓                      ↓
    Отправляем           Сохраняем в очередь
         ↓                      ↓
      Готово!           Когда сеть появится →
                        отправляем автоматически
```

### Реализация

**Файл:** `client/src/lib/offlineStorage.ts`

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

// === СХЕМА БАЗЫ ДАННЫХ ===

interface OfflineDB extends DBSchema {
  // Очередь действий для отправки
  pendingActions: {
    key: string;
    value: {
      id: string;
      action: string;      // Название API endpoint
      payload: any;        // Данные для отправки
      timestamp: number;   // Когда создано
      retries: number;     // Сколько раз пытались
    };
    indexes: { 'by-timestamp': number };
  };
  
  // Кэш данных
  cachedData: {
    key: string;
    value: {
      key: string;
      data: any;
      timestamp: number;
      expiresAt: number;   // Когда устареет
    };
  };
}

// === ИНИЦИАЛИЗАЦИЯ ===

let db: IDBPDatabase<OfflineDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<OfflineDB>> {
  if (db) return db;
  
  db = await openDB<OfflineDB>('app-offline', 1, {
    upgrade(db) {
      // Создаём хранилище для очереди действий
      const actionsStore = db.createObjectStore('pendingActions', { keyPath: 'id' });
      actionsStore.createIndex('by-timestamp', 'timestamp');
      
      // Создаём хранилище для кэша
      db.createObjectStore('cachedData', { keyPath: 'key' });
    },
  });
  
  return db;
}

// === РАБОТА С ОЧЕРЕДЬЮ ДЕЙСТВИЙ ===

// Добавить действие в очередь
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
  
  console.log(`[Offline] Действие "${action}" добавлено в очередь`);
  return id;
}

// Получить все ожидающие действия
export async function getPendingActions(): Promise<any[]> {
  const db = await getDB();
  return db.getAllFromIndex('pendingActions', 'by-timestamp');
}

// Удалить действие (после успешной отправки)
export async function removePendingAction(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('pendingActions', id);
}

// Увеличить счётчик попыток
export async function incrementRetry(id: string): Promise<void> {
  const db = await getDB();
  const action = await db.get('pendingActions', id);
  if (action) {
    action.retries++;
    await db.put('pendingActions', action);
  }
}

// === РАБОТА С КЭШЕМ ===

// Сохранить данные в кэш
export async function setCachedData(
  key: string, 
  data: any, 
  ttlMs: number = 5 * 60 * 1000 // По умолчанию 5 минут
): Promise<void> {
  const db = await getDB();
  await db.put('cachedData', {
    key,
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttlMs,
  });
}

// Получить данные из кэша
export async function getCachedData<T>(key: string): Promise<T | null> {
  const db = await getDB();
  const cached = await db.get('cachedData', key);
  
  if (!cached) return null;
  
  // Проверяем не устарело ли
  if (cached.expiresAt < Date.now()) {
    await db.delete('cachedData', key);
    return null;
  }
  
  return cached.data as T;
}

// === СИНХРОНИЗАЦИЯ ===

// Отправить все ожидающие действия
export async function syncPendingActions(): Promise<void> {
  const actions = await getPendingActions();
  
  console.log(`[Offline] Синхронизация ${actions.length} действий...`);
  
  for (const action of actions) {
    // Максимум 3 попытки
    if (action.retries >= 3) {
      console.error(`[Offline] Превышено число попыток для: ${action.id}`);
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
        console.log(`[Offline] Успешно синхронизировано: ${action.id}`);
      } else {
        throw new Error(`HTTP ${response.status}`);
      }
    } catch (error) {
      console.error(`[Offline] Ошибка синхронизации: ${action.id}`, error);
      await incrementRetry(action.id);
    }
  }
}

// === АВТОМАТИЧЕСКАЯ СИНХРОНИЗАЦИЯ ===

if (typeof window !== 'undefined') {
  // Синхронизируем когда появляется интернет
  window.addEventListener('online', () => {
    console.log('[Offline] Сеть появилась — синхронизируем...');
    syncPendingActions();
  });
  
  // Синхронизируем при загрузке если есть сеть
  if (navigator.onLine) {
    syncPendingActions();
  }
}
```

**Optimistic UI Hook:**

```typescript
// Файл: client/src/hooks/useOptimisticMutation.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queueAction } from '@/lib/offlineStorage';

export function useOptimisticMutation<TData, TVariables>({
  mutationFn,
  queryKey,
  optimisticUpdate,
  offlineAction,
}: {
  mutationFn: (variables: TVariables) => Promise<TData>;
  queryKey: string[];
  optimisticUpdate: (old: TData | undefined, variables: TVariables) => TData;
  offlineAction?: string;
}) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (variables: TVariables) => {
      // Если offline — сохраняем в очередь
      if (!navigator.onLine && offlineAction) {
        await queueAction(offlineAction, variables);
        // Возвращаем оптимистичный результат
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
      
      // Сохраняем предыдущие данные для отката
      const previousData = queryClient.getQueryData<TData>(queryKey);
      
      // СРАЗУ обновляем UI
      queryClient.setQueryData<TData>(queryKey, (old) =>
        optimisticUpdate(old, variables)
      );
      
      return { previousData };
    },
    
    onError: (error, variables, context) => {
      // Откатываем если ошибка
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
    },
    
    onSettled: () => {
      // Обновляем данные с сервера
      queryClient.invalidateQueries({ queryKey });
    },
  });
}
```

---

## 5. Аналитика (Event Taxonomy)

### Что это даёт

| Преимущество | Описание |
|--------------|----------|
| Понимание пользователей | Видите что делают, где уходят, что нравится |
| Данные для решений | Не гадаете, а знаете что улучшать |
| Воронки конверсии | Видите где теряете клиентов |
| ROI маркетинга | Понимаете какие каналы работают |

**Бизнес-ценность:** Компании управляемые данными растут в 23 раза быстрее (McKinsey).

**Без аналитики:** "Кажется пользователям не нравится" → Гадание
**С аналитикой:** "78% уходят на шаге 3, причина — медленная загрузка" → Решение

### Как это работает

```
Пользователь делает действие
        ↓
Событие записывается с метаданными
        ↓
События группируются и отправляются батчами
        ↓
На сервере сохраняются в базу
        ↓
Dashboard показывает графики и метрики
```

### Реализация

**Файл:** `shared/analytics.ts` — Стандартизированная схема событий

```typescript
// === КАТЕГОРИИ СОБЫТИЙ ===
// Все события делятся на категории для удобства анализа

export const EVENT_CATEGORIES = {
  PAGE: 'page',              // Просмотры страниц
  USER: 'user',              // Действия пользователя (регистрация, логин)
  DEMO: 'demo',              // Взаимодействие с демо-приложениями
  ENGAGEMENT: 'engagement',  // Клики, шеры, закладки
  CONVERSION: 'conversion',  // Конверсии (оплата, реферал)
  ERROR: 'error',            // Ошибки
  PERFORMANCE: 'performance', // Метрики производительности
} as const;

// === ДЕЙСТВИЯ ===
// Конкретные действия внутри категорий

export const EVENT_ACTIONS = {
  // Страницы
  VIEW: 'view',
  LEAVE: 'leave',
  SCROLL: 'scroll',
  
  // Пользователь
  REGISTER: 'register',
  LOGIN: 'login',
  
  // Демо
  DEMO_START: 'demo_start',
  DEMO_COMPLETE: 'demo_complete',
  DEMO_INTERACT: 'demo_interact',
  
  // Вовлечённость
  CLICK: 'click',
  SHARE: 'share',
  
  // Конверсии
  REFERRAL_CLICK: 'referral_click',
  REFERRAL_SIGNUP: 'referral_signup',
  PAYMENT_START: 'payment_start',
  PAYMENT_COMPLETE: 'payment_complete',
  
  // Производительность (Web Vitals)
  FCP: 'fcp',
  LCP: 'lcp',
  FID: 'fid',
  CLS: 'cls',
} as const;

// === ИНТЕРФЕЙС СОБЫТИЯ ===

export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;          // Дополнительная метка (например, название кнопки)
  value?: number;          // Числовое значение (например, время в мс)
  metadata?: Record<string, any>; // Любые дополнительные данные
  timestamp: number;
  sessionId: string;       // ID сессии для группировки
  telegramId?: number;     // ID пользователя если авторизован
}
```

**Файл:** `client/src/lib/analytics.ts` — Клиент аналитики

```typescript
import { AnalyticsEvent, EVENT_CATEGORIES, EVENT_ACTIONS } from '@shared/analytics';
import { queueAction } from './offlineStorage';

// === СЕССИЯ ===

const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('analytics_session', sessionId);
  }
  return sessionId;
};

// === ОЧЕРЕДЬ СОБЫТИЙ ===
// Собираем события и отправляем батчами для экономии запросов

const eventQueue: AnalyticsEvent[] = [];
let flushTimeout: NodeJS.Timeout | null = null;

// Отправка событий на сервер
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
      // Офлайн — сохраняем для синхронизации
      await queueAction('analytics/events', { events });
    }
  } catch (error) {
    console.error('[Analytics] Ошибка отправки:', error);
    eventQueue.push(...events); // Возвращаем в очередь
  }
}

// === ГЛАВНАЯ ФУНКЦИЯ ТРЕКИНГА ===

export function track(
  category: string,
  action: string,
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
    telegramId: window.Telegram?.WebApp?.initDataUnsafe?.user?.id,
  };
  
  eventQueue.push(event);
  
  // Отправляем через 1 секунду (собираем батч)
  if (flushTimeout) clearTimeout(flushTimeout);
  flushTimeout = setTimeout(flushEvents, 1000);
}

// === УДОБНЫЕ МЕТОДЫ ===

export const analytics = {
  // Просмотр страницы
  pageView: (path: string, title?: string) =>
    track(EVENT_CATEGORIES.PAGE, EVENT_ACTIONS.VIEW, path, undefined, { title }),
  
  // Начало демо
  demoStart: (demoId: string, demoName: string) =>
    track(EVENT_CATEGORIES.DEMO, EVENT_ACTIONS.DEMO_START, demoId, undefined, { demoName }),
  
  // Завершение демо
  demoComplete: (demoId: string, durationMs: number) =>
    track(EVENT_CATEGORIES.DEMO, EVENT_ACTIONS.DEMO_COMPLETE, demoId, durationMs),
  
  // Клик
  click: (element: string, context?: Record<string, any>) =>
    track(EVENT_CATEGORIES.ENGAGEMENT, EVENT_ACTIONS.CLICK, element, undefined, context),
  
  // Ошибка
  error: (message: string, stack?: string) =>
    track(EVENT_CATEGORIES.ERROR, 'js_error', message, undefined, { stack }),
  
  // Web Vitals
  performance: (metric: string, value: number) =>
    track(EVENT_CATEGORIES.PERFORMANCE, metric, undefined, value),
};

// === АВТОМАТИЧЕСКИЙ ТРЕКИНГ ===

if (typeof window !== 'undefined') {
  // Первый просмотр
  analytics.pageView(window.location.pathname, document.title);
  
  // SPA навигация
  const originalPushState = history.pushState;
  history.pushState = function(...args) {
    originalPushState.apply(this, args);
    analytics.pageView(window.location.pathname, document.title);
  };
  
  // Web Vitals
  import('web-vitals').then(({ onCLS, onFCP, onFID, onLCP }) => {
    onFCP((m) => analytics.performance('fcp', m.value));
    onLCP((m) => analytics.performance('lcp', m.value));
    onFID((m) => analytics.performance('fid', m.value));
    onCLS((m) => analytics.performance('cls', m.value));
  });
}
```

---

## 6. A/B Тестирование

### Что это даёт

| Преимущество | Описание |
|--------------|----------|
| Проверка гипотез | Тестируете изменения на части пользователей |
| Минимизация рисков | Плохое изменение увидят 10%, не все |
| Рост метрик | Находите что работает лучше |
| Культура экспериментов | Решения на основе данных, не мнений |

**Бизнес-ценность:** Компании с A/B тестами растут на 30% быстрее. Netflix тестирует даже иконки фильмов.

**Пример:** Booking.com проводит 1000+ A/B тестов одновременно и увеличил конверсию на 25%.

### Как это работает

```
Определяем эксперимент:
- Контроль (текущий вариант): 50%
- Вариант A (новый): 50%
        ↓
Пользователь заходит
        ↓
Рассчитываем bucket по hash(userId + experimentId)
        ↓
Показываем соответствующий вариант
        ↓
Трекаем конверсии для каждого варианта
        ↓
Через неделю анализируем:
- Контроль: 5% конверсия
- Вариант A: 7% конверсия → Внедряем!
```

### Реализация

**Файл:** `client/src/lib/experiments.ts`

```typescript
import { getCachedData, setCachedData } from './offlineStorage';
import { analytics } from './analytics';

// === КОНФИГУРАЦИЯ ЭКСПЕРИМЕНТОВ ===

interface Experiment {
  id: string;
  name: string;
  variants: string[];
  weights: number[];  // Сумма должна = 1
  active: boolean;
}

// Все активные эксперименты
const EXPERIMENTS: Experiment[] = [
  {
    id: 'homepage_cta',
    name: 'Кнопка на главной',
    variants: ['control', 'variant_a', 'variant_b'],
    weights: [0.34, 0.33, 0.33],  // Равное распределение
    active: true,
  },
  {
    id: 'onboarding_steps',
    name: 'Количество шагов онбординга',
    variants: ['5_steps', '3_steps'],
    weights: [0.5, 0.5],
    active: true,
  },
  {
    id: 'demo_card_layout',
    name: 'Дизайн карточек демо',
    variants: ['grid', 'list'],
    weights: [0.5, 0.5],
    active: false,  // Пока выключен
  },
];

// === ДЕТЕРМИНИРОВАННЫЙ HASH ===
// Один и тот же пользователь ВСЕГДА получает тот же вариант

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

// Bucket от 0 до 99
function getUserBucket(userId: string, experimentId: string): number {
  return hashString(`${userId}:${experimentId}`) % 100;
}

// Выбор варианта по bucket
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

// === ГЛАВНАЯ ФУНКЦИЯ ===

export async function getVariant(experimentId: string): Promise<string | null> {
  const experiment = EXPERIMENTS.find(e => e.id === experimentId);
  
  // Эксперимент не найден или выключен
  if (!experiment || !experiment.active) return null;
  
  // Проверяем кэш (пользователь должен видеть один вариант)
  const cacheKey = `experiment:${experimentId}`;
  const cached = await getCachedData<{ variant: string }>(cacheKey);
  if (cached) {
    return cached.variant;
  }
  
  // Получаем ID пользователя
  const telegramId = window.Telegram?.WebApp?.initDataUnsafe?.user?.id;
  const userId = telegramId?.toString() || 
    localStorage.getItem('anonymous_id') ||
    `anon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  // Сохраняем анонимный ID
  if (!telegramId) {
    localStorage.setItem('anonymous_id', userId);
  }
  
  // Назначаем вариант
  const bucket = getUserBucket(userId, experimentId);
  const variant = assignVariant(experiment, bucket);
  
  // Кэшируем на 30 дней
  await setCachedData(cacheKey, { variant }, 30 * 24 * 60 * 60 * 1000);
  
  // Трекаем назначение
  analytics.track('experiment', 'assign', experimentId, undefined, { variant });
  
  return variant;
}

// === REACT HOOK ===

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

// === ТРЕКИНГ КОНВЕРСИИ ===

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

// Пример использования:
//
// function HomePage() {
//   const { variant, isLoading } = useExperiment('homepage_cta');
//   
//   if (isLoading) return <Skeleton />;
//   
//   return (
//     <Button 
//       variant={variant === 'variant_a' ? 'primary' : 'secondary'}
//       onClick={() => {
//         trackConversion('homepage_cta', 'cta_click');
//         // ...
//       }}
//     >
//       {variant === 'variant_b' ? 'Попробовать бесплатно' : 'Начать'}
//     </Button>
//   );
// }
```

---

## 7. Gamification Engine

### Что это даёт

| Преимущество | Описание |
|--------------|----------|
| Вовлечённость | Пользователи возвращаются ради XP, уровней, наград |
| Удержание | Streak мотивирует заходить каждый день |
| Виральность | Люди хвастаются достижениями |
| Монетизация | Premium-уровни, эксклюзивные награды |

**Бизнес-ценность:** 
- Duolingo: геймификация даёт +200% удержания
- Fitbit: streak увеличил ежедневную активность на 27%
- LinkedIn: progress bar профиля увеличил заполняемость на 55%

### Как это работает

```
Пользователь делает действие (просмотр демо)
        ↓
Rules Engine проверяет правила:
- "demo_view" → +10 XP
- "first_demo" → бейдж "Первопроходец"
        ↓
Награды начисляются
        ↓
Проверяем уровень:
- XP >= 100 → Level UP!
        ↓
Проверяем streak:
- Вчера был? → streak++
- Не был? → streak = 1
```

### Реализация

**Файл:** `server/gamification/engine.ts`

```typescript
import { db } from '../db';
import { users } from '@shared/schema';
import { eq, sql } from 'drizzle-orm';

// === XP И УРОВНИ ===
// Экспоненциальная прогрессия — каждый уровень сложнее

const XP_PER_LEVEL = [
  0,      // Level 1 — старт
  100,    // Level 2 — легко достичь
  250,    // Level 3
  500,    // Level 4
  1000,   // Level 5 — средний пользователь
  2000,   // Level 6
  4000,   // Level 7
  7500,   // Level 8
  12000,  // Level 9
  20000,  // Level 10 — "эндгейм"
];

export function calculateLevel(totalXp: number): { 
  level: number; 
  currentXp: number; 
  nextLevelXp: number;
  progress: number; // 0-100%
} {
  let level = 1;
  
  for (let i = 1; i < XP_PER_LEVEL.length; i++) {
    if (totalXp >= XP_PER_LEVEL[i]) {
      level = i + 1;
    } else {
      break;
    }
  }
  
  const currentLevelXp = XP_PER_LEVEL[level - 1] || 0;
  const nextLevelXp = XP_PER_LEVEL[level] || XP_PER_LEVEL[XP_PER_LEVEL.length - 1] * 2;
  const xpInCurrentLevel = totalXp - currentLevelXp;
  const xpNeededForNext = nextLevelXp - currentLevelXp;
  
  return {
    level,
    currentXp: xpInCurrentLevel,
    nextLevelXp: xpNeededForNext,
    progress: Math.round((xpInCurrentLevel / xpNeededForNext) * 100),
  };
}

// === НАГРАДЫ ===

export async function awardXp(
  telegramId: number, 
  amount: number, 
  reason: string
): Promise<{
  newXp: number;
  leveledUp: boolean;
  newLevel: number;
}> {
  // Получаем текущие данные
  const user = await db.query.users.findFirst({
    where: eq(users.telegramId, telegramId),
  });
  
  if (!user) throw new Error('User not found');
  
  const oldLevel = calculateLevel(user.xp || 0).level;
  const newXp = (user.xp || 0) + amount;
  const { level: newLevel } = calculateLevel(newXp);
  
  // Обновляем в базе
  await db.update(users)
    .set({ 
      xp: newXp,
      level: newLevel,
    })
    .where(eq(users.telegramId, telegramId));
  
  console.log(`[Gamification] ${telegramId}: +${amount} XP (${reason})`);
  
  // Уведомляем если левел ап
  if (newLevel > oldLevel) {
    console.log(`[Gamification] ${telegramId}: LEVEL UP! ${oldLevel} → ${newLevel}`);
    // TODO: Отправить push notification
  }
  
  return {
    newXp,
    leveledUp: newLevel > oldLevel,
    newLevel,
  };
}

export async function awardCoins(
  telegramId: number, 
  amount: number, 
  reason: string
): Promise<number> {
  const result = await db.update(users)
    .set({
      coins: sql`COALESCE(coins, 0) + ${amount}`,
    })
    .where(eq(users.telegramId, telegramId))
    .returning({ coins: users.coins });
  
  console.log(`[Gamification] ${telegramId}: +${amount} coins (${reason})`);
  
  return result[0]?.coins || 0;
}

// === STREAK ===

export async function updateStreak(telegramId: number): Promise<{
  streak: number;
  isNewDay: boolean;
  bonusXp: number;
}> {
  const user = await db.query.users.findFirst({
    where: eq(users.telegramId, telegramId),
  });
  
  if (!user) throw new Error('User not found');
  
  const now = new Date();
  const today = now.toDateString();
  const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
  const lastActiveDay = lastActive?.toDateString();
  
  // Уже заходил сегодня
  if (lastActiveDay === today) {
    return { 
      streak: user.streak || 1, 
      isNewDay: false, 
      bonusXp: 0 
    };
  }
  
  let newStreak = 1;
  
  if (lastActive) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (lastActiveDay === yesterday.toDateString()) {
      // Заходил вчера — продолжаем streak
      newStreak = (user.streak || 0) + 1;
    }
    // Иначе streak сбрасывается
  }
  
  // Бонус за streak (max +50 XP)
  const bonusXp = Math.min(newStreak * 5, 50);
  
  // Обновляем
  await db.update(users)
    .set({
      streak: newStreak,
      lastActiveAt: now,
    })
    .where(eq(users.telegramId, telegramId));
  
  // Начисляем бонус
  if (bonusXp > 0) {
    await awardXp(telegramId, bonusXp, `Streak bonus (${newStreak} days)`);
  }
  
  console.log(`[Gamification] ${telegramId}: Streak ${newStreak} days, bonus +${bonusXp} XP`);
  
  return { streak: newStreak, isNewDay: true, bonusXp };
}

// === ПРАВИЛА (Rules Engine) ===

interface GamificationRule {
  id: string;
  trigger: string;          // Какое событие активирует
  xpReward?: number;
  coinsReward?: number;
  badgeId?: string;
  maxExecutions?: number;   // Максимум раз (1 = только первый раз)
}

const RULES: GamificationRule[] = [
  // Базовые награды
  { id: 'demo_view', trigger: 'demo_view', xpReward: 10 },
  { id: 'demo_complete', trigger: 'demo_complete', xpReward: 25, coinsReward: 5 },
  { id: 'share', trigger: 'share', xpReward: 15, coinsReward: 3 },
  
  // Рефералы
  { id: 'referral_signup', trigger: 'referral_signup', xpReward: 100, coinsReward: 50 },
  
  // Достижения (только первый раз)
  { id: 'first_demo', trigger: 'demo_complete', badgeId: 'first_explorer', xpReward: 50, maxExecutions: 1 },
  { id: 'five_demos', trigger: 'five_demos_completed', badgeId: 'demo_master', xpReward: 200, maxExecutions: 1 },
];

// Выполнение правила
export async function executeRule(
  telegramId: number, 
  eventName: string
): Promise<void> {
  const matchingRules = RULES.filter(r => r.trigger === eventName);
  
  for (const rule of matchingRules) {
    try {
      // TODO: Проверить maxExecutions через базу
      
      if (rule.xpReward) {
        await awardXp(telegramId, rule.xpReward, rule.id);
      }
      if (rule.coinsReward) {
        await awardCoins(telegramId, rule.coinsReward, rule.id);
      }
      if (rule.badgeId) {
        console.log(`[Gamification] ${telegramId}: Badge "${rule.badgeId}" awarded`);
        // TODO: Сохранить бейдж
      }
    } catch (error) {
      console.error(`[Gamification] Rule "${rule.id}" failed:`, error);
    }
  }
}
```

---

## 8. AI Integration

### Что это даёт

| Преимущество | Описание |
|--------------|----------|
| 24/7 поддержка | AI отвечает мгновенно, не нужен штат |
| Персонализация | AI адаптирует контент под пользователя |
| WOW-эффект | Современный AI впечатляет пользователей |
| Масштабируемость | 1000 пользователей одновременно — не проблема |

**Бизнес-ценность:** 
- AI-чат заменяет 5 операторов поддержки
- Экономия $5000+/месяц на зарплатах
- Время ответа: 2 секунды vs 15 минут

**Риски без safety:** Prompt injection, генерация вредного контента, утечка данных.

### Как это работает

```
Пользователь пишет вопрос
        ↓
Safety filter проверяет на prompt injection
        ↓
Rate limiter проверяет дневной лимит
        ↓
Orchestrator выбирает конфигурацию AI
        ↓
GPT-4o-mini генерирует ответ
        ↓
Ответ возвращается пользователю (streaming)
```

### Реализация

**Файл:** `server/ai/orchestrator.ts`

```typescript
import OpenAI from 'openai';

// === КОНФИГУРАЦИИ ===
// Разные задачи требуют разных настроек

interface AIConfig {
  model: string;
  temperature: number;  // 0 = детерминированный, 1 = креативный
  maxTokens: number;
  systemPrompt: string;
}

const AI_CONFIGS: Record<string, AIConfig> = {
  // Демо-ассистент — быстрые короткие ответы
  demo_assistant: {
    model: 'gpt-4o-mini',  // Быстрый и дешёвый
    temperature: 0.7,
    maxTokens: 300,
    systemPrompt: `Ты — помощник в демо-приложении Telegram Mini App.
Отвечай кратко (1-2 предложения).
Будь дружелюбным и полезным.
Язык: русский.`,
  },
  
  // Поддержка — более детальные ответы
  support: {
    model: 'gpt-4o-mini',
    temperature: 0.3,  // Более предсказуемый
    maxTokens: 800,
    systemPrompt: `Ты — служба поддержки платформы WEB4TG.
Помогай с вопросами о Mini App, демо-приложениях, оплате.
Если не знаешь ответ — предложи связаться с человеком.
Будь вежлив и профессионален.`,
  },
  
  // Креатив — генерация контента
  creative: {
    model: 'gpt-4o',  // Мощнее для сложных задач
    temperature: 0.9,  // Креативный
    maxTokens: 1500,
    systemPrompt: `Ты — креативный помощник.
Генерируй интересный контент для бизнеса.`,
  },
};

// === ORCHESTRATOR ===

export class AIOrchestrator {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  async chat(
    configName: keyof typeof AI_CONFIGS,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): Promise<{
    content: string;
    tokensUsed: number;
    latencyMs: number;
  }> {
    const config = AI_CONFIGS[configName];
    if (!config) throw new Error(`Unknown config: ${configName}`);
    
    const startTime = Date.now();
    
    const response = await this.openai.chat.completions.create({
      model: config.model,
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      messages: [
        { role: 'system', content: config.systemPrompt },
        ...messages,
      ],
    });
    
    return {
      content: response.choices[0]?.message?.content || '',
      tokensUsed: response.usage?.total_tokens || 0,
      latencyMs: Date.now() - startTime,
    };
  }
  
  // Streaming для real-time ответов
  async *chatStream(
    configName: keyof typeof AI_CONFIGS,
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
  ): AsyncGenerator<string> {
    const config = AI_CONFIGS[configName];
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
      if (content) yield content;
    }
  }
}

export const aiOrchestrator = new AIOrchestrator();
```

**Файл:** `server/ai/safety.ts` — Защита от prompt injection

```typescript
// === ЗАПРЕЩЁННЫЕ ПАТТЕРНЫ ===
// Попытки обойти системный промпт

const BLOCKED_PATTERNS = [
  /ignore\s+(?:all\s+)?(?:previous\s+)?instructions/i,
  /ignore\s+(?:the\s+)?system\s+prompt/i,
  /you\s+are\s+now\s+/i,
  /pretend\s+(?:you\s+are|to\s+be)/i,
  /act\s+as\s+(?:if|though)/i,
  /jailbreak/i,
  /bypass\s+(?:security|filters)/i,
  /DAN\s+mode/i,
  /developer\s+mode/i,
];

export function checkInputSafety(input: string): {
  safe: boolean;
  reason?: string;
} {
  // Проверяем запрещённые паттерны
  for (const pattern of BLOCKED_PATTERNS) {
    if (pattern.test(input)) {
      console.warn('[AI Safety] Blocked pattern detected:', pattern.source);
      return {
        safe: false,
        reason: 'Подозрительный запрос обнаружен',
      };
    }
  }
  
  // Проверяем длину
  if (input.length > 2000) {
    return {
      safe: false,
      reason: 'Сообщение слишком длинное',
    };
  }
  
  return { safe: true };
}

// === RATE LIMITING ДЛЯ AI ===
// AI дороже обычных запросов — жёстче лимиты

const AI_USAGE = new Map<number, { count: number; resetAt: number }>();
const DAILY_LIMIT = 50;  // 50 запросов в день на пользователя

export function checkAIRateLimit(telegramId: number): {
  allowed: boolean;
  remaining: number;
  resetAt: number;
} {
  const now = Date.now();
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  
  const userData = AI_USAGE.get(telegramId);
  
  // Новый день или новый пользователь
  if (!userData || userData.resetAt < now) {
    AI_USAGE.set(telegramId, {
      count: 1,
      resetAt: endOfDay.getTime(),
    });
    return { allowed: true, remaining: DAILY_LIMIT - 1, resetAt: endOfDay.getTime() };
  }
  
  // Лимит исчерпан
  if (userData.count >= DAILY_LIMIT) {
    return { allowed: false, remaining: 0, resetAt: userData.resetAt };
  }
  
  // Увеличиваем счётчик
  userData.count++;
  return { 
    allowed: true, 
    remaining: DAILY_LIMIT - userData.count,
    resetAt: userData.resetAt,
  };
}
```

---

## 9. Telegram Viewport Optimization

### Что это даёт

| Преимущество | Описание |
|--------------|----------|
| Идеальное отображение | На всех устройствах, включая iPhone с Dynamic Island |
| Нет обрезанного контента | Кнопки не скрыты за системными элементами |
| Haptic feedback | Вибрация при нажатии как в нативных приложениях |
| Native feel | Ощущение что это нативное приложение |

**Бизнес-ценность:** Пользователь не видит багов = доверяет = покупает.

**Проблема без этого:** Контент скрыт за "чёлкой" iPhone, кнопки под системной клавиатурой.

### Как это работает

```
Telegram сообщает размеры viewport и safe area
        ↓
React hook слушает изменения
        ↓
CSS custom properties обновляются
        ↓
UI адаптируется автоматически
```

### Реализация

**Файл:** `client/src/hooks/useTelegramViewport.ts`

```typescript
import { useState, useEffect } from 'react';

interface ViewportState {
  height: number;           // Текущая высота viewport
  stableHeight: number;     // Стабильная высота (без клавиатуры)
  isExpanded: boolean;      // Развёрнуто ли на весь экран
  safeArea: {
    top: number;            // Отступ сверху (чёлка, Dynamic Island)
    bottom: number;         // Отступ снизу (home indicator)
    left: number;
    right: number;
  };
}

export function useTelegramViewport(): ViewportState {
  const [viewport, setViewport] = useState<ViewportState>({
    height: window.innerHeight,
    stableHeight: window.innerHeight,
    isExpanded: false,
    safeArea: { top: 0, bottom: 0, left: 0, right: 0 },
  });
  
  useEffect(() => {
    const WebApp = window.Telegram?.WebApp;
    if (!WebApp) {
      console.log('[Viewport] Not in Telegram, using defaults');
      return;
    }
    
    const updateViewport = () => {
      const newViewport = {
        height: WebApp.viewportHeight || window.innerHeight,
        stableHeight: WebApp.viewportStableHeight || window.innerHeight,
        isExpanded: WebApp.isExpanded || false,
        safeArea: {
          top: WebApp.safeAreaInset?.top || 0,
          bottom: WebApp.safeAreaInset?.bottom || 0,
          left: WebApp.safeAreaInset?.left || 0,
          right: WebApp.safeAreaInset?.right || 0,
        },
      };
      
      setViewport(newViewport);
      
      // Обновляем CSS custom properties
      document.documentElement.style.setProperty(
        '--tg-viewport-height', 
        `${newViewport.height}px`
      );
      document.documentElement.style.setProperty(
        '--tg-viewport-stable-height', 
        `${newViewport.stableHeight}px`
      );
      document.documentElement.style.setProperty(
        '--tg-safe-top', 
        `${newViewport.safeArea.top}px`
      );
      document.documentElement.style.setProperty(
        '--tg-safe-bottom', 
        `${newViewport.safeArea.bottom}px`
      );
    };
    
    // Начальное обновление
    updateViewport();
    
    // Подписываемся на изменения
    WebApp.onEvent('viewportChanged', updateViewport);
    
    // Разворачиваем на весь экран
    WebApp.expand();
    
    return () => {
      WebApp.offEvent('viewportChanged', updateViewport);
    };
  }, []);
  
  return viewport;
}

// Использование в CSS:
// 
// .container {
//   height: var(--tg-viewport-height, 100vh);
//   padding-top: var(--tg-safe-top, 0);
//   padding-bottom: var(--tg-safe-bottom, 0);
// }
```

**Файл:** `client/src/lib/haptics.ts`

```typescript
// Типы тактильной обратной связи
type HapticType = 
  | 'light'          // Лёгкий тап
  | 'medium'         // Обычное нажатие
  | 'heavy'          // Сильное нажатие
  | 'success'        // Успех (зелёная галочка)
  | 'warning'        // Предупреждение
  | 'error'          // Ошибка
  | 'selection';     // Изменение выбора

export function haptic(type: HapticType): void {
  const WebApp = window.Telegram?.WebApp;
  if (!WebApp?.HapticFeedback) return;
  
  try {
    switch (type) {
      case 'light':
      case 'medium':
      case 'heavy':
        WebApp.HapticFeedback.impactOccurred(type);
        break;
      case 'success':
      case 'warning':
      case 'error':
        WebApp.HapticFeedback.notificationOccurred(type);
        break;
      case 'selection':
        WebApp.HapticFeedback.selectionChanged();
        break;
    }
  } catch (error) {
    // Не поддерживается — игнорируем
  }
}

// React hook
export function useHaptic() {
  return {
    light: () => haptic('light'),
    medium: () => haptic('medium'),
    heavy: () => haptic('heavy'),
    success: () => haptic('success'),
    warning: () => haptic('warning'),
    error: () => haptic('error'),
    selection: () => haptic('selection'),
  };
}

// Пример использования:
//
// function LikeButton() {
//   const haptic = useHaptic();
//   
//   return (
//     <Button onClick={() => {
//       haptic.light();  // Вибрация при клике
//       // ...
//     }}>
//       Like
//     </Button>
//   );
// }
```

---

## 10. CI/CD Pipeline

### Что это даёт

| Преимущество | Описание |
|--------------|----------|
| Автоматические проверки | Ошибки ловятся ДО релиза |
| Быстрые деплои | Изменения на продакшене за 5 минут |
| Уверенность | Тесты гарантируют что ничего не сломано |
| История | Видно кто, когда и что изменил |

**Бизнес-ценность:** 
- Разработчики тратят время на фичи, не на ручное тестирование
- Экономия 10+ часов в неделю
- Ноль "сломал продакшен в пятницу вечером"

### Как это работает

```
Push в main branch
        ↓
GitHub Actions запускается
        ↓
1. Lint & TypeCheck → Синтаксические ошибки
2. Unit Tests → Логика работает
3. Build → Приложение собирается
4. Lighthouse → Производительность в норме
5. E2E Tests → Пользовательские сценарии работают
        ↓
Все проверки прошли?
        ↓
Да → Deploy на Railway
Нет → Блокируем, исправляем
```

### Реализация

**Файл:** `.github/workflows/ci.yml`

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'

jobs:
  # ========== ЛИНТИНГ И ТИПЫ ==========
  lint:
    name: Lint & TypeCheck
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
        run: npx tsc --noEmit
      
      - name: ESLint
        run: npm run lint

  # ========== ТЕСТЫ ==========
  test:
    name: Unit Tests
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
        run: npm run test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v4
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: false

  # ========== СБОРКА ==========
  build:
    name: Build
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
      
      # Сохраняем артефакты для следующих шагов
      - name: Upload build
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist/

  # ========== LIGHTHOUSE ==========
  lighthouse:
    name: Lighthouse CI
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4
      
      - name: Download build
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist/
      
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v11
        with:
          configPath: './lighthouserc.json'
          uploadArtifacts: true

  # ========== ДЕПЛОЙ ==========
  deploy:
    name: Deploy to Railway
    runs-on: ubuntu-latest
    needs: [build, lighthouse]
    if: github.ref == 'refs/heads/main'  # Только main branch
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy
        uses: bervProject/railway-deploy@main
        with:
          railway_token: ${{ secrets.RAILWAY_TOKEN }}
          service: ${{ secrets.RAILWAY_SERVICE_ID }}
```

**Файл:** `lighthouserc.json` — Бюджеты производительности

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
        "first-contentful-paint": ["error", { "maxNumericValue": 2000 }],
        "largest-contentful-paint": ["error", { "maxNumericValue": 3000 }],
        "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
      }
    }
  }
}
```

---

## Сводная таблица ценности

| # | Улучшение | Что даёт | Метрика успеха |
|---|-----------|----------|----------------|
| 1 | Telegram Auth | Защита от подделки пользователей | 0 инцидентов безопасности |
| 2 | Rate Limiting | Защита от DDoS и ботов | 99.9% uptime |
| 3 | Code-Splitting | Быстрая загрузка | FCP < 2 секунды |
| 4 | Offline Sync | Работа без интернета | 0 потерянных действий |
| 5 | Аналитика | Понимание пользователей | Данные для решений |
| 6 | A/B тесты | Оптимизация конверсии | +30% рост метрик |
| 7 | Gamification | Вовлечённость и удержание | +200% retention |
| 8 | AI Integration | Автоматизация поддержки | -80% нагрузка на людей |
| 9 | Viewport | Идеальное отображение | 0 жалоб на UI |
| 10 | CI/CD | Быстрые и надёжные релизы | Деплой за 5 минут |

---

## План внедрения

### Фаза 1: Безопасность (1-2 недели)
- [ ] Telegram initData validation
- [ ] Rate limiting per Telegram ID
- [ ] Audit logging

### Фаза 2: Производительность (1-2 недели)
- [ ] Code-splitting optimization
- [ ] Speculative prefetch
- [ ] Image optimization

### Фаза 3: Offline (1 неделя)
- [ ] Service Worker
- [ ] Background sync
- [ ] Optimistic UI

### Фаза 4: Аналитика & Эксперименты (1-2 недели)
- [ ] Event taxonomy
- [ ] A/B testing infrastructure
- [ ] Dashboard

### Фаза 5: Gamification & AI (2 недели)
- [ ] Rules engine
- [ ] AI orchestrator
- [ ] Safety filters

### Фаза 6: CI/CD (1 неделя)
- [ ] GitHub Actions
- [ ] Lighthouse CI
- [ ] Auto-deploy

---

**Общее время:** 8-12 недель

**Приоритет:** Безопасность → Производительность → Офлайн → Аналитика → Gamification → AI → CI/CD
