import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bookshelfPlacement, cabinetPlacement, type PlannerItem, type PlannerProduct } from '../client/src/components/demos/furniture/plannerTypes';

const room = { width: 4.8, depth: 4 };
const longPiece: PlannerProduct = { id: 'long', name: 'Long piece', modelUrl: '/model.glb', widthM: 0.4, depthM: 2, heightM: 1 };
const piece = (x: number, z: number, rotation = 0): PlannerItem => ({ id: 'one', productId: 'long', x, z, rotation });

test('decor is shown only when the room and product footprint leave enough space', () => {
  const empty = cabinetPlacement(room, [], [longPiece]);
  assert.equal(empty.clear, true);
  assert.ok(Math.abs(empty.x - 1.92) < 0.001 && Math.abs(empty.z + 0.68) < 0.001);
  assert.equal(cabinetPlacement(room, [piece(1.8, -0.7)], [longPiece]).clear, false);
  assert.equal(cabinetPlacement(room, [piece(-1.5, 0.6)], [longPiece]).clear, true);
  assert.equal(cabinetPlacement({ width: 3.1, depth: 4 }, [], [longPiece]).clear, false);
  assert.equal(cabinetPlacement({ width: 4.8, depth: 2.7 }, [], [longPiece]).clear, false);
});

test('rotation changes the conservative footprint and hiding the cabinet is reversible', () => {
  const before = piece(0.8, -0.7);
  assert.equal(cabinetPlacement(room, [before], [longPiece]).clear, true);
  assert.equal(cabinetPlacement(room, [{ ...before, rotation: Math.PI / 2 }], [longPiece]).clear, false);
  assert.equal(cabinetPlacement(room, [before], [longPiece]).clear, true);
});

test('the shelf stays clear of the window and hides when a movable item occupies its space', () => {
  const shelf = bookshelfPlacement(room, [], [longPiece]);
  assert.equal(shelf.clear, true);
  assert.equal(bookshelfPlacement(room, [piece(shelf.x, shelf.z)], [longPiece]).clear, false);
  assert.equal(bookshelfPlacement(room, [piece(-1.5, 0.6)], [longPiece]).clear, true);
  assert.equal(bookshelfPlacement({ width: 2, depth: 2 }, [], [longPiece]).clear, false);
});
