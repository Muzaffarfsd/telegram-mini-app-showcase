/** Official NBKR rates are expressed in KGS per nominal units of each currency. */
export type NbkrRate = {
  rubToUsd: number;
  effectiveDate: string;
  source: 'NBKR';
  stale: boolean;
};

const NBKR_URL = 'https://www.nbkr.kg/XML/daily.xml';
const NBKR_TABLE_URL = 'https://www.nbkr.kg/index.jsp?lang=ENG';
const MAX_BYTES = 64 * 1024;
const MAX_HTML_BYTES = 256 * 1024;
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
  if (delta < -7 || delta > 0) throw new Error('NBKR date outside accepted window');
  return `${yearText}-${monthText}-${dayText}`;
}

function perNominal(nominalText: string, valueText: string): number {
  if (!/^\d+$/.test(nominalText) || !/^\d+(?:[,.]\d+)?$/.test(valueText)) throw new Error('Invalid NBKR quote');
  const nominal = Number(nominalText), value = Number(valueText.replace(',', '.'));
  if (!Number.isSafeInteger(nominal) || nominal < 1 || nominal > 1_000_000 || !Number.isFinite(value) || value <= 0 || value > 1_000_000) throw new Error('Invalid NBKR quote');
  return value / nominal;
}

function crossRate(rub: number, usd: number, effectiveDate: string): Omit<NbkrRate, 'stale'> {
  const rubToUsd = rub / usd;
  if (!Number.isFinite(rubToUsd) || rubToUsd <= 0) throw new Error('Invalid cross rate');
  return { rubToUsd, effectiveDate, source: 'NBKR' };
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
    return perNominal(nominalText, valueText);
  }
  return crossRate(perUnit('RUB'), perUnit('USD'), effectiveDate);
}

// The bank publishes the column dates and currency rows in two adjacent tables.
export function parseNbkrPublishedTable(html: string, now = Date.now()): Omit<NbkrRate, 'stale'> {
  if (html.length > MAX_HTML_BYTES) throw new Error('NBKR response too large');
  const marker = html.indexOf('id="sticker-exrates"');
  if (marker < 0) throw new Error('Missing NBKR exchange table');
  const widget = html.slice(marker, marker + 16000);
  const body = widget.indexOf('class="exchange-rates-body"');
  const end = widget.indexOf('</table>', body);
  if (body < 0 || end < 0) throw new Error('Incomplete NBKR exchange table');
  const dates = Array.from(widget.slice(0, body).matchAll(/<td\b[^>]*\bclass="exchange-rates-head-date"[^>]*>\s*([^<]*?)\s*<\/td>/gi), m => m[1].trim());
  if (dates[dates.length - 1] === '') dates.pop(); // trailing trend indicator
  if (!dates.length || dates.some(d => !/^\d{2}\.\d{2}\.\d{4}$/.test(d)) || new Set(dates).size !== dates.length) throw new Error('Invalid NBKR table dates');
  let column = -1, effectiveDate = '';
  for (const [index, date] of dates.entries()) {
    let iso: string;
    try { iso = validEffectiveDate(date, now); } catch { continue; }
    if (iso > effectiveDate) { effectiveDate = iso; column = index; }
  }
  if (column < 0) throw new Error('No effective NBKR table column');
  const rates = new Map<string, number>();
  for (const row of widget.slice(body, end).matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi)) {
    const currency = /<td\b[^>]*\bclass="excurr"[^>]*>\s*(?:<img\b[^>]*>\s*)?(\d+)\s*(USD|RUB)\s*<\/td>/i.exec(row[1]);
    if (!currency) continue;
    const values = Array.from(row[1].matchAll(/<td\b[^>]*\bclass="exrate"[^>]*>([^<]*)<\/td>/gi), m => m[1].trim());
    if (rates.has(currency[2]) || values.length !== dates.length) throw new Error('Ambiguous NBKR exchange row');
    rates.set(currency[2], perNominal(currency[1], values[column]));
  }
  if (!rates.has('RUB') || !rates.has('USD')) throw new Error('Incomplete NBKR table quotes');
  return crossRate(rates.get('RUB')!, rates.get('USD')!, effectiveDate);
}

async function boundedText(response: Response, limit: number, encoding: string): Promise<string> {
  const advertised = Number(response.headers.get('content-length'));
  if (Number.isFinite(advertised) && advertised > limit) throw new Error('NBKR response too large');
  if (!response.body) throw new Error('Empty NBKR response');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > limit) { await reader.cancel(); throw new Error('NBKR response too large'); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  return new TextDecoder(encoding).decode(bytes);
}

type Options = { fetcher?: typeof fetch; now?: () => number };
export function createNbkrRateService({ fetcher = fetch, now = Date.now }: Options = {}) {
  let cached: { value: Omit<NbkrRate, 'stale'>; fetchedAt: number } | null = null;
  let inFlight: Promise<NbkrRate> | null = null;
  let retryAfter = 0;
  async function readSource(url: string, accept: string, limit: number, encoding: string) {
    const response = await fetcher(url, { signal: AbortSignal.timeout(8000), redirect: 'error', headers: { accept } });
    if (!response.ok) throw new Error('NBKR request failed');
    return boundedText(response, limit, encoding);
  }

  const staleOrThrow = (): NbkrRate => {
    if (cached && now() - cached.fetchedAt <= MAX_STALE_MS) {
      // Revalidate the published date even when a previous response is cached.
      validEffectiveDate(cached.value.effectiveDate.split('-').reverse().join('.'), now());
      return { ...cached.value, stale: true };
    }
    throw new Error('Official NBKR rates are unavailable');
  };

  return async function getRate(): Promise<NbkrRate> {
    if (cached && bishkekDay(cached.fetchedAt) === bishkekDay(now()) && now() - cached.fetchedAt < FRESH_MS) {
      validEffectiveDate(cached.value.effectiveDate.split('-').reverse().join('.'), now());
      return { ...cached.value, stale: false };
    }
    if (inFlight) return inFlight;
    if (now() < retryAfter) return staleOrThrow();
    inFlight = (async () => {
      try {
        let value: Omit<NbkrRate, 'stale'>;
        try {
          value = parseNbkrDailyXml(await readSource(NBKR_URL, 'application/xml,text/xml', MAX_BYTES, 'windows-1251'), now());
        } catch {
          value = parseNbkrPublishedTable(await readSource(NBKR_TABLE_URL, 'text/html', MAX_HTML_BYTES, 'utf-8'), now());
        }
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
