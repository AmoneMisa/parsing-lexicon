import test from 'node:test';
import assert from 'node:assert/strict';
import { matchDictionaryLocation } from '../src/locations-runtime.js';

const cities = Object.freeze([
  'Samarkand',
  'Andijan',
  'Fergana',
  'Qarshi',
  'Urgench',
  'Termez',
  'Gulistan',
]);

const inputs = Object.freeze([
  'Universitet hududi',
  'Universitet atrofi',
  'Университет ҳудуди',
  'Университет атрофи',
  'Университетский',
]);

test('Uzbek and Russian university-area forms resolve to the shared canonical', () => {
  for (const city of cities) {
    for (const input of inputs) {
      const match = matchDictionaryLocation(input, 'UZ', city);
      assert.equal(match?.type, 'localAreas', `${city}: ${input}`);
      assert.equal(match?.name, 'University area', `${city}: ${input}`);
    }
  }
});
