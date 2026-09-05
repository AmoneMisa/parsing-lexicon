import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const assertMatch = (text, type, name) => {
  const match = matchDictionaryLocation(text, 'UZ', 'Bukhara');
  assert.ok(match, text);
  assert.equal(match.type, type, text);
  assert.equal(match.name, name, text);
};

test('reviewed Bukhara microdistricts and Safedmuy are exposed once', () => {
  const city = dictionaryFor('UZ', 'Bukhara');
  for (const name of [
    '5Б микрорайон',
    '5В микрорайон',
    '6A микрорайон',
    '6Б микрорайон',
    'Северный микрорайон',
  ]) {
    assert.equal((city.microdistricts || []).filter((entry) => entry.name === name).length, 1, name);
  }
  assert.equal((city.localAreas || []).filter((entry) => entry.name === 'Жилмассив Сафедмуй').length, 1);
});

test('reviewed Bukhara area aliases resolve with their semantic types', () => {
  assertMatch('5б мкр', 'microdistricts', '5Б микрорайон');
  assertMatch('5V микрорайон', 'microdistricts', '5В микрорайон');
  assertMatch('6А микрорайон', 'microdistricts', '6A микрорайон');
  assertMatch('6б мкр', 'microdistricts', '6Б микрорайон');
  assertMatch('мкр Северный', 'microdistricts', 'Северный микрорайон');
  assertMatch('Жилмассив Сафедмуй', 'localAreas', 'Жилмассив Сафедмуй');
});

test('Bukhara review POI and street noise is not retyped as an area', () => {
  for (const text of [
    'Бухарский государственный университет',
    '1-й 2-го массива улицы Шайхон',
    'Mavze',
  ]) {
    const match = matchDictionaryLocation(text, 'UZ', 'Bukhara');
    assert.ok(!match || !['microdistricts', 'localAreas'].includes(match.type), text);
  }
});
