import assert from 'node:assert/strict';
import { test } from 'node:test';
import { demoShareEntries } from '../shared/demoShare';
import { initializeDemoShareStart } from '../client/src/lib/demoShareStart';

function launch(href: string, initData = '') {
  let url = new URL(href);
  const storage = new Map<string, string>();
  const webApp = { initData };
  const classes = new Set<string>(['studio-home-theme', 'light-route-transition']);
  const location = {
    get href() { return url.href; },
    get hash() { return url.hash; },
    set hash(value: string) { url.hash = value; },
    get search() { return url.search; },
  };
  Object.assign(globalThis, {
    window: { location, Telegram: { WebApp: webApp }, sessionStorage: { getItem(key: string) { return storage.get(key) ?? null; }, setItem(key: string, value: string) { storage.set(key, value); } }, history: { state: null, replaceState(_state: unknown, _title: string, next: string) { url = new URL(next); } } },
    document: { documentElement: { classList: { remove(...names: string[]) { names.forEach(name => classes.delete(name)); }, add(name: string) { classes.add(name); } } } },
  });
  return { location, classes, storage, webApp };
}

test('every published demo opens once and selects the demo boot surface', () => {
  for (const id of Object.keys(demoShareEntries)) {
    const { location, classes } = launch(`https://example.test/?tgWebAppStartParam=demo_${id}`);
    assert.equal(initializeDemoShareStart(), true, id);
    assert.equal(location.hash, `#/demos/${id}/app`);
    assert.equal(classes.has('demo-boot-theme'), true);
    assert.equal(classes.has('studio-home-theme'), false);
    location.hash = '/';
    assert.equal(initializeDemoShareStart(), false);
    assert.equal(location.hash, '#/');
  }
});

test('a different demo can open within the same webview session', () => {
  const { location, webApp } = launch('https://example.test/#/', 'start_param=demo_apple-store&auth_date=123');
  assert.equal(initializeDemoShareStart(), true);
  location.hash = '/';
  webApp.initData = 'start_param=demo_flower-store&auth_date=123';
  assert.equal(initializeDemoShareStart(), true);
  assert.equal(location.hash, '#/demos/flower-store/app');
});

test('legacy sneaker alias and Telegram signed start parameter', () => {
  const { location, storage } = launch('https://example.test/#/?source=test', 'start_param=demo_royal-step&auth_date=123&hash=secret&user=private');
  assert.equal(initializeDemoShareStart(), true);
  assert.equal(location.hash, '#/demos/nike-sneakers/app');
  assert.equal(storage.get('web4tg:consumed-demo-start'), 'nike-sneakers|123');
  location.hash = '/';
  assert.equal(initializeDemoShareStart(), false);
  assert.equal(location.hash, '#/');
});

test('referral codes, unknown IDs and explicit in-app routes remain untouched', () => {
  for (const href of [
    'https://example.test/?tgWebAppStartParam=W4T123',
    'https://example.test/?tgWebAppStartParam=demo_unknown',
    'https://example.test/?tgWebAppStartParam=demo___proto__',
    'https://example.test/?tgWebAppStartParam=demo_apple-store#/projects',
  ]) {
    const { location } = launch(href);
    const original = location.hash;
    assert.equal(initializeDemoShareStart(), false, href);
    assert.equal(location.hash, original);
  }
});
