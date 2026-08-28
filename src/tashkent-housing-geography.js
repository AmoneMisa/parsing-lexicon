import { aliasesToRegex, escapeRegex, normalizeForMatch } from './normalization.js';
import { TASHKENT_METRO } from './geo.js';

function locationEntry(name, category, aliases = [], options = {}) {
  const all = [...new Set([name, ...aliases].filter(Boolean))];
  return Object.freeze({
    canonical: name,
    name,
    category,
    country: 'UZ',
    city: 'Tashkent',
    aliases: Object.freeze(all),
    re: aliasesToRegex(all),
    contextRequired: Boolean(options.contextRequired),
    contextRe: options.context ? new RegExp(options.context, 'iu') : null,
  });
}

/**
 * Housing-oriented Tashkent names that occur in listings as landmarks even when
 * the generic POI catalogue cannot safely classify the bare token on its own.
 * Canonicals are intentionally stable for existing parser consumers.
 */
export const TASHKENT_HOUSING_LANDMARKS = Object.freeze([
  locationEntry('Alay Bazaar', 'market', [
    'Алай', 'Алайский', 'Алайского', 'Alay', 'Oloy',
  ]),
  locationEntry('C-2', 'local_area', ['Ц-2', 'Ц 2', 'C-2', 'C 2']),
  locationEntry('Darkhan', 'local_area', ['Дархан', 'Darkhan', 'Darhan', 'Darxon']),
  locationEntry('Novomoskovskaya', 'residential_complex', [
    'Новомосковская', 'Новомосковской', 'Novomoskovskaya',
  ]),
  locationEntry('Yangi Choshtepa', 'local_area', [
    'Янги Чоштепа', 'Янги чоштепа', 'Yangi Choshtepa',
  ]),
  locationEntry('Glinka', 'landmark', [
    'Глинка', 'Glinka', 'Глинка ГАИ', 'ГАИ Глинка',
  ]),
  locationEntry('Dehqonobod', 'landmark', [
    'Дехконабад', 'Дехканабад', 'Дехконобод', 'Деҳқонобод', 'Dehqonobod', 'Dehkanabad',
  ]),
  locationEntry('Sergeli Car Bazaar', 'market', [
    'Сергели машинный базар',
    'Сергели машина бозор',
    'Сергели машина бозори',
    'Sergeli mashina bozori',
    'Sergeli mashina bozor',
    'Sergeli moshina bozori',
    'Sergeli moshina bozor',
    'Sergile moshena bozor',
    'Sergile moshina bozor',
    'Sergele moshena bozor',
    'Sergele moshina bozor',
  ]),
  locationEntry('Nizami Pedagogical University', 'university', [
    'Nizomiy',
    'Nizomiy universiteti',
    'Nizomiy pedagogika universiteti',
    'Nizomiy nomidagi universitet',
    'Низомий',
    'Низомий университети',
    'Низомий педагогика университети',
    'Nizami Pedagogical University',
    'National Pedagogical University of Uzbekistan named after Nizami',
    'Tashkent State Pedagogical University named after Nizami',
    'Ташкентский государственный педагогический университет имени Низами',
  ], { contextRequired: true, context: '(?:universitet|университет|pedagog|педагог)' }),
  locationEntry('World Languages University', 'university', [
    'Jahon tillar',
    'Jahon tillar universiteti',
    'Jahon tillari universiteti',
    'Жахон тиллар',
    'Жаҳон тиллар',
    'Жахон тиллар университети',
    'Жаҳон тиллар университети',
    'Жаҳон тиллари университети',
    'World Languages University',
    'Uzbekistan State World Languages University',
    'UzSWLU',
    "O'zbekiston davlat jahon tillari universiteti",
    'O‘zbekiston davlat jahon tillari universiteti',
    'Oʻzbekiston davlat jahon tillari universiteti',
  ], { contextRequired: true, context: '(?:universitet|университет|university)' }),
]);

function hasRequiredContext(entry, text, start, end) {
  if (!entry.contextRequired) return true;
  const around = text.slice(Math.max(0, start - 48), Math.min(text.length, end + 48));
  return entry.contextRe?.test(around) ?? false;
}

/** Return all housing landmarks in stable catalogue-priority order. */
export function matchTashkentHousingLandmarks(value) {
  const text = String(value ?? '');
  if (!text) return [];
  const matches = [];
  for (const entry of TASHKENT_HOUSING_LANDMARKS) {
    const match = text.match(entry.re);
    if (!match) continue;
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (!hasRequiredContext(entry, text, start, end)) continue;
    matches.push(entry);
  }
  return matches;
}

export const TASHKENT_NUMBERED_AREA_ALIASES = Object.freeze({
  Chilanzar: Object.freeze(['чиланзар', 'чилонзор', 'chilanzar', 'chilonzor']),
  Kuylyuk: Object.freeze(['куйлюк', 'куйлик', 'kuylyuk', 'kuyliq', 'qoyliq', 'qo yliq']),
  Sergeli: Object.freeze(['сергели', 'sergeli', 'sergile', 'sergele']),
  Yunusabad: Object.freeze(['юнусабад', 'yunusabad', 'yunusobod']),
  Yangihayot: Object.freeze(['янгихаёт', 'янгихаят', 'yangihayot']),
});

const REVERSE_NUMBERED_ALIASES = Object.freeze({
  Chilanzar: Object.freeze(['чиланзара', 'чилонзора', 'chilanzar', 'chilonzor']),
});

const DISTRICT_CONTEXT_ALIASES = Object.freeze({
  Sergeli: Object.freeze(['сергелийский', 'сергели', 'sergeli', 'sergile', 'sergele']),
  Chilanzar: Object.freeze(['чиланзарский', 'чиланзар', 'чилонзор', 'chilanzar', 'chilonzor']),
});

const NUMBERED_CONTEXT = '(?:tumani|тумани|district|район|massiv|массив)';
const NUMBERED_SUFFIX_CONTEXT = '(?:chi|чи|й|квартал|kvartal|hudud(?:da)?|худуд(?:да)?|mavze(?:si)?|мавзе(?:си)?|massiv(?:i)?|массив(?:и)?)';
// The open \p{L}* suffix used to swallow any trailing letters, so
// "туманность" (an unrelated word) satisfied this as if "туман" (district)
// had been mentioned. {0,4} covers real case endings (туманда, туманидан)
// while excluding unrelated 5+-letter continuations.
const DISTRICT_MARKER = '(?:район|туман\\p{L}{0,4}|tumani|district)';

function normalizedAlternatives(values) {
  return values
    .map((value) => escapeRegex(normalizeForMatch(value)).replace(/\\ /g, '\\s+'))
    .filter(Boolean)
    .join('|');
}

/**
 * Parse only the lexical shell of a numbered Tashkent massif. District-number
 * ambiguity remains the responsibility of the consumer.
 */
export function matchTashkentNumberedArea(value, canonical) {
  const aliases = TASHKENT_NUMBERED_AREA_ALIASES[canonical];
  if (!aliases?.length) return null;
  const text = normalizeForMatch(value);
  if (!text) return null;
  const alternatives = normalizedAlternatives(aliases);
  let match = text.match(new RegExp(
    `(?:^|\\s)(?:${alternatives})(?:\\s+${NUMBERED_CONTEXT})?\\s+(\\d{1,2})(?:\\s*([adад]))?(?:\\s+${NUMBERED_SUFFIX_CONTEXT})*(?:\\s|$)`,
    'iu',
  ));

  if (!match && REVERSE_NUMBERED_ALIASES[canonical]?.length) {
    const reverse = normalizedAlternatives(REVERSE_NUMBERED_ALIASES[canonical]);
    const reverseMatch = text.match(new RegExp(
      `(?:^|\\s)(\\d{1,2})\\s+(?:квартал|кв\\s+л|kvartal)\\s+(?:${reverse})(?:\\s|$)`,
      'iu',
    ));
    if (reverseMatch) match = [reverseMatch[0], reverseMatch[1], ''];
  }

  if (!match) return null;
  return Object.freeze({ number: Number(match[1]), suffix: match[2] || '' });
}

export function hasTashkentAreaAlias(value, canonical) {
  const aliases = TASHKENT_NUMBERED_AREA_ALIASES[canonical];
  if (!aliases?.length) return false;
  const text = normalizeForMatch(value);
  return aliases.some((alias) => ` ${text} `.includes(` ${normalizeForMatch(alias)} `));
}

export function hasExplicitTashkentDistrict(value, canonical) {
  const aliases = DISTRICT_CONTEXT_ALIASES[canonical];
  if (!aliases?.length) return false;
  const alternatives = normalizedAlternatives(aliases);
  const text = normalizeForMatch(value);
  return new RegExp(`(?:^|\\s)(?:${alternatives})\\s+${DISTRICT_MARKER}(?:\\s|$)`, 'iu').test(text);
}

const EXTRA_METRO_ALIASES = Object.freeze({
  Sergeli: Object.freeze(['Sergile', 'Sergele']),
});

const QOYLIQ_MASSIF_RE = /(?:куйлюк|куйлик|kuylyuk|kuyliq|qoyliq|qo[‘’ʻ']?yliq|қўйлиқ)(?:\s+\d{1,2})?\s+(?:массив(?:и)?|massiv(?:i)?)/iu;

/** Resolve listing typos/transliterations to an existing canonical metro entry. */
export function matchTashkentHousingMetro(value) {
  const text = String(value ?? '');
  if (!text) return null;
  for (const station of TASHKENT_METRO) {
    if (!station.re.test(text)) continue;
    // Qoyliq is also a large housing massif. In housing text an explicit
    // "массив/massiv" marker wins over the homonymous metro station.
    if (station.name === 'Qoyliq' && QOYLIQ_MASSIF_RE.test(text)) continue;
    return station;
  }
  for (const [canonical, aliases] of Object.entries(EXTRA_METRO_ALIASES)) {
    if (!aliasesToRegex(aliases).test(text)) continue;
    return TASHKENT_METRO.find((station) => station.name === canonical) || null;
  }
  return null;
}

const TASHKENT_HOUSING_TRANSIT = Object.freeze([
  locationEntry('Tashkent North Railway Station', 'railway', [
    'Ташкент Северный вокзал',
    'Ташкент Северный',
    'Tashkent North Railway Station',
    'Toshkent North Railway Station',
  ]),
]);

/** Preserve the historical housing-parser label while keeping its aliases shared. */
export function matchTashkentHousingTransit(value) {
  const text = String(value ?? '');
  if (!text) return null;
  return TASHKENT_HOUSING_TRANSIT.find((entry) => entry.re.test(text)) || null;
}
