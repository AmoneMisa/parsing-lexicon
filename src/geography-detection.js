import { COUNTRIES, canonicalCountryCode } from './countries.js';
import { CITIES } from './geography.js';
import { aliasesOf, aliasesToRegex, normalizeForMatch } from './normalization.js';

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function cityInflectionRegex(aliases) {
  const cyrillic = [...new Set(aliases.filter((alias) => /\p{Script=Cyrillic}/u.test(alias)))];
  if (!cyrillic.length) return null;
  const patterns = cyrillic.map((alias) => {
    const maxSuffix = alias.replace(/[^\p{L}\p{N}]/gu, '').length > 3 ? 5 : 3;
    return `${escapeRegex(alias)}(?:\\p{Script=Cyrillic}{0,${maxSuffix}})`;
  });
  return new RegExp(`(?<![\\p{L}\\p{N}])(?:${patterns.join('|')})(?![\\p{L}\\p{N}])`, 'iu');
}

const CITY_MATCHERS = CITIES.map((item) => {
  const aliases = [item.canonical, ...aliasesOf(item)];
  return Object.freeze({
    item,
    exact: aliasesToRegex(aliases),
    inflected: cityInflectionRegex(aliases),
  });
});

const COUNTRY_MATCHERS = COUNTRIES.map((item) => {
  // Two-letter country codes are intentionally excluded from arbitrary prose:
  // e.g. English "us" must not make a vacancy a US role. Exact ISO-2 values
  // are still handled by canonicalCountryCode().
  const aliases = [item.canonical, ...aliasesOf(item)]
    .filter((alias) => normalizeForMatch(alias).replace(/\s/g, '').length > 2);
  return Object.freeze({ item, re: aliasesToRegex(aliases) });
});

const US_STATE_RE = /\b[A-Z][A-Za-z.'-]+(?:\s+[A-Z][A-Za-z.'-]+){0,3}\s*,?\s+(?:AL|AK|AZ|AR|CA|CO|CT|DE|FL|GA|HI|ID|IL|IN|IA|KS|KY|LA|ME|MD|MA|MI|MN|MS|MO|MT|NE|NV|NH|NJ|NM|NY|NC|ND|OH|OK|OR|PA|RI|SC|SD|TN|TX|UT|VT|VA|WA|WV|WI|WY|DC)\b/;
const CITY_CONTEXT_RE = /(?:shahr(?:i)?|шаар(?:ы|ында|ына|ынан)?|город(?:а|е|у|ом)?|city|viloyat(?:i)?|област\p{L}{0,4})/iu;

function matchedAliasNeedsContext(item, matchedText) {
  if (item.contextRequired === true) return true;
  const guarded = item.contextRequiredAliases || [];
  if (!guarded.length) return false;
  const matched = normalizeForMatch(matchedText);
  return guarded.some((alias) => {
    const normalized = normalizeForMatch(alias);
    return normalized && (matched === normalized || matched.startsWith(normalized));
  });
}

function cityTextMatch(text, matcher) {
  const exact = text.match(matcher.exact);
  const inflected = exact || !matcher.inflected ? null : text.match(matcher.inflected);
  const match = exact || inflected;
  if (!match) return null;
  if (!matchedAliasNeedsContext(matcher.item, match[0])) return match;

  const start = match.index ?? 0;
  const end = start + match[0].length;
  const before = text.slice(Math.max(0, start - 40), start);
  const after = text.slice(end, end + 48);
  return CITY_CONTEXT_RE.test(`${before} ${match[0]} ${after}`) ? match : null;
}

/** Detect an ISO-2 country from a country alias, known city alias, or US city/state location. */
export function detectCountryCodeFromText(value) {
  const text = String(value || '').trim();
  if (!text) return null;

  const exact = canonicalCountryCode(text);
  if (exact) return exact;

  const country = COUNTRY_MATCHERS.find(({ re }) => re.test(text))?.item;
  if (country?.code) return country.code;

  // Keep dotted U.S. and explicit "remote US" support without treating the
  // ordinary English pronoun "us" as a geography signal.
  if (/\bU\.S\.?\b/.test(text) || /\bremote\s+us\b/i.test(text) || US_STATE_RE.test(text)) return 'US';

  return detectCityFromText(text)?.country || null;
}

/** Detect a known city in free text, including common Cyrillic case inflections. */
export function detectCityFromText(value, country = null) {
  const text = String(value || '');
  if (!text) return null;
  const code = country ? canonicalCountryCode(country) : null;
  const match = CITY_MATCHERS.find((matcher) =>
    (!code || matcher.item.country === code) && Boolean(cityTextMatch(text, matcher)));
  if (!match) return null;
  return Object.freeze({ canonical: match.item.canonical, country: match.item.country || null });
}

/** Detect every known city in free text, ordered by first mention and deduplicated by canonical name. */
export function detectCitiesFromText(value, country = null) {
  const text = String(value || '');
  if (!text) return Object.freeze([]);
  const code = country ? canonicalCountryCode(country) : null;
  const found = [];
  for (const matcher of CITY_MATCHERS) {
    if (code && matcher.item.country !== code) continue;
    const match = cityTextMatch(text, matcher);
    if (!match) continue;
    found.push({
      canonical: matcher.item.canonical,
      country: matcher.item.country || null,
      start: match.index ?? 0,
    });
  }
  found.sort((a, b) => a.start - b.start || a.canonical.localeCompare(b.canonical));
  const seen = new Set();
  return Object.freeze(found.filter((item) => {
    if (seen.has(item.canonical)) return false;
    seen.add(item.canonical);
    return true;
  }).map(({ canonical, country: cityCountry }) => Object.freeze({ canonical, country: cityCountry })));
}
