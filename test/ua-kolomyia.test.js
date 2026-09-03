import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

test('Kolomyia dictionary contains geo-aligned landmark canonicals', () => {
  const dictionary = dictionaryFor('UA', 'Kolomyia');
  assert.ok(dictionary);

  const names = new Set((dictionary.landmarks || []).map((entry) => entry.name));
  assert.ok(names.has('Pysanka Museum'));
  assert.ok(names.has('National Museum of Hutsulshchyna and Pokuttia Folk Art'));
  assert.ok(names.has('Kolomyia Railway Station'));
});

test('Kolomyia landmark aliases resolve to expected canonicals', () => {
  const cases = [
    ['Музей писанкового розпису', 'Pysanka Museum'],
    ['Національний музей народного мистецтва Гуцульщини та Покуття імені Й. Кобринського', 'National Museum of Hutsulshchyna and Pokuttia Folk Art'],
    ['Залізнична станція Коломия', 'Kolomyia Railway Station'],
  ];

  for (const [text, name] of cases) {
    const match = matchDictionaryLocation(text, 'UA', 'Kolomyia');
    assert.equal(match?.city, 'Kolomyia');
    assert.equal(match?.type, 'landmarks');
    assert.equal(match?.name, name);
  }
});
