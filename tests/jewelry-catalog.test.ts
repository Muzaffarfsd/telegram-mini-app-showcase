import assert from 'node:assert/strict';
import { test } from 'node:test';
import { jewelryProducts } from '../client/src/components/demos/jewelryProducts';

test('demo catalog has twenty source-linked, unique products with their own descriptions', () => {
  assert.equal(jewelryProducts.length, 20);
  assert.equal(new Set(jewelryProducts.map(p => p.id)).size, 20);
  assert.equal(new Set(jewelryProducts.map(p => p.sku)).size, 20);
  assert.equal(new Set(jewelryProducts.map(p => p.story)).size, 20);
  for (const category of ['Кольца', 'Серьги', 'Колье', 'Браслеты']) {
    assert.equal(jewelryProducts.filter(p => p.category === category).length, 5);
  }
  for (const item of jewelryProducts) {
    assert.match(item.id, /^tiffany-\d+$/);
    assert.match(item.sku, /^\d+$/);
    assert.equal(new URL(item.sourceUrl).hostname, 'www.tiffany.com');
    assert.ok(item.price > 0 && Number.isFinite(item.price));
    assert.ok(item.displayName && item.name && item.material && item.stone && item.measurements && item.story);
  }
});
