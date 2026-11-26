import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fixedCanPlace, validateFixedLayout } from '../client/src/components/demos/furniture/fixedInteriorModel';
import type { PlannerItem, PlannerProduct } from '../client/src/components/demos/furniture/plannerTypes';

const sofa: PlannerProduct = { id: 'sofa', name: 'Sofa', modelUrl: '/sofa.glb', widthM: 2.03, depthM: 1.58, heightM: .9 };
const table: PlannerProduct = { id: 'table', name: 'Table', modelUrl: '/table.glb', widthM: .9, depthM: .45, heightM: .45 };
const couch: PlannerItem = { id: 'a', productId: 'sofa', x: 0, z: 0, rotation: 0 };
const side: PlannerItem = { id: 'b', productId: 'table', x: 0, z: 1.02, rotation: 0 };

test('actual GLB depth may invalidate a nominally valid placement without moving saved items', () => {
  const saved = { version: 1, items: [couch, side], selected: 'a' };
  assert.deepEqual(validateFixedLayout(saved, [sofa, table]), saved);
  const conservative = { ...sofa, depthM: 1.65 };
  assert.equal(fixedCanPlace(couch, conservative, saved.items, [conservative, table]), false);
  assert.deepEqual(saved.items, [couch, side]);
});

test('boundaries, rotation, fixed furniture and invalid saved state are checked', () => {
  assert.equal(fixedCanPlace({ ...couch, x: 4.5 }, sofa, [], [sofa]), false);
  assert.equal(fixedCanPlace({ ...couch, x: 2.8, z: -2.15 }, sofa, [], [sofa]), false);
  assert.equal(fixedCanPlace({ ...couch, x: 4.1, z: 1, rotation: Math.PI / 2 }, sofa, [], [sofa]), false);
  assert.equal(validateFixedLayout({ version: 1, items: [couch, couch] }, [sofa]), null);
  assert.equal(validateFixedLayout({ version: 1, items: [couch], selected: 'missing' }, [sofa]), null);
});
