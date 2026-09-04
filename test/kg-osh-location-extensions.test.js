import test from 'node:test';
import assert from 'node:assert/strict';

import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations-runtime.js';

test('Osh settlement aliases resolve through the city dictionary', () => {
  const expected = new Map([
    ['Кенеш', 'Кеңеш'],
    ['Kerme Too', 'Керме-Тоо'],
    ['Озгур айылы', 'Озгур'],
    ['село Орке', 'Орке'],
    ['Pyatiletka', 'Пятилетка'],
    ['Тээке айылы', 'Тээке'],
    ['Uchar', 'Учар'],
  ]);

  for (const [input, canonical] of expected) {
    const match = matchDictionaryLocation(input, 'KG', 'Osh');
    assert.equal(match?.type, 'settlements', input);
    assert.equal(match?.name, canonical, input);
  }
});

test('Osh Asman Residence aliases resolve as a residential complex', () => {
  for (const input of [
    'Asman Residence-1',
    'Асман Резиденс 1',
    'ЖК Асман Резиденс 1',
    'Asman Residence 1 турак жай комплекси',
  ]) {
    const match = matchDictionaryLocation(input, 'KG', 'Osh');
    assert.equal(match?.type, 'residentialComplexes', input);
    assert.equal(match?.name, 'Asman Residence 1', input);
  }
});

test('Osh extensions preserve existing Anar and Tuleyken microdistricts', () => {
  const osh = LOCATION_DICTIONARIES.KG.Osh;
  assert.equal(osh.microdistricts.some(({ name }) => name === 'Anar'), true);
  assert.equal(osh.microdistricts.some(({ name }) => name === 'Tuleyken'), true);
});
