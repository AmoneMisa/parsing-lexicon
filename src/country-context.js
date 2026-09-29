import { canonicalCountryCode, countryByCode } from './countries.js';
import { CITIES } from './geography.js';
import { findCanonical } from './normalization.js';

export function countryContext(value) {
  const code = canonicalCountryCode(value);
  if (!code) return null;
  const country = countryByCode(code);
  if (!country) return null;
  return Object.freeze({
    code: country.code,
    country: country.canonical,
    currency: country.currency || null,
    phoneCountry: country.code,
  });
}

export function countryCurrency(value) {
  return countryContext(value)?.currency || null;
}

export function countryPhoneHint(value) {
  return countryContext(value)?.phoneCountry || null;
}

// A context that names only the city ("Tashkent") still fixes the country and
// with it the default currency. Without this a Tashkent listing parsed with
// `{ city }` alone had no fallback currency and consumers filled the gap with
// their own default (KZT), mislabelling so'm prices.
export function countryCodeForCity(city) {
  if (!city) return '';
  return findCanonical(String(city), CITIES)?.country || '';
}
