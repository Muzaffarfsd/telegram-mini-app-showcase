const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');

(async () => {
  for (const browserType of [chromium, webkit]) {
    const browser = await browserType.launch({headless:true});
    try {
      const context = await browser.newContext({viewport:{width:320,height:568},isMobile:true,hasTouch:true,locale:'ru-RU',reducedMotion:'reduce',serviceWorkers:'block'});
      await context.addInitScript(() => localStorage.setItem('app-language','ru'));
      await context.route('https://telegram.org/js/telegram-web-app.js',route => route.fulfill({contentType:'text/javascript',body:''}));
      const page = await context.newPage();
      const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.goto(`${process.env.MURAKA_TEST_URL || 'http://127.0.0.1:53738/'}#/demos/muraka-fashion/app`);
      await page.getByTestId('muraka-fashion').waitFor();
      await page.getByRole('button',{name:'Каталог',exact:true}).tap();
      await page.getByTestId('mf-card-jeans-blue').getByRole('button',{name:/Открыть/}).tap();
      const open = page.getByRole('button',{name:'Увеличить фотографию товара'});
      await open.tap();
      const dialog = page.getByRole('dialog',{name:'ФОТОГРАФИИ'});
      await dialog.waitFor();
      await page.waitForFunction(() => document.querySelector('[data-testid="muraka-fashion"]')?.hasAttribute('inert'));
      for (const selector of ['[data-testid="muraka-fashion"]','.mf-nav','.w4-topbar']) {
        assert.equal(await page.locator(selector).first().evaluate(element => element.hasAttribute('inert')),true,`${selector} must be inert behind dialog`);
      }
      assert.equal(await dialog.getByRole('button',{name:'Предыдущая фотография'}).isDisabled(),true);
      await page.screenshot({path:`${process.env.TEMP}/fashion-photo-${browserType.name()}.png`});
      await dialog.getByRole('button',{name:'Следующая фотография'}).tap();
      assert.equal(await dialog.getByText('2 / 4').count(),1);
      assert.match(await dialog.locator('img').getAttribute('alt'), /фотография 2 из 4/);
      await dialog.getByRole('button',{name:'Увеличить фотографию',exact:true}).tap();
      const region = dialog.getByRole('region');
      const dimensions = await region.evaluate(e => ({sw:e.scrollWidth,cw:e.clientWidth,sh:e.scrollHeight,ch:e.clientHeight}));
      assert.ok(dimensions.sw > dimensions.cw && dimensions.sh > dimensions.ch,'Zoomed image must be scrollable in both directions');
      await page.waitForFunction(() => document.querySelector('.mf-photo-viewport')?.scrollTop > 0);
      await region.evaluate(e => {e.scrollLeft=0;e.scrollTop=0;});
      assert.deepEqual(await region.evaluate(e => [e.scrollLeft,e.scrollTop]),[0,0]);
      await dialog.getByRole('button',{name:'Уменьшить фотографию'}).tap();
      await page.keyboard.press('Escape');
      assert.equal(await dialog.count(),0);
      await open.waitFor();
      await page.waitForFunction(() => document.activeElement?.getAttribute('aria-label') === 'Увеличить фотографию товара');
      assert.equal(await page.getByTestId('muraka-fashion').evaluate(element => element.hasAttribute('inert')),false);
      assert.deepEqual(errors,[]);
      console.log(`${browserType.name()}: gallery zoom, navigation and scrolling passed`);
    } finally { await browser.close(); }
  }
})().catch(error => {console.error(error);process.exitCode=1;});
