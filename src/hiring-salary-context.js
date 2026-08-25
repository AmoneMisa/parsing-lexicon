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

/**
 * Parse salary text and optionally infer a missing currency from geography.
 *
 * The fallback is deliberately opt-in. A bare number must never silently become
 * USD merely because a consumer happens to normalize all salaries to USD later.
 * Consumers that know a feed uses local currency can request `currencyFallback:
 * 'country'` and keep the provenance in `currencySource`.
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

  if (options.currencyFallback !== 'country') {
    return Object.freeze({
      ...parsed,
      currency: null,
      currencySource: 'unknown',
      currencyCountry: null,
    });
  }

  const country = contextCountry(options);
  const currency = country ? COUNTRY_DEFAULT_CURRENCIES[country] || null : null;
  return Object.freeze({
    ...parsed,
    currency,
    currencySource: currency ? 'country-default' : 'unknown',
    currencyCountry: currency ? country : null,
  });
}
