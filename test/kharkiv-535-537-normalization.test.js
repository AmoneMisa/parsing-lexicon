import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations.js';

function match(city, text) {
  const result = matchDictionaryLocation(text, 'UA', city);
  return result?.type === 'microdistricts' ? result.name : null;
}

test('Kharkiv 535 and 535A listing forms share one canonical', () => {
  for (const alias of [
    '535-й мікрорайон',
    '535 мікрорайон',
    '535-й микрорайон',
    '535 микрорайон',
    '535 мкр',
    '535A',
    '535А мкр',
    '535а мкр',
  ]) {
    assert.equal(match('Kharkiv', alias), '535A', alias);
  }

  const entries = dictionaryFor('UA', 'Kharkiv')?.microdistricts || [];
  assert.equal(entries.filter(({ name }) => name === '535A').length, 1);
  assert.equal(entries.some(({ name }) => name === '535 microdistrict'), false);
});

test('Kharkiv 536 is a city-scoped canonical with Builder Town aliases', () => {
  for (const alias of [
    '536-й мікрорайон',
    '536 микрорайон',
    '536 мкр',
    'Містечко Будівельників',
    'Городок Строителей',
  ]) {
    assert.equal(match('Kharkiv', alias), '536 microdistrict', alias);
  }
});

test('Kharkiv 537 accepts full and classifieds-style abbreviations', () => {
  for (const alias of [
    '537-й мікрорайон',
    '537-й микрорайон',
    '537 мкр',
    '537 м.р.',
  ]) {
    assert.equal(match('Kharkiv', alias), '537 microdistrict', alias);
  }
});

test('Kharkiv 535-537 aliases do not leak into Kyiv', () => {
  for (const alias of ['535 мкр', 'Городок Строителей', '537 м.р.']) {
    assert.equal(match('Kyiv', alias), null, alias);
  }
});
