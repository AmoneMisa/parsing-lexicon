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

function withCurrencyContext(parsed, value, options) {
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
  return withCurrencyContext(parseSalary(value), value, options);
}

// Include short local-board labels/markers used in real vacancy feeds: `З/п`,
// `ЗП`, and the money emoji that ish-bor-style cards use before a salary field.
// The marker is still required for long prose so unrelated large numbers are not
// promoted to compensation merely because the vacancy happens to be in UZ/KZ.
const VACANCY_COMPENSATION_RE = /(?:💵|💰|salary|salary\s+range|base\s+pay|pay\s+range|annual\s+pay|compensation(?:\s+range)?|з\s*[/\\.\-]?\s*п\b|заработн\p{L}*\s+плат\p{L}*|зарплат\p{L}*|оклад\p{L}*|вилка\s+оплат\p{L}*|оплата\s+труда|компенсац\p{L}*|ставка)/giu;

// AI-recruiting/staffing postings (e.g. Mercor) routinely mention funding,
// valuation or revenue figures in the same listing as the actual salary. A
// wide compensation window can grab "$50M Series B" instead of the real pay
// range, so when this noise is present anywhere in the text, narrow the
// window around each compensation keyword to keep only nearby money.
const VACANCY_COMPENSATION_NOISE_RE = /(?:valuation|funding|raised\s+\$|series\s+[a-e]\b|\bARR\b|revenue|GMV|market\s+cap|equity\s+grant|stock\s+options?)/iu;

/**
 * Vacancy descriptions often mention unrelated money: company revenue, customer
 * spend, relocation bonuses, benchmark payouts, etc. Do not turn those amounts
 * into the vacancy salary. For long prose, only parse a money expression from a
 * compensation-labelled context window. Short salary fields remain permissive.
 */
export function parseHiringVacancySalary(value, options = {}) {
  const text = String(value || '').trim();
  if (!text) return null;
  if (text.length <= 240) return parseHiringSalaryWithContext(text, options);

  const radius = VACANCY_COMPENSATION_NOISE_RE.test(text) ? 60 : 280;

  VACANCY_COMPENSATION_RE.lastIndex = 0;
  for (const match of text.matchAll(VACANCY_COMPENSATION_RE)) {
    const start = match.index ?? 0;
    const window = text.slice(Math.max(0, start - 80), Math.min(text.length, start + match[0].length + radius));
    const parsed = parseHiringSalaryWithContext(window, options);
    if (parsed && (parsed.min != null || parsed.max != null)) return parsed;
  }
  return null;
}