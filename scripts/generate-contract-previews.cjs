// Start the app, then run: node scripts/generate-contract-previews.cjs
// Optional: CONTRACT_PREVIEW_BASE_URL=https://host/ and --capture-only.
// Captures current home screens in work/contract-preview-captures, then replaces only
// the 13 explicitly mapped files in client/public/order-contract-previews.
const { chromium } = require('playwright');
const sharp = require('sharp');
const fs = require('node:fs/promises');
const path = require('node:path');

// Catalogue direction key -> actual project ID and a visible home-screen marker.
// The source route is /#/demos/{projectId}/app; generic directions have no exact
// matching project and are intentionally excluded from this list.
const projects = [
  { key: 'clothes', id: 'muraka-fashion', marker: 'НОВЫЙ СЕЗОН' },
  { key: 'sneakers', id: 'nike-sneakers', marker: 'Кроссовки' },
  { key: 'tech', id: 'apple-store', marker: 'Открой новое' },
  { key: 'flowers', id: 'flower-store', marker: 'ЛЮБИМЫЕ ЦВЕТЫ' },
  { key: 'women-fashion', id: 'women-fashion', marker: 'ВЕЩИ ДЛЯ ТВОЕЙ ЖИЗНИ' },
  { key: 'takt-coffee', id: 'takt-coffee', marker: 'Вишнёвая мокка' },
  { key: 'lumi-studio', id: 'lumi-studio', marker: 'КРАСОТА В ДЕТАЛЯХ' },
  { key: 'furniture-studio', id: 'furniture-studio', marker: 'Sofas' },
  { key: 'opt-market', id: 'opt-market', marker: 'Хорошие продукты' },
  { key: 'jewelry-store', id: 'jewelry-store', marker: 'УКРАШЕНИЯ ДЛЯ ТВОЕЙ ЖИЗНИ' },
  { key: 'medical-center', id: 'medical-center', marker: 'ЗДОРОВЬЕ НАЧИНАЕТСЯ' },
  { key: 'china-buyer', id: 'china-buyer', marker: 'Ваш байер в Китае' },
  { key: 'skincare-aura', id: 'skincare-aura', marker: 'С возвращением' },
];

const base = process.env.CONTRACT_PREVIEW_BASE_URL || 'http://127.0.0.1:41755/';
const captureOnly = process.argv.includes('--capture-only');
const work = path.resolve('work/contract-preview-captures');
const output = path.resolve('client/public/order-contract-previews');
const timeout = 30000;

async function createPreview(screenshot) {
  const metadata = await sharp(screenshot).metadata();
  if (metadata.width !== 780 || metadata.height !== 1688) throw new Error('Unexpected screenshot dimensions');
  // Resize by width alone: the captured screen is never stretched or rotated.
  const resized = await sharp(screenshot).resize({ width: 420 }).png().toBuffer({ resolveWithObject: true });
  const h = resized.info.height;
  if (Math.abs(420 / h - 390 / 844) > 0.001) throw new Error('Screenshot aspect ratio changed');
  const mask = Buffer.from(`<svg width="420" height="${h}"><rect width="420" height="${h}" rx="34" fill="#fff"/></svg>`);
  const screen = await sharp(resized.data).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  const frame = Buffer.from(`<svg width="640" height="960" xmlns="http://www.w3.org/2000/svg"><rect x="101" y="16" width="438" height="${h + 18}" rx="44" fill="#171717"/><rect x="104" y="19" width="432" height="${h + 12}" rx="41" fill="#383838"/><rect x="108" y="23" width="424" height="${h + 4}" rx="37" fill="#090909"/></svg>`);
  return sharp({ create: { width: 640, height: 960, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: frame }, { input: screen, left: 110, top: 25 }])
    .webp({ quality: 87, alphaQuality: 100, effort: 5 }).toBuffer();
}

(async () => {
  await fs.mkdir(work, { recursive: true });
  const browser = await chromium.launch();
  const prepared = [];
  try {
    for (const project of projects) {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 }, deviceScaleFactor: 2,
        isMobile: true, hasTouch: true, locale: 'ru-RU',
        serviceWorkers: 'block', reducedMotion: 'reduce',
      });
      try {
        await context.addInitScript(() => localStorage.setItem('app-language', 'ru'));
        await context.route('https://telegram.org/js/telegram-web-app.js', route => route.fulfill({ body: '' }));
        await context.route('**/api/**', route => route.fulfill({ json: { data: [] } }));
        const page = await context.newPage();
        const route = new URL('/#/demos/' + project.id + '/app', base).href;
        await page.goto(route, { waitUntil: 'domcontentloaded', timeout });
        await page.waitForFunction(marker => document.body.innerText.replace(/\s+/g, ' ').toLowerCase().includes(marker.toLowerCase()), project.marker, { timeout });
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(() => [...document.images].filter(image => {
          const rect = image.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && rect.top < innerHeight && rect.bottom > 0 && rect.left < innerWidth && rect.right > 0 && getComputedStyle(image).visibility !== 'hidden';
        }).every(image => image.complete && image.naturalWidth > 0), null, { timeout });
        await page.waitForTimeout(1000); // Allow the current home composition to settle.
        const screenshot = await page.screenshot();
        await fs.writeFile(path.join(work, project.id + '.png'), screenshot);
        prepared.push({ name: project.key + '.webp', data: await createPreview(screenshot) });
        console.log(project.key + ' -> ' + route);
      } finally {
        await context.close();
      }
    }
  } finally {
    await browser.close();
  }
  // Do not write partial output if any capture fails.
  if (!captureOnly) for (const preview of prepared) await fs.writeFile(path.join(output, preview.name), preview.data);
})().catch(error => { console.error(error); process.exitCode = 1; });
