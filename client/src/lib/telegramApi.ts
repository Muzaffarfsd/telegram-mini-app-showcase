import { sameOriginApiUrl } from './apiUrl';
import { getCSRFToken } from './apiClient';

export async function telegramApiRequest(
  method: string,
  url: string,
  initData: string,
  data?: unknown,
): Promise<Response> {
  url = sameOriginApiUrl(url);
  const headers: Record<string, string> = {
    'x-telegram-init-data': initData,
  };
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method.toUpperCase())) {
    const token = await getCSRFToken();
    if (!token) throw new Error('Could not prepare secure request');
    headers['X-CSRF-Token'] = token;
  }

  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
    cache: 'no-store',
    redirect: 'error',
  });

  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }

  return res;
}

export async function getTelegramApiData<T>(
  url: string,
  initData: string,
): Promise<T> {
  const res = await telegramApiRequest('GET', url, initData);
  return await res.json();
}

export async function postTelegramApiData<T>(
  url: string,
  initData: string,
  data: unknown,
): Promise<T> {
  const res = await telegramApiRequest('POST', url, initData, data);
  return await res.json();
}
