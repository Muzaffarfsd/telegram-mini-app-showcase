import test from 'node:test';
import assert from 'node:assert/strict';
import { readContractDraft, saveContractDraft } from '../client/src/components/contractDraftStorage';

test('contract draft stores only catalogue choices and expires after 30 days', () => {
  const values = new Map<string, string>();
  const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value) } as unknown as Storage;
  const selection = { direction: 'Магазин одежды', projectName: 'Личное название', includedFeatures: ['Каталог'], extraFeatures: [{ name: 'Поиск', price: 20000 }], estimatedTotal: 170000, support: { name: 'Стандартный', price: 14900, period: 'month' as const }, customer: { name: 'Личные реквизиты' } };
  const now = 2_000_000_000_000;
  saveContractDraft(storage, selection, now);
  const stored = [...values.values()].join('');
  assert.doesNotMatch(stored, /Личное название|Личные реквизиты|customer|projectName/);
  assert.deepEqual(readContractDraft(storage, now + 1000), { direction: selection.direction, projectName: '', includedFeatures: selection.includedFeatures, extraFeatures: selection.extraFeatures, estimatedTotal: selection.estimatedTotal, support: selection.support });
  assert.equal(readContractDraft(storage, now + 31 * 24 * 60 * 60 * 1000), null);
  assert.equal(readContractDraft(storage, now - 1), null);
});

test('invalid, unavailable or blocked storage cannot break contract page', () => {
  const invalid = { getItem: () => '{broken' } as unknown as Storage;
  assert.equal(readContractDraft(invalid), null);
  const blocked = { getItem: () => { throw Error('blocked'); }, setItem: () => { throw Error('blocked'); } } as unknown as Storage;
  assert.equal(readContractDraft(blocked), null);
  assert.doesNotThrow(() => saveContractDraft(blocked, { direction: 'Test', projectName: '', includedFeatures: [], extraFeatures: [], estimatedTotal: null, support: null }));
});
