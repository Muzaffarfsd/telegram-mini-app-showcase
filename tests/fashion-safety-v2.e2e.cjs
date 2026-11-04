const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const axe = require('axe-core');
const base = (process.env.MURAKA_TEST_URL || 'http://127.0.0.1:53744').replace(/\/$/, '');
const engine = process.env.MURAKA_ENGINE === 'webkit' ? webkit : chromium;
async function run(browser, width, height) {
  const context = await browser.newContext({ viewport: {width, height}, isMobile:true, hasTouch:true, reducedMotion:'reduce', serviceWorkers:'block' });
  await context.addInitScript(() => {
    if (!sessionStorage.getItem('fashion-regression-seeded')) {
      sessionStorage.setItem('fashion-regression-seeded','1');
      localStorage.setItem('muraka-fashion-demo-v1', JSON.stringify({
        cart:[{id:'tee-white',size:'M',quantity:7},{id:'tee-white',size:'L',quantity:7}], favorites:[], orders:[], reviews:[]
      }));
    }
  });
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({contentType:'text/javascript',body:''}));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  try {
    await page.goto(`${base}/#/demos/muraka-fashion/app`, {waitUntil:'domcontentloaded'});
    await page.getByTestId('muraka-fashion').waitFor();
    await page.locator('.mf-nav').getByRole('button',{name:/Корзина/}).click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    await page.waitForFunction(() => document.getElementById('root')?.hasAttribute('inert'));
    const rows = dialog.locator('.mf-cart-item');
    const total = dialog.locator('.mf-sheet-footer strong');
    assert.equal(await rows.count(),2, 'two size variants exist');
    assert.match(await total.innerText(),/68\s?600/, '14 units are present');
    const secondSelect = rows.nth(1).locator('select');
    await secondSelect.selectOption('M');
    assert.equal(await rows.count(),2, 'blocked merge must keep both rows');
    assert.equal(await secondSelect.inputValue(),'L', 'blocked merge restores previous size');
    assert.match(await total.innerText(),/68\s?600/, 'blocked merge preserves quantity and total');
    assert.match(await dialog.locator('.mfx-cart-notice').innerText(), /Нельзя объединить размеры/);
    for(let i=0;i<4;i++) await rows.first().getByRole('button',{name:/Уменьшить количество/}).click();
    assert.match(await total.innerText(),/49\s?000/, 'quantity changes correctly');
    await rows.nth(1).locator('select').selectOption('M');
    assert.equal(await rows.count(),1, 'allowed merge combines variants');
    assert.match(await total.innerText(),/49\s?000/, 'allowed merge preserves quantity and total');
    assert.equal(await rows.first().locator('.mf-qty span').innerText(),'10');
    await dialog.getByRole('button',{name:'Закрыть'}).click();
    await dialog.waitFor({state:'hidden'});
    assert.equal(await page.locator('#root').evaluate(e=>e.hasAttribute('inert')),false, 'root restored after dialog');
    await page.locator('.mf-nav').getByRole('button',{name:'Каталог'}).click();
    await page.getByTestId('mf-card-jeans-blue').getByRole('button',{name:/Открыть/}).click();
    await page.getByRole('button',{name:'Как выбрать размер'}).click();
    await page.getByRole('dialog').waitFor();
    await page.waitForFunction(() => document.getElementById('root')?.hasAttribute('inert'));
    await page.addScriptTag({content:axe.source});
    const violations = await page.evaluate(async()=>{
      const results=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21a','wcag21aa']}});
      return results.violations.filter(v=>v.impact==='serious'||v.impact==='critical').map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)}));
    });
    assert.deepEqual(violations,[], 'size guide has no serious or critical Axe violations');
    await page.getByRole('dialog').getByRole('button',{name:'ПОНЯТНО'}).click();
    await page.getByRole('dialog').waitFor({state:'hidden'});
    assert.equal(await page.locator('#root').evaluate(e=>e.hasAttribute('inert')),false);
    const button = page.locator('.mf-add');
    await button.scrollIntoViewIfNeeded();
    const action=await button.boundingBox(), nav=await page.locator('.mf-nav').boundingBox();
    assert(action&&nav&&action.y+action.height<=nav.y+1,'purchase action is reachable above navigation');
    assert.deepEqual(errors,[]);
    console.log(`${engine.name()} ${width}: safe size merge, modal inertness, guide accessibility and CTA passed`);
  } finally {await context.close();}
}
(async()=>{const browser=await engine.launch();try{for(const [w,h] of [[320,568],[390,844],[430,932]]) await run(browser,w,h);}finally{await browser.close();}})().catch(error=>{console.error(error);process.exitCode=1;});
