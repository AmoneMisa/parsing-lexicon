import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/index.js';

test('Otopeni owns Henri Coandă airport vocabulary without treating it as Bucharest territory', () => {
  const airport = LOCATION_DICTIONARIES.RO.Otopeni.landmarks.find(({ canonical }) => canonical === 'Bucharest Henri Coandă International Airport');
  assert.ok(airport);
  assert.ok(airport.aliases.includes('Aeroportul Otopeni'));
  assert.ok(airport.aliases.includes('OTP'));
  assert.equal(matchDictionaryLocation('Aeroportul Otopeni', 'RO', 'Otopeni')?.name, 'Bucharest Henri Coandă International Airport');
  assert.equal(matchDictionaryLocation('Aeroportul Otopeni', 'RO', 'Bucharest'), null);
});
