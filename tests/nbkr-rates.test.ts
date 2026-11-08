import test from 'node:test';
import assert from 'node:assert/strict';
import express from 'express';
import { createNbkrRateService, parseNbkrDailyXml } from '../server/nbkrRates';
import { apiAccessPolicy } from '../server/security';

const NOW = Date.parse('2026-11-08T14:00:00Z'); // evening in Bishkek
const xml = (date = '09.11.2026', rubValue = '1,0759', rubNominal = '1') => `<?xml version="1.0" encoding="windows-1251"?>
<CurrencyRates Name="Daily Exchange Rates" Date="${date}">
<Currency ISOCode="USD"><Nominal>1</Nominal><Value>87,4478</Value></Currency>
<Currency ISOCode="RUB"><Nominal>${rubNominal}</Nominal><Value>${rubValue}</Value></Currency>
</CurrencyRates>`;

test('NBKR cross rate uses each nominal and preserves an advance effective date', () => {
  const one = parseNbkrDailyXml(xml(), NOW);
  const hundred = parseNbkrDailyXml(xml('09.11.2026', '107,59', '100'), NOW);
  assert.ok(Math.abs(one.rubToUsd - 1.0759 / 87.4478) < 1e-12);
  assert.ok(Math.abs(one.rubToUsd - hundred.rubToUsd) < 1e-12);
  assert.equal(one.effectiveDate, '2026-11-09');
  assert.equal(one.source, 'NBKR');
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
    assert.equal(url, 'https://www.nbkr.kg/XML/daily.xml');
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
  assert.equal(calls, 2);
  assert.equal((await get()).stale, true);
  assert.equal(calls, 2); // failed upstream is retried at most once per cooldown
  clock += 24 * 60 * 60 * 1000;
  await assert.rejects(get(), /unavailable/);
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
