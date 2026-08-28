import test from 'node:test';
import assert from 'node:assert/strict';
import { dictionaryFor, matchDictionaryLocation } from '../src/locations.js';

test('Odesa Fontan station zones are local areas, not standalone microdistricts', () => {
  const odesa = dictionaryFor('UA', 'Odesa');
  const microdistrictNames = new Set((odesa?.microdistricts || []).map(({ name }) => name));
  const localAreaNames = new Set((odesa?.localAreas || []).map(({ name }) => name));

  for (let station = 5; station <= 16; station += 1) {
    const canonical = `${station} Fontan Station`;
    assert.equal(microdistrictNames.has(canonical), false);
    assert.equal(localAreaNames.has(canonical), true);
  }
});

test('Odesa Fontan station aliases resolve through the local-area collection', () => {
  assert.deepEqual(
    matchDictionaryLocation('квартира, 13 станция Фонтана', 'UA', 'Odesa'),
    {
      city: 'Odesa',
      type: 'localAreas',
      name: '13 Fontan Station',
      aliases: dictionaryFor('UA', 'Odesa').localAreas.find(({ name }) => name === '13 Fontan Station').aliases,
    },
  );
});

test('Velykyi Fontan remains the actual microdistrict around station locality zones', () => {
  const odesa = dictionaryFor('UA', 'Odesa');
  assert.equal(odesa?.microdistricts?.some(({ name }) => name === 'Velykyi Fontan'), true);
});
