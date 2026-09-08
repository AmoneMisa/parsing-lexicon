import {
  TASHKENT_NUMBERED_AREA_ALIASES,
  matchTashkentHousingDistrict,
  matchTashkentHousingMetro,
  matchTashkentNumberedArea,
} from './tashkent-housing-geography.js';

const PHONE_RUN_RE = /\+?\d[\d\s().-]{7,}\d/gu;
const ADDRESS_LABEL_RE = /(?:адрес|адреса|адресація|адресация|manzil|address|adresă|adresa)\s*[:=\-–—]\s*/iu;
const PREFIX_STREET_MARKER = String.raw`(?:(?:ул(?:ица)?|вул(?:иця)?|пр|просп(?:ект)?|пр-т|переул(?:ок)?|пров(?:улок)?|проезд|наб(?:ережная)?|шоссе|str(?:ada)?|street|st|avenue|ave|road|rd|көше)\.?)`;
const POSTFIX_STREET_MARKER = String.raw`(?:ko['’ʼ\u02bc]?cha(?:si)?|кўча(?:си)?|коча(?:си)?|kocha(?:si)?|көше(?:сі)?|көшесі|көчө(?:сү)?)`;
const POSTFIX_STREET_TYPE = String.raw`(?:вулиця|улица|провулок|переулок|проспект|бульвар|набережна|набережная|шосе|шоссе|площа|площадь|узвіз|спуск|алея|аллея|дорога|тупик|көше(?:сі)?|көшесі|көчө(?:сү)?)`;
const HOUSE_MARKER = String.raw`(?:дом|д\.|будинок|буд\.|house|h\.|uy|уй|үй|nr\.?|no\.?|№)`;
const BUILDING_MARKER = String.raw`(?:корп(?:ус)?\.?|к\.|строен(?:ие)?|стр\.|будова|секц(?:ия|ія)?|bloc|corp|building|bldg\.?|korpus|bino|bina|бино)`;
const NUMBER_TOKEN = String.raw`\d{1,5}(?:[-\/]?[\p{L}]\d{0,4})?(?:[\/-]\d{1,4}(?:[-\/]?[\p{L}]\d{0,4})?){0,2}`;
const STREET_WORD = String.raw`[\p{L}'’.-]{2,48}`;
const SECONDARY_TOKEN = String.raw`(?:${NUMBER_TOKEN}|[\p{L}])`;
const LEVEL_NUMBER_TOKEN = String.raw`\d{1,3}(?:[-–—]?(?:й|ый|ий|st|nd|rd|th))?`;
const LEVEL_MARKER = String.raw`(?:этаж(?:е|у|ом)?|поверх(?:у|е|ом)?|floor|qavat(?:da)?|қабат(?:та)?|кават|қават|etaj(?:da|ul)?)`;
const ENTRANCE_MARKER = String.raw`(?:подъезд|під['’ʼ\u02bc]?їзд|entrance|intrare|kirish|кіреберіс|кире\s+бериш)`;
const STAIRCASE_MARKER = String.raw`(?:лестниц(?:а|ы)?|сходи|staircase|scara)`;
const ADDRESS_FIELD_STOP_RE = /\s+(?:цена|ціна|нарх(?:и)?|narx|price|стоимост[ьи]|этаж(?:ность)?|поверх|qavat|қабат|кават|қават|комнат(?:ы|а)?|кімнат(?:и|а)?|xona|хона|площадь|площа|maydon|тел(?:ефон)?|phone|комисси\p{L}*|депозит|deposit|ориентир\p{L}*|ор[-–—]?р\.?)(?=$|[\s:№#-])/iu;
const PROPERTY_AREA_LINE_RE = /(?:^|[^\p{L}\p{N}_])(?:(?:общая|жилая|полезная|кухонная)\s+площадь|площадь\s+(?:квартиры|дома|комнаты))(?=$|[^\p{L}\p{N}_])/iu;
const NON_ADDRESS_BARE_RE = /^(?:(?:(?:перш(?:ий|ому)|перв(?:ый|ом)|друг(?:ий|ому)|втор(?:ой|ом)|трет(?:ій|ьем|ий)|\d{1,3}(?:-?й)?)\s+(?:поверх|этаж|floor|qavat|қабат))|(?:поверх|этаж|floor|qavat|қабат)(?:\s|$)|(?:район|р-н|рн|мікрорайон|микрорайон|мкр\.?|жк|ж\.к\.|жилой\s+комплекс|житловий\s+комплекс|residential\s+complex)(?:\s|$)|(?:недалеко|поруч|рядом|біля|около|возле)(?=$|[^\p{L}\p{N}_])|(?:зупинка|остановка|станція|станция)(?:\s|$))/iu;
const DELIMITED_STREET_REJECT_RE = /(?:^|\s)(?:город|місто|city|район|р-н|рн|мікрорайон|микрорайон|мкр|жк|метро|поверх|этаж|floor|qavat|кімнат\p{L}*|комнат\p{L}*|квартира|квартири|квартиры|оренда|аренда|продаж\p{L}*|цена|ціна|площад\p{L}*|площа|зупинка|остановка|ориентир\p{L}*|ор[-–—]?р\.?)(?:\s|$)/iu;
const UNIT_COMPONENT_PATTERNS = Object.freeze([
  String.raw`(?:^|[\s,;])(?:кв\.?|кв-ра)(?!\p{L})\s*(?:№|#)?\s*(${SECONDARY_TOKEN})(?=$|[^\p{L}\p{N}])`,
  String.raw`(?:^|[\s,;])квартира\s*(?:№|#)\s*(${SECONDARY_TOKEN})(?=$|[^\p{L}\p{N}])`,
  String.raw`(?:^|[\s,;])(?:apt\.?|ap\.?|unit)(?!\p{L})\s*(?:no\.?|nr\.?|№|#)?\s*(${SECONDARY_TOKEN})(?=$|[^\p{L}\p{N}])`,
  String.raw`(?:^|[\s,;])apartament(?:ul)?\s*(?:nr\.?|№|#)\s*(${SECONDARY_TOKEN})(?=$|[^\p{L}\p{N}])`,
  String.raw`(?:^|[\s,;])xonadon\s*(?:№|#)\s*(${SECONDARY_TOKEN})(?=$|[^\p{L}\p{N}])`,
]);
const LEVEL_COMPONENT_PATTERNS = Object.freeze([
  String.raw`(?:^|[\s,;])(${LEVEL_NUMBER_TOKEN})\s+${LEVEL_MARKER}(?!\p{L})(?=$|[^\p{L}\p{N}])`,
  String.raw`(?:^|[\s,;])${LEVEL_MARKER}(?!\p{L})\s*(${LEVEL_NUMBER_TOKEN})(?=$|[^\p{L}\p{N}])`,
]);
const ENTRANCE_COMPONENT_PATTERNS = Object.freeze([
  String.raw`(?:^|[\s,;])${ENTRANCE_MARKER}(?!\p{L})\s*(?:№|#)?\s*(${SECONDARY_TOKEN})(?=$|[^\p{L}\p{N}])`,
  String.raw`(?:^|[\s,;])(${SECONDARY_TOKEN})\s+${ENTRANCE_MARKER}(?!\p{L})(?=$|[^\p{L}\p{N}])`,
]);
const STAIRCASE_COMPONENT_PATTERNS = Object.freeze([
  String.raw`(?:^|[\s,;])${STAIRCASE_MARKER}(?!\p{L})\s*(?:№|#)?\s*(${SECONDARY_TOKEN})(?=$|[^\p{L}\p{N}])`,
  String.raw`(?:^|[\s,;])(${SECONDARY_TOKEN})\s+${STAIRCASE_MARKER}(?!\p{L})(?=$|[^\p{L}\p{N}])`,
]);
const SECONDARY_COMPONENT_PATTERNS = Object.freeze([
  ...UNIT_COMPONENT_PATTERNS,
  ...LEVEL_COMPONENT_PATTERNS,
  ...ENTRANCE_COMPONENT_PATTERNS,
  ...STAIRCASE_COMPONENT_PATTERNS,
]);
const ADDRESS_TOKEN_RE = /\r\n|\r|\n|\d+(?:[\/-]\d+)?(?:[-\/]?[\p{L}])?|[\p{L}]+(?:['’ʼ\u02bc.-][\p{L}]+)*|[,;:#№()]|[^\s]/gu;

function clean(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(PHONE_RUN_RE, (segment) => segment.replace(/\D/gu, '').length >= 9 ? ' ' : segment)
    .replace(/[\t\f\v]+/gu, ' ')
    .replace(/\s{2,}/gu, ' ')
    .replace(/^[\s,;:.\-–—]+|[\s,;:.\-–—]+$/gu, '')
    .trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function compactStreet(value) {
  return clean(value)
    // The bare abbreviations in PREFIX_STREET_MARKER (e.g. "пр" for "пр-т")
    // must not be followed by a letter, or this would strip a false-positive
    // prefix off an unrelated word that merely starts the same way (e.g.
    // "проживания" -> "оживания").
    .replace(new RegExp(`^${PREFIX_STREET_MARKER}(?!\\p{L})\\s*`, 'iu'), '')
    .replace(new RegExp(`\\s+${POSTFIX_STREET_MARKER}$`, 'iu'), '')
    // OCR frequently substitutes “оя” for the Ukrainian/Russian “ля” in
    // “шлях”; correct the street-token typo before canonical lookup.
    .replace(/(?<!\p{L})шоях(?!\p{L})/giu, 'шлях')
    // Listings commonly abbreviate this Kharkiv street to an initial and
    // surname; expand it so address-only consumers do not retain just “Л”.
    .replace(/(?<!\p{L})л\s*\.\s*малой(?!\p{L})/giu, 'Любови Малой')
    .replace(/[\s,;:.\-–—]+$/gu, '')
    .trim() || null;
}

function normalizeNumber(value) {
  const result = clean(value).replace(/\s+/gu, '');
  return result || null;
}

function normalizeLevel(value) {
  return normalizeNumber(value)?.replace(/[-–—]?(?:й|ый|ий|st|nd|rd|th)$/iu, '') || null;
}

function tokenizeAddress(value) {
  const text = String(value ?? '').normalize('NFKC');
  const tokens = [];
  for (const match of text.matchAll(ADDRESS_TOKEN_RE)) {
    const raw = match[0];
    const type = /^[\r\n]+$/u.test(raw)
      ? 'newline'
      : /^[,;:#№()]$/u.test(raw)
        ? 'delimiter'
        : /^\d/u.test(raw)
          ? 'number'
          : /^\p{L}/u.test(raw)
            ? 'word'
            : 'symbol';
    tokens.push(Object.freeze({ type, value: raw, index: match.index ?? 0 }));
  }
  return Object.freeze(tokens);
}

function componentMatch(value, patterns, normalize = normalizeNumber) {
  const text = String(value ?? '').normalize('NFKC');
  for (const pattern of patterns) {
    const match = text.match(new RegExp(pattern, 'iu'));
    if (match?.[1]) return normalize(match[1]);
  }
  return null;
}

function extractSecondaryComponents(value) {
  const components = {
    unit: componentMatch(value, UNIT_COMPONENT_PATTERNS),
    level: componentMatch(value, LEVEL_COMPONENT_PATTERNS, normalizeLevel),
    entrance: componentMatch(value, ENTRANCE_COMPONENT_PATTERNS),
    staircase: componentMatch(value, STAIRCASE_COMPONENT_PATTERNS),
  };
  return Object.freeze(components);
}

function stripSecondaryComponents(value) {
  let text = String(value ?? '').normalize('NFKC');
  for (const pattern of SECONDARY_COMPONENT_PATTERNS) {
    text = text.replace(new RegExp(pattern, 'giu'), ' ');
  }
  return clean(text);
}

function normalizedSecondaryComponents(components = {}) {
  const result = {};
  const unit = normalizeNumber(components.unit);
  const level = normalizeLevel(components.level);
  const entrance = normalizeNumber(components.entrance);
  const staircase = normalizeNumber(components.staircase);
  if (unit) result.unit = unit;
  if (level) result.level = level;
  if (entrance) result.entrance = entrance;
  if (staircase) result.staircase = staircase;
  return result;
}

function scoreAddressConfidence(value, evidence = {}) {
  const tokens = tokenizeAddress(value);
  const hasDelimiter = tokens.some((token) => token.type === 'delimiter' || token.type === 'newline');
  const sourceStrength = Object.freeze({ structured: 0.8, known: 0.6, delimited: 0.5, bare: 0.35 });
  let score = sourceStrength[evidence.source] ?? 0.66;

  // Positive evidence accumulates independently. A parser path provides a
  // useful prior, but it cannot by itself produce a high-confidence address.
  if (evidence.hasStreetMarker) score += 0.22;
  if (evidence.hasKnownStreet) score += 0.22;
  if (evidence.hasHouse) score += evidence.source === 'bare' ? 0.5 : evidence.source === 'delimited' ? 0.3 : evidence.source === 'known' ? 0.16 : 0.2;
  if (evidence.source === 'delimited' && hasDelimiter) score += 0.12;
  if (evidence.hasGeo) score += 0.06;
  if (evidence.hasAddressLabel) score += 0.12;

  // Free-text candidates often contain an address-shaped numeric fragment in
  // a price/contact/marketing sentence. Apply negative evidence only where a
  // strong structural marker has not already established the address.
  const requiresNoiseGuard = evidence.source === 'bare' || evidence.source === 'delimited'
    || (!evidence.hasStreetMarker && !evidence.hasKnownStreet && evidence.source !== 'structured');
  if (requiresNoiseGuard) {
    const text = String(value ?? '');
    if (/(?:цена|ціна|нарх(?:и)?|narx|price|стоимост|аренд|rent)/iu.test(text)) score -= 0.12;
    if (/(?:тел(?:ефон)?|phone|contact|whatsapp|telegram)/iu.test(text)) score -= 0.18;
    if (/(?:этаж|поверх|floor|qavat|қабат)/iu.test(text)) score -= 0.1;
    if (/(?:комнат|кімнат|xona|хона|room)/iu.test(text)) score -= 0.08;
    if (tokens.filter((token) => token.type === 'number').length > 4) score -= 0.08;
    if (/(?:акция|скидк|sale|срочно|luxury|элит|новострой)/iu.test(text)) score -= 0.05;
  }

  return Math.min(1, Math.max(0, Number(score.toFixed(2))));
}

function result(address, street = null, houseNumber = null, building = null, confidence = 0, components = null) {
  const normalizedStreet = compactStreet(street);
  const normalizedHouseNumber = normalizeNumber(houseNumber);
  const compactBuilding = normalizedHouseNumber?.match(/^(\d{1,5})(?:к|k)(\d{1,4})$/iu);
  const normalizedBuilding = normalizeNumber(building) || compactBuilding?.[2] || null;
  // `address` is a geocoding-compatible street/house value, never a fallback
  // copy of a whole labelled listing line.  Districts, metros and nearby POIs
  // are preserved as independent components by the caller.
  const canonicalAddress = normalizedStreet
    ? composeHousingAddress({ street: normalizedStreet, houseNumber: compactBuilding ? compactBuilding[1] : normalizedHouseNumber, building: normalizedBuilding })
    : null;
  return Object.freeze({
    address: canonicalAddress,
    street: normalizedStreet,
    houseNumber: compactBuilding ? compactBuilding[1] : normalizedHouseNumber,
    building: normalizedBuilding,
    confidence,
    ...normalizedSecondaryComponents(components || {}),
  });
}

function attachSecondaryComponents(parsed, components) {
  if (!parsed || (!parsed.address && !parsed.street && !parsed.houseNumber && !parsed.district)) return parsed;
  const normalized = normalizedSecondaryComponents(components);
  if (Object.keys(normalized).length === 0) return parsed;
  return Object.freeze({ ...parsed, ...normalized });
}

function tashkentGeoComponents(value) {
  const text = String(value ?? '');
  const district = matchTashkentHousingDistrict(text)?.name || null;
  const metro = matchTashkentHousingMetro(text)?.name || null;
  const mahalla = text.match(/(?:^|[^\p{L}])(\p{L}[\p{L}'’ʼ-]{1,48})\s+(?:mahalla(?:si)?|маҳалла(?:си)?|махалл[ая]|mfy)(?=$|[^\p{L}])/iu)?.[1] || null;
  return Object.freeze({ district, metro, mahalla: compactStreet(mahalla) });
}

function attachGeoComponents(parsed, value) {
  const geo = tashkentGeoComponents(value);
  if (!geo.district && !geo.metro && !geo.mahalla) return parsed;
  return Object.freeze({ ...parsed, ...Object.fromEntries(Object.entries(geo).filter(([, item]) => item)) });
}

const GEO_COMPONENT_TYPES = Object.freeze({
  district: 'district',
  metro: 'metro',
  mahalla: 'mahalla',
  street: 'street',
  residentialComplex: 'residential_complex',
});

function geoScopeSlug(value) {
  return String(value || '')
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');
}

function isCompatibleGeoCatalogEntity(entity, fallback) {
  const country = String(entity.country || fallback.country || '').trim().toUpperCase();
  if (country !== fallback.country) return false;

  const entityType = String(entity.type || fallback.type || '').trim();
  if (entityType !== fallback.type) return false;

  // Geo-catalog IDs are stable country:city:type:slug references. Require the
  // returned entity to stay in the caller's city scope when one was supplied;
  // this prevents an otherwise-valid homonym from another city being attached
  // to a parsed address. The catalog, not the lexicon, remains authoritative
  // for the underlying hierarchy and coordinates.
  if (!fallback.city) return true;
  const [, entityCity] = String(entity.id || '').split(':');
  return !entityCity || entityCity === geoScopeSlug(fallback.city);
}

function geoCatalogReference(entity, fallback) {
  if (!entity || typeof entity !== 'object' || !entity.id || !isCompatibleGeoCatalogEntity(entity, fallback)) return null;
  return Object.freeze({
    id: String(entity.id),
    canonical: String(entity.canonicalName || entity.canonical || fallback.canonical),
    type: String(entity.type || fallback.type),
    country: String(entity.country || fallback.country),
    ...(entity.parentId ? { parentId: String(entity.parentId) } : {}),
  });
}

/**
 * Resolve already-parsed address components through a caller-supplied geo
 * catalog bridge. The lexicon deliberately returns only stable entity
 * references: the catalog remains the sole owner of coordinates and source
 * metadata.
 */
export function resolveHousingAddressGeoEntities(parts, options = {}) {
  const resolveGeoEntity = options.resolveGeoEntity;
  const country = String(options.country || '').trim().toUpperCase();
  const city = String(options.city || '').trim();
  if (!parts || typeof resolveGeoEntity !== 'function' || !country) return Object.freeze({});

  const resolved = {};
  for (const [component, type] of Object.entries(GEO_COMPONENT_TYPES)) {
    const canonical = parts[component];
    if (!canonical) continue;
    const input = Object.freeze({ country, ...(city ? { city } : {}), type, canonical: String(canonical) });
    const reference = geoCatalogReference(resolveGeoEntity(input), input);
    if (reference) resolved[component] = reference;
  }
  return Object.freeze(resolved);
}

function attachCatalogReferences(parsed, options) {
  const geoEntities = resolveHousingAddressGeoEntities(parsed, options);
  return Object.keys(geoEntities).length ? Object.freeze({ ...parsed, geoEntities }) : parsed;
}

function tashkentMassifHouseAddress(value) {
  const text = String(value ?? '');
  const match = text.match(
    /(?:^|[^\p{L}\p{N}_])(\d{1,2})\s+(?:mavze(?:si)?|мавзе(?:си)?)\s+(\d{1,5})\s*([\p{L}])?\s*(?:dom|дом|uy|уй)(?=$|[^\p{L}\p{N}_])/iu,
  );
  if (!match) return null;

  const quarterNumber = Number(match[1]);
  const district = Object.keys(TASHKENT_NUMBERED_AREA_ALIASES).find((canonical) => {
    const numbered = matchTashkentNumberedArea(text, canonical);
    return numbered?.number === quarterNumber;
  });
  if (!district) return null;

  const quarterMatch = matchTashkentNumberedArea(text, district);
  const suffix = match[3] ? String(match[3]).toUpperCase() : '';
  return Object.freeze({
    ...result(
      null,
      null,
      `${Number(match[2])}${suffix}`,
      null,
      scoreAddressConfidence(text, { source: 'structured', hasHouse: true }),
    ),
    district,
    quarter: Object.freeze({
      number: quarterNumber,
      suffix: quarterMatch?.suffix || '',
    }),
  });
}

function splitAddressTail(raw) {
  const text = clean(raw);
  if (!text) return null;

  const buildingRe = new RegExp(`(?:\\s*[,;]?\\s*${BUILDING_MARKER}\\s*(${NUMBER_TOKEN}))\\s*$`, 'iu');
  const buildingMatch = text.match(buildingRe);
  const building = buildingMatch?.[1] || null;
  const withoutBuilding = buildingMatch ? clean(text.slice(0, buildingMatch.index)) : text;

  const markedHouse = withoutBuilding.match(new RegExp(`^(.*?)\\s*[,;]?\\s*${HOUSE_MARKER}\\s*(${NUMBER_TOKEN})\\s*$`, 'iu'));
  if (markedHouse && /\p{L}{2,}/u.test(markedHouse[1])) {
    return { street: markedHouse[1], houseNumber: markedHouse[2], building };
  }

  const trailingHouse = withoutBuilding.match(new RegExp(`^(.*?\\p{L}.*?)\\s+(${NUMBER_TOKEN})\\s*$`, 'iu'));
  if (trailingHouse && /\p{L}{2,}/u.test(trailingHouse[1])) {
    const compactBuilding = trailingHouse[2].match(/^(\d{1,5})\s*(?:к|k)\s*(\d{1,4})$/iu);
    return compactBuilding
      ? { street: trailingHouse[1], houseNumber: compactBuilding[1], building: building || compactBuilding[2] }
      : { street: trailingHouse[1], houseNumber: trailingHouse[2], building };
  }

  return /\p{L}{2,}/u.test(withoutBuilding)
    ? { street: withoutBuilding, houseNumber: null, building }
    : null;
}

function postfixTypedStreetAddress(line) {
  const suffix = line.match(new RegExp(
    `(?:^|[^\\p{L}\\p{N}])((?:${STREET_WORD}\\s+){0,4}${STREET_WORD}\\s+${POSTFIX_STREET_TYPE})` +
      `\\s*[,;]?\\s*(${NUMBER_TOKEN})` +
      `(?:\\s*[,;]?\\s*${BUILDING_MARKER}\\s*(${NUMBER_TOKEN}))?` +
      `(?=$|[^\\p{L}\\p{N}])`,
    'iu',
  ));
  if (!suffix) return null;

  const street = suffix[1];
  const houseNumber = suffix[2];
  const building = suffix[3] || null;
  const address = composeHousingAddress({ street, houseNumber, building });
  return result(
    address,
    street,
    houseNumber,
    building,
    scoreAddressConfidence(line, { source: 'explicit', hasStreetMarker: true, hasHouse: true }),
  );
}

function prefixTypedStreetAddress(line) {
  const prefix = line.match(new RegExp(
    `(?:^|[\\s,;])${PREFIX_STREET_MARKER}\\s+` +
      `((?:${STREET_WORD}\\s+){0,4}${STREET_WORD})` +
      `\\s*[,;]?\\s*(?:${HOUSE_MARKER}\\s*)?(${NUMBER_TOKEN})` +
      `(?:\\s*[,;]?\\s*${BUILDING_MARKER}\\s*(${NUMBER_TOKEN}))?` +
      `(?=$|[^\\p{L}\\p{N}])`,
    'iu',
  ));
  if (!prefix) return null;

  const street = prefix[1];
  const houseNumber = prefix[2];
  const building = prefix[3] || null;
  const address = composeHousingAddress({ street, houseNumber, building });
  return result(
    address,
    street,
    houseNumber,
    building,
    scoreAddressConfidence(line, { source: 'explicit', hasStreetMarker: true, hasHouse: true }),
  );
}

function addressCandidateLine(line) {
  const text = String(line);
  const markerIndex = text.search(new RegExp(`${PREFIX_STREET_MARKER}|${POSTFIX_STREET_MARKER}`, 'iu'));
  const searchStart = markerIndex >= 0 ? markerIndex : 0;
  const tail = text.slice(searchStart);
  const match = tail.match(ADDRESS_FIELD_STOP_RE);
  return match ? clean(text.slice(0, searchStart + (match.index ?? 0))) : line;
}

function explicitStreetAddress(text) {
  const lines = text
    .split(/[\r\n|]/u)
    .map((part) => clean(part).slice(0, 1200))
    .filter(Boolean)
    .slice(0, 12);

  for (const rawLine of lines) {
    if (PROPERTY_AREA_LINE_RE.test(rawLine)) continue;
    const line = addressCandidateLine(rawLine);
    if (!line) continue;

    const postfixTyped = postfixTypedStreetAddress(line);
    if (postfixTyped) return postfixTyped;

    const prefixTyped = prefixTypedStreetAddress(line);
    if (prefixTyped) return prefixTyped;

    const boundedPrefix = line.match(new RegExp(
      `(?:^|[\\s,;])${PREFIX_STREET_MARKER}(?!\\p{L})\\s*((?:${STREET_WORD}\\s+){0,3}${STREET_WORD})(?=$|[,;])`,
      'iu',
    ));
    if (boundedPrefix) {
      return result(
        boundedPrefix[0],
        boundedPrefix[1],
        null,
        null,
        scoreAddressConfidence(line, { source: 'explicit', hasStreetMarker: true, hasHouse: false }),
      );
    }

    const prefix = line.match(new RegExp(`(?:^|[\\s,;])(${PREFIX_STREET_MARKER})\\s+(.+)$`, 'iu'));
    if (prefix) {
      const tail = splitAddressTail(prefix[2]);
      if (tail) {
        return result(
          line,
          tail.street,
          tail.houseNumber,
          tail.building,
          scoreAddressConfidence(line, {
            source: 'explicit',
            hasStreetMarker: true,
            hasHouse: Boolean(tail.houseNumber),
          }),
        );
      }
    }

    const postfix = line.match(new RegExp(`^(.+?)\\s+(${POSTFIX_STREET_MARKER})(.*)$`, 'iu'));
    if (postfix) {
      const tailText = clean(`${postfix[1]} ${postfix[3]}`);
      const tail = splitAddressTail(tailText);
      if (tail) {
        return result(
          line,
          tail.street,
          tail.houseNumber,
          tail.building,
          scoreAddressConfidence(line, {
            source: 'explicit',
            hasStreetMarker: true,
            hasHouse: Boolean(tail.houseNumber),
          }),
        );
      }
    }
  }

  return null;
}

function knownStreetAddress(text, knownStreet) {
  const street = compactStreet(knownStreet);
  if (!street) return null;
  const streetPattern = street.split(/\s+/u).map(escapeRegExp).join('\\s+');
  const re = new RegExp(
    `(?:^|[^\\p{L}\\p{N}])(?:${PREFIX_STREET_MARKER}\\s+)?(${streetPattern})(?:\\s+${POSTFIX_STREET_MARKER})?` +
      `(?:\\s*[,;]?\\s*(?:${HOUSE_MARKER})?\\s*(${NUMBER_TOKEN}))?` +
      `(?:\\s*[,;]?\\s*${BUILDING_MARKER}\\s*(${NUMBER_TOKEN}))?` +
      `(?=$|[^\\p{L}\\p{N}])`,
    'iu',
  );
  const match = text.match(re);
  if (!match) return null;
  const houseNumber = match[2] || null;
  const building = match[3] || null;
  const address = composeHousingAddress({ street, houseNumber, building });
  return result(
    address,
    street,
    houseNumber,
    building,
    scoreAddressConfidence(text, {
      source: 'known',
      hasKnownStreet: true,
      hasHouse: Boolean(houseNumber),
    }),
  );
}

function knownStreetCandidates(options = {}) {
  const values = [options.knownStreet, ...(Array.isArray(options.knownStreets) ? options.knownStreets : [])]
    .map(compactStreet)
    .filter(Boolean);
  return [...new Set(values)].sort((a, b) => b.length - a.length || a.localeCompare(b));
}

function labelledAddress(text, rawValue) {
  const label = text.match(ADDRESS_LABEL_RE);
  if (!label) return null;

  // Find the same label in the original, un-cleaned text so the label's own
  // line can be bounded correctly. If a masked phone number sits right after
  // the label (e.g. "Адрес: +998...\nТелефон для связи"), clean() at the top
  // of parseHousingAddress already collapsed that masked run together with
  // the following line's newline into one space, which would otherwise let
  // the NEXT line's unrelated content bleed into this label's value.
  const rawLabelMatch = String(rawValue ?? '').match(ADDRESS_LABEL_RE);
  const rawLine = rawLabelMatch
    ? String(rawValue).slice(rawLabelMatch.index + rawLabelMatch[0].length).split(/[\r\n|]/u, 1)[0]
    : text.slice((label.index ?? 0) + label[0].length).split(/[\r\n|]/u, 1)[0];

  const line = clean(rawLine).slice(0, 140);
  if (!line) return null;
  const delimited = parseHousingAddress(line, { allowDelimitedBare: true });
  if (delimited.street) return delimited;
  // A generic label such as "Manzil:" is often followed by district and POI
  // prose.  Accept an unmarked bare form only when it has an actual house
  // component; marker-based street forms were already handled above.
  const bare = parseHousingAddress(line, { allowBare: true });
  return bare.street && bare.houseNumber ? bare : null;
}

function plausibleDelimitedStreet(value) {
  const segment = clean(value);
  if (!segment || segment.length > 80 || DELIMITED_STREET_REJECT_RE.test(segment)) return false;
  if (/\d/u.test(segment) || !/\p{L}{2,}/u.test(segment)) return false;
  const words = segment.split(/\s+/u);
  if (words.length < 1 || words.length > 5) return false;
  return words.every((word) => /^[\p{L}'’.-]{2,48}$/u.test(word));
}

function delimitedBareAddress(text) {
  const lines = String(text).split(/[\r\n|]/u).slice(0, 12);
  for (const rawLine of lines) {
    const segments = rawLine.split(/[,;]/u).map(clean).filter(Boolean);
    for (let i = 0; i < segments.length - 1; i += 1) {
      if (!plausibleDelimitedStreet(segments[i])) continue;
      const house = segments[i + 1].match(new RegExp(`^(${NUMBER_TOKEN})$`, 'iu'));
      if (!house) continue;
      const street = segments[i];
      const houseNumber = house[1];
      let building = null;
      const next = segments[i + 2] || '';
      const buildingMatch = next.match(new RegExp(`^${BUILDING_MARKER}\\s*(${NUMBER_TOKEN})$`, 'iu'));
      if (buildingMatch) building = buildingMatch[1];
      const address = composeHousingAddress({ street, houseNumber, building });
      return result(
        address,
        street,
        houseNumber,
        building,
        scoreAddressConfidence(rawLine, { source: 'delimited', hasHouse: true }),
      );
    }
  }
  return null;
}

function bareAddress(text) {
  const cleaned = clean(text);
  if (!cleaned || PROPERTY_AREA_LINE_RE.test(cleaned) || NON_ADDRESS_BARE_RE.test(cleaned)) return null;
  const stopMatch = cleaned.match(ADDRESS_FIELD_STOP_RE);
  const truncated = stopMatch ? clean(cleaned.slice(0, stopMatch.index)) : cleaned;
  if (!truncated) return null;
  const tail = splitAddressTail(truncated);
  if (!tail) return null;
  if (/^(?:центр|centre|center)$/iu.test(compactStreet(tail.street) || '')) return null;
  return result(
    truncated,
    tail.street,
    tail.houseNumber,
    tail.building,
    scoreAddressConfidence(truncated, { source: 'bare', hasHouse: Boolean(tail.houseNumber) }),
  );
}

/**
 * Parse only textual address structure. This module intentionally contains no
 * coordinates and performs no geocoding.
 *
 * `knownStreet` may be supplied when a location dictionary has already
 * canonicalized one street. `knownStreets` accepts several candidates and the
 * parser tests the longest canonical name first, preventing shorter aliases
 * from stealing an overlapping match.
 *
 * Secondary address components (unit, level, entrance and staircase) are
 * extracted only when a valid address is found. They are omitted otherwise so
 * legacy result shapes remain stable.
 *
 * `allowDelimitedBare` accepts only a short `street, house-number` pair and is
 * intended for consumers that already have strong city/area context.
 *
 * `allowBare` should be used only when the input is already known to be an
 * address field (for example a source-provided address), not on arbitrary post
 * prose where prices and phone numbers may look like house numbers.
 */
export function parseHousingAddress(value, options = {}) {
  const text = clean(value);
  if (!text) return result(null);

  const components = extractSecondaryComponents(value);
  const addressText = stripSecondaryComponents(text) || text;

  const tashkentMassifHouse = tashkentMassifHouseAddress(addressText);
  if (tashkentMassifHouse) return attachCatalogReferences(attachGeoComponents(attachSecondaryComponents(tashkentMassifHouse, components), value), options);

  const labelled = labelledAddress(addressText, value);
  if (labelled) return attachCatalogReferences(attachGeoComponents(attachSecondaryComponents(labelled, components), value), options);

  for (const knownStreet of knownStreetCandidates(options)) {
    const known = knownStreetAddress(addressText, knownStreet);
    if (known) return attachCatalogReferences(attachGeoComponents(attachSecondaryComponents(known, components), value), options);
  }

  const explicit = explicitStreetAddress(addressText);
  if (explicit) return attachCatalogReferences(attachGeoComponents(attachSecondaryComponents(explicit, components), value), options);

  if (options.allowDelimitedBare === true) {
    const delimited = delimitedBareAddress(addressText);
    if (delimited) return attachCatalogReferences(attachGeoComponents(attachSecondaryComponents(delimited, components), value), options);
  }

  if (options.allowBare === true) {
    const bare = bareAddress(addressText);
    return bare ? attachCatalogReferences(attachGeoComponents(attachSecondaryComponents(bare, components), value), options) : result(null);
  }
  const geo = tashkentGeoComponents(value);
  // A bare slash-number can also be floor notation in listing prose. Keep it
  // as a house component only when the same compact geo block names a mahalla.
  const compactHouse = geo.mahalla
    ? String(value ?? '').match(/(?:^|\s)(\d{1,5}(?:\/\d{1,5}){1,2})(?=$|[^\d/])/u)?.[1] || null
    : null;
  if (geo.district || geo.metro || geo.mahalla) {
    return attachCatalogReferences(Object.freeze({ ...result(null, null, compactHouse, null, compactHouse ? 0.45 : 0), ...Object.fromEntries(Object.entries(geo).filter(([, item]) => item)) }), options);
  }
  return result(null);
}

export function composeHousingAddress(parts = {}) {
  const street = compactStreet(parts.street);
  const houseNumber = normalizeNumber(parts.houseNumber);
  const building = normalizeNumber(parts.building);
  if (!street) return null;
  return [street, houseNumber, building ? `корп. ${building}` : null].filter(Boolean).join(' ');
}
