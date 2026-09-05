import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

function byName(group, name) {
  return (group || []).find((entry) => entry.name === name);
}

test('reviewed Osh residential complexes resolve through clean canonicals', () => {
  const osh = dictionaryFor('KG', 'Osh');
  assert.ok(osh);

  const cases = [
    ['Аристократ', 'квартира в ЖК Аристократ'],
    ['Фрунзенский', 'квартира в ЖК Фрунзенский'],
    ['Миллион', 'квартира в ЖК Миллион'],
    ['Osh Plaza', 'квартира в ЖК Osh Plaza'],
    ['Сере', 'квартира в ЖК Сере'],
    ['Ак-Бата', 'квартира в ЖК Ак-Бата'],
    ['Ак-Бата 2', 'квартира в ЖК Ак-Бата 2'],
    ['Манас', 'квартира в ЖК Манас'],
    ['ЖК Сулайман Тоо', 'квартира в ЖК Сулайман Тоо'],
    ['Таберик', 'квартира в ЖК Таберик'],
    ['Юджин', 'квартира в ЖК Юджин'],
  ];

  for (const [name, text] of cases) {
    const entry = byName(osh.residentialComplexes, name);
    assert.ok(entry, name);

    const match = matchDictionaryLocation(text, 'KG', 'Osh');
    assert.ok(match, text);
    assert.equal(match.type, 'residentialComplexes');
    assert.equal(match.name, name);
  }
});

test('Ikhlas Osh reuses the existing Mon Paris residential owner', () => {
  const osh = dictionaryFor('KG', 'Osh');
  const monParis = byName(osh.residentialComplexes, 'Mon Paris');
  assert.ok(monParis);
  assert.ok(monParis.re.test('жилой комплекс "Ихлас Ош"'));

  const match = matchDictionaryLocation('квартира в ЖК Ихлас Ош', 'KG', 'Osh');
  assert.ok(match);
  assert.equal(match.type, 'residentialComplexes');
  assert.equal(match.name, 'Mon Paris');
  assert.equal(byName(osh.residentialComplexes, 'Ихлас Ош'), undefined);
});

test('Sulayman-Too landmark keeps bare-name ownership', () => {
  const match = matchDictionaryLocation('рядом с Сулайман-Тоо', 'KG', 'Osh');
  assert.ok(match);
  assert.equal(match.name, 'Sulayman-Too');
});
