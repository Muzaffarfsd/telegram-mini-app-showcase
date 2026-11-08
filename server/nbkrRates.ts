/** Official NBKR rates are expressed in KGS per nominal units of each currency. */
export type NbkrRate = {
  rubToUsd: number;
  effectiveDate: string;
  source: 'NBKR';
  stale: boolean;
};

const NBKR_URL = 'https://www.nbkr.kg/XML/daily.xml';
const MAX_BYTES = 64 * 1024;
const FRESH_MS = 60 * 60 * 1000;
const MAX_STALE_MS = 24 * 60 * 60 * 1000;
const RETRY_MS = 30 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function bishkekDay(now: number): number {
  // Kyrgyzstan uses UTC+06:00; compare calendar dates rather than local server time.
  return Math.floor((now + 6 * 60 * 60 * 1000) / DAY_MS);
}
function validEffectiveDate(value: string, now: number): string {
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(value);
  if (!match) throw new Error('Invalid NBKR date');
  const [, dayText, monthText, yearText] = match;
  const day = Number(dayText), month = Number(monthText), year = Number(yearText);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) throw new Error('Invalid NBKR date');
  const delta = Math.floor(date.getTime() / DAY_MS) - bishkekDay(now);
  // A rate announced in advance is not effective until its Kyrgyz calendar day.
  // Keep the previous effective value, marked stale, if refresh yields a future rate.
  if (delta < -7 || delta > 0) throw new Error('NBKR date outside accepted window');
  return `${yearText}-${monthText}-${dayText}`;
}

export function parseNbkrDailyXml(xml: string, now = Date.now()): Omit<NbkrRate, 'stale'> {
  if (xml.length > MAX_BYTES || /<!\s*(?:DOCTYPE|ENTITY)\b/i.test(xml)) throw new Error('Invalid NBKR XML');
  const root = /<CurrencyRates\b[^>]*\bDate="([^"]+)"[^>]*>/i.exec(xml);
  if (!root || !/<\/CurrencyRates\s*>/i.test(xml)) throw new Error('Invalid NBKR XML');
  const effectiveDate = validEffectiveDate(root[1], now);

  function perUnit(code: 'USD' | 'RUB'): number {
    const expression = new RegExp(`<Currency\\s+ISOCode="${code}"\\s*>([\\s\\S]*?)<\\/Currency\\s*>`, 'gi');
    const matches = Array.from(xml.matchAll(expression));
    if (matches.length !== 1) throw new Error(`Invalid ${code} quote`);
    const nominalText = /<Nominal>\s*(\d+)\s*<\/Nominal>/i.exec(matches[0][1])?.[1];
    const valueText = /<Value>\s*(\d+(?:[,.]\d+)?)\s*<\/Value>/i.exec(matches[0][1])?.[1];
    if (!nominalText || !valueText) throw new Error(`Invalid ${code} quote`);
    const nominal = Number(nominalText), value = Number(valueText.replace(',', '.'));
    if (!Number.isSafeInteger(nominal) || nominal < 1 || nominal > 1_000_000 || !Number.isFinite(value) || value <= 0 || value > 1_000_000) throw new Error(`Invalid ${code} quote`);
    return value / nominal;
  }
  const rubToUsd = perUnit('RUB') / perUnit('USD');
  if (!Number.isFinite(rubToUsd) || rubToUsd <= 0) throw new Error('Invalid cross rate');
  return { rubToUsd, effectiveDate, source: 'NBKR' };
}

async function boundedText(response: Response): Promise<string> {
  const advertised = Number(response.headers.get('content-length'));
  if (Number.isFinite(advertised) && advertised > MAX_BYTES) throw new Error('NBKR response too large');
  if (!response.body) throw new Error('Empty NBKR response');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > MAX_BYTES) { await reader.cancel(); throw new Error('NBKR response too large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder('windows-1251').decode(bytes);
}

type Options = { fetcher?: typeof fetch; now?: () => number };
export function createNbkrRateService({ fetcher = fetch, now = Date.now }: Options = {}) {
  let cached: { value: Omit<NbkrRate, 'stale'>; fetchedAt: number } | null = null;
  let inFlight: Promise<NbkrRate> | null = null;
  let retryAfter = 0;

  const staleOrThrow = (): NbkrRate => {
    if (cached && now() - cached.fetchedAt <= MAX_STALE_MS) {
      // Revalidate the published date even when a previous response is cached.
      validEffectiveDate(cached.value.effectiveDate.split('-').reverse().join('.'), now());
      return { ...cached.value, stale: true };
    }
    throw new Error('Official NBKR rates are unavailable');
  };

  return async function getRate(): Promise<NbkrRate> {
    if (cached && now() - cached.fetchedAt < FRESH_MS) {
      validEffectiveDate(cached.value.effectiveDate.split('-').reverse().join('.'), now());
      return { ...cached.value, stale: false };
    }
    if (inFlight) return inFlight;
    if (now() < retryAfter) return staleOrThrow();
    inFlight = (async () => {
      try {
        const response = await fetcher(NBKR_URL, { signal: AbortSignal.timeout(5000), redirect: 'error', headers: { accept: 'application/xml,text/xml' } });
        if (!response.ok) throw new Error('NBKR request failed');
        const value = parseNbkrDailyXml(await boundedText(response), now());
        cached = { value, fetchedAt: now() };
        retryAfter = 0;
        return { ...value, stale: false };
      } catch {
        retryAfter = now() + RETRY_MS;
        return staleOrThrow();
      }
    })();
    try { return await inFlight; } finally { inFlight = null; }
  };
}
