import { CURRENCY_TERMS } from './money-lexicon.js';

export {
  CURRENCY_SYMBOL_CANDIDATES,
  CURRENCY_TERMS,
} from './money-lexicon.js';

export {
  moneyCurrencyCandidatesFromText,
  moneyCurrencyFromText,
  moneyCurrencyPattern,
} from './money-core.js';

const LOCALE_ALIASES = Object.freeze({
  uzLatn: 'uz-Latn',
  uzCyrl: 'uz-Cyrl',
  kk: 'kk',
  uk: 'uk',
  ro: 'ro',
  ru: 'ru',
  en: 'en',
});

function normalizedLocale(locale) {
  const raw = String(locale || 'en').trim();
  return LOCALE_ALIASES[raw] || raw || 'en';
}

function supportedCurrency(code) {
  const normalized = String(code || '').trim().toUpperCase();
  return CURRENCY_TERMS.some((entry) => entry.canonical === normalized) ? normalized : null;
}

function currencyPart(code, locale, currencyDisplay) {
  try {
    const parts = new Intl.NumberFormat(normalizedLocale(locale), {
      style: 'currency',
      currency: code,
      currencyDisplay,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).formatToParts(1);
    return parts.find((part) => part.type === 'currency')?.value || code;
  } catch {
    return code;
  }
}

/** Localized display metadata without a second hand-maintained currency catalog. */
export function currencyDisplay(code, locale = 'en') {
  const canonical = supportedCurrency(code);
  if (!canonical) return null;
  return Object.freeze({
    code: canonical,
    symbol: currencyPart(canonical, locale, 'narrowSymbol'),
    name: currencyPart(canonical, locale, 'name'),
  });
}

export function currencySymbol(code, locale = 'en') {
  return currencyDisplay(code, locale)?.symbol || null;
}

export function currencyName(code, locale = 'en') {
  return currencyDisplay(code, locale)?.name || null;
}
