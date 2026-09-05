import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const byName = (group, name) => (group || []).find((entry) => entry.name === name);

const reviewed = Object.freeze([
  ['Бишкек-1 улица', 'улица Бишкек-1'],
  ['Бишкек-2 улица', 'улица Бишкек-2'],
  ['Бишкек-3 улица', 'улица Бишкек-3'],
  ['Бишкек-4 улица', 'улица Бишкек-4'],
  ['Бишкек-5 улица', 'улица Бишкек-5'],
  ['Бишкек-6 улица', 'улица Бишкек-6'],
  ['Бишкек-7 улица', 'улица Бишкек-7'],
  ['Бишкек-8 улица', 'улица Бишкек-8'],
  ['Улица Бишкек-9', 'Бишкек-9 улица'],
  ['Улица Абдумомунова', 'ул. Абдумомунова'],
  ['Улица Байгазак Арпачиева', 'ул. Байгазак Арпачиева'],
  ['Улица квартал Кирова', 'квартал Кирова улица'],
  ['Парковая улица', 'ул. Парковая'],
  ['Улица Тунгуч', 'ул. Тунгуч'],
  ['Улица Турусбекова', 'ул. Турусбекова'],
]);

test('reviewed Bishkek streets resolve to one lexical owner each', () => {
  const bishkek = dictionaryFor('KG', 'Bishkek');
  for (const [canonical, text] of reviewed) {
    assert.ok(byName(bishkek.streets, canonical), canonical);
    assert.equal((bishkek.streets || []).filter((entry) => entry.name === canonical).length, 1);
    const match = matchDictionaryLocation(`квартира, ${text}`, 'KG', 'Bishkek');
    assert.ok(match, text);
    assert.equal(match.type, 'streets');
    assert.equal(match.name, canonical);
  }
});

test('existing Ibraimov owner absorbs the reviewed Russian source name', () => {
  const bishkek = dictionaryFor('KG', 'Bishkek');
  assert.equal(byName(bishkek.streets, 'Улица Ибраимова'), undefined);
  const match = matchDictionaryLocation('дом на улице Ибраимова', 'KG', 'Bishkek');
  assert.ok(match);
  assert.equal(match.type, 'streets');
  assert.equal(match.name, 'Ibraimov Street');
});

test('ambiguous, stale, and out-of-city Bishkek street candidates are not promoted as lexical owners', () => {
  const bishkek = dictionaryFor('KG', 'Bishkek');
  for (const name of ['1-я улица', 'Улица 11-я', 'Улица 12-я', '22-я улица', 'Улица 8-я', 'Береговая улица', 'Улица СЭЗ Бишкек']) {
    assert.equal(byName(bishkek.streets, name), undefined, name);
  }
});
