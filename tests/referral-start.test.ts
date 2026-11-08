import test from 'node:test';
import assert from 'node:assert/strict';
import { referralCodeFromStart } from '../client/src/lib/profileRequest';

const setSearch = (search: string) => {
  Object.assign(globalThis, { window: { location: { search } } });
};

test('recognizes bot-created REF codes and existing referral formats', () => {
  setSearch('');
  assert.equal(referralCodeFromStart('start_param=ref12345'), 'REF12345');
  assert.equal(referralCodeFromStart('start_param=WEB4TGFRIEND'), 'WEB4TGFRIEND');
  assert.equal(referralCodeFromStart('start_param=W4TABC12'), 'W4TABC12');
});

test('reads the URL fallback, but only accepts valid referral codes', () => {
  setSearch('?tgWebAppStartParam=REF12345');
  assert.equal(referralCodeFromStart(''), 'REF12345');
  assert.equal(referralCodeFromStart('start_param=REFNOTNUMERIC'), null);
  assert.equal(referralCodeFromStart(`start_param=REF${'1'.repeat(48)}`), null);
  assert.equal(referralCodeFromStart('start_param=some_other_feature'), null);
  assert.equal(referralCodeFromStart('start_param=REF12345%26unexpected'), null);
});
