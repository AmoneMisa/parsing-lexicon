import test from 'node:test';
import assert from 'node:assert/strict';

import { matchDictionaryLocation } from '../src/index.js';

function match(city, text) {
  const result = matchDictionaryLocation(text, 'UA', city);
  return result?.type === 'microdistricts' ? result.name : null;
}

test('Kharkiv numbered microdistrict abbreviations resolve to stable canonicals', () => {
  const cases = new Map([
    ['601 мкр.', '601 microdistrict'],
    ['614 мкр.', '614 microdistrict'],
    ['615 м/р', '615 microdistrict'],
    ['625 мкр', '625 microdistrict'],
    ['626-й м/р', '626 microdistrict'],
    ['656 мрн', '656 microdistrict'],
    ['521 мрн.', '521 microdistrict'],
    ['535А м/р', '535A'],
    ['535а мкр', '535A'],
    ['606A мкр.', '606A'],
    ['606а м/р', '606A'],
  ]);

  for (const [alias, canonical] of cases) {
    assert.equal(match('Kharkiv', alias), canonical);
  }
});

test('Kharkiv numbered abbreviations remain city-scoped', () => {
  for (const alias of ['601 мкр.', '614 мкр.', '615 м/р', '625 мкр', '656 мрн', '535А м/р', '606а м/р']) {
    assert.equal(match('Kyiv', alias), null);
  }
});
