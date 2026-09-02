import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/index.js';

test('Kamianets-Podilskyi dictionary contains geo-aligned landmark canonicals', () => {
  const dictionary = dictionaryFor('UA', 'Kamianets-Podilskyi');
  assert.ok(dictionary);

  const names = new Set((dictionary.landmarks || []).map((entry) => entry.name));
  assert.ok(names.has('Old Castle'));
  assert.ok(names.has('Polskyi Rynok Square'));
  assert.ok(names.has('Armenian Market Square'));
  assert.ok(names.has('Kamianets-Podilskyi Railway Station'));
});

test('Kamianets-Podilskyi landmark aliases resolve to expected canonicals', () => {
  const cases = [
    ["Старий замок, Кам'янець-Подільський", 'Old Castle'],
    ['площа Польський Ринок', 'Polskyi Rynok Square'],
    ['площа Вірменський Ринок', 'Armenian Market Square'],
    ["залізничний вокзал Кам'янець-Подільський", 'Kamianets-Podilskyi Railway Station'],
  ];

  for (const [text, name] of cases) {
    const match = matchDictionaryLocation(text, 'UA', 'Kamianets-Podilskyi');
    assert.equal(match?.city, 'Kamianets-Podilskyi');
    assert.equal(match?.type, 'landmarks');
    assert.equal(match?.name, name);
  }
});
