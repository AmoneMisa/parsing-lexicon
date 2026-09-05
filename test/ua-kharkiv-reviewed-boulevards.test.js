import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const byName = (group, name) => (group || []).find((entry) => entry.name === name);

const names = Object.freeze([
  'Гончаровский бульвар',
  'Жасминовый бульвар',
  'Профсоюзный бульвар',
  'бульвар Фронтовиков',
  'Садовый бульвар',
  'бульвар Юрьева',
  'бульвар Богдана Хмельницкого',
  'бульвар Дмитрия Антоновича',
]);

const assertStreetMatch = (text, name) => {
  const match = matchDictionaryLocation(text, 'UA', 'Kharkiv');
  assert.ok(match, text);
  assert.equal(match.type, 'streets', text);
  assert.equal(match.name, name, text);
};

test('reviewed Kharkiv boulevards are exposed as street owners', () => {
  const kharkiv = dictionaryFor('UA', 'Kharkiv');
  for (const name of names) assert.ok(byName(kharkiv.streets, name), name);
});

test('reviewed Kharkiv boulevard aliases stay explicitly street-qualified', () => {
  assertStreetMatch('Гончаровский бул., 7', 'Гончаровский бульвар');
  assertStreetMatch('Жасминовый бул.', 'Жасминовый бульвар');
  assertStreetMatch('Профсоюзный бул.', 'Профсоюзный бульвар');
  assertStreetMatch('бул. Фронтовиков', 'бульвар Фронтовиков');
  assertStreetMatch('Садовый бул.', 'Садовый бульвар');
  assertStreetMatch('бул. Юрьева', 'бульвар Юрьева');
  assertStreetMatch('бул. Богдана Хмельницкого', 'бульвар Богдана Хмельницкого');
  assertStreetMatch('бул. Дмитрия Антоновича', 'бульвар Дмитрия Антоновича');

  for (const bare of [
    'Гончаровский',
    'Жасминовый',
    'Профсоюзный',
    'Фронтовиков',
    'Садовый',
    'Юрьева',
    'Богдана Хмельницкого',
    'Дмитрия Антоновича',
  ]) {
    const match = matchDictionaryLocation(bare, 'UA', 'Kharkiv');
    assert.notEqual(match?.type, 'streets', bare);
  }
});
