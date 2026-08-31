import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/index.js';

function match(city, text) {
  const result = matchDictionaryLocation(text, 'UA', city);
  return result?.type === 'microdistricts' ? result.name : null;
}

test('Kharkiv historical 624A forms resolve to current 627 microdistrict', () => {
  for (const alias of ['624A', '624А', '624а', '624А мікрорайон', '624а микрорайон', '624А мкр']) {
    assert.equal(match('Kharkiv', alias), '627 microdistrict');
  }
});

test('Kharkiv 624 remains distinct from 624A/627', () => {
  assert.equal(match('Kharkiv', '624-й мікрорайон'), '624 microdistrict');
  assert.equal(match('Kharkiv', '624 мкр'), '624 microdistrict');
  assert.equal(match('Kharkiv', '627-й микрорайон'), '627 microdistrict');
});

test('Kharkiv 624A aliases remain city-scoped', () => {
  assert.equal(match('Kyiv', '624А мікрорайон'), null);
  assert.equal(match('Kyiv', '624A'), null);
});
