// Bake the existing cover, live demo screenshot and foreground into one paintable image.
// Run with node scripts/build-showcase-art.cjs after replacing any source in public/showcase.
const fs = require('node:fs/promises');
const path = require('node:path');
const { chromium } = require('playwright');
const sharp = require('sharp');

// Handset bounds and foreground in the original 264 by 352 reference compositions.
const scenes = {
  'furniture-studio': null,
  'flower-store': null,
  'muraka-fashion': { handset: [66, 27, 136, 298], foreground: [[45, 277], [70, 292], [82, 303], [101, 311], [108, 320], [102, 346], [33, 348]] },
  'women-fashion': { handset: [61, 21, 138, 303], foreground: [[41, 327], [98, 322], [132, 320], [155, 314], [171, 306], [189, 300], [202, 286], [247, 264], [260, 351], [34, 351]] },
  'nike-sneakers': { handset: [56, 24, 136, 289], foreground: [[98, 321], [112, 310], [135, 302], [151, 293], [165, 278], [175, 269], [185, 247], [197, 233], [200, 217], [236, 219], [259, 294], [258, 348], [93, 348]] },
  'apple-store': { handset: [65, 13, 146, 320], foreground: [[176, 302], [179, 284], [181, 272], [188, 263], [207, 257], [219, 219], [257, 207], [263, 346], [179, 347]] },
  'lumi-studio': { handset: [63, 26, 136, 295], foreground: [[37, 318], [75, 317], [98, 316], [128, 310], [153, 306], [173, 310], [188, 314], [205, 299], [254, 281], [260, 351], [33, 351]] },
  'opt-market': { handset: [62, 15, 139, 306], foreground: [[169, 287], [183, 279], [184, 271], [192, 260], [203, 256], [208, 224], [225, 220], [263, 247], [259, 345], [170, 345], [181, 315], [181, 299]] },
  'jewelry-store': { handset: [56, 8, 151, 330], foreground: [[132, 239], [142, 235], [153, 234], [159, 238], [160, 246], [176, 246], [193, 244], [214, 238], [251, 221], [263, 222], [261, 242], [217, 258], [238, 275], [238, 307], [207, 308], [205, 259], [160, 264], [160, 270], [141, 271], [141, 263], [134, 263]] },
  'medical-center': { handset: [60, 12, 141, 309], foreground: [[10, 284], [48, 281], [65, 284], [76, 290], [77, 304], [66, 315], [74, 328], [70, 343], [6, 347]] },
  'china-buyer': { cutout: true },
  'skincare-aura': { handset: [62, 26, 136, 297], foreground: [[111, 324], [143, 316], [159, 312], [174, 304], [191, 291], [209, 277], [240, 251], [259, 243], [260, 350], [104, 350]] },
};
const source = path.resolve(__dirname, '../client/public/showcase');
const output = path.resolve(__dirname, '../client/src/assets/showcase-art');
const width = 204;
const height = 272;

async function picture(folder, id) {
  const filename = folder === 'covers' && id === 'furniture-studio' ? 'furniture-studio-v3.webp' : id + '.webp';
  const bytes = await fs.readFile(path.join(source, folder, filename));
  return 'data:image/webp;base64,' + bytes.toString('base64');
}

async function composition(id, scene) {
  const cover = await picture('covers', id);
  if (!scene) return '<img class="original" src="' + cover + '">';
  const screen = await picture('screens', id);
  if (scene.cutout) {
    return `<div class="ps-device-scene"><div class="ps-device"><div class="ps-device-display"><img src="${screen}"></div></div>
      <img style="right:0;bottom:0;width:42%;height:43%;object-fit:contain;object-position:right bottom" src="${cover}"></div>`;
  }
  const [x, y, w, h] = scene.handset;
  const scaleX = 152 / w;
  const scaleY = 310 / h;
  const placement = `left:${(62 - x * scaleX) / 264 * 100}%;top:${(17 - y * scaleY) / 352 * 100}%;width:${scaleX * 100}%;height:${scaleY * 100}%`;
  const outline = scene.foreground.map(([px, py]) => `${px / 264 * 100}% ${py / 352 * 100}%`).join(',');
  return `<div class="ps-device-scene"><img style="${placement}" src="${cover}">
    <div class="ps-device"><div class="ps-device-display"><img src="${screen}"></div></div>
    <img style="${placement};clip-path:polygon(${outline})" src="${cover}"></div>`;
}

async function buildPreviewSheet() {
  const ids = Object.keys(scenes).sort();
  const columns = 4;
  const width = 144;
  const height = 192;
  const tiles = ids.map((id, index) => ({
    input: path.join(output, id + '.preview.webp'),
    left: (index % columns) * width, top: Math.floor(index / columns) * height,
  }));
  await sharp({ create: { width: width * columns, height: height * Math.ceil(ids.length / columns),
    channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite(tiles)
    .webp({ quality: 66, alphaQuality: 55, effort: 6 })
    .toFile(path.join(output, '../showcase-preview-sheet.webp'));
}

async function main() {
  await fs.mkdir(output, { recursive: true });
  const handsetStyles = await fs.readFile(path.join(__dirname, '../client/src/components/ShowcaseHandset.css'), 'utf8');
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 3 });
    for (const [id, scene] of Object.entries(scenes)) {
      const only = process.argv.find(arg => arg.startsWith('--id='));
      if (only && id !== only.slice(5)) continue;
      const html = await composition(id, scene);
      await page.setContent(`<style>
        *{box-sizing:border-box} body{margin:0}
        .original{position:absolute;inset:0;width:100%;height:100%}
        img{display:block;position:absolute}
        ${handsetStyles}
      </style><div class="ps-composition">${html}</div>`);
      await page.evaluate(() => Promise.all(Array.from(document.images, image => image.decode())));
      const rendered = await page.screenshot({ omitBackground: true });
      await sharp(rendered).webp({ quality: 86, alphaQuality: 82, effort: 5 }).toFile(path.join(output, id + '.webp'));
      await sharp(rendered).resize({ width: 144 }).webp({ quality: 63, alphaQuality: 50, effort: 5 }).toFile(path.join(output, id + '.preview.webp'));
    }
  } finally {
    await browser.close();
  }
  await buildPreviewSheet();
}
(process.argv.includes('--sheet-only') ? buildPreviewSheet() : main())
  .catch(error => { console.error(error); process.exitCode = 1; });
