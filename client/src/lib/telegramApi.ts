export async function telegramApiRequest(
  method: string,
  url: string,
  initData: string,
  data?: unknown,
): Promise<Response> {
  const headers: Record<string, string> = {
    'x-telegram-init-data': initData,
  };

  if (data) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(url, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: 'include',
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
