import test from 'node:test';
import assert from 'node:assert/strict';
import { createSignedCsrfToken, verifySignedCsrfToken } from '../server/csrfTokens';

test('signed token is random, bound to the session and expires', () => {
  const now = 1_700_000_000_000;
  const token = createSignedCsrfToken('test-secret', 'session-one', now);
  assert.notEqual(token, createSignedCsrfToken('test-secret', 'session-one', now));
  assert.equal(verifySignedCsrfToken('test-secret', 'session-one', token, now), true);
  assert.equal(verifySignedCsrfToken('test-secret', 'session-two', token, now), false);
  assert.equal(verifySignedCsrfToken('other-secret', 'session-one', token, now), false);
  assert.equal(verifySignedCsrfToken('test-secret', 'session-one', token, now + 3_601_000), false);
  assert.equal(verifySignedCsrfToken('test-secret', 'session-one', token, now - 1_000), false);
  const modified = token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a');
  assert.equal(verifySignedCsrfToken('test-secret', 'session-one', modified, now), false);
  assert.equal(verifySignedCsrfToken('test-secret', 'session-one', 'v1.invalid', now), false);
});
