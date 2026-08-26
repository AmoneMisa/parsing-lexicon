import { canonicalCountryCode, countryByCode } from './countries.js';

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
