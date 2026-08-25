import { findCanonical } from './normalization.js';
import { deepFreeze, freezeAliases } from './lexicon-core.js';

const country = (code, canonical, currency, aliases) => deepFreeze({
  code,
  canonical,
  type: 'country',
  currency,
  aliases: freezeAliases(aliases),
});

/** Canonical countries used by housing/hiring ingestion. */
export const COUNTRIES = Object.freeze([
  country('UZ', 'Uzbekistan', 'UZS', {
    en: ['Uzbekistan', 'Republic of Uzbekistan'],
    ru: ['Узбекистан', 'Республика Узбекистан'],
    uk: ['Узбекистан', 'Республіка Узбекистан'],
    ro: ['Uzbekistan', 'Republica Uzbekistan'],
    uzLatn: ["O'zbekiston", 'O‘zbekiston', 'Oʻzbekiston', "O'zbekiston Respublikasi", 'Ozbekiston'],
    uzCyrl: ['Ўзбекистон', 'Ўзбекистон Республикаси'],
    kk: ['Өзбекстан', 'Өзбекстан Республикасы'],
  }),
  country('KZ', 'Kazakhstan', 'KZT', {
    en: ['Kazakhstan', 'Republic of Kazakhstan'],
    ru: ['Казахстан', 'Республика Казахстан'],
    uk: ['Казахстан', 'Республіка Казахстан'],
    ro: ['Kazahstan', 'Republica Kazahstan', 'Kazakhstan'],
    uzLatn: ["Qozog'iston", 'Qozog‘iston', 'Qozogʻiston', "Qozog'iston Respublikasi"],
    uzCyrl: ['Қозоғистон', 'Қозоғистон Республикаси'],
    kk: ['Қазақстан', 'Қазақстан Республикасы'],
  }),
  country('UA', 'Ukraine', 'UAH', {
    en: ['Ukraine'],
    ru: ['Украина'],
    uk: ['Україна'],
    ro: ['Ucraina'],
    uzLatn: ['Ukraina'],
    uzCyrl: ['Украина'],
    kk: ['Украина'],
  }),
  country('RO', 'Romania', 'RON', {
    en: ['Romania'],
    ru: ['Румыния'],
    uk: ['Румунія'],
    ro: ['România', 'Romania'],
    uzLatn: ['Ruminiya'],
    uzCyrl: ['Руминия'],
    kk: ['Румыния'],
  }),
  country('KG', 'Kyrgyzstan', 'KGS', {
    en: ['Kyrgyzstan', 'Kyrgyz Republic'],
    ru: ['Кыргызстан', 'Киргизия', 'Кыргызская Республика'],
    uk: ['Киргизстан', 'Киргизька Республіка'],
    ro: ['Kârgâzstan', 'Kyrgyzstan'],
    uzLatn: ["Qirg'iziston", 'Qirg‘iziston', 'Qirgʻiziston'],
    uzCyrl: ['Қирғизистон'],
    kk: ['Қырғызстан', 'Қырғыз Республикасы'],
  }),
]);

const COUNTRY_BY_CODE = new Map(COUNTRIES.map((item) => [item.code, item]));

export function canonicalCountry(value) {
  if (!value) return null;
  const direct = COUNTRY_BY_CODE.get(String(value).trim().toUpperCase());
  if (direct) return direct.canonical;
  return findCanonical(value, COUNTRIES)?.canonical || null;
}

export function canonicalCountryCode(value) {
  if (!value) return null;
  const direct = COUNTRY_BY_CODE.get(String(value).trim().toUpperCase());
  if (direct) return direct.code;
  return findCanonical(value, COUNTRIES)?.code || null;
}

export function countryByCode(value) {
  return COUNTRY_BY_CODE.get(String(value || '').trim().toUpperCase()) || null;
}
