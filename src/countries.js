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
    uzLatn: ["O'zbekiston", "O'zbekiston Respublikasi", 'Ozbekiston'],
    uzCyrl: ['Ўзбекистон', 'Ўзбекистон Республикаси'],
    kk: ['Өзбекстан', 'Өзбекстан Республикасы'],
  }),
  country('KZ', 'Kazakhstan', 'KZT', {
    en: ['Kazakhstan', 'Republic of Kazakhstan'],
    ru: ['Казахстан', 'Республика Казахстан'],
    uk: ['Казахстан', 'Республіка Казахстан'],
    ro: ['Kazahstan', 'Republica Kazahstan', 'Kazakhstan'],
    uzLatn: ["Qozog'iston", "Qozog'iston Respublikasi"],
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
    uzLatn: ["Qirg'iziston"],
    uzCyrl: ['Қирғизистон'],
    kk: ['Қырғызстан', 'Қырғыз Республикасы'],
  }),
  country('GE', 'Georgia', 'GEL', {
    en: ['Georgia'],
    ru: ['Грузия'],
    uk: ['Грузія'],
    ro: ['Georgia'],
  }),
  country('AZ', 'Azerbaijan', 'AZN', {
    en: ['Azerbaijan'],
    ru: ['Азербайджан'],
    uk: ['Азербайджан'],
    ro: ['Azerbaidjan'],
  }),
  country('AM', 'Armenia', 'AMD', {
    en: ['Armenia'],
    ru: ['Армения'],
    uk: ['Вірменія'],
    ro: ['Armenia'],
  }),
  country('MD', 'Moldova', 'MDL', {
    en: ['Moldova', 'Republic of Moldova'],
    ru: ['Молдова'],
    uk: ['Молдова'],
    ro: ['Moldova', 'Republica Moldova'],
  }),
  country('TJ', 'Tajikistan', 'TJS', {
    en: ['Tajikistan'],
    ru: ['Таджикистан'],
    uk: ['Таджикистан'],
    ro: ['Tadjikistan'],
  }),
  country('TM', 'Turkmenistan', 'TMT', {
    en: ['Turkmenistan'],
    ru: ['Туркменистан'],
    uk: ['Туркменістан'],
    ro: ['Turkmenistan'],
  }),
  country('PL', 'Poland', 'PLN', {
    en: ['Poland'],
    ru: ['Польша'],
    uk: ['Польща'],
    ro: ['Polonia'],
    all: ['Polska'],
  }),
  country('DE', 'Germany', 'EUR', {
    en: ['Germany'],
    ru: ['Германия'],
    uk: ['Німеччина'],
    ro: ['Germania'],
    all: ['Deutschland'],
  }),
  country('GB', 'United Kingdom', 'GBP', {
    en: ['United Kingdom', 'UK', 'Great Britain', 'Britain', 'England'],
    ru: ['Великобритания', 'Британия', 'Англия'],
    uk: ['Велика Британія', 'Британія', 'Англія'],
    ro: ['Regatul Unit', 'Marea Britanie'],
  }),
  country('US', 'United States', 'USD', {
    en: ['United States', 'United States of America', 'USA', 'U.S.', 'US'],
    ru: ['США', 'Соединенные Штаты', 'Соединённые Штаты'],
    uk: ['США', 'Сполучені Штати'],
    ro: ['Statele Unite', 'SUA'],
  }),
  country('CN', 'China', 'CNY', {
    en: ['China', "People's Republic of China", 'PRC'],
    ru: ['Китай'],
    uk: ['Китай'],
    ro: ['China'],
    all: ['中国', '中华人民共和国'],
  }),
  country('JP', 'Japan', 'JPY', {
    en: ['Japan'],
    ru: ['Япония'],
    uk: ['Японія'],
    ro: ['Japonia'],
    all: ['日本'],
  }),
  country('KR', 'South Korea', 'KRW', {
    en: ['South Korea', 'Republic of Korea', 'Korea'],
    ru: ['Южная Корея', 'Корея'],
    uk: ['Південна Корея', 'Корея'],
    ro: ['Coreea de Sud', 'Coreea'],
    all: ['대한민국', '한국'],
  }),
  country('TW', 'Taiwan', 'TWD', {
    en: ['Taiwan'],
    ru: ['Тайвань'],
    uk: ['Тайвань'],
    ro: ['Taiwan'],
    all: ['臺灣', '台灣'],
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
