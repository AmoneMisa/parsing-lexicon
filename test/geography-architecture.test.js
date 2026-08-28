import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { COUNTRIES } from '../src/countries.js';
import { CITIES, CITIES_BY_COUNTRY, GLOBAL_CITIES, REGIONS_BY_COUNTRY, canonicalCity, canonicalRegion } from '../src/geography.js';
import { detectCityFromText, detectCountryCodeFromText } from '../src/geography-detection.js';
import { geographyDisplayName } from '../src/geography-display.js';
import { LOCATION_LIST_KEYS } from '../src/location-merge.js';
import { matchDictionaryLocation } from '../src/locations.js';

test('canonical CITIES is the only city catalog used by free-text detection', async () => {
  const source = await readFile(new URL('../src/geography-detection.js', import.meta.url), 'utf8');
  assert.match(source, /const CITY_MATCHERS = CITIES\.map/u);
  assert.doesNotMatch(source, /CITY_CATALOG|HIRING_GLOBAL_CITIES|KZ_CITY_CATALOG|UZ_CITY_CATALOG|UA_CITY_CATALOG/u);
});

test('global cities belong to canonical geography', () => {
  assert.ok(GLOBAL_CITIES.length > 20);
  assert.equal(canonicalCity('NYC'), 'New York');
  assert.equal(canonicalCity('東京'), 'Tokyo');
  assert.equal(canonicalCity('Кишинёв'), 'Chisinau');
  assert.equal(detectCityFromText('Role based in München')?.canonical, 'Munich');
  assert.equal(detectCountryCodeFromText('Remote role in 서울'), 'KR');
  assert.ok(CITIES_BY_COUNTRY.US.some(({ canonical }) => canonical === 'New York'));
});

test('country scopes accept codes and aliases', () => {
  assert.equal(canonicalCity('Київ', 'UA'), 'Kyiv');
  assert.equal(canonicalCity('Київ', 'Ukraine'), 'Kyiv');
  assert.equal(canonicalCity('Київ', 'Украина'), 'Kyiv');
  assert.equal(canonicalCity('Київ', 'KZ'), null);
  assert.equal(canonicalRegion('Одеська область', 'Ukraine'), 'Odesa Oblast');
  assert.ok(REGIONS_BY_COUNTRY.UA.some(({ canonical }) => canonical === 'Odesa Oblast'));
});

test('city ownership is valid and unique', () => {
  const countryCodes = new Set(COUNTRIES.map(({ code }) => code));
  const keys = new Set();
  for (const item of CITIES) {
    assert.ok(countryCodes.has(item.country));
    const key = `${item.country}:${item.canonical}`;
    assert.ok(!keys.has(key), `duplicate city ${key}`);
    keys.add(key);
  }
});

test('location matcher consumes the canonical collection key list', async () => {
  const source = await readFile(new URL('../src/locations.js', import.meta.url), 'utf8');
  assert.match(source, /for \(const type of LOCATION_LIST_KEYS\)/u);
  assert.ok(LOCATION_LIST_KEYS.includes('mahallas'));
  assert.ok(LOCATION_LIST_KEYS.includes('localAreas'));
  assert.ok(LOCATION_LIST_KEYS.includes('suburbs'));

  assert.deepEqual(matchDictionaryLocation('Обихаёт', 'UZ', 'Namangan')?.type, 'mahallas');
  assert.deepEqual(matchDictionaryLocation('Киргули', 'UZ', 'Fergana')?.type, 'localAreas');
  assert.deepEqual(matchDictionaryLocation('Бесагаш', 'KZ', 'Almaty')?.type, 'suburbs');
});

test('migrated major-city locations no longer use the legacy runtime owner', async () => {
  const source = await readFile(new URL('../src/locations.js', import.meta.url), 'utf8');
  assert.match(source, /city !== 'Kyiv' && city !== 'Kharkiv'/u);
  assert.doesNotMatch(source, /Kharkiv:\s*withoutMetro/u);
});

test('display derives labels from canonical entities and supports regions', () => {
  assert.equal(geographyDisplayName('Munich', 'ru', 'city'), 'Мюнхен');
  assert.equal(geographyDisplayName('Tokyo', 'ru', 'city'), 'Токио');
  assert.equal(geographyDisplayName('Odesa Oblast', 'ru', 'region'), 'Одесская область');
  assert.equal(geographyDisplayName('DE', 'ru', 'country'), 'Германия');
});
