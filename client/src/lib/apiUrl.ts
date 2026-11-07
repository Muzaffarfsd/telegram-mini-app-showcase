/** Authenticated helpers must never forward Telegram credentials outside this API. */
export function sameOriginApiUrl(input: string, origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : undefined);
  if (!base || typeof input !== 'string' || input.length > 4096) {
    throw new Error('Invalid API URL');
  }
  const url = new URL(input, `${base}/`);
  if (
    url.origin !== new URL(base).origin ||
    !['https:', 'http:'].includes(url.protocol) ||
    url.username || url.password || url.hash ||
    !url.pathname.startsWith('/api/')
  ) {
    throw new Error('API requests must use this application’s API');
  }
  return `${url.pathname}${url.search}`;
}
