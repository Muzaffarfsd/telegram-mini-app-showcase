import { z, ZodSchema } from 'zod';
import { logger } from './logger';

type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions<T = unknown> {
  method?: HTTPMethod;
  body?: unknown;
  schema?: ZodSchema<T>;
  headers?: Record<string, string>;
  timeout?: number;
  skipAuth?: boolean;
}

interface APIResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

interface APIError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

class APIClientError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor({ message, status, code, details }: APIError) {
    super(message);
    this.name = 'APIClientError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

let csrfToken: string | null = null;
let csrfTokenPromise: Promise<string> | null = null;

async function getCSRFToken(): Promise<string> {
  if (csrfToken) return csrfToken;
  
  if (csrfTokenPromise) return csrfTokenPromise;
  
  csrfTokenPromise = fetch('/api/csrf-token', { credentials: 'include' })
    .then(res => res.json())
    .then(data => {
      csrfToken = data.token;
      return csrfToken!;
    })
    .catch(err => {
      logger.warn('Failed to fetch CSRF token', { error: err.message });
      return '';
    })
    .finally(() => {
      csrfTokenPromise = null;
    });
  
  return csrfTokenPromise;
}

function getTelegramInitData(): string {
  try {
    if (typeof window !== 'undefined' && window.Telegram?.WebApp?.initData) {
      return window.Telegram.WebApp.initData;
    }
  } catch {
    logger.debug('Telegram WebApp not available');
  }
  return '';
}

async function request<T>(
  url: string,
  options: RequestOptions<T> = {}
): Promise<APIResponse<T>> {
  const {
    method = 'GET',
    body,
    schema,
    headers = {},
    timeout = 30000,
    skipAuth = false,
  } = options;

  const startTime = performance.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const requestHeaders: Record<string, string> = {
      ...headers,
    };

    if (body) {
      requestHeaders['Content-Type'] = 'application/json';
    }

    if (!skipAuth) {
      const initData = getTelegramInitData();
      if (initData) {
        requestHeaders['X-Telegram-Init-Data'] = initData;
      }

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
        const token = await getCSRFToken();
        if (token) {
          requestHeaders['X-CSRF-Token'] = token;
        }
      }
    }

    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      credentials: 'include',
      signal: controller.signal,
    });

    const duration = Math.round(performance.now() - startTime);
    logger.api(method, url, response.status, duration);

    if (!response.ok) {
      let errorData: { error?: string; message?: string; code?: string; details?: unknown } = {};
      
      try {
        errorData = await response.json();
      } catch {
        errorData = { error: response.statusText };
      }

      if (response.status === 401) {
        logger.warn('Unauthorized request', { url });
        csrfToken = null;
      }

      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        logger.warn('Rate limited', { url, retryAfter });
      }

      throw new APIClientError({
        message: errorData.error || errorData.message || 'Request failed',
        status: response.status,
        code: errorData.code,
        details: errorData.details,
      });
    }

    const data = await response.json();

    if (schema) {
      const result = schema.safeParse(data);
      if (!result.success) {
        logger.error('API response validation failed', result.error, { url, data });
        throw new APIClientError({
          message: 'Invalid response format',
          status: response.status,
          code: 'VALIDATION_ERROR',
          details: result.error.issues,
        });
      }
      return { data: result.data, status: response.status, headers: response.headers };
    }

    return { data, status: response.status, headers: response.headers };
  } catch (error) {
    if (error instanceof APIClientError) {
      throw error;
    }

    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIClientError({
        message: 'Request timeout',
        status: 408,
        code: 'TIMEOUT',
      });
    }

    logger.error('Network error', error);
    throw new APIClientError({
      message: 'Network error',
      status: 0,
      code: 'NETWORK_ERROR',
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  async get<T>(url: string, schema?: ZodSchema<T>): Promise<T> {
    const response = await request<T>(url, { method: 'GET', schema });
    return response.data;
  },

  async post<T>(url: string, body?: unknown, schema?: ZodSchema<T>): Promise<T> {
    const response = await request<T>(url, { method: 'POST', body, schema });
    return response.data;
  },

  async put<T>(url: string, body?: unknown, schema?: ZodSchema<T>): Promise<T> {
    const response = await request<T>(url, { method: 'PUT', body, schema });
    return response.data;
  },

  async patch<T>(url: string, body?: unknown, schema?: ZodSchema<T>): Promise<T> {
    const response = await request<T>(url, { method: 'PATCH', body, schema });
    return response.data;
  },

  async delete<T>(url: string, schema?: ZodSchema<T>): Promise<T> {
    const response = await request<T>(url, { method: 'DELETE', schema });
    return response.data;
  },

  request,
  APIClientError,
};

export type { APIResponse, APIError, RequestOptions };
export { APIClientError };
export default apiClient;
