import test from 'node:test';
import assert from 'node:assert/strict';
import { readOrderContractSelection } from '../client/src/components/orderContractSelection';

const now = 1_800_000_000_000;
const oneDay = 24 * 60 * 60 * 1000;
const draft = { step: 3, templateId: 'ecommerce-basic', storeCategory: 'flowers', extras: ['search', 'search', 'payments', 'made-up'], projectName: 'Ромашка', planId: 'standard', annual: false, customer: { name: 'sensitive' } };
const encoded = (fields: Record<string, unknown> = {}) => JSON.stringify({ version: 1, savedAt: now - oneDay, draft, ...fields });
const storage = (value: string | null) => ({ getItem(key: string) { assert.equal(key, 'web4tg:order-draft:v1'); return value; } });

test('valid draft uses catalog prices and does not expose customer data', () => {
  const result = readOrderContractSelection(storage(encoded()), now)!;
  assert.equal(result.direction, 'Магазин цветов');
  assert.equal(result.projectName, 'Ромашка');
  assert.equal(result.estimatedTotal, 170000);
  assert.deepEqual(result.extraFeatures, [{ name: 'Поиск', price: 20000 }]);
  assert.ok(result.includedFeatures.includes('Каталог'));
  assert.deepEqual(result.support, { name: 'Стандартный', price: 14900, period: 'month' });
  assert.doesNotMatch(JSON.stringify(result), /sensitive|customer/);
});
test('annual selection follows the existing ten-month price', () => {
  const result = readOrderContractSelection(storage(encoded({ draft: { ...draft, annual: true } })), now)!;
  assert.deepEqual(result.support, { name: 'Стандартный', price: 149000, period: 'year' });
});
test('expired, future, invalid and missing records do not become orders', () => {
  for (const value of [null, '{broken', '{}', encoded({ savedAt: now - 31 * oneDay }), encoded({ savedAt: now + 1 }), encoded({ version: 9 }), encoded({ draft: { ...draft, templateId: 'unknown' } }), encoded({ draft: { ...draft, planId: 'unknown' } })]) {
    assert.equal(readOrderContractSelection(storage(value), now), null);
  }
  assert.equal(readOrderContractSelection(null, now), null);
});
test('blocked storage never escapes and does not try to change the order', () => {
  let calls = 0;
  const blocked = { getItem() { calls++; throw new Error('blocked'); }, setItem() { throw new Error('must not write'); }, removeItem() { throw new Error('must not delete'); } };
  assert.equal(readOrderContractSelection(blocked, now), null);
  assert.equal(calls, 1);
});
