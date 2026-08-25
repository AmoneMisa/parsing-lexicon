import test from 'node:test';
import assert from 'node:assert/strict';
import {
  isHiringNonCityLocation,
  isHiringRemoteLocationScope,
} from '../src/hiring-location-fields.js';


test('recognises non-city hiring location groups', () => {
  assert.equal(isHiringNonCityLocation('Europe'), true);
  assert.equal(isHiringNonCityLocation('Європа'), true);
  assert.equal(isHiringNonCityLocation('EMEA'), true);
  assert.equal(isHiringNonCityLocation('Tashkent'), false);
});

test('recognises remote hiring location scopes without treating regions as remote', () => {
  assert.equal(isHiringRemoteLocationScope('Worldwide'), true);
  assert.equal(isHiringRemoteLocationScope('Global'), true);
  assert.equal(isHiringRemoteLocationScope('Anywhere'), true);
  assert.equal(isHiringRemoteLocationScope('Anywhere in Europe'), true);
  assert.equal(isHiringRemoteLocationScope('Europe'), false);
  assert.equal(isHiringRemoteLocationScope('EMEA'), false);
});
