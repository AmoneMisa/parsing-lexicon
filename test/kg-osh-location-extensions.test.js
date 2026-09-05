import test from 'node:test';
import assert from 'node:assert/strict';

import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations-runtime.js';

test('Osh settlement aliases resolve through the city dictionary', () => {
  const expected = new Map([
    ['Кенеш', 'Кеңеш'],
    ['село Керме-Тоо', 'Керме-Тоо'],
    ['Озгур айылы', 'Озгур'],
    ['село Орке', 'Орке'],
    ['Pyatiletka', 'Пятилетка'],
    ['Тээке айылы', 'Тээке'],
    ['Uchar', 'Учар'],
    ['Ak Buura 2', 'Ак-Буура-2'],
    ['село Ак-Буура-3', 'Ак-Буура-3'],
  ]);

  for (const [input, canonical] of expected) {
    const match = matchDictionaryLocation(input, 'KG', 'Osh');
    assert.equal(match?.type, 'settlements', input);
    assert.equal(match?.name, canonical, input);
  }
});

test('Osh Kerme-Too municipal territory and village remain distinct lexicon entities', () => {
  const mtu = matchDictionaryLocation('МТУ Керме-Тоо', 'KG', 'Osh');
  assert.equal(mtu?.type, 'districts');
  assert.equal(mtu?.name, 'Керме-Тоо');

  const village = matchDictionaryLocation('село Керме-Тоо', 'KG', 'Osh');
  assert.equal(village?.type, 'settlements');
  assert.equal(village?.name, 'Керме-Тоо');

  const kulatov = matchDictionaryLocation('микрорайон Т. Кулатова', 'KG', 'Osh');
  assert.equal(kulatov?.type, 'microdistricts');
  assert.equal(kulatov?.name, 'Кулатов');
});

test('Osh residential aliases resolve through the city dictionary', () => {
  const expected = new Map([
    ['Asman Residence-1', 'Asman Residence 1'],
    ['Асман Резиденс 1', 'Asman Residence 1'],
    ['ЖК Асман Резиденс 1', 'Asman Residence 1'],
    ['Asman Residence 1 турак жай комплекси', 'Asman Residence 1'],
    ['ЖК Мон Париж', 'Mon Paris'],
    ['Mon Paris Osh', 'Mon Paris'],
    ['Mon Paris турак жай комплекси', 'Mon Paris'],
  ]);

  for (const [input, canonical] of expected) {
    const match = matchDictionaryLocation(input, 'KG', 'Osh');
    assert.equal(match?.type, 'residentialComplexes', input);
    assert.equal(match?.name, canonical, input);
  }
});

test('Osh extensions preserve existing Anar and Tuleyken microdistricts', () => {
  const osh = LOCATION_DICTIONARIES.KG.Osh;
  assert.equal(osh.microdistricts.some(({ name }) => name === 'Anar'), true);
  assert.equal(osh.microdistricts.some(({ name }) => name === 'Tuleyken'), true);
});
