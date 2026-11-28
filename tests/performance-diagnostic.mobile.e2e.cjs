const assert = require('node:assert/strict');
const { chromium, webkit } = require('playwright');
const path = require('node:path');
const site = process.env.DIAGNOSTIC_TEST_URL || 'http://127.0.0.1:41755/';

async function run(browser, diagnostic) {
  const context = await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  await context.route('https://telegram.org/js/telegram-web-app.js', route=>route.fulfill({body:''}));
  await context.route('**/api/**', route=>route.fulfill({json:{data:[]}}));
  await context.addInitScript(diagnostic => {
    const nop=()=>{}, buttons=()=>({show:nop,hide:nop,enable:nop,disable:nop,onClick:nop,offClick:nop,setText:nop,setParams:nop,showProgress:nop,hideProgress:nop});
    const tg={version:'8.0',platform:'android',initData:`start_param=${diagnostic?'diag_demo_':'demo_'}furniture-studio&hash=PRIVATE_SENTINEL`,initDataUnsafe:{user:{id:987654321}},themeParams:{},colorScheme:'light',viewportHeight:844,viewportStableHeight:844,isExpanded:true,
      safeAreaInset:{top:0,bottom:0,left:0,right:0},contentSafeAreaInset:{top:0,bottom:0,left:0,right:0},ready:nop,expand:nop,isVersionAtLeast:()=>true,requestFullscreen:nop,
      onEvent:nop,offEvent:nop,setBackgroundColor:nop,setHeaderColor:nop,setBottomBarColor:nop,MainButton:buttons(),SecondaryButton:buttons(),BackButton:buttons(),HapticFeedback:{impactOccurred:nop,selectionChanged:nop,notificationOccurred:nop}};
    window.Telegram={}; Object.defineProperty(window.Telegram,'WebApp',{configurable:true,get:()=>tg,set:nop});
    Object.defineProperty(navigator,'clipboard',{configurable:true,value:undefined});
  },diagnostic);
  const page=await context.newPage(), requests=[];
  page.on('request', request => requests.push(request.url()));
  try {
    await page.goto(new URL(`/?tgWebAppStartParam=${diagnostic?'diag_demo_':'demo_'}furniture-studio`,site).href);
    await page.getByTestId('furniture-store').waitFor({timeout:30000});
    if (!diagnostic) {
      await page.waitForTimeout(500);
      assert.equal(await page.locator('#performance-diagnostic').count(),0,'normal launch must not have diagnostic UI');
      assert.equal(requests.some(url=>url.includes('performanceDiagnostic')),false,'normal launch must not load diagnostic observers');
      return;
    }
    const button=page.getByRole('button',{name:'Открыть диагностику скорости'});
    await button.waitFor(); await button.tap();
    const report=page.getByLabel('Отчёт диагностики');
    const text=await report.inputValue();
    assert.match(text,/Экран: furniture-studio/);
    assert.match(text,/Платформа Telegram: Android/);
    assert.match(text,/Появление элемента экрана: \d+ мс/);
    assert.match(text,/Инерцию и ощущение прокрутки эти метрики не измеряют/);
    assert.doesNotMatch(text,/PRIVATE_SENTINEL|987654321|https?:|start_param|initData|userAgent/);
    await page.getByRole('button',{name:'Скопировать отчёт'}).tap();
    await page.getByText('Выделите текст отчёта и скопируйте вручную.').waitFor();
    await page.getByRole('button',{name:'Продолжить'}).tap();
    assert.equal(await button.isVisible(),true);
    await page.evaluate(() => { location.hash='#/'; });
    await button.tap();
    await page.getByText('Запись остановлена после выхода из проекта. Отчёт можно скопировать.').waitFor();
    await page.getByRole('button',{name:'Завершить'}).tap();
    assert.equal(await page.locator('#performance-diagnostic').count(),0);
    console.log(`PASS ${browser.browserType().name()}: explicit local diagnostics, safe report, manual copy and exit`);
  } finally {await context.close();}
}
async function signedLaunch(browser) {
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  const sdk=path.join(path.dirname(require.resolve('@twa-dev/sdk')),'telegram-web-apps.js');
  await context.route('https://telegram.org/js/telegram-web-app.js', route=>route.fulfill({contentType:'text/javascript',path:sdk}));
  await context.route('**/api/**', route=>route.fulfill({json:{data:[]}}));
  await context.addInitScript(()=>{window.TelegramWebviewProxy={postEvent(){}}});
  const page=await context.newPage();
  try {
    const hash = new URLSearchParams({tgWebAppData:'start_param=diag_demo_china-buyer&auth_date=123&hash=PRIVATE_SENTINEL',tgWebAppVersion:'8.0',tgWebAppPlatform:'ios'}).toString();
    await page.goto(new URL('/#'+hash,site).href);
    await page.getByTestId('china-buyer').waitFor({timeout:30000});
    await page.getByRole('button',{name:'Открыть диагностику скорости'}).tap();
    const report=await page.getByLabel('Отчёт диагностики').inputValue();
    assert.match(report,/Экран: china-buyer/); assert.match(report,/Платформа Telegram: iOS/);
    assert.doesNotMatch(report,/PRIVATE_SENTINEL|start_param|https?:/);
    console.log(`PASS ${browser.browserType().name()}: diagnostic launch through Telegram SDK init data`);
  } finally {await context.close();}
}
async function allProjects(browser) {
  const ids=['furniture-studio','flower-store','takt-coffee','china-buyer','medical-center','lumi-studio','opt-market','apple-store','muraka-fashion','women-fashion','jewelry-store','nike-sneakers','skincare-aura'];
  for (const id of ids) {
    const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
    await context.route('https://telegram.org/js/telegram-web-app.js', route=>route.fulfill({body:''}));
    await context.route('**/api/**', route=>route.fulfill({json:{data:[]}}));
    const page=await context.newPage();
    try {
      await page.goto(new URL(`/?tgWebAppStartParam=diag_demo_${id}`,site).href);
      const button=page.getByRole('button',{name:'Открыть диагностику скорости'}); await button.waitFor({timeout:30000});
      await page.waitForFunction(() => document.querySelector('#root')?.querySelector('[data-testid="furniture-store"], [data-testid="flower-store"], [data-testid="takt-coffee"], [data-testid="china-buyer"], [data-testid="medical-center"], [data-testid="lumi-studio"], [data-testid="opt-market"], [data-testid="apple-store"], [data-testid="muraka-fashion"], [data-testid="women-fashion"], [data-testid="jewelry-store"], [data-testid="royal-step"], [data-testid="demo-content"] .aura'));
      await page.waitForTimeout(100);
      await button.tap();
      const report=await page.getByLabel('Отчёт диагностики').inputValue();
      assert.ok(report.includes(`Экран: ${id}`));
      assert.match(report,/Появление элемента экрана: \d+ мс/,`${id} must report its own mounted screen`);
    } finally {await context.close();}
  }
  console.log('PASS Chromium: diagnostics detect all 13 actual project screens');
}
async function homeLaunch(browser) {
  const context=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,serviceWorkers:'block'});
  await context.route('https://telegram.org/js/telegram-web-app.js', route=>route.fulfill({body:''}));
  await context.route('**/api/**', route=>route.fulfill({json:{data:[]}}));
  const page=await context.newPage();
  try {
    await page.goto(new URL('/?tgWebAppStartParam=diag_home',site).href);
    await page.getByTestId('home-page').waitFor({timeout:30000});
    await page.getByRole('button',{name:'Открыть диагностику скорости'}).tap();
    const report=await page.getByLabel('Отчёт диагностики').inputValue();
    assert.match(report,/Экран: основное приложение/); assert.match(report,/Появление элемента экрана: \d+ мс/);
    console.log(`PASS ${browser.browserType().name()}: explicit diagnostic launch of main application`);
  } finally {await context.close();}
}
(async()=>{for(const engine of [chromium,webkit]) {const browser=await engine.launch();try{await run(browser,false);await run(browser,true);await signedLaunch(browser);await homeLaunch(browser);if(engine===chromium)await allProjects(browser);}finally{await browser.close();}}})().catch(error=>{console.error(error);process.exit(1)});
