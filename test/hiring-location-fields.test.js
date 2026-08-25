import test from 'node:test';
import assert from 'node:assert/strict';
import { isHiringNonCityLocation } from '../src/hiring-location-fields.js';


test('recognises non-city hiring location groups', () => {
  assert.equal(isHiringNonCityLocation('Europe'), true);
  assert.equal(isHiringNonCityLocation('Європа'), true);
  assert.equal(isHiringNonCityLocation('EMEA'), true);
  assert.equal(isHiringNonCityLocation('Tashkent'), false);
});
