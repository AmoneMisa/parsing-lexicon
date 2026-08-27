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
  const match = CITY_MATCHERS.find(({ item, exact, inflected }) =>
    (!code || item.country === code) && (exact.test(text) || Boolean(inflected?.test(text))));
  if (!match) return null;
  return Object.freeze({ canonical: match.item.canonical, country: match.item.country || null });
}
