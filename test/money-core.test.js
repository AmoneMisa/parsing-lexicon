import assert from 'node:assert/strict';
import test from 'node:test';

import { MONEY_RANGE_RE } from '../src/money-core.js';

test('MONEY_RANGE_RE does not read a scale abbreviation off an unrelated following word', () => {
  // "2 до 3 месяцев" is a probation-period phrase, not a millions-scaled
  // salary range: "м" from "месяцев" must not be read as "million".
  const months = 'от 2 до 3 месяцев'.match(MONEY_RANGE_RE);
  assert.equal(months[1], '2');
  assert.equal(months[2], undefined);
  assert.equal(months[3], '3');
  assert.equal(months[4], undefined);

  const meters = '10 до 20 метров'.match(MONEY_RANGE_RE);
  assert.equal(meters[1], '10');
  assert.equal(meters[2], undefined);
  assert.equal(meters[3], '20');
  assert.equal(meters[4], undefined);
});

test('MONEY_RANGE_RE still reads a genuine scale abbreviation at a real word boundary', () => {
  const scaled = '10 до 20 тыс'.match(MONEY_RANGE_RE);
  assert.equal(scaled[1], '10');
  assert.equal(scaled[3], '20');
  assert.equal(scaled[4], 'тыс');
});

test('MONEY_RANGE_RE still matches a word separator with no surrounding space', () => {
  assert.equal('5до10'.match(MONEY_RANGE_RE)?.[0], '5до10');
});
