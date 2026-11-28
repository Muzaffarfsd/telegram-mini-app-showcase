const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const site = process.env.PRELOAD_TEST_URL || 'http://127.0.0.1:41756/';
const projects = {
  'furniture-studio':'FurnitureShop', 'flower-store':'FlowerStore', 'takt-coffee':'TaktCoffee',
  'china-buyer':'ChinaBuyer', 'medical-center':'MedicalCenter', 'lumi-studio':'LumiStudio',
  'opt-market':'OptMarket', 'apple-store':'AppleStore', 'muraka-fashion':'MurakaFashion',
  'women-fashion':'WomenFashion', 'jewelry-store':'JewelryStore', 'nike-sneakers':'RoyalStep',
  'skincare-aura':'SkincareStore',
};

async function check(browser, label, path, expected, stored) {
  const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  if (stored) await context.addInitScript(data => { for (const [k,v] of Object.entries(data)) sessionStorage.setItem(k,v); },stored);
  await context.route('https://telegram.org/js/telegram-web-app.js', route=>route.fulfill({body:''}));
  await context.route('**/assets/**', route=>route.abort());
  try {
    const page=await context.newPage();
    await page.goto(new URL(path,site).href,{waitUntil:'domcontentloaded'});
    const links=await page.locator('link[rel="modulepreload"]').evaluateAll(nodes=>nodes.map(node=>new URL(node.href).pathname));
    const demoLinks = Object.values(projects).filter(chunk=>links.some(href=>href.includes('/'+chunk+'-')));
    assert.deepEqual(demoLinks,expected ? [projects[expected]] : [], `${label}: unexpected selected chunks: ${links}`);
    assert.equal(links.some(href=>/\/DemoAppShell-/.test(href)),Boolean(expected),`${label}: shell preload`);
    if (expected) {
      const selectedAssets = await page.locator('link[rel="modulepreload"],link[rel="preload"][as="style"]').evaluateAll(nodes=>nodes.filter(node=>/\/(?:DemoAppShell|FurnitureShop|FlowerStore|TaktCoffee|ChinaBuyer|MedicalCenter|LumiStudio|OptMarket|AppleStore|MurakaFashion|WomenFashion|JewelryStore|RoyalStep|SkincareStore)-/.test(node.href)).map(node=>({href:node.href,priority:node.getAttribute('fetchpriority')})));
      assert.ok(selectedAssets.length>=2 && selectedAssets.every(asset=>asset.priority==='low'), `${label}: project assets should be low priority while app boots`);
      const images=await page.locator('link[rel="preload"][as="image"]').count();
      assert.equal(images,0,`${label}: early images must not compete with the app boot`);
    }
  } finally {await context.close();}
}

(async()=>{
  for(const [name,engine] of [['chromium',chromium],['webkit',webkit]]){
    const browser=await engine.launch();
    try {
      for(const id of Object.keys(projects)) {
        await check(browser,`${name} share ${id}`,`/?tgWebAppStartParam=demo_${id}`,id);
        await check(browser,`${name} direct ${id}`,`/#/demos/${id}/app`,id);
      }
      await check(browser,`${name} alias`, '/?tgWebAppStartParam=demo_royal-step', 'nike-sneakers');
      await check(browser,`${name} diagnostic launch`, '/?tgWebAppStartParam=diag_demo_furniture-studio', 'furniture-studio');
      await check(browser,`${name} explicit route wins`, '/?tgWebAppStartParam=demo_apple-store#/demos/flower-store/app', 'flower-store');
      await check(browser,`${name} other explicit page wins`, '/?tgWebAppStartParam=demo_apple-store#/projects', null);
      await check(browser,`${name} invalid`, '/?tgWebAppStartParam=demo___proto__', null);
      await check(browser,`${name} consumed`, '/?tgWebAppStartParam=demo_apple-store', null, {'web4tg:consumed-demo-start':'apple-store|no-date'});
      const data = encodeURIComponent('start_param=demo_china-buyer&auth_date=123456');
      await check(browser,`${name} Telegram initData`, `/#tgWebAppData=${data}&tgWebAppPlatform=ios`, 'china-buyer');
      const diagnosticData = encodeURIComponent('start_param=diag_demo_china-buyer&auth_date=123456');
      await check(browser,`${name} diagnostic Telegram initData`, `/#tgWebAppData=${diagnosticData}&tgWebAppPlatform=ios`, 'china-buyer');
      await check(browser,`${name} signed launch wins`, `/?tgWebAppStartParam=demo_apple-store#tgWebAppData=${data}&tgWebAppPlatform=ios`, 'china-buyer');
      await check(browser,`${name} consumed Telegram initData`, `/#tgWebAppData=${data}&tgWebAppPlatform=ios`, null, {'web4tg:consumed-demo-start':'china-buyer|123456'});
      console.log(`PASS ${name}: public shared and direct links select one project; aliases, explicit routes, consumed and invalid launches`);
    } finally {await browser.close();}
  }
})().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
