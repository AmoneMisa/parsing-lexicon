import { LOCATION_DICTIONARIES } from './locations-runtime.js';
import { LOCATION_LIST_KEYS } from './location-merge.js';
import { CITIES_BY_COUNTRY, canonicalCity } from './geography.js';
import { aliasesOf, aliasesToRegex, normalizeForMatch } from './normalization.js';
import { KZ_AMBIGUOUS_LOCAL_NAMES, KZ_SEARCH_CLUSTERS } from './kz-location-extensions.js';
import { UZ_AMBIGUOUS_LOCAL_NAMES } from './uz-location-extensions.js';

// Compatibility names retained for consumers. The canonical dictionaries are
// assembled once in the public runtime registry; matcher layers must consume, not re-merge.
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
  developmentAreas: 'development_area',
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

const CONTEXT_PATTERNS = Object.freeze({
  metro: Object.freeze({
    before: /(?:метро|metro|станц(?:ия|ии)?|station|ст\.?\s*м\.?)\s*[:\-–—]?\s*$/iu,
    after: /^\s*[:\-–—]?\s*(?:метро|metro|станц(?:ия|ии)?|station)(?=$|[^\p{L}\p{N}_])/iu,
    inside: /(?:метро|metro|станц(?:ия|ии)?|station)/iu,
  }),
  district: Object.freeze({
    before: /(?:район|р-н|рн|туман\p{L}{0,4}|tumani|district)\s*[:\-–—]?\s*$/iu,
    after: /^\s*[:\-–—]?\s*(?:район|р-н|рн|туман\p{L}{0,4}|tumani|district)(?=$|[^\p{L}\p{N}_])/iu,
  }),
  mahalla: Object.freeze({
    before: /(?:махалл(?:а|я)|маҳалла(?:си)?|mahalla(?:si)?|mfy|мфй)\s*[:\-–—]?\s*$/iu,
    after: /^\s*[:\-–—]?\s*(?:махалл(?:а|я)|маҳалла(?:си)?|mahalla(?:si)?|mfy|мфй)(?=$|[^\p{L}\p{N}_])/iu,
  }),
  microdistrict: Object.freeze({
    before: /(?:массив(?:и)?|massiv(?:i)?|жилмассив|ж\/м|микрорайон|мкр\.?|mavze(?:si)?|мавзе(?:си)?|квартал|kvartal|daha|даха|даҳа)\s*[:\-–—]?\s*$/iu,
    after: /^\s*(?:\d{1,2}[aа]?\s*)?[:\-–—]?\s*(?:массив(?:и)?|massiv(?:i)?|жилмассив|ж\/м|микрорайон|мкр\.?|mavze(?:si)?|мавзе(?:си)?|квартал|kvartal|daha|даха|даҳа)(?=$|[^\p{L}\p{N}_])/iu,
  }),
  local_area: Object.freeze({
    before: /(?:массив(?:и)?|massiv(?:i)?|жилмассив|ж\/м|микрорайон|мкр\.?|mavze(?:si)?|мавзе(?:си)?|квартал|kvartal|daha|даха|даҳа|зона|area)\s*[:\-–—]?\s*$/iu,
    after: /^\s*(?:\d{1,2}[aа]?\s*)?[:\-–—]?\s*(?:массив(?:и)?|massiv(?:i)?|жилмассив|ж\/м|микрорайон|мкр\.?|mavze(?:si)?|мавзе(?:си)?|квартал|kvartal|daha|даха|даҳа|зона|area)(?=$|[^\p{L}\p{N}_])/iu,
  }),
  development_area: Object.freeze({
    before: /(?:(?:международн\p{L}*|international)\s+)?(?:бизнес[-\s]?центр|делов\p{L}*\s+центр|business\s+cent(?:er|re)|development\s+area|mixed[-\s]?use\s+(?:district|development))\s*[:\-–—]?\s*$/iu,
    after: /^\s*[:\-–—]?\s*(?:(?:международн\p{L}*|international)\s+)?(?:бизнес[-\s]?центр|делов\p{L}*\s+центр|business\s+cent(?:er|re)|development\s+area|mixed[-\s]?use\s+(?:district|development))(?=$|[^\p{L}\p{N}_])/iu,
  }),
  residential_complex: Object.freeze({
    before: /(?:жк|жилой\s+комплекс|residential\s+complex|residence|turar\s+joy\s+majmuasi|tjm)\s*[:\-–—]?\s*$/iu,
    after: /^\s*[:\-–—]?\s*(?:жк|жилой\s+комплекс|residential\s+complex|residence|turar\s+joy\s+majmuasi|tjm)(?=$|[^\p{L}\p{N}_])/iu,
  }),
  street: Object.freeze({
    before: /(?:улица|ул\.?|street|st\.?|ko['’ʻ]?cha(?:si)?|кўча(?:си)?)\s*[:\-–—]?\s*$/iu,
    after: /^\s*[:\-–—]?\s*(?:улица|ул\.?|street|st\.?|ko['’ʻ]?cha(?:si)?|кўча(?:си)?)(?=$|[^\p{L}\p{N}_])/iu,
  }),
  poi: Object.freeze({
    before: /(?:базар|рынок|bozor(?:i)?|мечет\p{L}*|масжид|masjid|mosque|парк|park|mall|молл|трц|тц|вокзал|аэропорт|airport|университет|university)\s*[:\-–—]?\s*$/iu,
    after: /^\s*[:\-–—]?\s*(?:базар|рынок|bozor(?:i)?|мечет\p{L}*|масжид|masjid|mosque|парк|park|mall|молл|трц|тц|вокзал|аэропорт|airport|университет|university)(?=$|[^\p{L}\p{N}_])/iu,
  }),
});

function hasExplicitContext(value, candidate) {
  const pattern = CONTEXT_PATTERNS[candidate.type];
  if (!pattern) return false;
  const before = value.slice(Math.max(0, candidate.start - 40), candidate.start);
  const after = value.slice(candidate.end, Math.min(value.length, candidate.end + 40));
  return pattern.before.test(before) || pattern.after.test(after) || Boolean(pattern.inside?.test(candidate.matchedText));
}

function overlaps(a, b) {
  return a.start < b.end && b.start < a.end;
}

function containsSpan(outer, inner) {
  return outer.start <= inner.start && outer.end >= inner.end;
}

const SEMANTIC_CHAR_RE = /[\p{L}\p{N}_]/u;
function semanticBounds(value, match) {
  let start = match.index ?? 0;
  let end = start + match[0].length;
  while (start < end && !SEMANTIC_CHAR_RE.test(value[start])) start += 1;
  while (end > start && !SEMANTIC_CHAR_RE.test(value[end - 1])) end -= 1;
  return { start, end };
}

const NUMBERED_LOCAL_AREA_NAME_RE = /(?:^|[-–—/\s])\d{1,2}[aа]?(?=$|[^\p{L}\p{N}_])/iu;
const NUMBERED_CHILD_SUFFIX_RE = /^\s*[-–—/]\s*\d{1,2}[aа]?(?=$|[^\p{L}\p{N}_])/iu;

function isUmbrellaAreaPrefixOfNumberedBlock(value, candidate) {
  if (candidate.type !== 'local_area') return false;
  if (NUMBERED_LOCAL_AREA_NAME_RE.test(String(candidate.name || ''))) return false;
  return NUMBERED_CHILD_SUFFIX_RE.test(value.slice(candidate.end));
}

const RESIDENTIAL_MARKER_TEXT = String.raw`(?:ж\.?\s*к\.?|жил(?:ой|ого)?\s+комплекс\p{L}*|residential\s+complex|turar\s+joy\s+majmuasi|tjm)`;
const residentialMarkedAliasCache = new WeakMap();

function stripResidentialMarker(value) {
  return String(value || '')
    .replace(new RegExp(`^\\s*${RESIDENTIAL_MARKER_TEXT}\\s*[:\\-–—]?\\s*`, 'iu'), '')
    .replace(new RegExp(`\\s*${RESIDENTIAL_MARKER_TEXT}\\s*$`, 'iu'), '')
    .trim();
}

function residentialMarkedAliasRegex(item) {
  if (residentialMarkedAliasCache.has(item)) return residentialMarkedAliasCache.get(item);
  const aliases = [...new Set([item?.name, ...(item?.aliases || [])]
    .map(stripResidentialMarker)
    .filter(Boolean))];
  const re = aliases.length ? aliasesToRegex(aliases) : null;
  residentialMarkedAliasCache.set(item, re);
  return re;
}

function markedResidentialMatch(value, item) {
  const aliasRe = residentialMarkedAliasRegex(item);
  if (!aliasRe) return null;
  const markerRe = new RegExp(`(?:^|[^\\p{L}\\p{N}_])${RESIDENTIAL_MARKER_TEXT}\\s*[:\\-–—]?\\s*`, 'giu');
  for (const marker of value.matchAll(markerRe)) {
    const tailStart = (marker.index ?? 0) + marker[0].length;
    const tail = value.slice(tailStart, Math.min(value.length, tailStart + 96));
    const aliasMatch = tail.match(aliasRe);
    if (!aliasMatch) continue;
    const offset = aliasMatch.index ?? 0;
    if (offset > 0 && /\S/u.test(tail.slice(0, offset))) continue;
    return { 0: aliasMatch[0], index: tailStart + offset };
  }
  return null;
}

const LOCATION_CLAUSE_BOUNDARY_RE = /[\n\r.!?;|]/u;
const PRIMARY_LOCATION_PREFIX_RE = /(?:(?:^|[^\p{L}\p{N}_])(?:адрес|локаци(?:я|и)|расположени(?:е|я)|находится)\s*[:\-–—]?\s*|(?:^|[^\p{L}\p{N}_])(?:в|на)\s+(?:(?:ж\.?\s*к\.?|жил(?:ом|ой)\s+комплекс\p{L}*|микрорайон\p{L}*|мкр\.?|массив\p{L}*|махалл\p{L}*|mahalla|massiv|district|район\p{L}*|metro|метро)\s*)?)$/iu;
const NEARBY_LOCATION_PREFIX_RE = /(?:^|[^\p{L}\p{N}_])(?:до|около|возле|рядом(?:\s+(?:с|со))?|недалеко\s+от|неподал[её]ку\s+от|вблизи|напротив|ориентир(?:ом)?|near|nearby|close\s+to|next\s+to|opposite|landmark|yaqin(?:ida)?|yonida|mo['’ʻ]?ljal|яқин(?:ида)?|ёнида|мўлжал|жақын|жанында|маңында)(?=$|[^\p{L}\p{N}_])[\s\S]{0,96}$/iu;
const DISTANCE_LOCATION_PREFIX_RE = /(?:\d+(?:[.,]\d+)?\s*(?:мин(?:ут\p{L}*)?|min(?:ute)?s?|daqiqa|м|m|метр\p{L}*|км|km)\s*(?:от|до|from|to)\s+)[\s\S]{0,80}$/iu;
const NEARBY_LOCATION_SUFFIX_RE = /^\s*(?:[-—–:]\s*)?(?:(?:\d+(?:[.,]\d+)?\s*(?:мин(?:ут\p{L}*)?|min(?:ute)?s?|daqiqa|м|m|метр\p{L}*|км|km))|(?:рядом|поблизости|nearby|yaqin(?:ida)?|яқин(?:ида)?|жақын))(?=$|[^\p{L}\p{N}_])/iu;

function clauseStart(value, start) {
  for (let index = start - 1; index >= 0; index -= 1) {
    if (LOCATION_CLAUSE_BOUNDARY_RE.test(value[index])) return index + 1;
  }
  return 0;
}

function clauseEnd(value, end) {
  for (let index = end; index < value.length; index += 1) {
    if (LOCATION_CLAUSE_BOUNDARY_RE.test(value[index])) return index;
  }
  return value.length;
}

function locationMentionRole(value, candidate) {
  const start = clauseStart(value, candidate.start);
  const end = clauseEnd(value, candidate.end);
  const before = value.slice(start, candidate.start);
  const after = value.slice(candidate.end, end);

  // A direct subject marker later in the same clause wins over an unrelated
  // earlier temporal "до": "до пятницы квартира в ЖК X" is still ЖК X itself.
  if (PRIMARY_LOCATION_PREFIX_RE.test(before)) return 'primary';
  if (NEARBY_LOCATION_PREFIX_RE.test(before) || DISTANCE_LOCATION_PREFIX_RE.test(before) || NEARBY_LOCATION_SUFFIX_RE.test(after)) {
    return 'nearby';
  }
  return 'mentioned';
}

function publicMatch(candidate) {
  const { start, end, matchedText, explicitContext, ...result } = candidate;
  return Object.freeze(result);
}

function findEntryMatches(text, cityName, data) {
  const value = String(text || '');
  const raw = [];
  for (const key of LOCATION_LIST_KEYS) {
    for (const item of data?.[key] || []) {
      const match = value.match(item?.re)
        || (key === 'residentialComplexes' ? markedResidentialMatch(value, item) : null);
      if (!match) continue;
      const { start, end } = semanticBounds(value, match);
      const candidate = {
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
        start,
        end,
        matchedText: value.slice(start, end),
        explicitContext: false,
        role: 'mentioned',
      };
      if (isUmbrellaAreaPrefixOfNumberedBlock(value, candidate)) continue;
      candidate.explicitContext = hasExplicitContext(value, candidate);
      candidate.role = locationMentionRole(value, candidate);
      raw.push(candidate);
    }
  }

  const filtered = raw.filter((candidate) => {
    const peers = raw.filter((other) => other !== candidate && overlaps(candidate, other));
    if (candidate.explicitContext) return true;

    // An explicit type marker is stronger than a same-surface alias of another type:
    // "метро Минор" is a station, while "Минор махалла" is the mahalla.
    if (peers.some((peer) => peer.explicitContext && peer.type !== candidate.type)) return false;

    // Prefer the semantically longer phrase when one alias contains another, e.g.
    // "Сергели машинный базар" over the bare district/metro token "Сергели".
    const length = candidate.end - candidate.start;
    if (peers.some((peer) => containsSpan(peer, candidate) && (peer.end - peer.start) > length)) return false;

    // Bare station names that are also real neighborhoods/mahallas/districts are
    // not enough to assert metro semantics. Explicit metro context restores them.
    if (candidate.type === 'metro' && peers.some((peer) =>
      ['district', 'microdistrict', 'mahalla', 'local_area'].includes(peer.type)
    )) return false;

    return true;
  });

  return filtered.map(publicMatch);
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
