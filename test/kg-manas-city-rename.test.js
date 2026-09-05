import test from 'node:test';
import assert from 'node:assert/strict';

import { canonicalCity } from '../src/geography.js';
import { detectCityFromText } from '../src/geography-detection.js';
import { LOCATION_DICTIONARIES, dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

test('Jalal-Abad historical names canonicalize to current Manas city', () => {
  assert.equal(canonicalCity('Manas', 'KG'), 'Manas');
  assert.equal(canonicalCity('Манас', 'KG'), 'Manas');
  assert.equal(canonicalCity('Jalal-Abad', 'KG'), 'Manas');
  assert.equal(canonicalCity('Jalalabad', 'KG'), 'Manas');
  assert.equal(canonicalCity('Жалал-Абад', 'KG'), 'Manas');
  assert.equal(canonicalCity('Джалал-Абад', 'KG'), 'Manas');
});

test('bare Manas stays guarded while explicit city context and historical names resolve', () => {
  assert.equal(detectCityFromText('Манас'), null);
  assert.deepEqual(detectCityFromText('Манас шаары', 'KG'), { canonical: 'Manas', country: 'KG' });
  assert.deepEqual(detectCityFromText('город Манас', 'KG'), { canonical: 'Manas', country: 'KG' });
  assert.deepEqual(detectCityFromText('Jalal-Abad', 'KG'), { canonical: 'Manas', country: 'KG' });
});

test('runtime keeps one Manas city dictionary and accepts the historical city input', () => {
  assert.ok(LOCATION_DICTIONARIES.KG.Manas);
  assert.equal(LOCATION_DICTIONARIES.KG['Jalal-Abad'], undefined);
  assert.equal(dictionaryFor('KG', 'Jalal-Abad'), dictionaryFor('KG', 'Manas'));

  const match = matchDictionaryLocation('квартира в мкр Курманбек', 'KG', 'Jalal-Abad');
  assert.ok(match);
  assert.equal(match.city, 'Manas');
  assert.equal(match.type, 'microdistricts');
  assert.equal(match.name, 'Микрорайон Курманбек');
});
