import { GENERIC_LANDMARK_TERMS } from './landmarks.js';
import { findCanonical, normalizeForMatch } from './normalization.js';
import { TASHKENT_LANDMARKS } from './tashkent-pois.js';
import { HOUSING_LANDMARK_EXTENSIONS, HOUSING_POI_EXTENSIONS } from './housing-poi-extensions.js';

const DISPLAY = Object.freeze({
  en: Object.freeze({
    Park: 'Park', Metro: 'Metro', 'Bus stop': 'Bus stop', 'Public transport': 'Public transport',
    'Main road': 'Main road', Clinic: 'Clinic', 'Maternity hospital': 'Maternity hospital', Hospital: 'Hospital',
    School: 'School', Kindergarten: 'Kindergarten', Childcare: 'Childcare', University: 'University',
    'Shopping center': 'Shopping center', Shop: 'Shop', Korzinka: 'Korzinka', Supermarket: 'Supermarket',
    Market: 'Market', Cafe: 'Cafe', Restaurant: 'Restaurant', Playground: 'Playground', Pharmacy: 'Pharmacy',
    Mosque: 'Mosque', Church: 'Church', 'Railway station': 'Railway station', Airport: 'Airport',
    'Bobur Park': 'Bobur Park', 'Independence Square': 'Independence Square', 'Mega Planet': 'Mega Planet',
  }),
  ru: Object.freeze({
    Park: 'Парк', Metro: 'Метро', 'Bus stop': 'Автобусная остановка', 'Public transport': 'Общественный транспорт',
    'Main road': 'Главная дорога', Clinic: 'Клиника', 'Maternity hospital': 'Роддом', Hospital: 'Больница',
    School: 'Школа', Kindergarten: 'Детский сад', Childcare: 'Детские учреждения', University: 'Университет',
    'Shopping center': 'Торговый центр', Shop: 'Магазин', Korzinka: 'Korzinka', Supermarket: 'Супермаркет',
    Market: 'Рынок', Cafe: 'Кафе', Restaurant: 'Ресторан', Playground: 'Детская площадка', Pharmacy: 'Аптека',
    Mosque: 'Мечеть', Church: 'Церковь', 'Railway station': 'Железнодорожный вокзал', Airport: 'Аэропорт',
    'Bobur Park': 'Парк Бобура', 'Independence Square': 'Площадь Независимости', 'Mega Planet': 'Mega Planet',
  }),
});

function languageKey(locale) {
  return String(locale || 'en').toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

function exactPoi(value) {
  const needle = normalizeForMatch(value);
  if (!needle) return null;
  return TASHKENT_LANDMARKS.find((entry) =>
    [entry.name, ...(entry.aliases || [])].some((alias) => normalizeForMatch(alias) === needle)) || null;
}

function extensionEntity(value) {
  return findCanonical(value, HOUSING_POI_EXTENSIONS)
    || findCanonical(value, HOUSING_LANDMARK_EXTENSIONS)
    || null;
}

export function housingSemanticCanonical(value) {
  const text = String(value || '').trim();
  if (!text) return '';
  const extension = extensionEntity(text);
  if (extension?.canonical) return extension.canonical;
  const generic = findCanonical(text, GENERIC_LANDMARK_TERMS);
  if (generic?.canonical) return generic.canonical;
  return exactPoi(text)?.name || text;
}

export function housingSemanticDisplayName(value, locale = 'en') {
  const text = String(value || '').trim();
  if (!text) return '';
  const language = languageKey(locale);
  const extension = extensionEntity(text);
  if (extension?.display?.[language]) return extension.display[language];
  const canonical = extension?.canonical
    || findCanonical(text, GENERIC_LANDMARK_TERMS)?.canonical
    || exactPoi(text)?.name
    || text;
  return DISPLAY[language]?.[canonical] || canonical;
}
