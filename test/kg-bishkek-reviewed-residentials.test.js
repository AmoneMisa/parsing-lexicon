import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const byName = (group, name) => (group || []).find((entry) => entry.name === name);

const reviewed = Object.freeze([
  ['Ачекей', 'квартира в ЖК Ачекей'],
  ['Арбат', 'квартира в ЖК Арбат'],
  ['Чынгыз Айтматов Ордосу', 'квартира в ЖК Чынгыз Айтматов'],
  ['Jal Artis', 'квартира в ЖК Джал Артис'],
  ['Флоренция', 'квартира в ЖК Флоренция'],
  ['IHLAS Residence', 'квартира в ЖК IHLAS Residence'],
  ['Империал', 'квартира в ЖК Империал'],
  ['Jibekcity', 'квартира в ЖК JIBEK CITY'],
  ['Континенталь', 'квартира в ЖК Континенталь'],
  ['Кремлевский', 'квартира в ЖК Кремлёвский'],
  ['Malina', 'квартира в ЖК MALINA'],
  ['Мурас', 'квартира в ЖК Мурас'],
  ['Пионер', 'квартира в ЖК Пионер'],
  ['Royal', 'квартира в ЖК Royal'],
]);

test('reviewed Bishkek residential owners resolve to one canonical each', () => {
  const bishkek = dictionaryFor('KG', 'Bishkek');
  for (const [canonical, text] of reviewed) {
    assert.ok(byName(bishkek.residentialComplexes, canonical), canonical);
    assert.equal((bishkek.residentialComplexes || []).filter((entry) => entry.name === canonical).length, 1, canonical);
    const match = matchDictionaryLocation(text, 'KG', 'Bishkek');
    assert.ok(match, text);
    assert.equal(match.type, 'residentialComplexes');
    assert.equal(match.name, canonical);
  }
});

test('Tokyo construction label enriches existing Tokyo City owner', () => {
  const bishkek = dictionaryFor('KG', 'Bishkek');
  assert.ok(byName(bishkek.residentialComplexes, 'Tokyo City'));
  assert.equal(byName(bishkek.residentialComplexes, 'Tokyo'), undefined);
  const match = matchDictionaryLocation('квартира в ЖК Tokyo', 'KG', 'Bishkek');
  assert.ok(match);
  assert.equal(match.type, 'residentialComplexes');
  assert.equal(match.name, 'Tokyo City');
});

test('ambiguous Bishkek residential review labels stay deferred', () => {
  const bishkek = dictionaryFor('KG', 'Bishkek');
  assert.equal(byName(bishkek.residentialComplexes, 'Белек'), undefined);
  assert.equal(byName(bishkek.residentialComplexes, 'Asman Residence'), undefined);
  assert.equal(byName(bishkek.residentialComplexes, 'ASMAN TOWERS'), undefined);
  assert.equal((bishkek.residentialComplexes || []).filter((entry) => entry.name === 'Южный').length, 1);
});
