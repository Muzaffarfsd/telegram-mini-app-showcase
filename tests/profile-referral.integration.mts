import { createRequire } from 'node:module';
import { pathToFileURL } from 'node:url';
import { createHmac } from 'node:crypto';
import assert from 'node:assert/strict';

const root = process.cwd();
const requireProject = createRequire(`${root}/package.json`);
const { newDb, DataType } = requireProject('pg-mem');
const express = requireProject('express');
const pg = requireProject('pg');
const memory = newDb();
memory.public.registerFunction({ name: 'pg_advisory_xact_lock', args: [DataType.bigint], returns: DataType.integer, implementation: () => 0 });
memory.public.none(`CREATE TABLE users (id serial PRIMARY KEY, telegram_id bigint UNIQUE NOT NULL, username varchar(255), first_name varchar(255), last_name varchar(255), referral_code varchar(50) UNIQUE NOT NULL, referred_by_code varchar(50), total_referrals integer NOT NULL DEFAULT 0, active_referrals integer NOT NULL DEFAULT 0, total_earnings numeric NOT NULL DEFAULT 0, pending_rewards numeric NOT NULL DEFAULT 0, tier varchar(50) DEFAULT 'Bronze' NOT NULL, level integer DEFAULT 1 NOT NULL, xp integer DEFAULT 0 NOT NULL, xp_to_next_level integer DEFAULT 100 NOT NULL, total_xp integer DEFAULT 0 NOT NULL, current_streak integer DEFAULT 1 NOT NULL, best_streak integer DEFAULT 1 NOT NULL, last_visit_date date DEFAULT now() NOT NULL, completed_tasks integer DEFAULT 0 NOT NULL, achievements jsonb DEFAULT '[]' NOT NULL, total_coins integer DEFAULT 0 NOT NULL, available_coins integer DEFAULT 0 NOT NULL, spent_coins integer DEFAULT 0 NOT NULL, created_at timestamp DEFAULT now() NOT NULL, updated_at timestamp DEFAULT now() NOT NULL);
CREATE TABLE referrals (id serial PRIMARY KEY, referrer_telegram_id bigint NOT NULL REFERENCES users(telegram_id), referred_telegram_id bigint NOT NULL REFERENCES users(telegram_id), bonus_amount numeric NOT NULL, status varchar(50) NOT NULL, created_at timestamp DEFAULT now());
INSERT INTO users (telegram_id, referral_code) VALUES (123, 'WEB4TGSELF'), (456, 'WEB4TGFRIEND'), (789, 'WEB4TGOTHER'), (321, 'WEB4TGUITEST');`);
const adapter = memory.adapters.createPg();
// pg-mem does not implement the node-postgres rowMode used by Drizzle.
for (const Class of new Set([adapter.Pool, adapter.Client]) as Set<any>) {
  const original = Class.prototype.query;
  Class.prototype.query = function(config: any, ...args: any[]) {
    if (config && typeof config === 'object') {
      const clean = { ...config }; const arrayMode = clean.rowMode === 'array'; delete clean.rowMode; delete clean.types;
      const result = original.call(this, clean, ...args);
      return arrayMode ? Promise.resolve(result).then((r: any) => ({ ...r, rows: r.rows.map((row: any) => Object.values(row)) })) : result;
    }
    return original.call(this, config, ...args);
  };
}
pg.Pool = adapter.Pool;
process.env.DATABASE_URL = 'postgresql://test:test@127.0.0.1:1/test';
process.env.TELEGRAM_BOT_TOKEN = 'isolated-test-bot';
const { default: referrals } = await import(pathToFileURL(`${root}/server/routes/referrals.ts`).href);
const { default: projects } = await import(pathToFileURL(`${root}/server/routes/projects.ts`).href);
const { generateCSRFToken, validateCSRF } = await import(pathToFileURL(`${root}/server/routes/shared.ts`).href);
const { pool } = await import(pathToFileURL(`${root}/server/db.ts`).href);
function initData(id: number) {
  const p = new URLSearchParams({ auth_date: String(Math.floor(Date.now()/1000)), user: JSON.stringify({ id, first_name:'Test' }) });
  const check = [...p].sort(([a],[b])=>a.localeCompare(b)).map(([a,b])=>`${a}=${b}`).join('\n');
  const key = createHmac('sha256','WebAppData').update(process.env.TELEGRAM_BOT_TOKEN!).digest();
  p.set('hash',createHmac('sha256',key).update(check).digest('hex')); return p.toString();
}
const app = express(); app.use(express.json()); app.use('/api',validateCSRF); app.get('/api/csrf-token', async (req: any, res: any) => { const session = req.headers['x-telegram-init-data'] || req.ip; res.json({token:await generateCSRFToken(session,!!req.headers['x-telegram-init-data'])}); }); app.use(projects); app.use(referrals);
const server = await new Promise<any>(resolve => { const s=app.listen(0,'127.0.0.1',()=>resolve(s)); });
const url = `http://127.0.0.1:${server.address().port}/api/referral/apply`;
async function apply(id: number, code: string) { const auth=initData(id);const token=await generateCSRFToken(auth,true);return fetch(url,{method:'POST',headers:{'content-type':'application/json','x-telegram-init-data':auth,'x-csrf-token':token},body:JSON.stringify({userId:id,referralCode:code})}); }
try {
  let r = await apply(123,'WEB4TGSELF'); assert.equal(r.status,400);
  r = await apply(123,'MISSINGCODE'); assert.equal(r.status,404);
  r = await apply(123,'WEB4TGFRIEND'); assert.equal(r.status,200);
  r = await apply(123,'WEB4TGFRIEND'); assert.equal(r.status,409);
  const rows = memory.public.many('SELECT * FROM referrals'); assert.equal(rows.length,1); assert.equal(rows[0].referred_telegram_id,123); assert.equal(rows[0].referrer_telegram_id,456);
  const referrer=memory.public.one('SELECT total_referrals,total_earnings FROM users WHERE telegram_id=456');assert.equal(referrer.total_referrals,1);assert.equal(Number(referrer.total_earnings),100);
  r = await apply(789,`W4T${(456).toString(36).toUpperCase()}`); assert.equal(r.status,200);
  console.log('isolated pg-mem: stored and legacy codes, self, missing, duplicate, referral and totals passed');
  if (process.env.PROFILE_TEST_SITE) {
    const { chromium } = requireProject('playwright');
    const auth = initData(321); const token = await generateCSRFToken(auth,true);
    const create = await fetch(url.replace('/referral/apply','/create-project'),{method:'POST',headers:{'content-type':'application/json','x-telegram-init-data':auth,'x-csrf-token':token},body:JSON.stringify({telegramId:'321',projectName:'Тестовый проект'})});assert.equal(create.status,200);
    const browser=await chromium.launch();
    try {
      const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'ru-RU'});
      await context.addInitScript(({auth})=>{localStorage.setItem('app-language','ru');sessionStorage.setItem('__telegram__initParams',JSON.stringify({tgWebAppData:auth,tgWebAppVersion:'9.0',tgWebAppPlatform:'ios'}));},{auth});
      await context.route('https://telegram.org/js/telegram-web-app.js',route=>route.fulfill({contentType:'text/javascript',body:''}));
      const backend=url.replace('/api/referral/apply','');
      await context.route(/\/api\/(user-projects|referrals\/(stats|user\/init)|referral\/apply|csrf-token)/,async route=>{const original=new URL(route.request().url());const response=await route.fetch({url:backend+original.pathname+original.search});await route.fulfill({response});});
      const page=await context.newPage();const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
      await page.goto(process.env.PROFILE_TEST_SITE,{waitUntil:'domcontentloaded'});await page.getByTestId('nav-profile').tap();
      await page.getByText('Тестовый проект').waitFor({timeout:15000});await page.getByText('Тестовый проект').tap();assert.equal(await page.getByRole('progressbar',{name:'Готовность: 10%'}).isVisible(),true);
      await page.getByText('У меня есть код друга').tap();await page.getByTestId('input-friend-referral').fill('WEB4TGFRIEND');await page.getByTestId('button-apply-referral').tap();
      await page.getByText('Код применен',{exact:true}).waitFor({timeout:15000});assert.equal(memory.public.many('SELECT * FROM referrals WHERE referred_telegram_id=321').length,1);assert.deepEqual(errors,[]);
      await context.close();console.log('mobile journey: project creation, profile details and referral through isolated HTTP server and pg-mem passed');
      const newUserAuth=initData(999);const newContext=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,locale:'ru-RU'});
      await newContext.addInitScript(({auth})=>{localStorage.setItem('app-language','ru');sessionStorage.setItem('__telegram__initParams',JSON.stringify({tgWebAppData:auth,tgWebAppVersion:'9.0',tgWebAppPlatform:'ios'}));},{auth:newUserAuth});
      await newContext.route('https://telegram.org/js/telegram-web-app.js',route=>route.fulfill({contentType:'text/javascript',body:''}));
      await newContext.route(/\/api\/(user-projects|referrals\/(stats|user\/init)|referral\/apply|csrf-token)/,async route=>{const original=new URL(route.request().url());const response=await route.fetch({url:backend+original.pathname+original.search});await route.fulfill({response});});
      const newPage=await newContext.newPage();await newPage.goto(process.env.PROFILE_TEST_SITE,{waitUntil:'domcontentloaded'});await newPage.getByTestId('nav-profile').tap();
      await newPage.getByRole('button',{name:'Подключить',exact:true}).tap({timeout:15000});await newPage.getByTestId('button-invite-friend').waitFor({state:'visible'});
      await newPage.waitForFunction(()=>!document.querySelector('[data-testid="button-invite-friend"]')?.hasAttribute('disabled'));
      assert.equal(memory.public.many('SELECT * FROM users WHERE telegram_id=999').length,1);await newContext.close();
      console.log('mobile journey: new account explicitly connects referrals through isolated HTTP server and pg-mem passed');
    } finally {await browser.close();}
  }
} finally { await new Promise<void>(resolve => server.close(resolve)); await pool.end(); }
