const assert = require('node:assert/strict');
const { chromium } = require('playwright');
const site = process.env.FURNITURE_TEST_URL || 'http://127.0.0.1:41755/';

(async () => {
  const browser = await chromium.launch();
  try {
    for (const scale of [1, 2]) {
      const context = await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:scale,isMobile:true,hasTouch:true,serviceWorkers:'block'});
      const page = await context.newPage(), requested = [];
      page.on('request', request => { if (request.resourceType() === 'image') requested.push(new URL(request.url()).pathname); });
      try {
        await page.goto(new URL('/#/demos/furniture-studio/app',site).href);
        const hero = page.locator('.fhome-slide:not([aria-hidden="true"]) .fhome-hero-image').first();
        await hero.waitFor();
        await hero.evaluate(async image => { if (!image.complete) await new Promise((resolve,reject)=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',reject,{once:true});}); });
        const src = await hero.evaluate(image => new URL(image.currentSrc).pathname);
        assert.ok(src.startsWith('/furniture/home/sloane-'), `unexpected hero ${src}`);
        assert.equal(requested.filter(path => path === src).length, 1, 'early warm and visible image should share one request');
        assert.equal(requested.includes('/furniture/real-products/sofa-main.webp'), false, 'do not fetch the old non-hero image');
        console.log(`PASS furniture ${scale}x: first image ${src} requested once`);
      } finally { await context.close(); }
    }
    // 320px at 2x is deliberately included: 72vw selects the 480px image,
    // whereas the previous preloader's 90vw selected and downloaded 900px.
    for (const [width,scale,expected] of [[320,1,480],[320,2,480],[390,2,640],[390,3,900]]) {
      const context = await browser.newContext({viewport:{width,height:844},deviceScaleFactor:scale,isMobile:true,hasTouch:true,serviceWorkers:'block'});
      const page = await context.newPage(), requested = [];
      page.on('request', request => { if (request.resourceType() === 'image') requested.push(new URL(request.url()).pathname); });
      try {
        await page.goto(new URL('/#/demos/takt-coffee/app',site).href);
        const hero = page.locator('.coffee-hero-photo.tk-hero-cutout').first();
        await hero.waitFor();
        await hero.evaluate(async image => { if (!image.complete) await new Promise((resolve,reject)=>{image.addEventListener('load',resolve,{once:true});image.addEventListener('error',reject,{once:true});}); });
        const src = await hero.evaluate(image => new URL(image.currentSrc).pathname);
        assert.equal(src, `/takt-coffee/editorial/cherry-mocha-${expected}.webp`);
        assert.equal(requested.filter(path => path === src).length,1,'early warm and visible image should share one request');
        for (const other of [480,640,900].filter(size => size !== expected))
          assert.equal(requested.includes(`/takt-coffee/editorial/cherry-mocha-${other}.webp`),false,'do not fetch the wrong responsive image');
        console.log(`PASS coffee ${width}px ${scale}x: ${src} requested once`);
      } finally { await context.close(); }
    }
  } finally {await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
