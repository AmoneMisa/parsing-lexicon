import test from 'node:test';
import assert from 'node:assert/strict';

import {
  UA_ADMINISTRATIVE_GEO_META,
  ukraineAdministrativeGeoSet,
  ukraineAdministrativeGeoByCode,
  findUkraineAdministrativeGeo,
  ukraineAdministrativeChildrenOf,
  ukraineAdministrativeAncestry,
  ukraineAdministrativeGeocodeCandidates,
  ukraineInternalGeoSet,
  ukraineGeoSetCoverage,
} from '@whiteslove/parsing-lexicon/ua-geo-set';
import {
  ukraineAdministrativeCoordinateDescriptors,
  resolveUkraineAdministrativeCoordinates,
} from '@whiteslove/parsing-lexicon/ua-geo-resolver';

test('vendored KATOTTG snapshot is nationwide, current and internally linked', () => {
  const rows = ukraineAdministrativeGeoSet();

  assert.equal(UA_ADMINISTRATIVE_GEO_META.snapshot, '2026-07-07');
  assert.equal(UA_ADMINISTRATIVE_GEO_META.runtimeDependency, false);
  assert.equal(UA_ADMINISTRATIVE_GEO_META.recordCount, rows.length);
  assert.ok(rows.length > 30_000, `unexpected KATOTTG size: ${rows.length}`);

  const codes = new Set(rows.map((row) => row.code));
  assert.equal(codes.size, rows.length, 'KATOTTG codes must be unique');

  for (const row of rows) {
    assert.match(row.code, /^UA[0-9A-Z]{17}$/);
    assert.ok(row.name);
    if (row.parentCode) {
      assert.ok(codes.has(row.parentCode), `missing parent ${row.parentCode} for ${row.code} ${row.name}`);
    }
  }
});

test('nationwide lookup, children and ancestry are deterministic', () => {
  const rows = ukraineAdministrativeGeoSet();
  const child = rows.find((row) => row.parentCode);
  assert.ok(child);

  assert.equal(ukraineAdministrativeGeoByCode(child.code), child);
  assert.ok(ukraineAdministrativeChildrenOf(child.parentCode).some((row) => row.code === child.code));

  const ancestry = ukraineAdministrativeAncestry(child);
  assert.ok(ancestry.length >= 2);
  assert.equal(ancestry.at(-1)?.code, child.code);
  assert.equal(ancestry.at(-2)?.code, child.parentCode);

  const candidates = ukraineAdministrativeGeocodeCandidates(child);
  assert.ok(candidates.length > 0);
  assert.ok(candidates.every((query) => query.endsWith('Ukraine')));

  const byName = findUkraineAdministrativeGeo(child.name, { limit: 100 });
  assert.ok(byName.some((row) => row.code === child.code));
});

test('curated internal geo remains separate and covers housing/search entities', () => {
  const rows = ukraineInternalGeoSet();
  const coverage = ukraineGeoSetCoverage();

  assert.ok(rows.length > 0);
  assert.equal(coverage.administrative, UA_ADMINISTRATIVE_GEO_META.recordCount);
  assert.equal(coverage.internal, rows.length);
  assert.ok(rows.some((row) => row.type === 'districts'));
  assert.ok(rows.some((row) => row.type === 'microdistricts'));
  assert.ok(rows.some((row) => row.type === 'pois'));

  const ids = new Set();
  for (const row of rows) {
    const id = `${row.city}\u0000${row.type}\u0000${row.canonical}`;
    assert.equal(ids.has(id), false, `duplicate internal geo entity: ${id}`);
    ids.add(id);
  }
});

test('administrative coordinate descriptors never fabricate coordinates', async () => {
  const descriptors = ukraineAdministrativeCoordinateDescriptors({ limit: 25 });
  assert.equal(descriptors.length, 25);
  for (const row of descriptors) {
    assert.equal(row.coordinates, null);
    assert.equal(row.source, 'geocode');
    assert.ok(row.candidates.length > 0);
  }

  const calls = [];
  const resolved = await resolveUkraineAdministrativeCoordinates(async (query, row) => {
    calls.push({ query, row });
    return { lat: 50.45, lng: 30.5236 };
  }, { limit: 10, maxLookups: 1 });

  assert.equal(resolved.length, 10);
  assert.equal(calls.length, 1);
  assert.equal(resolved.filter((row) => row.source === 'geocode').length, 1);
  assert.equal(resolved.filter((row) => row.source === 'unresolved').length, 9);
  assert.deepEqual(resolved[0].coordinates, { lat: 50.45, lng: 30.5236 });
});
