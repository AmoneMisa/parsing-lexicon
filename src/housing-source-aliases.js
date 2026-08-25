import { lexiconEntity } from './lexicon-core.js';
import { findCanonical } from './normalization.js';
import { resolveHousingIntent } from './housing-intent.js';
import { HOUSING_OCCUPANCY_TYPES, PROPERTY_TYPES } from './housing.js';

const group = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, extra);

/** Source/feed wording that is useful for normalization but too noisy for the generic core. */
export const HOUSING_DEAL_TYPE_EXTENSIONS = Object.freeze([
  group('longRent', {
    ru: ['снять', 'в месяц', 'месяц'],
    en: ['monthly'],
    uzLatn: ['ijaraga', 'oyiga', 'beriladi'],
    uzCyrl: ['ижарага', 'ойига', 'берилади'],
    kk: ['айына'],
  }),
  group('shortRent', {
    ru: ['сутки', 'суток', 'суточно'],
    en: ['daily'],
    uzLatn: ['kunlik', 'sutkalik'],
    uzCyrl: ['кунлик', 'суткалик'],
    kk: ['тәуліктік'],
  }),
]);

export const HOUSING_ROOM_ONLY_EXTENSIONS = Object.freeze([
  group('roomOnly', {
    ru: ['шеринг'],
    en: ['room only'],
    uzLatn: ['student qizlarga', 'talaba qizlarga', 'opshijit dom', 'obshijit dom'],
    uzCyrl: ['студент қизларга', 'талаба қизларга'],
  }),
]);

export function resolveExtendedHousingIntent(value) {
  const text = String(value || '');
  const base = resolveHousingIntent(text);
  if (base) return base;
  const deal = findCanonical(text, HOUSING_DEAL_TYPE_EXTENSIONS, { partial: true });
  if (!deal?.canonical) return null;
  return Object.freeze({ action: null, listingKind: null, dealType: deal.canonical });
}

export function isRoomOnlyHousing(value) {
  const text = String(value || '');
  if (!text.trim()) return false;
  const occupancy = findCanonical(text, HOUSING_OCCUPANCY_TYPES, { partial: true })?.canonical;
  if (occupancy && ['room', 'sharedRoom', 'bedSpace'].includes(occupancy)) return true;
  if (findCanonical(text, PROPERTY_TYPES, { partial: true })?.canonical === 'dormitory') return true;
  return Boolean(findCanonical(text, HOUSING_ROOM_ONLY_EXTENSIONS, { partial: true }));
}
