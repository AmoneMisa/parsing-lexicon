import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/locations-runtime.js';

test('Kostanay local geography aliases resolve in city scope', () => {
  assert.equal(matchDictionaryLocation('5-й микрорайон', 'KZ', 'Kostanay')?.name, '5-й микрорайон');
  assert.equal(matchDictionaryLocation('мкр Наурыз', 'KZ', 'Kostanay')?.name, 'Наурыз');
  assert.equal(matchDictionaryLocation('ЖК Алтын-Арман', 'KZ', 'Kostanay')?.name, 'Алтын Арман');
});

test('Pavlodar local geography aliases resolve in city scope', () => {
  assert.equal(matchDictionaryLocation('Дачный микрорайон', 'KZ', 'Pavlodar')?.name, 'Дачный');
  assert.equal(matchDictionaryLocation('мкр Сарыарка', 'KZ', 'Pavlodar')?.name, 'Сарыарка');
  assert.equal(matchDictionaryLocation('Усольский микрорайон', 'KZ', 'Pavlodar')?.name, 'Усольский');
});

test('Bukhara first microdistrict aliases resolve in city scope', () => {
  assert.equal(matchDictionaryLocation('1-й микрорайон', 'UZ', 'Bukhara')?.name, '1-й микрорайон');
  assert.equal(matchDictionaryLocation('1 мкр', 'UZ', 'Bukhara')?.name, '1-й микрорайон');
});
