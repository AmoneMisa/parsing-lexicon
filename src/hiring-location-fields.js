import { detectCityFromText } from './geography-detection.js';

const B = '(?<![\\p{L}\\p{N}])';
const E = '(?![\\p{L}\\p{N}])';
const re = (pattern) => new RegExp(`${B}(?:${pattern})(?:\\p{Script=Cyrillic}{1,3})?${E}`, 'iu');

const NON_CITY_LOCATION_RE = /^(?:europe|europa|європа|европа|штати|states|worldwide|global|anywhere|emea|apac)$/iu;
const REMOTE_LOCATION_SCOPE_RE = /^(?:worldwide|global|work\s+from\s+anywhere|anywhere(?:\s+in\b.*)?)$/iu;

export function isHiringNonCityLocation(value) {
  return NON_CITY_LOCATION_RE.test(String(value || '').trim());
}

export function isHiringRemoteLocationScope(value) {
  return REMOTE_LOCATION_SCOPE_RE.test(String(value || '').trim());
}

// Public Uzbek CV boards sometimes expose only a region. Keep the historic
// Personal-Site canonical names as a stable consumer contract while matching
// multilingual source spellings centrally.
const UZ_HIRING_REGIONS = Object.freeze([
  ['Tashkent Region', re('ташкент(?:ская)?\\s+(?:обл(?:асть)?\\.?|region)|toshkent\\s+viloyati|tashkent\\s+region')],
  ['Karakalpakstan', re("каракалпакстан|qoraqalpog(?:'|’)iston|karakalpakstan")],
  ['Kashkadarya', re('кашкадар\\p{L}*|qashqadaryo|kashkadarya')],
  ['Surkhandarya', re('сурхандар\\p{L}*|surxondaryo|surkhandarya')],
  ['Jizzakh', re('джизак\\p{L}*|jizzax|jizzakh')],
  ['Syrdarya', re('сырдар\\p{L}*|sirdaryo|syrdarya')],
  ['Khorezm', re('хорезм\\p{L}*|xorazm|khorezm')],
]);

// Keep legacy consumer canonicals and inflected aliases where the broader
// geography catalog intentionally uses a different modern spelling.
const HIRING_CITY_OVERRIDES = Object.freeze({
  UZ: Object.freeze([
    ['Navoi', re('навои|navoi')],
  ]),
  UA: Object.freeze([
    ['Odesa', re('одесс|одес|odesa|odessa')],
  ]),
});

export function detectHiringLocationName(value, country) {
  const text = String(value || '');
  const code = String(country || '').toUpperCase();
  if (!text || !code) return null;
  if (code === 'UZ') {
    const region = UZ_HIRING_REGIONS.find(([, matcher]) => matcher.test(text));
    if (region) return region[0];
  }
  const override = HIRING_CITY_OVERRIDES[code]?.find(([, matcher]) => matcher.test(text));
  if (override) return override[0];
  return detectCityFromText(text, code)?.canonical || null;
}
