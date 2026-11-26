import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bookshelfPlacement, cabinetPlacement, picturePlacement, sidePicturePlacement, type PlannerItem, type PlannerProduct } from '../client/src/components/demos/furniture/plannerTypes';

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

test('the framed picture uses a clear wall span without changing the layout', () => {
  const wide = { width: 4.8, depth: 4, openings: { window: { start: 1.1, width: 1.3 }, door: { start: 3.0, width: 0.8 } } };
  const x = picturePlacement(wide, [], [longPiece], false);
  assert.notEqual(x, null);
  // The window is padded by the curtains, and the door is padded by trim.
  assert.ok(x! + 0.3 <= -4.8 / 2 + 1.1 - 0.44 || x! - 0.3 >= -4.8 / 2 + 1.1 + 1.3 + 0.44);
  assert.ok(x! + 0.3 <= -4.8 / 2 + 3.0 - 0.08 || x! - 0.3 >= -4.8 / 2 + 3.0 + 0.8 + 0.08);
  const filled = { width: 2, depth: 2, openings: { window: { start: 0.1, width: 1.8 }, door: null } };
  assert.equal(picturePlacement(filled, [], [longPiece], false), null);
  const tall = { ...longPiece, heightM: 2, widthM: 4.8, depthM: 0.2 };
  const item = { ...piece(0, -1.9), productId: tall.id };
  assert.equal(picturePlacement({ width: 4.8, depth: 4, openings: { window: null, door: null } }, [item], [tall], false), null);
  const tallAlongSide = { ...tall, widthM: 0.2, depthM: 4 };
  assert.equal(sidePicturePlacement(room, [{ ...piece(-2.3, 0), productId: tall.id }], [tallAlongSide]), null);
  assert.equal(sidePicturePlacement({ width: 2, depth: 2 }, [], [longPiece]), 0);
});
