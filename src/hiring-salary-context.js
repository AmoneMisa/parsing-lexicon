import { detectCountryCodeFromText } from './geography-detection.js';
import { parseSalary } from './money.js';

/**
 * Default local currencies used only as an opt-in fallback when salary text
 * contains an amount but no explicit currency. Explicit currency always wins.
 */
export const COUNTRY_DEFAULT_CURRENCIES = Object.freeze({
  US: 'USD',
  GB: 'GBP',
  UA: 'UAH',
  UZ: 'UZS',
  KZ: 'KZT',
  KG: 'KGS',
  RO: 'RON',
  PL: 'PLN',
  TR: 'TRY',
  GE: 'GEL',
});

export function defaultCurrencyForCountry(value) {
  const country = detectCountryCodeFromText(value);
  return country ? COUNTRY_DEFAULT_CURRENCIES[country] || null : null;
}

function contextCountry(options) {
  return detectCountryCodeFromText(options.country)
    || detectCountryCodeFromText(options.location)
    || null;
}

function languageDefaultCountry(value) {
  const text = String(value || '');
  // Use only language signals that are specific enough to avoid turning generic
  // Russian/English salary text into a local currency guess. Uzbek and Kazakh
  // salary/period vocabulary is deterministic enough for this fallback.
  if (/(?:^|[^\p{L}\p{N}])(?:oylik|oyiga|maosh|ish\s+haqi|ойлик|ойига|маош|иш\s+ҳақи)(?=$|[^\p{L}\p{N}])/iu.test(text)) return 'UZ';
  if (/(?:^|[^\p{L}\p{N}])(?:жалақы|еңбекақы|айлық|айына)(?=$|[^\p{L}\p{N}])/iu.test(text)) return 'KZ';
  return null;
}

/**
 * Parse salary text and optionally infer a missing currency from geography or
 * unambiguous local salary-language markers.
 *
 * The fallback is deliberately opt-in. A bare number must never silently become
 * USD merely because a consumer happens to normalize all salaries to USD later.
 * Provenance is returned in `currencySource` so consumers can distinguish an
 * explicit currency from a contextual fallback.
 */
export function parseHiringSalaryWithContext(value, options = {}) {
  const parsed = parseSalary(value);
  if (!parsed) return null;

  if (parsed.currency) {
    return Object.freeze({
      ...parsed,
      currencySource: 'explicit',
      currencyCountry: null,
    });
  }

  let country = null;
  if (options.currencyFallback === 'country') country = contextCountry(options);
  else if (options.currencyFallback === 'language') country = languageDefaultCountry(value);

  const currency = country ? COUNTRY_DEFAULT_CURRENCIES[country] || null : null;
  return Object.freeze({
    ...parsed,
    currency,
    currencySource: currency
      ? options.currencyFallback === 'language' ? 'language-default' : 'country-default'
      : 'unknown',
    currencyCountry: currency ? country : null,
  });
}
