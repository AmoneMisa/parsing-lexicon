import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations-runtime.js';

test('Navoiy 17 microdistrict is part of the canonical Uzbekistan registry', () => {
  const entry = LOCATION_DICTIONARIES.UZ.Navoiy.microdistricts
    .find(({ name }) => name === '17 microdistrict');

  assert.ok(entry);
  assert.ok(entry.aliases.includes('17-kichik nohiya'));
  assert.ok(entry.aliases.includes('17-й микрорайон'));
});

test('Navoiy local and Russian 17 microdistrict forms resolve to one canonical', () => {
  for (const input of ['17-kichik nohiya', '17 kichik nohiya', '17-й микрорайон', '17 микрорайон']) {
    const match = matchDictionaryLocation(input, 'UZ', 'Navoiy');
    assert.equal(match?.type, 'microdistricts', input);
    assert.equal(match?.name, '17 microdistrict', input);
  }
});
