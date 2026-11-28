import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { furniturePixelRatio, type FurnitureRenderHints } from '../client/src/components/demos/furniture/renderQuality';

const screen: FurnitureRenderHints = { pixelRatio: 3, width: 390, height: 600 };
const high = 'Mozilla/5.0 Telegram-Android/11.3.3 (Google Pixel; Android 15; SDK 35; HIGH)';

test('unknown and constrained devices keep their previous rendering quality', () => {
  assert.equal(furniturePixelRatio('viewer', screen), 1.75);
  assert.equal(furniturePixelRatio('planner', screen), 1.5);
  assert.equal(furniturePixelRatio('fixed', { ...screen, memory: 2 }), 1);
  assert.equal(furniturePixelRatio('viewer', { ...screen, userAgent: high, memory: 4 }), 1.75);
  assert.equal(furniturePixelRatio('planner', { ...screen, memory: 8, cores: 8, lowPerformance: true }), 1.5);
  assert.equal(furniturePixelRatio('viewer', { ...screen, memory: 8, cores: 8, userAgent: high.replace('HIGH', 'AVERAGE') }), 1.75);
});

test('higher detail is limited to capable devices and a bounded drawing buffer', () => {
  assert.equal(furniturePixelRatio('viewer', { ...screen, userAgent: high }), 2);
  assert.equal(furniturePixelRatio('planner', { ...screen, memory: 8, cores: 8 }), 1.75);
  assert.equal(furniturePixelRatio('fixed', { ...screen, userAgent: high, pixelRatio: 1 }), 1);
  const large = { ...screen, width: 500, height: 600, userAgent: high };
  assert.ok(Math.abs(furniturePixelRatio('viewer', large) - Math.sqrt(1_100_000 / 300_000)) < 0.00001);
  assert.equal(furniturePixelRatio('viewer', { ...large, width: 1000, height: 1000 }), 1.75);
});
