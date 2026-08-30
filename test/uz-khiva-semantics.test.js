import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations.js';

test('Khiva Old City is an alias of Ichan Kala, not a second canonical', () => {
  const localAreas = LOCATION_DICTIONARIES.UZ.Khiva.localAreas;
  assert.equal(localAreas.filter(({ name }) => name === 'Ichan Kala').length, 1);
  assert.equal(localAreas.some(({ name }) => name === 'Old City'), false);
});

test('Khiva old-city multilingual forms resolve to Ichan Kala', () => {
  for (const input of ['Old City', 'Старый город', 'Eski shahar', 'Ичан-Кала', "Ichan-Qal'a"]) {
    const match = matchDictionaryLocation(input, 'UZ', 'Khiva');
    assert.equal(match?.type, 'localAreas', input);
    assert.equal(match?.name, 'Ichan Kala', input);
  }
});
