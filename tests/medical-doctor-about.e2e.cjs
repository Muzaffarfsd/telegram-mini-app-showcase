// Medical doctor profile and centre story: truthful demo content, gallery and working navigation.
const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const engine = process.env.MEDICAL_ENGINE === 'webkit' ? webkit : chromium;
const base = (process.env.MEDICAL_TEST_URL || 'http://127.0.0.1:53744/').replace(/\/$/, '');
async function run(browser, width, height) {
 const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true, reducedMotion: 'reduce', serviceWorkers: 'block' });
 const page = await context.newPage(); const errors=[]; page.on('pageerror', e => errors.push(e.message));
 try {
  await page.goto(`${base}/#/demos/medical-center/app`, { waitUntil:'domcontentloaded' });
  await page.getByTestId('medical-center').waitFor();
  await page.getByRole('button',{name:'Врачи',exact:true}).click();
  await page.getByRole('button',{name:'Профиль специалиста Анна Морозова'}).click();
  const doc=page.locator('.meddoc'); await doc.getByRole('heading',{name:/Анна Морозова/}).waitFor();
  assert.match(await doc.locator('.meddoc-demo').innerText(),/Демонстрационный профиль/);
  assert.match(await doc.locator('.meddoc-education').innerText(),/Пример заполнения/);
  const photos=doc.locator('.meddoc-gallery-rail button'); assert.equal(await photos.count(),3);
  const portrait=await doc.locator('.meddoc-main-image img').getAttribute('src');
  await photos.nth(0).click(); assert.equal(await photos.nth(0).getAttribute('aria-pressed'),'true');
  assert.notEqual(await doc.locator('.meddoc-main-image img').getAttribute('src'),portrait);
  await doc.getByRole('button',{name:'Вернуть портрет'}).click(); assert.equal(await doc.locator('.meddoc-main-image img').getAttribute('src'),portrait);
  assert.equal(await doc.locator('.meddoc-video').getAttribute('controls'),'');
  assert.equal(await doc.locator('video source').getAttribute('src'),'/medical/video/doctor-anna.mp4');
  assert.equal(await doc.locator('.meddoc-video').getAttribute('poster'),'/medical/generated/med-v3-doctor-anna-poster.webp');
  assert.match(await doc.locator('.meddoc-video-section').innerText(),/В ролике:[\s\S]*без звука/);
  await doc.locator('.meddoc-video').scrollIntoViewIfNeeded(); await doc.locator('.meddoc-video').evaluate(e=>e.play()); await page.waitForFunction(()=>document.querySelector('.meddoc-video')?.currentTime>0.1); await doc.locator('.meddoc-video').evaluate(e=>e.pause());
  for(const [name,id] of [['Дмитрий Орлов','cardio'],['Елена Соколова','neuro'],['Мария Белова','maria']]) { await page.getByRole('button',{name:'Врачи',exact:true}).click(); await page.getByRole('button',{name:`Профиль специалиста ${name}`}).click(); const video=doc.locator('.meddoc-video'); await video.scrollIntoViewIfNeeded(); assert.equal(await video.locator('source').getAttribute('src'),`/medical/video/doctor-${id}.mp4`); assert.equal(await video.getAttribute('poster'),`/medical/generated/med-v3-doctor-${id}-poster.webp`); await video.evaluate(e=>e.play()); await page.waitForFunction(()=>document.querySelector('.meddoc-video')?.currentTime>0.1); await video.evaluate(e=>e.pause()); }
  await page.getByRole('button',{name:'Врачи',exact:true}).click();
  await page.getByRole('button',{name:'Профиль специалиста Ольга Власова'}).click();
  assert.match(await doc.locator('.meddoc-book').innerText(),/ИССЛЕДОВАНИЕ · 30 МИН/);
  assert.equal(await doc.locator('video source').getAttribute('src'),'/medical/video/doctor-ultrasound.mp4');
  assert.equal(await doc.locator('.meddoc-video').getAttribute('poster'),'/medical/generated/med-v3-doctor-ultrasound-poster.webp');
  await doc.locator('.meddoc-video').scrollIntoViewIfNeeded(); await doc.locator('.meddoc-video').evaluate(e=>e.play()); await page.waitForFunction(()=>document.querySelector('.meddoc-video')?.currentTime>0.1); await doc.locator('.meddoc-video').evaluate(e=>e.pause());
  assert.equal(await doc.locator('.meddoc-gallery img').count(),4);
  for (const img of await doc.locator('.meddoc-gallery img').all()) { await img.scrollIntoViewIfNeeded(); await img.evaluate(e=>e.decode()); assert(await img.evaluate(e=>e.naturalWidth>0),'ultrasound photos load'); }
  await page.getByRole('button',{name:'Главная',exact:true}).click();
  await page.getByRole('button',{name:'О центре',exact:true}).click();
  const about=page.locator('.medabout'); assert.equal(await about.locator('.medabout-chapter').count(),3);
  assert.match(await about.locator('.medabout-story').innerText(),/ВХОД[\s\S]*РЕСЕПШЕН[\s\S]*КАБИНЕТ/);
  assert.match(await about.locator('.medabout-details').innerText(),/Адрес[\s\S]*Не указан в демо/);
  assert.equal(await about.locator('a[href^="tel:"],a[href^="mailto:"],a[href*="maps."]').count(),0,'no fake contact or map links');
  assert.equal(await about.locator('.medabout-video').getAttribute('controls'),'');
  assert.match(await about.locator('.medabout-video-section').innerText(),/В ролике:[\s\S]*без звука/);
  await about.locator('.medabout-video').scrollIntoViewIfNeeded(); await about.locator('.medabout-video').evaluate(e=>e.play()); await page.waitForFunction(()=>document.querySelector('.medabout-video')?.currentTime>0.1); await about.locator('.medabout-video').evaluate(e=>e.pause());
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no horizontal overflow');
  await about.getByRole('button',{name:'Познакомиться с врачами'}).click();
  assert.equal(await page.getByTestId('medical-center').getAttribute('data-screen'),'doctors');
  assert.deepEqual(errors,[],'no uncaught errors');
  console.log(`${engine.name()} ${width}x${height}: doctor profile, real video control, centre story and demo contacts passed`);
 } finally { await context.close(); }
}
(async()=>{const browser=await engine.launch();try{for(const [w,h] of [[320,568],[390,844],[430,932]].filter(([w])=>!process.env.MEDICAL_WIDTH||w===Number(process.env.MEDICAL_WIDTH)))await run(browser,w,h);}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1});
