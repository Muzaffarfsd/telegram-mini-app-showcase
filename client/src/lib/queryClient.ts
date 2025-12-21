import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { ZodSchema } from "zod";
import { logger } from "./logger";
import { getCachedApiResponse, cacheApiResponse, CACHE_TTL } from "./telegramStorage";

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

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  const headers: Record<string, string> = {};
  
  if (data) {
    headers["Content-Type"] = "application/json";
  }
  
  const initData = getTelegramInitData();
  if (initData) {
    headers["X-Telegram-Init-Data"] = initData;
  }

  const startTime = performance.now();
  
  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  const duration = Math.round(performance.now() - startTime);
  logger.api(method, url, res.status, duration);

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";

export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const headers: Record<string, string> = {};
    
    const initData = getTelegramInitData();
    if (initData) {
      headers["X-Telegram-Init-Data"] = initData;
    }

    const startTime = performance.now();
    
    const res = await fetch(url, {
      credentials: "include",
      headers,
    });

    const duration = Math.round(performance.now() - startTime);
    logger.api('GET', url, res.status, duration);

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export function createTypedQueryFn<T>(options: {
  on401: UnauthorizedBehavior;
  schema: ZodSchema<T>;
}): QueryFunction<T> {
  const { on401: unauthorizedBehavior, schema } = options;
  
  return async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const headers: Record<string, string> = {};
    
    const initData = getTelegramInitData();
    if (initData) {
      headers["X-Telegram-Init-Data"] = initData;
    }

    const startTime = performance.now();
    
    const res = await fetch(url, {
      credentials: "include",
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

const CACHE_TIME = {
  SHORT: 1 * 60 * 1000,
  MEDIUM: 5 * 60 * 1000,
  LONG: 15 * 60 * 1000,
  INFINITE: Infinity,
} as const;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      staleTime: CACHE_TIME.MEDIUM,
      gcTime: CACHE_TIME.LONG,
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
 * Query function with DeviceStorage caching (Bot API 9.2)
 * Seeds queryClient with cached data, then fetches fresh data
 */
export function getCachedQueryFn<T>(options: {
  on401: UnauthorizedBehavior;
  cacheTtl?: number;
}): QueryFunction<T> {
  const { on401: unauthorizedBehavior, cacheTtl = CACHE_TTL.FIVE_MINUTES } = options;
  
  return async ({ queryKey }) => {
    const url = queryKey[0] as string;
    
    const cached = await getCachedApiResponse<T>(url);
    if (cached !== null) {
      queryClient.setQueryData(queryKey, cached);
    }
    
    return fetchAndCache<T>(url, unauthorizedBehavior, cacheTtl);
  };
}

async function fetchAndCache<T>(
  url: string, 
  unauthorizedBehavior: UnauthorizedBehavior,
  cacheTtl: number
): Promise<T> {
  const headers: Record<string, string> = {};
  
  const initData = getTelegramInitData();
  if (initData) {
    headers["X-Telegram-Init-Data"] = initData;
  }

  const startTime = performance.now();
  
  const res = await fetch(url, {
    credentials: "include",
    headers,
  });

  const duration = Math.round(performance.now() - startTime);
  logger.api('GET', url, res.status, duration);

  if (unauthorizedBehavior === "returnNull" && res.status === 401) {
    return null as T;
  }

  await throwIfResNotOk(res);
  const data = await res.json();
  
  try {
    await cacheApiResponse(url, data, cacheTtl);
  } catch {
    // Silently ignore storage errors - caching is optional
  }
  
  return data;
}

export { CACHE_TIME, CACHE_TTL };
