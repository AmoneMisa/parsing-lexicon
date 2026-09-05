import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

test('reviewed Osh microdistricts are available through the runtime dictionary', () => {
  const osh = dictionaryFor('KG', 'Osh');
  assert.ok(osh);

  const expected = [
    ['ДЭУ-21', 'квартира в микрорайоне ДЭУ-21'],
    ['МЖК-2', 'квартира в мкр МЖК-2'],
    ['Ошский', 'квартира в Ошском микрорайоне'],
  ];

  for (const [name, text] of expected) {
    const entry = osh.microdistricts.find((item) => item.name === name);
    assert.ok(entry, name);

    const match = matchDictionaryLocation(text, 'KG', 'Osh');
    assert.ok(match, text);
    assert.equal(match.type, 'microdistricts');
    assert.equal(match.name, name);
  }
});
