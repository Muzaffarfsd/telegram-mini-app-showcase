// Cache the catalog's Apple images in responsive WebP sizes. The source URLs and
// their existing use restrictions remain documented in appleCatalog2026.ts.
// Run from the repository root: node scripts/build-apple-local-images.cjs
require('tsx/cjs');
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const { appleCatalog2026 } = require('../client/src/components/demos/appleCatalog2026.ts');
const { appleColorImages2026, appleColorPhotos2026 } = require('../client/src/components/demos/appleColorImages2026.ts');

const root = path.join('client', 'public', 'apple-store', 'products');
const manifestPath = 'client/src/components/demos/appleLocalProductImages.ts';
// The catalog's wireless charging case image is a 56px icon. Use the larger
// existing gallery view for the same product to avoid enlarging that icon.
const sourceOverrides = {
  'https://www.apple.com/v/airpods-5/b/images/overview/contrast/airpods_chargingcase_wireless__b41jvywbfgc2_large.png':
    'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/airpods-5-wcc-select-202609_FV1?wid=940&hei=1112&fmt=png-alpha',
};
function keyFor(raw) {
  const url = new URL(raw);
  url.hash = '';
  if (url.hostname === 'store.storeimages.cdn-apple.com') {
    for (const key of ['wid', 'hei', 'fmt']) url.searchParams.delete(key);
  }
  url.searchParams.sort();
  return url.toString();
}
async function main() {
  await fs.mkdir(root, { recursive: true });
  const colorPhotos = Object.entries(appleColorImages2026).flatMap(([id, colors]) =>
    Object.keys(colors).flatMap(color => appleColorPhotos2026(id, color) || []));
  const sources = [...new Set([...appleCatalog2026.map(item => item.image), ...colorPhotos])];
  const manifest = {}, failures = [];
  let downloadedBytes = 0, outputBytes = 0;
  let next = 0;
  async function worker() {
    while (next < sources.length) {
    const index = next++, src = sources[index];
    try {
      const response = await fetch(sourceOverrides[src] || src, { signal: AbortSignal.timeout(20000) });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const bytes = Buffer.from(await response.arrayBuffer());
      const meta = await sharp(bytes, { failOn: 'error' }).metadata();
      if (!meta.width || !meta.height || meta.width < 150 || meta.height < 150) throw new Error('image too small or invalid');
      downloadedBytes += bytes.length;
      const key = keyFor(src), id = crypto.createHash('sha256').update(key).digest('hex').slice(0, 16);
      const widths = [];
      for (const desired of [160, 480, 940]) {
        const width = Math.min(desired, meta.width);
        if (widths.includes(width)) continue;
        const file = path.join(root, `${id}-${width}.webp`);
        const info = await sharp(bytes).resize({ width, withoutEnlargement: true }).webp({quality: 82, alphaQuality: 100, effort: 4}).toFile(file);
        if (info.width !== width) throw new Error(`wrong width ${info.width}`);
        widths.push(width); outputBytes += info.size;
      }
      manifest[key] = { id, widths };
      console.log(`${index + 1}/${sources.length}: ${src} (${bytes.length} bytes)`);
    } catch (error) {
      failures.push({ src, message: String(error.message || error) });
      console.error(`FAILED ${src}: ${error.message}`);
    }
    }
  }
  await Promise.all(Array.from({length: 6}, () => worker()));
  const ordered = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  await fs.writeFile(manifestPath, `/** Locally resized copies of catalog images. Sources retain their existing rights restrictions. */\nexport const appleLocalProductImages:Record<string,{id:string;widths:number[]}> = ${JSON.stringify(ordered, null, 2)};\n`);
  console.log(JSON.stringify({sourceCount:sources.length, localized:Object.keys(manifest).length, downloadedBytes, outputBytes, failures}, null, 2));
  if (failures.length) process.exitCode = 1;
}
main().catch(error => { console.error(error); process.exitCode = 1; });
