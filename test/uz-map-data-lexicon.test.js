import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
import { LOCATION_DICTIONARIES } from '../src/locations.js';

test('approved UZ map data is available to the lexicon without spatial fields', async () => {
  const uz = LOCATION_DICTIONARIES.UZ;
  assert.ok(uz.Tashkent.streets.some(({ name }) => name === 'Amir Temur Avenue'));
  assert.ok(uz.Bukhara.localAreas.some(({ name }) => name === 'Gulobiyon'));
  assert.ok(uz.Nukus.localAreas.some(({ name }) => name === '108 povorot'));
  assert.ok(uz.Urgench.residentialComplexes.some(({ name }) => name === 'Sohil Plaza turar joy majmuasi'));

  const source = await readFile(new URL('../src/uz-map-data-location-extensions.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /"(?:center|accuracyM|lat|lng)"\s*:/u);
});

test('approved map-label translations become lexical aliases', () => {
  const akchasay = LOCATION_DICTIONARIES.UZ.Almalyk.localAreas.find(({ name }) => name === 'Акчасай');
  const zapravka = LOCATION_DICTIONARIES.KG.Osh.localAreas.find(({ name }) => name === 'Заправка');

  assert.ok(akchasay?.aliases.includes('Akchasay'));
  assert.ok(zapravka?.aliases.includes('Zapravka'));
});
