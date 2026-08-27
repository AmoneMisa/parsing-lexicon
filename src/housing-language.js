import { normalizeUnicode } from './normalization.js';

// Uzbek and Kazakh Cyrillic carry letters no Slavic alphabet uses. Their
// presence rules out "this text is already Russian/Ukrainian" even though the
// housing vocabulary overlaps heavily. `і` is deliberately absent: it is an
// ordinary Ukrainian letter.
const NON_SLAVIC_CYRILLIC = /[ўқғҳәөүұңһ]/iu;
const SLAVIC_LANGUAGES = new Set(['ru', 'uk']);

/**
 * Housing vocabulary that reliably indicates the language a listing body is
 * written in. Deliberately common words: the goal is deciding whether a reader
 * needs a translation, not identifying rare dialects.
 */
const HOUSING_LANGUAGE_SIGNALS = Object.freeze({
  ru: {
    pattern: /(?:квартир\p{L}*|комнат\p{L}*|этаж\p{L}*|дом\p{L}*|цен\p{L}*|сда[её]тся|прода[её]тся|аренд\p{L}*|рядом|метро|семейн\p{L}*|коммунальн\p{L}*|ремонт\p{L}*|мебел\p{L}*|балкон\p{L}*|район\p{L}*)/giu,
    minimum: 2,
  },
  uk: {
    pattern: /(?:квартир\p{L}*|кімнат\p{L}*|поверх\p{L}*|будинк\p{L}*|цін\p{L}*|здається|продається|оренд\p{L}*|поруч|метро|сімейн\p{L}*|комунальн\p{L}*|ремонт\p{L}*|мебл\p{L}*|балкон\p{L}*|район\p{L}*)/giu,
    minimum: 2,
  },
  en: {
    pattern: /(?:^|[^\p{L}])(?:apartment|flat|house|room|bedroom|floor|price|rent|rental|sale|family|utilities|near|available|furnished|balcony|district|deposit)(?=$|[^\p{L}])/giu,
    minimum: 3,
  },
  uz: {
    pattern: /(?:kvartira\p{L}*|xona\p{L}*|qavat\p{L}*|uy\p{L}*|narx\p{L}*|ijara\p{L}*|beriladi|sotiladi|yaqin|metro|mebel\p{L}*|balkon\p{L}*|tuman\p{L}*)/giu,
    minimum: 2,
  },
  ro: {
    pattern: /(?:apartament\p{L}*|cameră\p{L}*|camera\p{L}*|etaj\p{L}*|cas[aă]\p{L}*|case\p{L}*|pre[țt]\p{L}*|închiri\p{L}*|inchiri\p{L}*|vânz\p{L}*|vanz\p{L}*|metrou\p{L}*|famil\p{L}*|utilit\p{L}*|mobilat\p{L}*|balcon\p{L}*|cartier\p{L}*)/giu,
    minimum: 2,
  },
  kk: {
    pattern: /(?:пәтер\p{L}*|бөлме\p{L}*|қабат\p{L}*|үй\p{L}*|баға\p{L}*|жалд\p{L}*|жалғ\p{L}*|сат\p{L}*|жақын\p{L}*|метро\p{L}*|отбасы\p{L}*|коммунал\p{L}*|жиһаз\p{L}*|балкон\p{L}*|аудан\p{L}*)/giu,
    minimum: 2,
  },
});

function signalCount(text, language) {
  const signal = HOUSING_LANGUAGE_SIGNALS[language];
  if (!signal) return 0;
  return (text.match(signal.pattern) || []).length;
}

/**
 * True when the housing text already reads as the given language, i.e. a reader
 * of that language does not need it translated.
 *
 * Uses a per-language evidence threshold rather than a single hit, because one
 * shared word ("metro", "balkon") appears across all of these languages.
 */
export function housingTextIsInLanguage(value, language) {
  const text = normalizeUnicode(value ?? '').toLocaleLowerCase();
  if (!text.trim()) return false;
  const signal = HOUSING_LANGUAGE_SIGNALS[language];
  if (!signal) return false;
  // Uzbek/Kazakh Cyrillic text reuses Slavic housing words but is neither.
  if (SLAVIC_LANGUAGES.has(language) && NON_SLAVIC_CYRILLIC.test(text)) return false;
  return signalCount(text, language) >= signal.minimum;
}

/**
 * Best-guess language of a housing text, or null when no language reaches its
 * evidence threshold.
 */
export function detectHousingTextLanguage(value) {
  const text = normalizeUnicode(value ?? '').toLocaleLowerCase();
  if (!text.trim()) return null;

  let best = null;
  for (const language of Object.keys(HOUSING_LANGUAGE_SIGNALS)) {
    if (SLAVIC_LANGUAGES.has(language) && NON_SLAVIC_CYRILLIC.test(text)) continue;
    const count = signalCount(text, language);
    if (count < HOUSING_LANGUAGE_SIGNALS[language].minimum) continue;
    if (!best || count > best.count) best = { language, count };
  }
  return best?.language ?? null;
}
