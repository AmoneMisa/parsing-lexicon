import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { COUNTRIES } from '../src/countries.js';
import { CITIES, CITIES_BY_COUNTRY, GLOBAL_CITIES, REGIONS_BY_COUNTRY, canonicalCity, canonicalRegion } from '../src/geography.js';
import { TASHKENT_DISTRICTS } from '../src/geo.js';
import { detectCityFromText, detectCountryCodeFromText } from '../src/geography-detection.js';
import { GEOGRAPHY_DISPLAY_NAMES, geographyDisplayName } from '../src/geography-display.js';
import { LOCATION_LIST_KEYS } from '../src/location-merge.js';
import { LOCATION_DICTIONARIES, matchDictionaryLocation } from '../src/locations.js';

test('canonical CITIES is the only city catalog used by free-text detection', async () => {
  const source = await readFile(new URL('../src/geography-detection.js', import.meta.url), 'utf8');
  assert.match(source, /const CITY_MATCHERS = CITIES\.map/u);
  assert.doesNotMatch(source, /CITY_CATALOG|HIRING_GLOBAL_CITIES|KZ_CITY_CATALOG|UZ_CITY_CATALOG|UA_CITY_CATALOG/u);
});

test('Central Asia location matching consumes canonical geography city ownership', async () => {
  const source = await readFile(new URL('../src/central-asia-locations.js', import.meta.url), 'utf8');
  assert.match(source, /CITIES_BY_COUNTRY, canonicalCity/u);
  assert.doesNotMatch(source, /KZ_CITY_CATALOG|UZ_CITY_CATALOG|canonicalKazakhstanCity|canonicalUzbekistanCity/u);
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

test('expanded Central Asia cities belong to canonical geography', () => {
  assert.equal(canonicalCity('Целиноград', 'KZ'), 'Astana');
  assert.equal(canonicalCity('Темиртау', 'KZ'), 'Temirtau');
  assert.equal(canonicalCity("Qo'qon", 'UZ'), 'Kokand');
  assert.equal(canonicalCity('Нөкис', 'UZ'), 'Nukus');
  assert.ok(CITIES_BY_COUNTRY.KZ.some(({ canonical }) => canonical === 'Konaev'));
  assert.ok(CITIES_BY_COUNTRY.UZ.some(({ canonical }) => canonical === 'Margilan'));
});

test('context-required cities stay guarded in free text', () => {
  assert.equal(detectCityFromText('Xonobod', 'UZ'), null);
  assert.equal(detectCityFromText('Xonobod shahri', 'UZ')?.canonical, 'Xonobod');
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
  assert.ok(LOCATION_LIST_KEYS.includes('developmentAreas'));

  assert.deepEqual(matchDictionaryLocation('Обихаёт', 'UZ', 'Namangan')?.type, 'mahallas');
  assert.deepEqual(matchDictionaryLocation('Киргули', 'UZ', 'Fergana')?.type, 'localAreas');
  assert.deepEqual(matchDictionaryLocation('Бесагаш', 'KZ', 'Almaty')?.type, 'suburbs');
  assert.deepEqual(matchDictionaryLocation('Tashkent City', 'UZ', 'Tashkent')?.type, 'developmentAreas');
});

test('Tashkent City has one canonical semantic owner in the runtime registry', () => {
  const tashkent = LOCATION_DICTIONARIES.UZ.Tashkent;
  assert.ok(tashkent.developmentAreas.some(({ name }) => name === 'Tashkent City'));
  assert.equal(tashkent.residentialComplexes.some(({ name }) => name === 'Tashkent City'), false);
});

test('Ukraine runtime locations no longer use the legacy UA seed', async () => {
  const source = await readFile(new URL('../src/locations.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /BASE_LOCATION_DICTIONARIES\.UA/u);
  assert.doesNotMatch(source, /UA_BASE_LOCATION_DICTIONARIES/u);
  assert.match(source, /UA:\s*mergeLocationCountries\(\s*UA_EXTRA_LOCATION_DICTIONARIES/u);
});

test('country presentation normalizes every catalog entry to English and Russian', () => {
  for (const item of COUNTRIES) {
    const en = item.aliases.en?.[0] || item.canonical;
    const ru = item.aliases.ru?.[0] || en;
    assert.equal(GEOGRAPHY_DISPLAY_NAMES.en.country[item.code], en);
    assert.equal(GEOGRAPHY_DISPLAY_NAMES.ru.country[item.code], ru);
    assert.equal(geographyDisplayName(ru, 'en', 'country'), en);
    assert.equal(geographyDisplayName(en, 'ru', 'country'), ru);
  }

  assert.equal(geographyDisplayName('Республика Узбекистан', 'en', 'country'), 'Uzbekistan');
  assert.equal(geographyDisplayName('United States', 'ru', 'country'), 'США');
  assert.equal(geographyDisplayName('DE', 'ru', 'country'), 'Германия');
});

test('display derives labels from canonical entities and supports regions', () => {
  assert.equal(geographyDisplayName('Munich', 'ru', 'city'), 'Мюнхен');
  assert.equal(geographyDisplayName('Tokyo', 'ru', 'city'), 'Токио');
  assert.equal(geographyDisplayName('Odesa Oblast', 'ru', 'region'), 'Одесская область');
  assert.equal(geographyDisplayName('DE', 'ru', 'country'), 'Германия');
});

test('every canonical Tashkent district has a Russian display label', () => {
  for (const district of TASHKENT_DISTRICTS) {
    const label = GEOGRAPHY_DISPLAY_NAMES.ru.district[district.canonical];
    assert.ok(label, `missing Russian district display label: ${district.canonical}`);
    assert.equal(geographyDisplayName(district.canonical, 'ru', 'district'), label);
  }

  assert.equal(geographyDisplayName('Almazar', 'ru', 'district'), 'Алмазар');
  assert.equal(geographyDisplayName('Yangihayot', 'ru', 'district'), 'Янгихаёт');
});
