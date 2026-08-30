import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations.js';

const EXPECTED = new Map([
  ['5/1-kichik nohiya', '5/1 microdistrict'],
  ['5/1 микрорайон', '5/1 microdistrict'],
  ['5/2-kichik nohiya', '5/2 microdistrict'],
  ['5/2 микрорайон', '5/2 microdistrict'],
  ['5/3-kichik nohiya', '5/3 microdistrict'],
  ['5/3 микрорайон', '5/3 microdistrict'],
  ['Yubiley kichik nohiya', 'Yubileyny microdistrict'],
  ['Юбилейный микрорайон', 'Yubileyny microdistrict'],
]);

test('verified Almalyk microdistricts are canonical Uzbekistan locations', () => {
  const canonicals = new Set(
    LOCATION_DICTIONARIES.UZ.Almalyk.microdistricts.map(({ name }) => name),
  );

  for (const canonical of new Set(EXPECTED.values())) {
    assert.ok(canonicals.has(canonical), canonical);
  }
});

test('Almalyk Uzbek and Russian forms resolve to stable microdistrict canonicals', () => {
  for (const [input, canonical] of EXPECTED) {
    const match = matchDictionaryLocation(input, 'UZ', 'Almalyk');
    assert.equal(match?.type, 'microdistricts', input);
    assert.equal(match?.name, canonical, input);
  }
});
