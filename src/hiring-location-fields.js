import { detectCityFromText } from './geography-detection.js';

const B = '(?<![\\p{L}\\p{N}])';
const E = '(?![\\p{L}\\p{N}])';
const re = (pattern) => new RegExp(`${B}(?:${pattern})(?:\\p{Script=Cyrillic}{1,3})?${E}`, 'iu');

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

export function detectHiringLocationName(value, country) {
  const text = String(value || '');
  const code = String(country || '').toUpperCase();
  if (!text || !code) return null;
  if (code === 'UZ') {
    const region = UZ_HIRING_REGIONS.find(([, matcher]) => matcher.test(text));
    if (region) return region[0];
  }
  return detectCityFromText(text, code)?.canonical || null;
}
