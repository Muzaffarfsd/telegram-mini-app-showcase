const assert = require('node:assert/strict');
const fs = require('node:fs/promises');
const path = require('node:path');
const sharp = require('sharp');

const root = path.join(__dirname, '..', 'client', 'public', 'project-stories');
const projects = ['muraka-fashion', 'takt-coffee', 'women-fashion', 'nike-sneakers', 'apple-store', 'furniture-studio', 'flower-store', 'lumi-studio', 'opt-market', 'jewelry-store', 'medical-center', 'china-buyer', 'skincare-aura'];
const english = new Set(['takt-coffee', 'furniture-studio', 'china-buyer']);

(async () => {
  let count = 0;
  for (const project of projects) {
    const names = ['1.webp', '2.webp', '3.webp'];
    if (english.has(project)) names.push('1-en.webp', '2-en.webp', '3-en.webp');
    for (const name of names) {
      const file = path.join(root, project, name);
      await fs.access(file);
      const { width, height, format } = await sharp(file).metadata();
      assert.equal(format, 'webp', `${project}/${name} format`);
      assert.ok(width >= 780 && height >= 1688, `${project}/${name} needs a real high-density capture, got ${width}×${height}`);
      count++;
    }
  }
  assert.equal(count, 48);
  console.log(`PASS ${count} high-density project captures`);
})().catch(error => { console.error(error); process.exit(1); });
