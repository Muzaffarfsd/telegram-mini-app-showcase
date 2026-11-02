import { test } from 'node:test';
import assert from 'node:assert/strict';
import { trackDemoView, trackFeatureAdded, trackProjectCreation } from '../client/src/hooks/useGamification';

test('device progress tracks distinct demos before visiting rewards and preserves achievement XP', () => {
  const store = new Map<string, string>();
  const events: unknown[] = [];
  Object.assign(globalThis, {
    localStorage: { getItem: (key: string) => store.get(key) ?? null, setItem: (key: string, value: string) => store.set(key, value) },
    window: { dispatchEvent: (event: unknown) => events.push(event) },
  });
  const stats = () => JSON.parse(store.get('gamification_stats')!);
  const achievement = (id: string) => stats().achievements.find((item: { id: string }) => item.id === id);
  trackDemoView('one');
  trackDemoView('one');
  assert.equal(achievement('explorer-bronze').progress, 1);
  trackDemoView('two');
  trackDemoView('three');
  assert.equal(achievement('explorer-bronze').unlocked, true);
  assert.equal(stats().totalXp, 50);
  for (let i = 4; i <= 10; i++) trackDemoView(`demo-${i}`);
  assert.equal(achievement('explorer-silver').unlocked, true);
  assert.equal(stats().totalXp, 250);
  assert.equal(stats().level, 2);
  assert.equal(stats().xp, 150);
  assert.equal(stats().xpToNextLevel, 400);
  for (let i = 0; i < 5; i++) trackFeatureAdded();
  assert.equal(achievement('feature-master').unlocked, true);
  assert.equal(stats().totalXp, 400);
  trackProjectCreation();
  assert.equal(stats().totalXp, 525);
  assert.equal(stats().level, 3);
  assert.equal(stats().xp, 25);
  trackProjectCreation();
  assert.equal(stats().totalXp, 525);
  assert.ok(events.length >= 1);
});
