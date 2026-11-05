const { chromium, webkit } = require('playwright');
const assert = require('node:assert/strict');
const app = 'http://127.0.0.1:53755/';
const wrap = value => JSON.stringify({ value: JSON.stringify(value), timestamp: 123, ttl: 9999999999999 });
(async()=>{
 for (const browserType of [chromium, webkit]) {
  const browser=await browserType.launch();const context=await browser.newContext({viewport:{width:390,height:844}});await context.route('https://telegram.org/js/telegram-web-app.js',route=>route.abort());const page=await context.newPage();
  await page.addInitScript(() => Object.defineProperty(Navigator.prototype,'onLine',{get:()=>false,configurable:true}));
  try {
   // Send JSON wrappers as strings: no browser-side eval or access to existing user profiles.
   await page.goto(app,{waitUntil:'domcontentloaded'});
   await page.evaluate(async ({favorites,viewed})=>{
    localStorage.setItem('stray-store_cart','delete');localStorage.setItem('stray-store_orders','delete');localStorage.setItem('techstore-cart','delete');localStorage.setItem('labsurvivalist-store_orders','delete');
    localStorage.setItem('floralart-store_cart','keep-floralart');localStorage.setItem('flower-store-cart-v1','keep-flora');
    localStorage.setItem('tma_cache_favorites',favorites);localStorage.setItem('tma_cache_viewedDemos',viewed);
    localStorage.setItem('gamification_stats',JSON.stringify({viewedDemoIds:['futuristic-fashion-4','florist','flower-store'],xp:991}));
    localStorage.setItem('web4tg_user_behavior',JSON.stringify({viewedDemos:['tech-nova','florist','apple-store'],categoryPreferences:{A:3},lastVisit:1,sessionCount:1}));
    localStorage.setItem('analytics_offline_queue',JSON.stringify([{category:'demo',label:'beauty',id:'remove'},{category:'demo',label:'florist',id:'keep-florist'},{category:'demo',label:'flower-store',id:'keep-flora'}]));
    await new Promise((resolve,reject)=>{const r=indexedDB.open('web4tg-offline',1);r.onupgradeneeded=()=>{r.result.createObjectStore('viewedDemos',{keyPath:'id'});r.result.createObjectStore('userProfile',{keyPath:'id'});r.result.createObjectStore('gamificationStats',{keyPath:'id'})};r.onerror=()=>reject(r.error);r.onsuccess=()=>{const db=r.result,tx=db.transaction(['viewedDemos','userProfile','gamificationStats'],'readwrite');for(const v of [{id:'old-1',demoId:'streetwear-vanta'},{id:'old-2',demoId:'restaurant'},{id:'keep-1',demoId:'flower-store'},{id:'keep-2',demoId:'florist'}])tx.objectStore('viewedDemos').put(v);tx.objectStore('userProfile').put({id:'current',value:'keep'});tx.objectStore('gamificationStats').put({id:'current',xp:77,viewedDemoIds:['beauty','florist','flower-store']});tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)}});
   },{favorites:wrap(['streetwear-vanta','flower-store','florist']),viewed:wrap(['restaurant','florist','apple-store'])});
   await page.reload({waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>localStorage.getItem('techstore-cart')===null);
   await page.waitForFunction(()=>new Promise(resolve=>{const r=indexedDB.open('web4tg-offline');r.onsuccess=()=>{const db=r.result,q=db.transaction('viewedDemos').objectStore('viewedDemos').getAll();q.onsuccess=()=>{db.close();resolve(q.result.length===2)}};r.onerror=()=>resolve(false)}));
   const got=await page.evaluate(()=>({strayCart:localStorage.getItem('stray-store_cart'),strayOrders:localStorage.getItem('stray-store_orders'),old:localStorage.getItem('techstore-cart'),old2:localStorage.getItem('labsurvivalist-store_orders'),floral:localStorage.getItem('floralart-store_cart'),flora:localStorage.getItem('flower-store-cart-v1'),favorites:JSON.parse(JSON.parse(localStorage.getItem('tma_cache_favorites')).value),viewed:JSON.parse(JSON.parse(localStorage.getItem('tma_cache_viewedDemos')).value),stats:JSON.parse(localStorage.getItem('gamification_stats')),behavior:JSON.parse(localStorage.getItem('web4tg_user_behavior')),queue:JSON.parse(localStorage.getItem('analytics_offline_queue'))}));
   assert.equal(got.strayCart,null);assert.equal(got.strayOrders,null);assert.equal(got.old,null);assert.equal(got.old2,null);assert.equal(got.floral,'keep-floralart');assert.equal(got.flora,'keep-flora');assert.deepEqual(got.favorites,['flower-store','florist']);assert.deepEqual(got.viewed,['florist','apple-store']);assert.deepEqual(got.stats.viewedDemoIds,['florist','flower-store']);assert.equal(got.stats.xp,991);assert.deepEqual(got.behavior.viewedDemos,['florist','apple-store']);assert.deepEqual(got.behavior.categoryPreferences,{A:3});assert.deepEqual(got.queue.map(x=>x.id),['keep-florist','keep-flora']);
   const remaining=await page.evaluate(()=>new Promise((resolve,reject)=>{const r=indexedDB.open('web4tg-offline');r.onsuccess=()=>{const db=r.result,tx=db.transaction(['viewedDemos','userProfile','gamificationStats']),a=tx.objectStore('viewedDemos').getAll(),b=tx.objectStore('userProfile').get('current'),c=tx.objectStore('gamificationStats').get('current');tx.oncomplete=()=>{db.close();resolve({records:a.result,profile:b.result,stats:c.result})};tx.onerror=()=>reject(tx.error)}}));
   assert.deepEqual(remaining.records.map(x=>x.demoId).sort(),['florist','flower-store'].sort());assert.equal(remaining.profile.value,'keep');assert.deepEqual(remaining.stats.viewedDemoIds,['florist','flower-store']);assert.equal(remaining.stats.xp,77);
   const telegramResult=await page.evaluate(async ({favorites,viewed})=>{
    const items={'tma_cache_favorites':favorites,'tma_cache_viewedDemos':viewed};let writes=0;
    const device={getItem:(key,cb)=>cb(null,items[key]||null),setItem:(key,value,cb)=>{writes++;items[key]=value;cb(null)}};
    window.Telegram={WebApp:{version:'9.2',DeviceStorage:device}};
    const module=await import('/src/lib/cleanupRetiredDemos.ts');await module.cleanupRetiredDemos();
    return {favorites:JSON.parse(JSON.parse(items.tma_cache_favorites).value),writes};
   },{favorites:wrap(['beauty','florist','flower-store']),viewed:wrap(['tech-nova','apple-store'])});
   assert.deepEqual(telegramResult.favorites,['beauty','florist','flower-store']);assert.equal(telegramResult.writes,0);
   const blocked=await page.evaluate(async()=>{
    const loc=Object.getOwnPropertyDescriptor(window,'localStorage'),db=Object.getOwnPropertyDescriptor(window,'indexedDB');
    try {
      Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new Error('blocked')}});
      Object.defineProperty(window,'indexedDB',{configurable:true,get(){throw new Error('blocked')}});
      await (await import('/src/lib/cleanupRetiredDemos.ts')).cleanupRetiredDemos();return true;
    } finally {
      if(loc)Object.defineProperty(window,'localStorage',loc);else delete window.localStorage;
      if(db)Object.defineProperty(window,'indexedDB',db);else delete window.indexedDB;
    }
   });
   assert.equal(blocked,true,'blocked storage must not break cleanup');
   console.log(`PASS ${browserType.name()}: isolated cleanup, untouched Telegram DeviceStorage, protected FLORAL ART and retained app data`);
  }finally{await context.close();await browser.close()}
 }
})().catch(e=>{console.error(e);process.exitCode=1});
