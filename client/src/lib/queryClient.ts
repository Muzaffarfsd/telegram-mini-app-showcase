import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { ZodSchema } from "zod";
import { logger } from "./logger";
import { CACHE_TTL } from "./telegramStorage";
import { sameOriginApiUrl } from './apiUrl';
import { getCSRFToken } from './apiClient';

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

function getTelegramInitData(): string {
  try {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
      return window.Telegram.WebApp.initData;
    }
  } catch {
    return '';
  }
  return '';
}

function getNetworkTimeout(): number {
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (conn) {
    const et = conn.effectiveType;
    if (et === 'slow-2g' || et === '2g') return 30000;
    if (et === '3g') return 20000;
  }
  return 15000;
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  url = sameOriginApiUrl(url);
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  const initData = getTelegramInitData();
  if (initData) {
    headers["X-Telegram-Init-Data"] = initData;
  }
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    const token = await getCSRFToken();
    if (!token) throw new Error('Could not prepare secure request');
    headers['X-CSRF-Token'] = token;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), getNetworkTimeout());
  const startTime = performance.now();
  
  try {
    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
      cache: 'no-store',
      redirect: 'error',
      signal: controller.signal,
    });

    const duration = Math.round(performance.now() - startTime);
    logger.api(method, url, res.status, duration);

    await throwIfResNotOk(res);
    return res;
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new Error(`408: Request timeout for ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey, signal }) => {
    const url = sameOriginApiUrl(queryKey[0] as string);
    const headers: Record<string, string> = {};
    
    const initData = getTelegramInitData();
    if (initData) {
      headers["X-Telegram-Init-Data"] = initData;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), getNetworkTimeout());
    if (signal) {
      signal.addEventListener('abort', () => controller.abort());
    }
    const startTime = performance.now();
    
    try {
      const res = await fetch(url, {
        credentials: "include",
        cache: 'no-store',
        redirect: 'error',
        headers,
        signal: controller.signal,
      });

      const duration = Math.round(performance.now() - startTime);
      logger.api('GET', url, res.status, duration);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      await throwIfResNotOk(res);
      return await res.json();
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error(`408: Request timeout for ${url}`);
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }
  };

export function createTypedQueryFn<T>(options: {
  on401: UnauthorizedBehavior;
  schema: ZodSchema<T>;
}): QueryFunction<T> {
  const { on401: unauthorizedBehavior, schema } = options;
  
  return async ({ queryKey }) => {
    const url = sameOriginApiUrl(queryKey[0] as string);
    const headers: Record<string, string> = {};
    
    const initData = getTelegramInitData();
    if (initData) {
      headers["X-Telegram-Init-Data"] = initData;
    }

    const startTime = performance.now();
    
    const res = await fetch(url, {
      credentials: "include",
      cache: 'no-store',
      redirect: 'error',
      headers,
    });

    const duration = Math.round(performance.now() - startTime);
    logger.api('GET', url, res.status, duration);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null as T;
    }

    await throwIfResNotOk(res);
    const data = await res.json();
    
    const result = schema.safeParse(data);
    if (!result.success) {
      logger.error('API response validation failed', result.error, { url });
      throw new Error(`Validation failed: ${result.error.message}`);
    }
    
    return result.data;
  };
}

function getSlowNetworkMultiplier(): number {
  const conn = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  if (conn) {
    if (conn.saveData) return 4;
    const et = conn.effectiveType;
    if (et === 'slow-2g' || et === '2g') return 4;
    if (et === '3g') return 2;
  }
  return 1;
}

const CACHE_TIME = {
  SHORT: 1 * 60 * 1000,
  MEDIUM: 5 * 60 * 1000,
  LONG: 15 * 60 * 1000,
  INFINITE: Infinity,
} as const;

const netMultiplier = getSlowNetworkMultiplier();

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      staleTime: CACHE_TIME.MEDIUM * netMultiplier,
      gcTime: CACHE_TIME.LONG * netMultiplier,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if (error instanceof Error) {
          const status = parseInt(error.message.split(':')[0]);
          if ([401, 403, 404].includes(status)) {
            return false;
          }
        }
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
    },
    mutations: {
      retry: false,
      onError: (error) => {
        logger.error('Mutation failed', error);
      },
    },
  },
});

export function invalidateQueries(keys: string[]): Promise<void> {
  return Promise.all(
    keys.map(key => queryClient.invalidateQueries({ queryKey: [key] }))
  ).then(() => undefined);
}

export function prefetchQuery<T>(
  queryKey: string[],
  queryFn?: QueryFunction<T>
): Promise<void> {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn: queryFn || getQueryFn({ on401: "throw" }),
  });
}

/**
 * Backward-compatible query helper. API results stay in the in-memory query
 * client; persisting responses by URL can expose another session's data.
 */
export function getCachedQueryFn<T>(options: {
  on401: UnauthorizedBehavior;
  cacheTtl?: number;
}): QueryFunction<T> {
  return getQueryFn<T>({ on401: options.on401 });
}

export { CACHE_TIME, CACHE_TTL };
