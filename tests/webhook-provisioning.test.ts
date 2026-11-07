import test, { beforeEach, after } from 'node:test';
import assert from 'node:assert/strict';
import { secureExistingTelegramWebhook } from '../server/webhookProvisioning';

const botToken = '123456789' + ':' + 'W'.repeat(35);
const webAppUrl = 'https://studio.example';
const strongSecret = 'synthetic_webhook_secret_for_unit_tests_1234567890';
const originalSecret = process.env.TELEGRAM_WEBHOOK_SECRET;
beforeEach(() => { process.env.TELEGRAM_WEBHOOK_SECRET = strongSecret; });
after(() => { if (originalSecret === undefined) delete process.env.TELEGRAM_WEBHOOK_SECRET; else process.env.TELEGRAM_WEBHOOK_SECRET = originalSecret; });
function simulation(info: Record<string, unknown>, setResult = { ok: true }, setHttpStatus = 200) {
  const calls: { url: string; options?: RequestInit }[] = [];
  const fetcher: typeof fetch = async (input, options) => {
    const url = String(input); calls.push({ url, options });
    if (url.endsWith('/getWebhookInfo')) return new Response(JSON.stringify({ ok: true, result: info }), { status:200 });
    if (url.endsWith('/setWebhook')) return new Response(JSON.stringify(setResult), { status:setHttpStatus });
    throw new Error('Unexpected external request in synthetic test');
  };
  return { calls, fetcher };
}
const baseline = { url:`${webAppUrl}/api/telegram/webhook`, has_custom_certificate:false, allowed_updates:['message','callback_query'], max_connections:42 };
const run = (fetcher:typeof fetch, extra:Parameters<typeof secureExistingTelegramWebhook>[0] = {}) => secureExistingTelegramWebhook({ botToken, webAppUrl, fetcher, runtimeDomain:'studio.example', environmentName:'production', autoSecure:true, ...extra });

test('secures only the existing same-service callback and preserves its delivery settings', async () => {
  const { fetcher, calls } = simulation(baseline);
  assert.equal(await run(fetcher), 'secured'); assert.equal(calls.length, 2);
  const sent = JSON.parse(String(calls[1].options?.body));
  assert.deepEqual(sent, { url:baseline.url, secret_token:strongSecret, drop_pending_updates:false, allowed_updates:baseline.allowed_updates, max_connections:42 });
  assert.equal(calls[0].options?.redirect,'error'); assert.ok(calls[0].options?.signal);
  assert.equal(calls[1].options?.redirect,'error'); assert.ok(calls[1].options?.signal);
});
test('does not register an empty callback or take over another origin, path or query', async () => {
  for (const [url, status] of [['','not_registered'],['https://another.example/api/telegram/webhook','foreign_webhook'],[`${webAppUrl}/another-callback`,'foreign_webhook'],[`${baseline.url}?key=legacy`,'foreign_webhook']]) {
    const {fetcher,calls} = simulation({...baseline,url}); assert.equal(await run(fetcher),status); assert.equal(calls.length,1);
  }
});
test('does not touch a custom certificate or malformed provider settings', async () => {
  for (const [info,status] of [[{...baseline,has_custom_certificate:true},'custom_certificate'],[{...baseline,allowed_updates:['message',123]},'unsupported_configuration'],[{...baseline,max_connections:0},'unsupported_configuration']] as const) {
    const {fetcher,calls} = simulation(info); assert.equal(await run(fetcher),status); assert.equal(calls.length,1);
  }
});
test('preview and mismatching runtime domains cannot reconfigure the production bot', async () => {
  const {fetcher,calls} = simulation(baseline);
  assert.equal(await run(fetcher,{environmentName:'preview'}),'nonproduction_environment');
  assert.equal(await run(fetcher,{runtimeDomain:'preview.example'}),'runtime_origin_mismatch');
  assert.equal(await run(fetcher,{webAppUrl:'https://custom-domain.example'}),'runtime_origin_mismatch');
  assert.equal(calls.length,0);
});
test('disabled mode, invalid credentials and weak secrets make no provider calls', async () => {
  const {fetcher,calls} = simulation(baseline);
  assert.equal(await run(fetcher,{autoSecure:false}),'disabled');
  assert.equal(await run(fetcher,{botToken:'invalid'}),'invalid_configuration');
  assert.equal(await run(fetcher,{webAppUrl:'http://studio.example'}),'invalid_configuration');
  process.env.TELEGRAM_WEBHOOK_SECRET = 'weak';
  assert.equal(await run(fetcher),'invalid_secret'); assert.equal(calls.length,0);
});
test('operator environment switch disables automatic provisioning', async () => {
  const prior = process.env.TELEGRAM_WEBHOOK_AUTO_SECURE;
  process.env.TELEGRAM_WEBHOOK_AUTO_SECURE = 'false';
  const {fetcher,calls} = simulation(baseline);
  try {
    assert.equal(await secureExistingTelegramWebhook({botToken,webAppUrl,fetcher,runtimeDomain:'studio.example',environmentName:'production'}),'disabled');
    assert.equal(calls.length,0);
  } finally { if (prior === undefined) delete process.env.TELEGRAM_WEBHOOK_AUTO_SECURE; else process.env.TELEGRAM_WEBHOOK_AUTO_SECURE = prior; }
});
test('provider errors fail closed without exposing credentials', async () => {
  const failed = simulation(baseline,{ok:false},200);
  assert.equal(await run(failed.fetcher),'registration_failed');
  const failedHttp = simulation(baseline,{ok:true},500);
  assert.equal(await run(failedHttp.fetcher),'registration_failed');
  const unavailable: typeof fetch = async () => { throw new Error('Synthetic provider unavailable'); };
  assert.equal(await run(unavailable),'lookup_failed');
});
