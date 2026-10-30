const { chromium } = require('playwright');
const assert = require('node:assert/strict');

const siteUrl = process.env.PROFILE_TEST_URL || 'http://127.0.0.1:5000/';
async function setup(browser, width, withUser = false, firstName = 'Мария') {
  const context = await browser.newContext({ viewport:{width,height:844}, isMobile:true, hasTouch:true, deviceScaleFactor:2, locale:'ru-RU', reducedMotion:'reduce' });
  await context.addInitScript(({withUser,firstName}) => { localStorage.setItem('app-language','ru'); if (withUser) sessionStorage.setItem('__telegram__initParams',JSON.stringify({tgWebAppData:'user='+encodeURIComponent(JSON.stringify({id:12345,first_name:firstName,last_name:'Иванова',username:'maria',language_code:'ru'})),tgWebAppVersion:'9.0',tgWebAppPlatform:'ios'})); }, {withUser,firstName});
  await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({contentType:'text/javascript',body:''}));
  const page = await context.newPage();
  const errors=[]; page.on('pageerror', e=>errors.push(e.message));
  return {context,page,errors};
}
async function openProfile(page) {
  await page.goto(siteUrl, {waitUntil:'domcontentloaded'});
  await page.getByTestId('nav-profile').tap({timeout:20000});
  await page.getByTestId('profile-page').waitFor({timeout:20000});
}
(async()=>{
  const browser=await chromium.launch({headless:true});
  try {
    for (const width of [320,390,430]) {
      const {context,page,errors}=await setup(browser,width);
      await openProfile(page);
      await page.waitForFunction(()=>document.querySelector('[data-testid="user-name"]')?.textContent?.trim()==='Пользователь');
      await page.getByTestId('user-name').waitFor({state:'visible'});
      assert.equal(await page.getByTestId('button-invite-friend').isDisabled(),true);
      assert.equal(await page.getByTestId('input-friend-referral').isDisabled(),true);
      assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth <= innerWidth),true);
      assert.match(await page.locator('.profile-page').evaluate(e=>getComputedStyle(e).fontFamily),/Google Sans App/);
      assert.equal(await page.evaluate(()=>document.fonts.check('16px "Google Sans App"')),true);
      assert.equal(await page.locator('.profile-page').evaluate(e=>getComputedStyle(e,'::before').backgroundImage),'none');
      assert.equal(await page.locator('.profile-page').evaluate(e=>getComputedStyle(e,'::before').backgroundColor),'rgb(255, 255, 255)');
      assert.equal(await page.locator('.profile-row-icon .profile-glyph').first().evaluate(e=>getComputedStyle(e).maskImage.includes('.svg')),true);
      const add=page.getByRole('button',{name:'Создать проект'}).first();
      const rect=await add.boundingBox(); assert.ok(rect.width>=44 && rect.height>=44);
      if(width===390 && process.env.PROFILE_SCREENSHOT) await page.screenshot({path:process.env.PROFILE_SCREENSHOT});
      if(width===390) {
        const ai=page.getByRole('button',{name:'Chat with Alex'});
        const aiBox=await ai.boundingBox();const identityBox=await page.locator('.profile-identity').boundingBox();assert.ok(aiBox.y+aiBox.height<=identityBox.y);
        await ai.tap();
        await page.getByRole('button',{name:'Close',exact:true}).waitFor({timeout:12000});
        await page.getByRole('button',{name:'Close',exact:true}).tap();
        const language=page.locator('#profile-language');await language.selectOption('en');
        await page.waitForFunction(()=>document.querySelector('.profile-page h1')?.textContent==='Profile');
        await language.selectOption('ru');await page.waitForFunction(()=>document.querySelector('.profile-page h1')?.textContent==='Профиль');
      }
      await add.tap(); await page.waitForURL('**/#/constructor');
      assert.deepEqual(errors,[]); await context.close();
      console.log(`guest ${width}px: navigation, font, dimensions, disabled controls passed`);
    }
    const {context,page,errors}=await setup(browser,390,true);
    let authOnStats, authOnProjects;
    await page.route('**/api/referrals/stats/12345', route=>{authOnStats=route.request().headers()['x-telegram-init-data'];return route.fulfill({contentType:'application/json',body:JSON.stringify({referralCode:'WEB4TGSELF'})});});
    await page.route('**/api/csrf-token', route=>route.fulfill({contentType:'application/json',body:JSON.stringify({token:'test-csrf'})}));
    await page.route('**/api/user-projects/12345', async route=>{authOnProjects=route.request().headers()['x-telegram-init-data'];await new Promise(r=>setTimeout(r,2500));await route.fulfill({contentType:'application/json',body:JSON.stringify([{id:1,name:'Тестовый проект',status:'В разработке',progress:40},{id:2,name:'Готовый проект',status:'Готово',progress:100}])});});
    let payload;
    let applyHeaders;
    await page.route('**/api/referral/apply', async route=>{payload=route.request().postDataJSON();applyHeaders=route.request().headers();await route.fulfill({status:200,contentType:'application/json',body:'{}'});});
    await openProfile(page);
    await page.getByRole('status',{name:'Загрузка проектов...'}).waitFor({timeout:5000});
    assert.equal(await page.locator('.profile-project-loading .profile-skeleton').first().evaluate(e=>getComputedStyle(e).animationName),'none');
    try { await page.getByText('Тестовый проект').waitFor({timeout:10000}); } catch (error) { console.log('fixture diagnostics', await page.evaluate(() => ({user:window.Telegram?.WebApp?.initDataUnsafe?.user, profile:document.querySelector('[data-testid="profile-page"]')?.innerText.slice(0,800)})), errors); throw error; }
    assert.equal(await page.getByTestId('user-name').innerText(),'Мария Иванова');
    assert.ok(authOnProjects && authOnStats);
    await page.getByText('Тестовый проект').tap();
    assert.equal(await page.getByRole('progressbar',{name:'Готовность: 40%'}).isVisible(),true);
    await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
    const accessibility = await page.evaluate(async()=>await window.axe.run(document.querySelector('[data-testid="profile-page"]')));
    const critical = accessibility.violations.filter(v=>v.impact==='critical'||v.impact==='serious');
    if (critical.length) console.log('Profile a11y violations:', JSON.stringify(critical));
    assert.equal(critical.length,0);
    await page.getByText('У меня есть код друга').tap();
    assert.equal(await page.getByTestId('button-invite-friend').isEnabled(),true);
    const input=page.getByTestId('input-friend-referral'); const apply=page.getByTestId('button-apply-referral');
    assert.equal(await apply.isDisabled(),true); await input.fill('bad@code'); await apply.tap();
    assert.equal(await input.getAttribute('aria-invalid'),'true'); assert.equal(payload,undefined);
    await input.fill('web4tgself'); await apply.tap(); assert.match(await page.locator('#friend-code-error').innerText(),/собственный/);
    await input.fill('w4ttest'); assert.equal(await input.inputValue(),'W4TTEST');
    await apply.tap(); await page.waitForFunction(()=>document.querySelector('[data-testid="input-friend-referral"]')?.value==='');
    assert.deepEqual(payload,{userId:12345,referralCode:'W4TTEST'});
    assert.equal(applyHeaders['x-csrf-token'],'test-csrf'); assert.ok(applyHeaders['x-telegram-init-data']);
    await page.getByRole('button',{name:/Центр помощи/}).tap(); await page.waitForURL('**/#/help');
    assert.deepEqual(errors,[]); await context.close();
    console.log('Telegram fixture: authenticated project details, validated referral, axe serious/critical and help navigation passed');
    const errorCase=await setup(browser,320,true);
    await errorCase.page.route('**/api/user-projects/12345', route=>route.fulfill({status:503,body:'unavailable'}));
    await openProfile(errorCase.page);
    await errorCase.page.getByRole('alert').filter({hasText:'Не удалось загрузить проекты'}).waitFor();
    assert.equal(await errorCase.page.getByText('Здесь появятся ваши приложения').count(),0);
    await errorCase.page.unroute('**/api/user-projects/12345');
    await errorCase.page.route('**/api/user-projects/12345', route=>route.fulfill({contentType:'application/json',body:'[]'}));
    await errorCase.page.getByRole('button',{name:'Попробовать снова'}).first().tap();
    await errorCase.page.getByText('Здесь появятся ваши приложения').waitFor();
    assert.deepEqual(errorCase.errors,[]); await errorCase.context.close();
    console.log('Telegram fixture: project failure is shown as an error passed');
    const connectCase=await setup(browser,390,true);
    await connectCase.page.route('**/api/user-projects/12345', route=>route.fulfill({contentType:'application/json',body:'[]'}));
    await connectCase.page.route('**/api/referrals/stats/12345', route=>route.fulfill({status:404,contentType:'application/json',body:'{}'}));
    await connectCase.page.route('**/api/csrf-token', route=>route.fulfill({contentType:'application/json',body:'{"token":"test-csrf"}'}));
    let connectedHeaders;
    await connectCase.page.route('**/api/referrals/user/init', route=>{connectedHeaders=route.request().headers();return route.fulfill({contentType:'application/json',body:'{"referralCode":"WEB4TGNEW"}'});});
    await openProfile(connectCase.page);
    await connectCase.page.getByRole('button',{name:'Подключить',exact:true}).tap();
    await connectCase.page.getByText('WEB4TGNEW',{exact:true}).waitFor();
    assert.equal(connectedHeaders['x-csrf-token'],'test-csrf'); assert.ok(connectedHeaders['x-telegram-init-data']);
    await connectCase.context.close();
    console.log('Telegram fixture: new referral account connects only after user action');
    const iconCase=await setup(browser,390);
    await iconCase.page.route('**/profile-icons-selected.webp*', route=>route.abort());
    await openProfile(iconCase.page);
    assert.equal(await iconCase.page.locator('.profile-empty-icon .profile-glyph').evaluate(e=>getComputedStyle(e).visibility),'visible');
    await iconCase.context.close();
    console.log('offline artwork: vector icons stay visible');
    const longCase=await setup(browser,320,true,'Александра'.repeat(6));
    await longCase.page.route('**/api/user-projects/12345',route=>route.fulfill({contentType:'application/json',body:JSON.stringify([{id:1,name:'Оченьдлинноеназваниепроекта'.repeat(5),status:'В разработке',progress:40}])}));
    await longCase.page.route('**/api/referrals/stats/12345',route=>route.fulfill({contentType:'application/json',body:'{"referralCode":"WEB4TGSELF"}'}));
    await openProfile(longCase.page);await longCase.page.getByText(/Оченьдлинноеназвание/).waitFor();
    assert.equal(await longCase.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    assert.equal(await longCase.page.locator('.profile-project strong').evaluate(e=>e.scrollWidth<=e.clientWidth),true);
    await longCase.context.close();console.log('long account and project names: no horizontal overflow on 320px');
    const slowCase=await setup(browser,390,true);
    await slowCase.page.route('**/api/user-projects/12345',async route=>{await new Promise(r=>setTimeout(r,17000));await route.abort().catch(()=>{});});
    await slowCase.page.route('**/api/referrals/stats/12345',route=>route.fulfill({contentType:'application/json',body:'{"referralCode":"WEB4TGSELF"}'}));
    await openProfile(slowCase.page);
    await slowCase.page.getByRole('alert').filter({hasText:'Не удалось загрузить проекты'}).waitFor({timeout:19000});
    assert.equal(await slowCase.page.getByRole('button',{name:'Попробовать снова'}).first().isVisible(),true);
    await slowCase.context.close();console.log('slow network: projects time out and offer retry');
    const apiPage=await browser.newPage();
    await apiPage.route('**/profile-test-blank', route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Local test</title>'}));
    await apiPage.goto(new URL('/profile-test-blank',siteUrl).href,{waitUntil:'domcontentloaded'});
    const apiResult=await apiPage.evaluate(async()=>{
      window.Telegram={WebApp:{initData:'session-one'}};
      const calls=[];let tokenIndex=0;let failNext=false;
      window.fetch=async(url,options={})=>{const headers=options.headers||{};calls.push({url:String(url),headers});if(String(url)==='/api/csrf-token') return new Response(JSON.stringify({token:`token-${++tokenIndex}`}),{status:200,headers:{'content-type':'application/json'}});if(failNext){failNext=false;return new Response('{}',{status:403,headers:{'content-type':'application/json'}});}return new Response('{}',{status:200,headers:{'content-type':'application/json'}});};
      const {apiClient}=await import('/src/lib/apiClient.ts');
      await apiClient.post('/api/test',{});await apiClient.post('/api/test',{});
      window.Telegram.WebApp.initData='session-two';await apiClient.post('/api/test',{});
      failNext=true;try{await apiClient.post('/api/test',{});}catch{}await apiClient.post('/api/test',{});
      return {calls,tokenIndex};
    });
    const tokenCalls=apiResult.calls.filter(x=>x.url==='/api/csrf-token');
    assert.equal(apiResult.tokenIndex,3);assert.deepEqual(tokenCalls.map(x=>x.headers['X-Telegram-Init-Data']),['session-one','session-two','session-two']);
    const posts=apiResult.calls.filter(x=>x.url==='/api/test');assert.deepEqual(posts.map(x=>x.headers['X-CSRF-Token']),['token-1','token-1','token-2','token-2','token-3']);
    await apiPage.close();console.log('API client: session-bound CSRF caching, session changes and rejection recovery passed');
  } finally {await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
