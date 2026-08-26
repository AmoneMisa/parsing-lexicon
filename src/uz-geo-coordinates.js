import { normalizeForMatch } from './normalization.js';
import { UZ_CITY_CATALOG, canonicalUzbekistanCity } from './central-asia.js';
import { centralAsiaLocationCity } from './central-asia-locations.js';

// Coordinate contract mirrors the existing Ukraine layer and Flat Finder:
// { lat, lng }, exact location anchors first, city centre fallback.
//
// City coordinates are keyed by the package canonical city names. Local,
// Cyrillic and historical spellings resolve through canonicalUzbekistanCity().
const point = (lat, lng) => Object.freeze({ lat, lng });

export const UZ_CITY_COORDINATES = Object.freeze({
  Tashkent: point(41.264646, 69.216270),
  Samarkand: point(39.654562, 66.964449),
  Namangan: point(40.998298, 71.672573),
  Andijan: point(40.783376, 72.350673),
  Fergana: point(40.384213, 71.784325),
  Bukhara: point(39.770265, 64.430692),
  Qarshi: point(38.860563, 65.789051),
  Nukus: point(42.458611, 59.605758),
  Urgench: point(41.551774, 60.631431),
  Kokand: point(40.528611, 70.942500),
  Margilan: point(40.472373, 71.724632),
  Jizzakh: point(40.133507, 67.829561),
  Navoiy: point(40.084444, 65.379167),
  Termez: point(37.224167, 67.278333),
  Gulistan: point(40.495361, 68.775424),
  Chirchiq: point(41.468889, 69.582222),
  Almalyk: point(40.844722, 69.598333),
  Angren: point(41.016667, 70.143611),
  Bekabad: point(40.220833, 69.269722),
  Shakhrisabz: point(39.057778, 66.834167),
  Khiva: point(41.385546, 60.364080),
  Denov: point(38.267457, 67.898857),
  Asaka: point(40.641527, 72.238684),
  Kogon: point(39.727463, 64.554661),
  Kattakurgan: point(39.905464, 66.265563),
  Urgut: point(39.419019, 67.261180),
  Yangiyol: point(41.112016, 69.047098),
  Chust: point(41.003291, 71.237906),
  Chartak: point(41.069244, 71.823722),
  Kosonsoy: point(41.249442, 71.547384),
  Shahrixon: point(40.713311, 72.057065),
  Xonobod: point(40.802597, 72.974986),
  Khojeyli: point(42.408806, 59.445438),
  Takhiatash: point(42.342501, 59.569947),
  Kungrad: point(43.043333, 58.839444),
  Beruniy: point(41.691111, 60.752500),
  Turtkul: point(41.554444, 61.001111),
  Yangiyer: point(40.275000, 68.822500),
  Shirin: point(40.233333, 69.120000),
  Gazalkent: point(41.562940, 69.770770),
  Muynak: point(43.778770, 59.030394),
});

// A district, mahalla, metro station or residential complex is not inherently
// one point. Keep this map deliberately sparse: add only stable, independently
// verified point anchors. Unanchored entities still produce precise geocoding
// candidates and then fall back to the canonical city centre.
export const UZ_LOCATION_COORDINATES = Object.freeze({});

const TYPE_TO_LIST = Object.freeze({
  district: 'districts',
  districts: 'districts',
  microdistrict: 'microdistricts',
  microdistricts: 'microdistricts',
  mahalla: 'mahallas',
  mahallas: 'mahallas',
  localArea: 'localAreas',
  local_area: 'localAreas',
  localAreas: 'localAreas',
  suburb: 'suburbs',
  suburbs: 'suburbs',
  settlement: 'settlements',
  settlements: 'settlements',
  metro: 'metro',
  residentialComplex: 'residentialComplexes',
  residential_complex: 'residentialComplexes',
  residentialComplexes: 'residentialComplexes',
  street: 'streets',
  streets: 'streets',
  landmark: 'landmarks',
  landmarks: 'landmarks',
  poi: 'pois',
  pois: 'pois',
});

function canonicalCity(value) {
  return canonicalUzbekistanCity(value) || null;
}

function catalogCity(canonical) {
  return UZ_CITY_CATALOG.find((entry) => entry.canonical === canonical) || null;
}

function listKey(type) {
  return TYPE_TO_LIST[type] || String(type || '');
}

function findLocationEntry(city, type, value) {
  const key = listKey(type);
  const data = centralAsiaLocationCity('UZ', city);
  const normalized = normalizeForMatch(value);
  if (!data || !key || !normalized) return null;
  return (data[key] || []).find((entry) =>
    [entry?.canonical, entry?.name, ...(entry?.aliases || [])]
      .some((candidate) => normalizeForMatch(candidate) === normalized)) || null;
}

function candidateNames(entry, original) {
  return [...new Set([
    entry?.canonical,
    entry?.name,
    String(original || '').trim(),
  ].filter(Boolean))];
}

export function uzbekistanCityCoordinates(value) {
  const city = canonicalCity(value);
  return city ? (UZ_CITY_COORDINATES[city] || null) : null;
}

export function uzbekistanCityGeocodeCandidates(value) {
  const city = canonicalCity(value);
  if (!city) return Object.freeze([]);
  const entry = catalogCity(city);
  const names = [...new Set([
    entry?.localCanonical,
    city,
  ].filter(Boolean))];
  return Object.freeze(names.map((name) => `${name}, Uzbekistan`));
}

export function uzbekistanLocationCoordinates(cityValue, type, locationValue) {
  const city = canonicalCity(cityValue);
  if (!city) return null;
  const entry = findLocationEntry(city, type, locationValue);
  const name = entry?.canonical || entry?.name || String(locationValue || '').trim();
  if (!name) return null;
  return UZ_LOCATION_COORDINATES[city]?.[listKey(type)]?.[name] || null;
}

export function uzbekistanLocationGeocodeCandidates(cityValue, type, locationValue) {
  const city = canonicalCity(cityValue);
  if (!city) return Object.freeze([]);
  const entry = findLocationEntry(city, type, locationValue);
  const cityEntry = catalogCity(city);
  const cityNames = [...new Set([cityEntry?.localCanonical, city].filter(Boolean))];
  const names = candidateNames(entry, locationValue);
  const candidates = [];
  for (const name of names) {
    for (const cityName of cityNames) candidates.push(`${name}, ${cityName}, Uzbekistan`);
  }
  return Object.freeze([...new Set(candidates)]);
}

export function uzbekistanCoordinateFallback(cityValue, type = null, locationValue = null) {
  const city = canonicalCity(cityValue);
  if (!city) return null;
  if (type && locationValue) {
    const exact = uzbekistanLocationCoordinates(city, type, locationValue);
    if (exact) return Object.freeze({ ...exact, accuracy: 'exact', source: 'location' });
  }
  const center = UZ_CITY_COORDINATES[city];
  return center ? Object.freeze({ ...center, accuracy: 'city', source: 'city' }) : null;
}
