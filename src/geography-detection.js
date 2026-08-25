import { COUNTRIES, canonicalCountryCode } from './countries.js';
import { GEOGRAPHY_CITIES } from './geography.js';
import { KZ_CITY_CATALOG, UZ_CITY_CATALOG } from './central-asia.js';
import { UA_CITY_CATALOG } from './ukraine.js';
import { aliasesOf, aliasesToRegex, normalizeForMatch } from './normalization.js';

const city = (canonical, country, aliases = []) => Object.freeze({
  canonical,
  country,
  type: 'city',
  aliases: Object.freeze({ all: Object.freeze([...new Set([canonical, ...aliases])]) }),
});

/** Cities used by hiring feeds outside the housing-focused geography catalogs. */
export const HIRING_GLOBAL_CITIES = Object.freeze([
  city('Tbilisi', 'GE', ['Тбилиси']),
  city('Batumi', 'GE', ['Батуми']),
  city('Baku', 'AZ', ['Баку']),
  city('Yerevan', 'AM', ['Ереван', 'Єреван']),
  city('Chisinau', 'MD', ['Chișinău', 'Chişinău', 'Кишинёв', 'Кишинев']),
  city('Dushanbe', 'TJ', ['Душанбе']),
  city('Ashgabat', 'TM', ['Ашхабад']),
  city('Warsaw', 'PL', ['Warszawa', 'Варшава']),
  city('Krakow', 'PL', ['Kraków', 'Краков']),
  city('Berlin', 'DE', ['Берлин']),
  city('Munich', 'DE', ['München', 'Мюнхен']),
  city('London', 'GB', ['Лондон']),
  city('New York', 'US', ['New York City', 'NYC', 'Нью-Йорк', 'Нью Йорк']),
  city('Beijing', 'CN', ['Пекин', '北京']),
  city('Shanghai', 'CN', ['Шанхай', '上海']),
  city('Shenzhen', 'CN', ['Шэньчжэнь', '深圳']),
  city('Guangzhou', 'CN', ['Гуанчжоу', '广州']),
  city('Hangzhou', 'CN', ['Ханчжоу', '杭州']),
  city('Tokyo', 'JP', ['Токио', '東京']),
  city('Osaka', 'JP', ['Осака', '大阪']),
  city('Kyoto', 'JP', ['Киото', '京都']),
  city('Seoul', 'KR', ['Сеул', '서울']),
  city('Busan', 'KR', ['Пусан', '부산']),
  city('Taipei', 'TW', ['Тайбэй', '台北']),
  city('Kaohsiung', 'TW', ['Гаосюн', '高雄']),
  city('Taichung', 'TW', ['Тайчжун', '台中']),
]);

const CITY_CATALOG = Object.freeze((() => {
  const byKey = new Map();
  for (const item of [
    ...GEOGRAPHY_CITIES,
    ...KZ_CITY_CATALOG,
    ...UZ_CITY_CATALOG,
    ...UA_CITY_CATALOG,
    ...HIRING_GLOBAL_CITIES,
  ]) {
    const key = `${item.country || ''}:${item.canonical}`;
    if (!byKey.has(key)) byKey.set(key, item);
  }
  return [...byKey.values()];
})());

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

const CITY_MATCHERS = CITY_CATALOG.map((item) => {
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
