import test from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../src/index.js';

test('deal type vocabulary no longer decides transaction side', () => {
  assert.equal(api.findCanonical('куплю квартиру', api.DEAL_TYPES, { partial: true }), null);
  assert.equal(api.findCanonical('сниму квартиру', api.DEAL_TYPES, { partial: true }), null);
  assert.equal(api.resolveHousingIntent('куплю квартиру')?.listingKind, 'propertyWanted');
  assert.equal(api.resolveHousingIntent('сдам квартиру')?.listingKind, 'propertyOffer');
});

test('region entities are typed as regions', () => {
  assert.equal(api.UA_REGIONS.find(({ canonical }) => canonical === 'Kyiv Oblast')?.type, 'region');
  assert.equal(api.KZ_REGIONS.find(({ canonical }) => canonical === 'Almaty Region')?.type, 'region');
});

test('negative floor constraints suppress overlapping positive match', () => {
  const parsed = api.parseHousingContext('Ищу квартиру: не первый и не последний этаж');
  assert.deepEqual(new Set(parsed.floorConstraints), new Set(['notFirst', 'notLast']));
});

test('Tashkent physical POIs are unique after group flattening', () => {
  const names = api.TASHKENT_LANDMARKS.map(({ name }) => name);
  assert.equal(names.length, new Set(names).size);
  const tma = api.TASHKENT_LANDMARKS.filter(({ name }) => name === 'Tashkent Medical Academy');
  assert.equal(tma.length, 1);
  assert.ok(tma[0].categories.includes('medical'));
  assert.ok(tma[0].categories.includes('university'));
});
