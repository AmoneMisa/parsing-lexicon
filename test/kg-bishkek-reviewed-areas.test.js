import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const byName = (group, name) => (group || []).find((entry) => entry.name === name);

test('reviewed Bishkek administrative district aliases resolve to existing owners', () => {
  const bishkek = dictionaryFor('KG', 'Bishkek');
  const cases = [
    ['Pervomaisky', 'Первомайский административный район'],
    ['Leninsky', 'Ленинский административный район'],
    ['Oktyabrsky', 'Октябрьский административный район'],
    ['Sverdlovsky', 'Свердловский административный район'],
  ];

  for (const [canonical, text] of cases) {
    assert.ok(byName(bishkek.districts, canonical), canonical);
    const match = matchDictionaryLocation(`квартира, ${text}`, 'KG', 'Bishkek');
    assert.ok(match, text);
    assert.equal(match.type, 'districts');
    assert.equal(match.name, canonical);
  }
});

test('reviewed Bishkek microdistricts 4, 5 and 9 resolve without duplicate owners', () => {
  const bishkek = dictionaryFor('KG', 'Bishkek');
  for (const [canonical, text] of [
    ['4-й микрорайон', 'квартира в 4-м микрорайоне'],
    ['5-й микрорайон', 'квартира в 5-м микрорайоне'],
    ['9-й микрорайон', 'квартира в 9-м микрорайоне'],
  ]) {
    assert.ok(byName(bishkek.microdistricts, canonical), canonical);
    const direct = matchDictionaryLocation(canonical, 'KG', 'Bishkek');
    assert.ok(direct, canonical);
    assert.equal(direct.type, 'microdistricts');
    assert.equal(direct.name, canonical);
    assert.equal((bishkek.microdistricts || []).filter((entry) => entry.name === canonical).length, 1);
  }
});

test('misclassified Bishkek review candidates stay with their semantic owners', () => {
  const bishkek = dictionaryFor('KG', 'Bishkek');
  assert.equal(byName(bishkek.localAreas, 'Catholic Church St Michael'), undefined);
  assert.equal(byName(bishkek.localAreas, 'Кок-Жар'), undefined);
  assert.ok(byName(bishkek.microdistricts, 'Kok-Jar'));

  for (const name of ['Бишкек', 'Бишкек 2', 'Бишкек I', 'Бишкек (Манас)', 'Ажыбек баатыр көчөсү', 'Эркинбек Матыев көчөсү']) {
    assert.equal(byName(bishkek.districts, name), undefined, name);
  }
});
