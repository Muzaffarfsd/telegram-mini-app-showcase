import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createNbkrRateService, parseNbkrDailyXml, parseNbkrPublishedTable } from '../server/nbkrRates';
import { apiAccessPolicy } from '../server/security';

const NOW = Date.parse('2026-11-08T20:00:00Z'); // 9 November in Bishkek
const xml = (date = '09.11.2026', rubValue = '1,0759', rubNominal = '1') => `<?xml version="1.0" encoding="windows-1251"?>
<CurrencyRates Name="Daily Exchange Rates" Date="${date}">
<Currency ISOCode="USD"><Nominal>1</Nominal><Value>87,4478</Value></Currency>
<Currency ISOCode="RUB"><Nominal>${rubNominal}</Nominal><Value>${rubValue}</Value></Currency>
</CurrencyRates>`;

test('NBKR cross rate uses each nominal and preserves the effective date', () => {
  const one = parseNbkrDailyXml(xml(), NOW);
  const hundred = parseNbkrDailyXml(xml('09.11.2026', '107,59', '100'), NOW);
  assert.ok(Math.abs(one.rubToUsd - 1.0759 / 87.4478) < 1e-12);
  assert.ok(Math.abs(one.rubToUsd - hundred.rubToUsd) < 1e-12);
  assert.equal(one.effectiveDate, '2026-11-09');
  assert.equal(one.source, 'NBKR');
  assert.equal(parseNbkrDailyXml(xml('08.11.2026'), NOW).effectiveDate, '2026-11-08');
});

test('rejects invalid, duplicated, impossible, old and prematurely dated quotes', () => {
  for (const input of [
    xml('10.11.2026'), xml('31.02.2026'), xml('31.10.2026'),
    xml('09.11.2026', '0'), xml('09.11.2026', '1,0759', '0'),
    xml().replace('</CurrencyRates>', '<Currency ISOCode="USD"><Nominal>1</Nominal><Value>1</Value></Currency></CurrencyRates>'),
    '<!DOCTYPE CurrencyRates [<!ENTITY x "1">]>' + xml(),
    xml().replace(/<Currency ISOCode="RUB">[\s\S]*?<\/Currency>/, ''),
  ]) assert.throws(() => parseNbkrDailyXml(input, NOW));
});

test('coalesces concurrent requests, caches, marks stale fallback and eventually expires it', async () => {
  let clock = NOW, calls = 0, fail = false;
  let release!: () => void;
  const gate = new Promise<void>(resolve => { release = resolve; });
  const fetcher: typeof fetch = async (url, options) => {
    calls++;
    if (!fail) assert.equal(url, 'https://www.nbkr.kg/XML/daily.xml');
    assert.equal(options?.redirect, 'error');
    await gate;
    if (fail) throw new Error('bank unavailable');
    return new Response(xml(), { status: 200 });
  };
  const get = createNbkrRateService({ fetcher, now: () => clock });
  const pending = [get(), get(), get()];
  release();
  const values = await Promise.all(pending);
  assert.equal(calls, 1);
  assert.equal(values[0].stale, false);
  assert.deepEqual(values[0], values[1]);
  clock += 59 * 60 * 1000;
  assert.equal((await get()).stale, false);
  assert.equal(calls, 1);
  clock += 2 * 60 * 1000;
  fail = true;
  assert.equal((await get()).stale, true);
  assert.equal(calls, 3); // XML and dated table both failed
  assert.equal((await get()).stale, true);
  assert.equal(calls, 3); // both failures share the cooldown
  clock += 24 * 60 * 60 * 1000;
  await assert.rejects(get(), /unavailable/);
});

test('ignores the next rate before midnight in Bishkek and refreshes after it becomes effective', async () => {
  let clock = NOW;
  let document = xml('09.11.2026');
  let calls = 0;
  const get = createNbkrRateService({
    now: () => clock,
    fetcher: async () => { calls++; return new Response(document, { status: 200 }); },
  });
  assert.equal((await get()).effectiveDate, '2026-11-09');
  document = xml('10.11.2026', '1,10');
  clock += 61 * 60 * 1000;
  const cached = await get();
  assert.equal(cached.effectiveDate, '2026-11-09');
  assert.equal(cached.stale, true);
  assert.equal(calls, 3);
  clock = Date.parse('2026-11-09T18:00:01Z'); // 10 November in Bishkek
  const current = await get();
  assert.equal(current.effectiveDate, '2026-11-10');
  assert.equal(current.stale, false);
  assert.ok(Math.abs(current.rubToUsd - 1.10 / 87.4478) < 1e-12);
  assert.equal(calls, 4);
});

const table = `<div id="sticker-exrates"><div class="exchange-rates-head"><table><tr>
  <td class="exchange-rates-head-date" colspan=2>09.11.2026</td>
  <td class="exchange-rates-head-date">10.11.2026</td><td class="exchange-rates-head-date"></td>
  </tr></table><div class="exchange-rates-body"><table><tbody>
  <tr><td class="excurr"><img src="usd.png"> 1USD</td><td class="exrate">87.45 </td><td class="exrate">88 </td><td class="exrate-up"></td></tr>
  <tr><td class="excurr"><img src="rub.png"> 100RUB</td><td class="exrate">106.78 </td><td class="exrate">110 </td><td class="excurr"></td></tr>
  </tbody></table></div></div>`;

test('cold start uses the currently effective table column and refreshes at Bishkek midnight', async () => {
  let clock = Date.parse('2026-11-09T17:59:00Z');
  const urls: string[] = [];
  const get = createNbkrRateService({ now: () => clock, fetcher: async url => {
    urls.push(String(url));
    return new Response(String(url).endsWith('daily.xml') ? xml('10.11.2026') : table);
  } });
  const [quote, second] = await Promise.all([get(), get()]);
  assert.deepEqual(quote, second);
  assert.deepEqual(urls, ['https://www.nbkr.kg/XML/daily.xml', 'https://www.nbkr.kg/index.jsp?lang=ENG']);
  assert.equal(quote.effectiveDate, '2026-11-09');
  assert.equal(quote.stale, false);
  assert.ok(Math.abs(quote.rubToUsd - 1.0678 / 87.45) < 1e-12);
  clock += 61000;
  assert.equal((await get()).effectiveDate, '2026-11-10');
  assert.equal(urls.length, 3);
  assert.ok(Math.abs(parseNbkrPublishedTable(table, clock).rubToUsd - 1.1 / 88) < 1e-12);
});

test('dated table requires both currencies and unambiguous values for an eligible day', () => {
  for (const bad of [table.replace('100RUB', '100USD'), table.replace('100RUB', '1EUR'), table.replace('106.78', '-1'), table.replace('<td class="exrate">88 </td>', ''), table.replace('09.11.2026', '11.11.2026'), table.replace('10.11.2026', '09.11.2026')]) {
    assert.throws(() => parseNbkrPublishedTable(bad, NOW));
  }
});

test('an unavailable or oversized upstream never produces a fabricated rate', async () => {
  for (const fetcher of [
    async () => new Response('no', { status: 503 }),
    async () => new Response('x'.repeat(65537), { status: 200 }),
    async () => new Response(xml(), { status: 200, headers: { 'content-length': '65537' } }),
    async () => new Response('not xml', { status: 200 }),
  ] as Array<typeof fetch>) {
    const get = createNbkrRateService({ fetcher, now: () => NOW });
    await assert.rejects(get(), /unavailable/);
  }
});

test('the exchange endpoint is public for reading only', async () => {
  const oldToken = process.env.TELEGRAM_BOT_TOKEN;
  process.env.TELEGRAM_BOT_TOKEN = '123456789:' + 'A'.repeat(35);
  const app = express();
  app.use('/api', apiAccessPolicy);
  app.get('/api/exchange-rates/nbkr', (_req, res) => res.json({ ok: true }));
  app.post('/api/exchange-rates/nbkr', (_req, res) => res.json({ ok: true }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise<void>(resolve => server.once('listening', resolve));
  try {
    const address = server.address();
    if (!address || typeof address === 'string') throw new Error('Missing test address');
    const url = `http://127.0.0.1:${address.port}/api/exchange-rates/nbkr`;
    assert.equal((await fetch(url)).status, 200);
    assert.equal((await fetch(url, { method: 'POST' })).status, 401);
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
    if (oldToken === undefined) delete process.env.TELEGRAM_BOT_TOKEN; else process.env.TELEGRAM_BOT_TOKEN = oldToken;
  }
});
