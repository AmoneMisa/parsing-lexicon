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
  assert.equal(matcher('Kindergarten').test('boxcha yaqin'), true);
  assert.equal(matcher('Supermarket').test('korzinka yaqin'), true);
  assert.equal(matcher('Supermarket').test('Супермаркет рядом'), true);
  assert.equal(matcher('Public transport').test('yulovchi transport qatnovi bor'), true);
  assert.equal(matcher('Main road').test('katta yulga yaqin'), true);
});

test('Russian infrastructure prose canonicalizes without source-local regexes', () => {
  assert.equal(matcher('Shop').test('много магазинов'), true);
  assert.equal(matcher('Market').test('Центральный рынок'), true);
  assert.equal(matcher('Metro').test('метро рядом'), true);
  assert.equal(matcher('Childcare').test('детские учреждения'), true);
  assert.equal(matcher('Cafe').test('кафе'), true);
  assert.equal(matcher('Park').test('парковая зона'), true);
  assert.equal(matcher('Maternity hospital').test('ориентир 8 роддом'), true);
});
