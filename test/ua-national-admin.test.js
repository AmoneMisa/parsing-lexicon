import test from 'node:test';
import assert from 'node:assert/strict';

import {
  UA_NATIONAL_ADMIN_SOURCE,
  ukraineNationalAdministrativeCatalog,
  ukraineNationalAdministrativeStats,
  searchUkraineAdministrativePlaces,
  ukraineAdministrativePlaceById,
} from '@whiteslove/parsing-lexicon/ua-national-admin';

test('nationwide KATOTTG catalog provides broad Ukrainian administrative coverage', () => {
  const data = ukraineNationalAdministrativeCatalog();
  const stats = ukraineNationalAdministrativeStats();

  assert.equal(UA_NATIONAL_ADMIN_SOURCE.authority, 'KATOTTG');
  assert.ok(stats.regions >= 25);
  assert.ok(stats.districts >= 100);
  assert.ok(stats.communities >= 1000);
  assert.ok(stats.settlements >= 20000);
  assert.ok(stats.cityDistricts >= 50);
  assert.ok(stats.total >= 25000);
  assert.equal(data.regions.length, stats.regions);
  assert.equal(data.cityDistricts.length, stats.cityDistricts);
});

test('official administrative names and KATOTTG ids are searchable', () => {
  const kyiv = searchUkraineAdministrativePlaces('Київ', { exact: true, limit: 20 });
  assert.ok(kyiv.length > 0);
  assert.ok(kyiv.some((row) => row.id.startsWith('UA')));

  const cityDistricts = searchUkraineAdministrativePlaces('район', {
    types: ['city_district'],
    limit: 20,
  });
  assert.ok(cityDistricts.length > 0);

  const sample = cityDistricts[0];
  assert.deepEqual(ukraineAdministrativePlaceById(sample.id), sample);
});
