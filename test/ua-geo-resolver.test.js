import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ukraineLocationCoordinateDescriptors,
  ukraineLocationCoordinateCoverage,
  resolveUkraineLocationCoordinates,
} from '@whiteslove/parsing-lexicon/ua-geo-resolver';

test('every Ukrainian internal geo entity is statically anchored or deterministically geocodable', () => {
  const rows = ukraineLocationCoordinateDescriptors();
  const coverage = ukraineLocationCoordinateCoverage();

  assert.ok(rows.length > 0);
  assert.equal(coverage.total, rows.length);
  assert.equal(coverage.missing, 0);
  assert.equal(coverage.resolvable, coverage.total);

  const ids = new Set();
  for (const row of rows) {
    const id = `${row.city}\u0000${row.type}\u0000${row.canonical}`;
    assert.equal(ids.has(id), false, `duplicate coordinate descriptor: ${id}`);
    ids.add(id);
    assert.ok(row.coordinates || row.candidates.length > 0, `unresolvable coordinate descriptor: ${id}`);
    if (row.coordinates) {
      assert.ok(Number.isFinite(row.coordinates.lat));
      assert.ok(Number.isFinite(row.coordinates.lng));
    }
  }
});

test('resolver uses injected lookup for non-static dependencies and preserves canonical identity', async () => {
  const calls = [];
  const resolved = await resolveUkraineLocationCoordinates(async (query, row) => {
    calls.push({ query, row });
    return { lat: 50.123, lng: 30.456 };
  }, { cities: ['Kyiv'], types: ['districts'], maxLookups: 1 });

  assert.ok(resolved.length > 0);
  const geocoded = resolved.find((row) => row.source === 'geocode');
  assert.ok(geocoded);
  assert.deepEqual(geocoded.coordinates, { lat: 50.123, lng: 30.456 });
  assert.equal(calls.length, 1);
  assert.match(calls[0].query, /Kyiv, Ukraine$/);
});

test('resolver never replaces unresolved dependency with a fake city-centre coordinate', async () => {
  const resolved = await resolveUkraineLocationCoordinates(async () => null, {
    cities: ['Kharkiv'],
    types: ['metro'],
    maxLookups: 10,
  });

  assert.ok(resolved.length > 0);
  for (const row of resolved) {
    if (row.source === 'static') continue;
    assert.equal(row.source, 'unresolved');
    assert.equal(row.coordinates, null);
  }
});
