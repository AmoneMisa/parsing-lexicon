import test from 'node:test';
import assert from 'node:assert/strict';

import {
  GENERIC_LANDMARK_TERMS,
  aliasesOf,
  aliasesToRegex,
} from '../src/index.js';

function matcher(canonical) {
  const entry = GENERIC_LANDMARK_TERMS.find((item) => item.canonical === canonical);
  assert.ok(entry, `missing generic landmark ${canonical}`);
  return aliasesToRegex([entry.canonical, ...aliasesOf(entry)]);
}

test('Uzbek housing spelling variants canonicalize as generic nearby landmarks', () => {
  assert.equal(matcher('Bus stop').test('avtobus kanichkasi yonida'), true);
  assert.equal(matcher('Bus stop').test('avtobus konichkasi yonida'), true);
  assert.equal(matcher('Clinic').test('poleklinika yaqin'), true);
});
