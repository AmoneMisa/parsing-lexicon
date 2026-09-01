import test from 'node:test';
import assert from 'node:assert/strict';
import { matchDictionaryLocation } from '../src/index.js';

const match = (text, city) => matchDictionaryLocation(text, 'UA', city)?.name ?? null;

test('Kyiv numbered neighbourhood aliases beat broader area names', () => {
  assert.equal(match('10-й «Б» мікрорайон Позняків', 'Kyiv'), 'Pozniaky 10B microdistrict');
  assert.equal(match('квартира, Троещина 24', 'Kyiv'), 'Troieshchyna 24 microdistrict');
  assert.equal(match('Осокорки 7А', 'Kyiv'), 'Osokorky 7A microdistrict');
  assert.equal(match('3-й микрорайон Радужного массива', 'Kyiv'), 'Raiduzhnyi 3 microdistrict');
  assert.equal(match('12-й мікрорайон Біличів', 'Kyiv'), 'Bilychi 12 microdistrict');
  assert.equal(match('2-й мікрорайон Воскресенського масиву', 'Kyiv'), 'Voskresenka 2 microdistrict');
});

test('Kharkiv 614 microdistrict remains directly canonicalizable', () => {
  assert.equal(match('614-й мікрорайон', 'Kharkiv'), '614 microdistrict');
  assert.equal(match('Микрорайон 614', 'Kharkiv'), '614 microdistrict');
});
