import { sameOriginApiUrl } from './apiUrl';

export class ProfileRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = 'ProfileRequestError';
  }
}

export function referralCodeFromStart(initData: string): string | null {
  const fromTelegram = new URLSearchParams(initData).get('start_param');
  const fromUrl = new URLSearchParams(window.location.search).get('tgWebAppStartParam');
  const candidate = (fromTelegram || fromUrl || '').trim().toUpperCase();
  return /^(?:WEB4TG|W4T)[A-Z0-9]{1,44}$/.test(candidate) ? candidate : null;
}

async function readResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      typeof body.message === 'string'
        ? body.message
        : typeof body.error === 'string'
          ? body.error
          : 'Request failed';
    throw new ProfileRequestError(message, response.status);
  }
  return body as T;
}

/** Mutations use the same Telegram session and CSRF protection as the profile. */
export async function profilePost<T>(url: string, initData: string, body: unknown): Promise<T> {
  url = sameOriginApiUrl(url);
  if (!initData) throw new ProfileRequestError('Telegram authorization is required', 401);
  const headers = { 'x-telegram-init-data': initData };
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 15000);
  try {
    const tokenResponse = await fetch('/api/csrf-token', {
      headers,
      credentials: 'include',
      cache: 'no-store',
      redirect: 'error',
      signal: controller.signal,
    });
    const tokenData = await readResponse<{ csrfToken?: string; token?: string }>(tokenResponse);
    const token = tokenData.csrfToken || tokenData.token;
    if (!token) throw new ProfileRequestError('Could not prepare request', 0);
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      redirect: 'error',
      headers: { ...headers, 'Content-Type': 'application/json', 'x-csrf-token': token },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    return await readResponse<T>(response);
  } finally {
    window.clearTimeout(timer);
  }
}
