import { Redis } from '@upstash/redis';

let redis: Redis | null = null;

export function getRedis(): Redis | null {
  if (redis) return redis;
  
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (!url || !token) {
    console.log('[Redis] Credentials not configured - caching disabled');
    return null;
  }
  
  try {
    redis = new Redis({ url, token });
    console.log('[Redis] Connected to Upstash Redis');
    return redis;
  } catch (error) {
    console.error('[Redis] Connection failed:', error);
    return null;
  }
}

const CACHE_TTL = {
  LEADERBOARD: 60,
  USER_STATS: 30,
  DAILY_TASKS: 120,
};

export async function getCached<T>(key: string): Promise<T | null> {
  const r = getRedis();
  if (!r) return null;
  
  try {
    const data = await r.get<T>(key);
    return data;
  } catch (error) {
    console.error('[Redis] Get error:', error);
    return null;
  }
}

export async function setCache<T>(key: string, value: T, ttlSeconds: number = 60): Promise<void> {
  const r = getRedis();
  if (!r) return;
  
  try {
    await r.set(key, value, { ex: ttlSeconds });
  } catch (error) {
    console.error('[Redis] Set error:', error);
  }
}

export async function invalidateCache(pattern: string): Promise<void> {
  const r = getRedis();
  if (!r) return;
  
  try {
    const keys = await r.keys(pattern);
    if (keys.length > 0) {
      await r.del(...keys);
    }
  } catch (error) {
    console.error('[Redis] Invalidate error:', error);
  }
}

export const cacheKeys = {
  leaderboard: () => 'leaderboard:top',
  userStats: (telegramId: number) => `user:${telegramId}:stats`,
  dailyTasks: (telegramId: number) => `user:${telegramId}:tasks`,
};

export { CACHE_TTL };
