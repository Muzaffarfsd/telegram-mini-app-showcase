import assert from 'node:assert/strict';
import test from 'node:test';
import { navigate } from '../client/src/hooks/useRouting';
import { isLightDestinationHash, repairLightBottomBar, restoreTelegramChrome } from '../client/src/lib/telegramChrome';

test('light destinations stay white through native navigation, demo cleanup and viewport changes', () => {
  const oldWindow = globalThis.window;
  const oldDocument = globalThis.document;
  let hash = '#/demos/women-fashion/app';
  const classes = new Set<string>();
  const changes: string[] = [];
  const tg = {
    bottomBarColor: '#000000',
    setBackgroundColor(color: string) { changes.push(`background:${color}`); },
    setHeaderColor(color: string) { changes.push(`header:${color}`); },
    setBottomBarColor(color: string) { changes.push(`bottom:${color}`); this.bottomBarColor = color; },
  };
  const location = {
    get hash() { return hash; },
    set hash(value: string) { hash = value.startsWith('#') ? value : `#${value}`; },
  };
  Object.assign(globalThis, {
    window: { location, Telegram: { WebApp: tg } },
    document: { documentElement: { classList: { toggle(name: string, active: boolean) { active ? classes.add(name) : classes.delete(name); } } } },
  });

  try {
    for (const destination of ['/', '/constructor?from=demo']) {
      hash = '#/demos/women-fashion/app';
      changes.length = 0;
      navigate(destination);
      assert.equal(isLightDestinationHash(), true);
      assert.ok(classes.has('light-route-transition'));
      restoreTelegramChrome(tg, { background: '#000000', header: '#000000', bottom: '#000000' });
      assert.ok(changes.length >= 6);
      assert.ok(changes.every(change => change.endsWith('#ffffff')), `${destination}: ${changes}`);

      // Telegram can restore an old colour after the native buttons hide.
      tg.bottomBarColor = '#000000';
      repairLightBottomBar(tg);
      assert.equal(tg.bottomBarColor, '#ffffff');
      const count = changes.length;
      repairLightBottomBar(tg);
      assert.equal(changes.length, count, 'multiple viewport listeners do not reapply white');
    }

    // A dark demo must keep its own colours and not inherit the light shell.
    changes.length = 0;
    navigate('/demos/skincare-aura/app');
    assert.equal(isLightDestinationHash(), false);
    assert.equal(classes.has('light-route-transition'), false);
    assert.deepEqual(changes, []);
    restoreTelegramChrome(tg, { background: '#101114', header: '#101114', bottom: '#101114' });
    const count = changes.length;
    repairLightBottomBar(tg);
    assert.equal(changes.length, count);
    assert.equal(tg.bottomBarColor, '#101114');
  } finally {
    Object.assign(globalThis, { window: oldWindow, document: oldDocument });
  }
});
