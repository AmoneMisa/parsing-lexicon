import { GeoAPI } from 'ua-geo-set';
import { normalizeForMatch } from './normalization.js';

let api;
let snapshot;

function geoApi() {
  if (!api) api = new GeoAPI();
  return api;
}

function freezeRows(rows) {
  return Object.freeze(rows.map((row) => Object.freeze(row)));
}

function normalizeRow(row, type) {
  return Object.freeze({
    id: row.id,
    name: row.name,
    nameFull: row.nameFull,
    type,
    category: row.category,
    regionId: row.regionId ?? null,
    districtId: row.districtId ?? null,
    parentId: row.parentId ?? null,
    parentType: row.parentType ?? null,
  });
}

function buildSnapshot() {
  const source = geoApi();
  const regions = freezeRows(source.getAllRegions().map((row) => normalizeRow(row, 'region')));
  const districts = freezeRows(source.getAllRegionDistricts().map((row) => normalizeRow(row, 'district')));
  const communities = freezeRows(source.getAllCommunities().map((row) => normalizeRow(row, 'community')));
  const settlements = freezeRows(source.getAllSettlements().map((row) => normalizeRow(row, 'settlement')));
  const cityDistricts = freezeRows(source.getAllCityDistricts().map((row) => normalizeRow(row, 'city_district')));
  return Object.freeze({ regions, districts, communities, settlements, cityDistricts });
}

export function ukraineNationalAdministrativeCatalog() {
  if (!snapshot) snapshot = buildSnapshot();
  return snapshot;
}

export function ukraineNationalAdministrativeStats() {
  const data = ukraineNationalAdministrativeCatalog();
  return Object.freeze({
    regions: data.regions.length,
    districts: data.districts.length,
    communities: data.communities.length,
    settlements: data.settlements.length,
    cityDistricts: data.cityDistricts.length,
    total: data.regions.length + data.districts.length + data.communities.length + data.settlements.length + data.cityDistricts.length,
  });
}

export function searchUkraineAdministrativePlaces(value, options = {}) {
  const needle = normalizeForMatch(value);
  if (!needle) return Object.freeze([]);
  const types = new Set(options.types || ['region', 'district', 'community', 'settlement', 'city_district']);
  const exact = options.exact === true;
  const limit = Math.max(1, Number(options.limit) || 50);
  const data = ukraineNationalAdministrativeCatalog();
  const groups = [data.regions, data.districts, data.communities, data.settlements, data.cityDistricts];
  const result = [];
  for (const rows of groups) {
    for (const row of rows) {
      if (!types.has(row.type)) continue;
      const name = normalizeForMatch(row.name);
      const full = normalizeForMatch(row.nameFull);
      const matched = exact ? (name === needle || full === needle) : (name.includes(needle) || full.includes(needle));
      if (!matched) continue;
      result.push(row);
      if (result.length >= limit) return Object.freeze(result);
    }
  }
  return Object.freeze(result);
}

export function ukraineAdministrativePlaceById(id) {
  const code = String(id || '').trim();
  if (!code) return null;
  const data = ukraineNationalAdministrativeCatalog();
  for (const rows of [data.regions, data.districts, data.communities, data.settlements, data.cityDistricts]) {
    const found = rows.find((row) => row.id === code);
    if (found) return found;
  }
  return null;
}

export function ukraineCityDistrictsByCityId(cityId) {
  const id = String(cityId || '').trim();
  if (!id) return Object.freeze([]);
  return Object.freeze(ukraineNationalAdministrativeCatalog().cityDistricts.filter((row) => row.regionId === id));
}

export const UA_NATIONAL_ADMIN_SOURCE = Object.freeze({
  name: 'KATOTTG via ua-geo-set',
  package: 'ua-geo-set',
  version: '1.0.4',
  snapshot: '2024',
  authority: 'KATOTTG',
});
