import test from 'node:test';
import assert from 'node:assert/strict';
import { compareHousingParsers, parseHousingV2 } from '../src/housing-parser-v2.js';

test('housing V2 emits explainable numeric candidates for a noisy listing', () => {
  const parsed = parseHousingV2('Сдам 3-к кв, м.Спортивная 7 мин,\n11/12, общ.пл.80 м², 22000 грн', { country: 'UA' });
  assert.equal(parsed.data.rooms, 3);
  assert.equal(parsed.data.floor, 11);
  assert.equal(parsed.data.totalFloors, 12);
  assert.equal(parsed.data['area.total'], 80);
  assert.equal(parsed.data.money.amount, 22000);
  assert.deepEqual(parsed.data.distance, { amount: 7, unit: 'minute' });
  assert.ok(parsed.debug.candidates.every((item) => item.evidence.length));
});

test('housing V2 comparison keeps legacy available during migration', () => {
  const compared = compareHousingParsers('2 xona, 5/9, 55 м2, narxi 850 ming', { country: 'UZ' });
  assert.equal(compared.legacy.rooms, 2);
  assert.equal(compared.v2.data.money.amount, 850000);
  assert.ok(Array.isArray(compared.differences));
});
