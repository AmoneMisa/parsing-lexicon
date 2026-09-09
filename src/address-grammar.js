/**
 * Country/language-scoped address grammar data, extracted from
 * housing-address.js's combined marker regexes. This is data, not logic:
 * housing-address.js still runs one shared parser engine and still builds
 * the exact same combined patterns from these fragments (verified
 * byte-identical to the pre-extraction hardcoded regex source in
 * address-grammar.test.js) — nothing about matching behavior changes.
 *
 * The value of splitting it out is making "which markers belong to which
 * language/country" an explicit, inspectable data structure instead of
 * only implicit in one long alternation, so a caller that already knows
 * the listing's country can use STREET_GRAMMAR_LANGUAGES_BY_COUNTRY as
 * scoring evidence (e.g. "this address's markers are consistent with the
 * supplied country") — a prior, per the plan, never a rigid requirement,
 * since messy marketplace text routinely mixes languages regardless of
 * country.
 */

// Each marker fragment is tagged by the language it belongs to (not the
// country) because that's what's actually true of the text — "ул./улица"
// is a Russian-language marker that shows up in UZ, KZ, KG and UA listings
// alike, not a marker exclusive to one country.
export const STREET_PREFIX_MARKERS = Object.freeze([
  { pattern: 'ул(?:ица)?', lang: 'ru' },
  { pattern: 'вул(?:иця)?', lang: 'uk' },
  { pattern: 'пр', lang: 'ru' },
  { pattern: 'просп(?:ект)?', lang: 'ru' },
  { pattern: 'пр-т', lang: 'ru' },
  { pattern: 'переул(?:ок)?', lang: 'ru' },
  { pattern: 'пров(?:улок)?', lang: 'uk' },
  { pattern: 'проезд', lang: 'ru' },
  { pattern: 'наб(?:ережная)?', lang: 'ru' },
  { pattern: 'шоссе', lang: 'ru' },
  { pattern: "str(?:ada)?", lang: 'ro' },
  { pattern: 'street', lang: 'en' },
  { pattern: 'st', lang: 'en' },
  { pattern: 'avenue', lang: 'en' },
  { pattern: 'ave', lang: 'en' },
  { pattern: 'road', lang: 'en' },
  { pattern: 'rd', lang: 'en' },
  { pattern: 'көше', lang: 'kk' },
]);

export const STREET_POSTFIX_MARKERS = Object.freeze([
  { pattern: 'ko[\'’ʼ\\u02bc]?cha(?:si)?', lang: 'uzLatn' },
  { pattern: 'кўча(?:си)?', lang: 'uzCyrl' },
  { pattern: 'коча(?:си)?', lang: 'uzCyrl' },
  { pattern: 'kocha(?:si)?', lang: 'uzLatn' },
  { pattern: 'көше(?:сі)?', lang: 'kk' },
  { pattern: 'көшесі', lang: 'kk' },
  { pattern: 'көчө(?:сү)?', lang: 'ky' },
]);

export const STREET_TYPE_MARKERS = Object.freeze([
  { pattern: 'вулиця', lang: 'uk' },
  { pattern: 'улица', lang: 'ru' },
  { pattern: 'провулок', lang: 'uk' },
  { pattern: 'переулок', lang: 'ru' },
  { pattern: 'проспект', lang: 'ru' },
  { pattern: 'бульвар', lang: 'ru' },
  { pattern: 'набережна', lang: 'uk' },
  { pattern: 'набережная', lang: 'ru' },
  { pattern: 'шосе', lang: 'uk' },
  { pattern: 'шоссе', lang: 'ru' },
  { pattern: 'площа', lang: 'uk' },
  { pattern: 'площадь', lang: 'ru' },
  { pattern: 'узвіз', lang: 'uk' },
  { pattern: 'спуск', lang: 'ru' },
  { pattern: 'алея', lang: 'uk' },
  { pattern: 'аллея', lang: 'ru' },
  { pattern: 'дорога', lang: 'ru' },
  { pattern: 'тупик', lang: 'ru' },
  { pattern: 'көше(?:сі)?', lang: 'kk' },
  { pattern: 'көшесі', lang: 'kk' },
  { pattern: 'көчө(?:сү)?', lang: 'ky' },
]);

export const HOUSE_MARKERS = Object.freeze([
  { pattern: 'дом', lang: 'ru' },
  { pattern: 'д\\.', lang: 'ru' },
  { pattern: 'будинок', lang: 'uk' },
  { pattern: 'буд\\.', lang: 'uk' },
  { pattern: 'house', lang: 'en' },
  { pattern: 'h\\.', lang: 'en' },
  { pattern: 'uy', lang: 'uzLatn' },
  { pattern: 'уй', lang: 'uzCyrl' },
  { pattern: 'үй', lang: 'kk' },
  { pattern: 'nr\\.?', lang: 'ro' },
  { pattern: 'no\\.?', lang: 'en' },
  { pattern: '№', lang: 'ru' },
]);

export const BUILDING_MARKERS = Object.freeze([
  { pattern: 'корп(?:ус)?\\.?', lang: 'ru' },
  { pattern: 'к\\.', lang: 'ru' },
  { pattern: 'строен(?:ие)?', lang: 'ru' },
  { pattern: 'стр\\.', lang: 'ru' },
  { pattern: 'будова', lang: 'uk' },
  { pattern: 'секц(?:ия|ія)?', lang: 'ru' },
  { pattern: 'bloc', lang: 'ro' },
  { pattern: 'corp', lang: 'ro' },
  { pattern: 'building', lang: 'en' },
  { pattern: 'bldg\\.?', lang: 'en' },
  { pattern: 'korpus', lang: 'uzLatn' },
  { pattern: 'bino', lang: 'uzLatn' },
  { pattern: 'bina', lang: 'uzLatn' },
  { pattern: 'бино', lang: 'uzCyrl' },
]);

// Which languages a given priority country's listings commonly mix, in the
// order they're worth checking first. Deliberately not exhaustive or
// exclusive — messy marketplace text can and does use any language
// regardless of country, so this is scoring-prior data, not a filter.
export const COUNTRY_ADDRESS_LANGUAGES = Object.freeze({
  UZ: Object.freeze(['uzLatn', 'uzCyrl', 'ru']),
  KZ: Object.freeze(['kk', 'ru']),
  KG: Object.freeze(['ky', 'ru']),
  UA: Object.freeze(['uk', 'ru']),
  RO: Object.freeze(['ro']),
});

function joinMarkerGroup(markers) {
  return markers.map((marker) => marker.pattern).join('|');
}

/** Rebuild the exact combined alternation source housing-address.js uses internally, from the tagged marker data above. */
export function combinedMarkerPattern(markers) {
  return joinMarkerGroup(markers);
}

/** True when `text` contains at least one marker tagged for one of `country`'s priority languages. */
export function matchesCountryAddressLanguage(text, country, markers) {
  const languages = COUNTRY_ADDRESS_LANGUAGES[String(country || '').toUpperCase()];
  if (!languages?.length) return false;
  const relevant = markers.filter((marker) => languages.includes(marker.lang));
  if (!relevant.length) return false;
  const pattern = new RegExp(`(?:${joinMarkerGroup(relevant)})`, 'iu');
  return pattern.test(String(text || ''));
}
