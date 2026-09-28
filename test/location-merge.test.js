import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LOCATION_LIST_KEYS,
  isMapDataEntry,
  locationEntry,
  locationEntries,
  markMapDataEntries,
  mergeLocationCityDictionaries,
  mergeLocationCountries,
  mergeLocationEntries,
} from '../src/location-merge.js';

test('locationEntry exposes re as a lazily-computed accessor', () => {
  const entry = locationEntry('Test Street', 'Тестовая улица');
  const descriptor = Object.getOwnPropertyDescriptor(entry, 're');
  assert.equal(typeof descriptor.get, 'function', 're must stay an accessor, not a precomputed value');
  assert.ok(entry.re.test('Test Street'));
  assert.ok(entry.re.test('Тестовая улица'));
});

test('merging location entries does not force each input entry\'s lazy regex getter to compute', () => {
  // This guards the perf regression where mergeEntry() spread `{...existing,
  // ...incoming}` directly: an object spread reads every enumerable own
  // property, including accessor getters, so it silently forced every
  // merged entry's regex to compile even when the merged result never used
  // that computed value. Import of the whole package took ~30s because of
  // this before the fix (mergeEntry() now uses omitLazyRegex()).
  let computeCount = 0;
  const spiedEntry = Object.freeze({
    canonical: 'Spied Entry',
    name: 'Spied Entry',
    aliases: Object.freeze(['Spied Entry', 'Alias']),
    get re() {
      computeCount += 1;
      return /spied/iu;
    },
  });

  mergeLocationEntries([spiedEntry]);
  assert.equal(computeCount, 0, 'merging a single-source entry must not touch its regex getter');

  mergeLocationEntries([spiedEntry], [locationEntry('Spied Entry', 'Another alias')]);
  assert.equal(computeCount, 0, 'merging duplicate-named entries must not touch either input\'s regex getter');
});

test('mergeLocationEntries unions aliases and keeps the merged regex functional', () => {
  const [merged] = mergeLocationEntries(
    [locationEntry('Sairan', 'Сайран')],
    [locationEntry('Sairan', 'ЖК Сайран')],
  );
  assert.deepEqual([...merged.aliases].sort(), ['Sairan', 'ЖК Сайран', 'Сайран'].sort());
  assert.ok(merged.re.test('рядом с ЖК Сайран'));
});

test('mergeLocationEntries keeps parent-scoped duplicates separate while inheriting unscoped aliases', () => {
  const unscoped = { ...locationEntry('Sairan', 'Общий Сайран') };
  const districtA = { ...locationEntry('Sairan', 'Сайран А'), parent: 'Bostandyk' };
  const districtB = { ...locationEntry('Sairan', 'Сайран Б'), parent: 'Medeu' };

  const merged = mergeLocationEntries([unscoped, districtA, districtB]);
  assert.equal(merged.length, 2, 'each parent scope keeps its own entity');

  const byParent = new Map(merged.map((entry) => [entry.parent, entry]));
  assert.ok(byParent.get('Bostandyk').aliases.includes('Общий Сайран'));
  assert.ok(byParent.get('Bostandyk').aliases.includes('Сайран А'));
  assert.ok(!byParent.get('Bostandyk').aliases.includes('Сайран Б'));
  assert.ok(byParent.get('Medeu').aliases.includes('Общий Сайран'));
  assert.ok(byParent.get('Medeu').aliases.includes('Сайран Б'));
});

test('markMapDataEntries and isMapDataEntry track fallback-only entries across a whole country', () => {
  const street = locationEntry('Scraped Street');
  const country = Object.freeze({ SomeCity: Object.freeze({ streets: Object.freeze([street]) }) });
  assert.equal(isMapDataEntry(street), false);
  markMapDataEntries(country);
  assert.equal(isMapDataEntry(street), true);
});

test('a reviewed owner merged with map data keeps matching precedence over fallback-only data', () => {
  const reviewed = locationEntry('Sairan', 'Reviewed alias');
  const mapData = locationEntry('Sairan', 'Scraped alias');
  markMapDataEntries({ City: { streets: [mapData] } });

  const [merged] = mergeLocationEntries([reviewed], [mapData]);
  assert.equal(isMapDataEntry(merged), false, 'a reviewed+map-data merge must not be marked fallback-only');
  assert.ok(merged.aliases.includes('Reviewed alias'));
  assert.ok(merged.aliases.includes('Scraped alias'));
});

test('mergeLocationCityDictionaries merges list keys and carries non-list metadata from the last source', () => {
  const base = { streets: locationEntries([['Main St', 'Главная']]), aliases: ['Base City'] };
  const extra = { streets: locationEntries([['Second St']]), aliases: ['Extended City'] };

  const merged = mergeLocationCityDictionaries(base, extra);
  assert.equal(merged.streets.length, 2);
  assert.deepEqual(merged.aliases, ['Extended City'], 'non-list keys take the last source that defines them');
  for (const key of LOCATION_LIST_KEYS) {
    if (key !== 'streets') assert.equal(merged[key], undefined);
  }
});

test('mergeLocationCountries merges same-named cities across country sources without duplicating others', () => {
  const base = { Tashkent: { streets: locationEntries([['Amir Temur']]) } };
  const extension = { Tashkent: { streets: locationEntries([['Navoi']]) }, Samarkand: { streets: locationEntries([['Registan']]) } };

  const merged = mergeLocationCountries(base, extension);
  assert.deepEqual(Object.keys(merged).sort(), ['Samarkand', 'Tashkent']);
  assert.equal(merged.Tashkent.streets.length, 2);
  assert.equal(merged.Samarkand.streets.length, 1);
});
