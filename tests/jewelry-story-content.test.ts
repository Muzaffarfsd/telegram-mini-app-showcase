import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { jewelryProducts } from '../client/src/components/demos/jewelryProducts';
import { getJewelryStoryCopy, jewelryStoryCopy } from '../client/src/components/demos/jewelryStoryContent';
import { jewelryStoryImage } from '../client/src/components/demos/jewelryStoryAssets';

test('every product has its own two-chapter narrative and separately reviewed editorial slots', () => {
  assert.equal(Object.keys(jewelryStoryCopy).length, jewelryProducts.length);
  const headings = new Set<string>();
  const images = new Set<string>();
  for (const product of jewelryProducts) {
    const copy = getJewelryStoryCopy(product);
    assert.ok(jewelryStoryCopy[product.id], `missing individual story for ${product.id}`);
    for (const value of Object.values(copy)) assert.ok(value.trim().length >= 3, `incomplete story for ${product.id}`);
    assert.ok(copy.designText.length > 20 && copy.detailText.length > 20, `missing descriptions for ${product.id}`);
    headings.add(copy.heading);
    for (const view of ['story', 'story-detail'] as const) {
      const image = jewelryStoryImage(product.id, view);
      assert.ok(image, `missing ${view} image for ${product.id}`);
      assert.match(image, new RegExp(`${product.id.slice(8)}-${view}(?:-v\\d+)?\\.png$`));
      assert.ok(existsSync(join(process.cwd(), 'client/public', image)), `missing file for ${product.id}: ${image}`);
      assert.ok(!images.has(image), `editorial image reused: ${image}`);
      images.add(image);
    }
  }
  assert.equal(headings.size, jewelryProducts.length, 'headings should be specific to each piece');
  assert.equal(images.size, jewelryProducts.length * 2, 'each piece needs two distinct editorial images');
});
