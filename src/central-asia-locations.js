import { LOCATION_DICTIONARIES } from './locations.js';
import { LOCATION_LIST_KEYS } from './location-merge.js';
import { CITIES_BY_COUNTRY, canonicalCity } from './geography.js';
import { aliasesOf, aliasesToRegex, normalizeForMatch } from './normalization.js';
import { KZ_AMBIGUOUS_LOCAL_NAMES, KZ_SEARCH_CLUSTERS } from './kz-location-extensions.js';
import { UZ_AMBIGUOUS_LOCAL_NAMES } from './uz-location-extensions.js';

// Compatibility names retained for consumers. The canonical dictionaries are
// assembled once in locations.js; matcher layers must consume, not re-merge.
export const KZ_EXPANDED_LOCATION_DICTIONARIES = LOCATION_DICTIONARIES.KZ || Object.freeze({});
export const UZ_EXPANDED_LOCATION_DICTIONARIES = LOCATION_DICTIONARIES.UZ || Object.freeze({});

export const CENTRAL_ASIA_LOCATION_DICTIONARIES = Object.freeze({
  KZ: KZ_EXPANDED_LOCATION_DICTIONARIES,
  UZ: UZ_EXPANDED_LOCATION_DICTIONARIES,
});

const TYPE_BY_KEY = Object.freeze({
  districts: 'district',
  microdistricts: 'microdistrict',
  mahallas: 'mahalla',
  localAreas: 'local_area',
  suburbs: 'suburb',
  settlements: 'settlement',
  metro: 'metro',
  residentialComplexes: 'residential_complex',
  streets: 'street',
  landmarks: 'poi',
  pois: 'poi',
  searchClusters: 'search_cluster',
});

const GENERIC_AMBIGUOUS = new Set([
  'center', 'old city', 'new city', 'airport', 'railway station area', 'university area',
  'central park', 'embankment', 'bazaar', 'market', 'north', 'east', 'south west',
]);

const KZ_AMBIGUOUS = new Set(KZ_AMBIGUOUS_LOCAL_NAMES.map(normalizeForMatch));
const UZ_AMBIGUOUS = new Set(UZ_AMBIGUOUS_LOCAL_NAMES.map(normalizeForMatch));

function cityCatalog(countryCode) {
  return CITIES_BY_COUNTRY[countryCode] || [];
}

function dictionaries(countryCode) {
  return CENTRAL_ASIA_LOCATION_DICTIONARIES[countryCode] || {};
}

const cityRegexCache = new Map();
function cityRegex(item) {
  const key = `${item.country}:${item.canonical}`;
  if (!cityRegexCache.has(key)) {
    cityRegexCache.set(key, aliasesToRegex([item.canonical, ...aliasesOf(item)]));
  }
  return cityRegexCache.get(key);
}

function explicitCityFromText(text, countryCode) {
  const value = String(text || '');
  const matches = [];
  for (const item of cityCatalog(countryCode)) {
    const match = value.match(cityRegex(item));
    if (!match) continue;
    if (item.contextRequired) {
      const start = match.index || 0;
      const before = value.slice(Math.max(0, start - 40), start);
      const after = value.slice(start + match[0].length, start + match[0].length + 48);
      if (!/(?:shahri|город|viloyati|область|andijon|андижан)/iu.test(`${before} ${after}`)) continue;
    }
    matches.push({ item, length: normalizeForMatch(match[0]).length });
  }
  matches.sort((a, b) => b.length - a.length);
  return matches[0]?.item?.canonical || null;
}

function isExplicitMetroContext(value, match) {
  const start = match.index ?? 0;
  const end = start + match[0].length;
  const before = value.slice(Math.max(0, start - 36), start);
  const after = value.slice(end, end + 36);
  return /(?:метро|metro|станц(?:ия|ии)?|station|ст\.?\s*м\.?|м\.)\s*[:\-–—]?\s*$/iu.test(before)
    || /^\s*(?:метро|metro|station|станц(?:ия|ии)?)(?=$|[^\p{L}\p{N}_])/iu.test(after);
}

function metroOverlapsArea(item, data) {
  const itemKeys = new Set([item.name, ...(item.aliases || [])].map(normalizeForMatch).filter(Boolean));
  return ['microdistricts', 'localAreas'].some((key) => (data?.[key] || []).some((area) =>
    [area.name, ...(area.aliases || [])].map(normalizeForMatch).some((value) => itemKeys.has(value)),
  ));
}

function findEntryMatches(text, cityName, data) {
  const value = String(text || '');
  const matches = [];
  for (const key of LOCATION_LIST_KEYS) {
    for (const item of data?.[key] || []) {
      const match = value.match(item?.re);
      if (!match) continue;
      if (key === 'metro' && metroOverlapsArea(item, data) && !isExplicitMetroContext(value, match)) continue;
      matches.push(Object.freeze({
        country: item.country || null,
        city: cityName,
        type: item.entityType || TYPE_BY_KEY[key] || key,
        key,
        name: item.name,
        aliases: item.aliases || [],
        district: item.district || null,
        parent: item.parent || item.district || null,
        confidence: item.confidence || null,
        language: item.language || null,
      }));
    }
  }
  return matches;
}

function isAmbiguousMatch(match, countryCode) {
  const keys = [match.name, ...(match.aliases || [])].map(normalizeForMatch).filter(Boolean);
  if (keys.some((key) => GENERIC_AMBIGUOUS.has(key))) return true;
  if (countryCode === 'KZ' && keys.some((key) => KZ_AMBIGUOUS.has(key))) return true;
  if (countryCode === 'UZ' && keys.some((key) => UZ_AMBIGUOUS.has(key))) return true;
  return false;
}

function clusterMatches(matches, countryCode) {
  if (countryCode !== 'KZ') return [];
  const names = new Set(matches.map((item) => normalizeForMatch(item.name)));
  return KZ_SEARCH_CLUSTERS.filter((cluster) => cluster.members.some((member) => names.has(normalizeForMatch(member))));
}

export function centralAsiaLocationCities(countryCode) {
  return dictionaries(countryCode);
}

export function centralAsiaLocationCity(countryCode, city) {
  const canonical = canonicalCity(city, countryCode) || city;
  return dictionaries(countryCode)[canonical] || null;
}

export function matchCentralAsiaLocationEntities(text, countryCode, preferredCity = null) {
  if (!text || !['KZ', 'UZ'].includes(countryCode)) {
    return Object.freeze({ city: null, matches: Object.freeze([]), searchClusters: Object.freeze([]), candidates: Object.freeze([]) });
  }

  const country = dictionaries(countryCode);
  const preferred = canonicalCity(preferredCity, countryCode) || preferredCity;
  const explicit = explicitCityFromText(text, countryCode);
  const scopedCity = preferred && country[preferred] ? preferred : explicit && country[explicit] ? explicit : null;

  if (scopedCity) {
    const matches = findEntryMatches(text, scopedCity, country[scopedCity]);
    const clusters = clusterMatches(matches, countryCode);
    return Object.freeze({ city: scopedCity, matches: Object.freeze(matches), searchClusters: Object.freeze(clusters), candidates: Object.freeze([]) });
  }

  const byCity = [];
  for (const [cityName, data] of Object.entries(country)) {
    const matches = findEntryMatches(text, cityName, data);
    if (matches.length) byCity.push({ city: cityName, matches });
  }

  if (!byCity.length) {
    return Object.freeze({ city: null, matches: Object.freeze([]), searchClusters: Object.freeze([]), candidates: Object.freeze([]) });
  }

  // Numeric microdistricts and common names such as Samal/Center occur in many
  // cities. Without an explicit/structured city we must not silently assign a
  // parent. Prefer a city only when it owns at least one non-ambiguous match
  // that no other city matched.
  const strong = byCity.filter((candidate) => candidate.matches.some((match) => !isAmbiguousMatch(match, countryCode)));
  const selected = strong.length === 1
    ? strong[0]
    : byCity.length === 1 && byCity[0].matches.some((match) => !isAmbiguousMatch(match, countryCode))
      ? byCity[0]
      : null;

  if (!selected) {
    return Object.freeze({
      city: null,
      matches: Object.freeze([]),
      searchClusters: Object.freeze([]),
      candidates: Object.freeze(byCity.map((candidate) => Object.freeze({ city: candidate.city, matches: Object.freeze(candidate.matches) }))),
    });
  }

  const clusters = clusterMatches(selected.matches, countryCode);
  return Object.freeze({ city: selected.city, matches: Object.freeze(selected.matches), searchClusters: Object.freeze(clusters), candidates: Object.freeze([]) });
}

export function matchCentralAsiaLocationEntity(text, countryCode, preferredCity = null, type = null) {
  const result = matchCentralAsiaLocationEntities(text, countryCode, preferredCity);
  return result.matches.find((item) => !type || item.type === type || item.key === type) || null;
}
