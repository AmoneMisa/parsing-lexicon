import test from 'node:test';
import assert from 'node:assert/strict';
import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations-runtime.js';

test('Samarkand semantic duplicates have one canonical owner', () => {
  const samarkand = LOCATION_DICTIONARIES.UZ.Samarkand;

  assert.equal(samarkand.landmarks.filter(({ name }) => name === 'Central Park').length, 1);
  assert.equal(samarkand.landmarks.some(({ name }) => name === 'Alisher Navoiy Park'), false);
  assert.equal(samarkand.landmarks.filter(({ name }) => name === 'Siyob Bazaar').length, 1);
  assert.equal(samarkand.landmarks.some(({ name }) => name === 'Siab Bazaar'), false);

  assert.equal(samarkand.streets.filter(({ name }) => name === 'University Boulevard').length, 1);
  assert.equal(samarkand.localAreas.some(({ name }) => name === 'University Boulevard'), false);
  assert.equal(samarkand.landmarks.some(({ name }) => name === 'University Boulevard'), false);

  assert.equal(samarkand.residentialComplexes.some(({ name }) => name === 'Samarkand City'), true);
  assert.equal(samarkand.landmarks.some(({ name }) => name === 'Samarkand City'), false);
});

test('Samarkand Russian and Uzbek aliases resolve through corrected semantics', () => {
  const expected = new Map([
    ['Парк Алишера Навои', ['landmarks', 'Central Park']],
    ["Alisher Navoiy bog'i", ['landmarks', 'Central Park']],
    ['Сиабский базар', ['landmarks', 'Siyob Bazaar']],
    ['Siyob bozori', ['landmarks', 'Siyob Bazaar']],
    ['Университетский бульвар', ['streets', 'University Boulevard']],
    ['Universitet xiyoboni', ['streets', 'University Boulevard']],
  ]);

  for (const [input, [type, canonical]] of expected) {
    const match = matchDictionaryLocation(input, 'UZ', 'Samarkand');
    assert.equal(match?.type, type, input);
    assert.equal(match?.name, canonical, input);
  }
});
