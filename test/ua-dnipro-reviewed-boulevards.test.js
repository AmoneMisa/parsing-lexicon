import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const byName = (group, name) => (group || []).find((entry) => entry.name === name);

const names = Object.freeze([
  'Батальона «Днепр» бульвар',
  'Славы бульвар',
  'Звёздный бульвар',
  'Театральный бульвар',
  'Черновола бульвар',
  'Кельнський бульвар',
]);

const assertStreetMatch = (text, name) => {
  const match = matchDictionaryLocation(text, 'UA', 'Dnipro');
  assert.ok(match, text);
  assert.equal(match.type, 'streets', text);
  assert.equal(match.name, name, text);
};

test('reviewed Dnipro boulevards are exposed as street owners', () => {
  const dnipro = dictionaryFor('UA', 'Dnipro');
  for (const name of names) assert.ok(byName(dnipro.streets, name), name);
});

test('reviewed Dnipro boulevard aliases remain street-qualified', () => {
  assertStreetMatch('бул. Батальона «Днепр»', 'Батальона «Днепр» бульвар');
  assertStreetMatch('бульвар Славы', 'Славы бульвар');
  assertStreetMatch('Звёздный бул.', 'Звёздный бульвар');
  assertStreetMatch('бульвар Театральный', 'Театральный бульвар');
  assertStreetMatch('Черновола бул.', 'Черновола бульвар');
  assertStreetMatch('бульвар Кельнський', 'Кельнський бульвар');

  for (const bare of ['Славы', 'Звёздный', 'Театральный', 'Черновола', 'Кельнський']) {
    const match = matchDictionaryLocation(bare, 'UA', 'Dnipro');
    assert.notEqual(match?.type, 'streets', bare);
  }
});
