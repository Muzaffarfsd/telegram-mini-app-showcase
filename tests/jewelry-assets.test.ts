import assert from 'node:assert/strict';
import { test } from 'node:test';
import path from 'node:path';
import sharp from 'sharp';
import { jewelryProducts } from '../client/src/components/demos/jewelryProducts';
import { jewelryImage } from '../client/src/components/demos/jewelryImageManifest';
import { jewelryStoryImage } from '../client/src/components/demos/jewelryStoryAssets';

test('every product has reviewed, distinct transparent gallery and story images', async () => {
  assert.ok(jewelryProducts.length >= 20);
  assert.equal(new Set(jewelryProducts.map(item => item.id)).size, jewelryProducts.length);
  const images: Array<[string, string | undefined]> = [
    ['hero', jewelryImage('hero')],
    ['editorial', jewelryImage('editorial')],
    ...jewelryProducts.flatMap(item => [
      [item.id, jewelryImage(item.id)],
      [`${item.id}-detail`, jewelryImage(`${item.id}-detail`)],
      [`${item.id}-worn`, jewelryImage(`${item.id}-worn`)],
      [`${item.id}-boxed`, jewelryImage(`${item.id}-boxed`)],
      [`${item.id}-story`, jewelryStoryImage(item.id, 'story')],
      [`${item.id}-story-detail`, jewelryStoryImage(item.id, 'story-detail')],
    ] as Array<[string, string | undefined]>),
  ];
  const missing = images.filter(([, src]) => !src).map(([name]) => name);
  assert.deepEqual(missing, [], `Images awaiting review: ${missing.join(', ')}`);
  assert.equal(new Set(images.map(([, src]) => src)).size, images.length, 'Each slot must use a distinct image');
  for (const [name, src] of images) {
    assert.ok(src?.startsWith('/jewelry/'), `${name} has an unexpected path`);
    const filename = path.join(process.cwd(), 'client', 'public', src.slice(1));
    const image = sharp(filename);
    const metadata = await image.metadata();
    assert.ok(metadata.hasAlpha, `${name} has no alpha channel`);
    assert.ok((metadata.width || 0) >= 512 && (metadata.height || 0) >= 512, `${name} is too small`);
    const alpha = (await image.stats()).channels[3];
    assert.equal(alpha.min, 0, `${name} has no transparent pixels`);
    assert.ok(alpha.max > 200, `${name} has no sufficiently opaque subject`);
  }
});
