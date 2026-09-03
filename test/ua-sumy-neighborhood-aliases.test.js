import test from 'node:test';
import assert from 'node:assert/strict';

import { LOCATION_DICTIONARIES } from '../src/index.js';

const microdistricts = LOCATION_DICTIONARIES.UA?.Sumy?.microdistricts || [];
const match = (text) => microdistricts.find((entry) => entry.re.test(text))?.name || null;

test('verified Sumy listing-facing neighborhoods resolve to existing geo canonicals', () => {
  assert.equal(match('мікрорайон Баранівка'), 'Baranivka');
  assert.equal(match('район Баранівка'), 'Baranivka');
  assert.equal(match('Барановка'), 'Baranivka');
  assert.equal(match('район Веретенівки'), 'Veretenivka');
  assert.equal(match('житловий масив Веретенівка'), 'Veretenivka');
  assert.equal(match('Веретеновка'), 'Veretenivka');

  assert.equal(match('Лука'), 'Luka');
  assert.equal(match('район Лука'), 'Luka');

  assert.equal(match('Роменський'), 'Romenskyi');
  assert.equal(match('Роменский'), 'Romenskyi');
  assert.equal(match('мікрорайон Роменський'), 'Romenskyi');
  assert.equal(match('микрорайон Роменский'), 'Romenskyi');

  assert.equal(match('Добровольна'), 'Dobrovilna');
  assert.equal(match('Добровольная'), 'Dobrovilna');
  assert.equal(match('район Добровольна'), 'Dobrovilna');
  assert.equal(match('район Добровольная'), 'Dobrovilna');

  assert.equal(match('Хіммістечко'), 'Khimhorodok');
  assert.equal(match('Курський'), 'Kurskyi');
  assert.equal(match('9-й мікрорайон'), '9 microdistrict');
  assert.equal(match('10-й мікрорайон'), '10 microdistrict');
  assert.equal(match('11-й мікрорайон'), '11 microdistrict');
  assert.equal(match('12-й мікрорайон'), '12 microdistrict');

  assert.equal(match('Тепличний'), 'Teplychnyi');
  assert.equal(match('мікрорайон Тепличний'), 'Teplychnyi');
  assert.equal(match('м/н Тепличний'), 'Teplychnyi');
});