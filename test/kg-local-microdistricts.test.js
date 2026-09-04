import test from 'node:test';
import assert from 'node:assert/strict';

import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations-runtime.js';

test('Osh scrape-backed microdistrict aliases resolve in city scope', () => {
  assert.equal(
    matchDictionaryLocation('квартира, микрорайон Анар, Ош', 'KG', 'Osh')?.name,
    'Anar',
  );
  assert.equal(
    matchDictionaryLocation('дом в мкр Тулейкен', 'KG', 'Osh')?.name,
    'Tuleyken',
  );
  assert.ok(
    LOCATION_DICTIONARIES.KG.Osh.microdistricts.find(({ name }) => name === 'Tuleyken')?.aliases.includes('Толойкон'),
  );
});

test('Karakol Voshod aliases resolve in city scope', () => {
  assert.equal(
    matchDictionaryLocation('квартира, микрорайон Восход, Каракол', 'KG', 'Karakol')?.name,
    'Voshod',
  );
});
