import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

test('Konotop dictionary contains geo-aligned landmark canonicals', () => {
  const dictionary = dictionaryFor('UA', 'Konotop');
  assert.ok(dictionary);

  const names = new Set((dictionary.landmarks || []).map((entry) => entry.name));
  assert.ok(names.has('Konotop Railway Station'));
  assert.ok(names.has('Конотопський міський краєзнавчий музей ім. О. М. Лазаревського'));
  assert.ok(names.has('Музей-садиба генерала М. І. Драгомирова'));
  assert.ok(names.has('Конотопський музей авіації'));
  assert.ok(names.has('Площа Миру'));
});

test('Konotop landmark aliases resolve to expected canonicals', () => {
  const cases = [
    ['Конотопський міський краєзнавчий музей ім.О.М.Лазаревського', 'Конотопський міський краєзнавчий музей ім. О. М. Лазаревського'],
    ['Конотопський краєзнавчий музей ім. О.М.Лазаревського', 'Конотопський міський краєзнавчий музей ім. О. М. Лазаревського'],
    ['Музей-садиба генерала М.І.Драгомирова', 'Музей-садиба генерала М. І. Драгомирова'],
    ['Музей-садиба М.І.Драгомирова', 'Музей-садиба генерала М. І. Драгомирова'],
    ['Музей авіації', 'Конотопський музей авіації'],
    ['Площа Миру', 'Площа Миру'],
  ];

  for (const [text, name] of cases) {
    const match = matchDictionaryLocation(text, 'UA', 'Konotop');
    assert.equal(match?.city, 'Konotop');
    assert.equal(match?.type, 'landmarks');
    assert.equal(match?.name, name);
  }
});
