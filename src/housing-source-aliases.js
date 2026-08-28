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

const THREADS_USERNAME_RE = /^@?([A-Za-z0-9_](?:[A-Za-z0-9._]{0,28}[A-Za-z0-9_])?)$/;
const THREADS_AGE_RE = /^\d{1,3}\s*(?:s|m|h|d|w|sec|min|hr|hrs|day|days|week|weeks|с|сек|м|мин|ч|д|дн|нед)$/iu;
const THREADS_EXPLICIT_RE = /(?:https?:\/\/)?(?:www\.)?threads\.net\/@[A-Za-z0-9._]+|(?:^|\n)\s*threads\s*(?=\n|$)/iu;
const THREADS_UI_NOISE_RE = /^(?:translate|see translation|перевести|показать перевод|original description|оригинальное описание)$/iu;

function sourceLines(value) {
  return String(value || '')
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function threadsUsernameFromFirstLine(value) {
  const first = sourceLines(value)[0] || '';
  return first.match(THREADS_USERNAME_RE)?.[1] || null;
}

/**
 * Detect the social/feed source from copied listing text.
 *
 * Threads copies are recognisable either by an explicit threads.net marker or
 * by the native copy shape: username on line 1, relative post age on line 2,
 * and a standalone Translate/translation UI line.
 */
export function detectHousingSource(value) {
  const text = String(value || '').replace(/\r\n?/g, '\n');
  if (!text.trim()) return null;
  if (THREADS_EXPLICIT_RE.test(text)) return 'threads';

  const lines = sourceLines(text);
  const username = lines[0]?.match(THREADS_USERNAME_RE)?.[1];
  const age = lines[1] && THREADS_AGE_RE.test(lines[1]);
  const hasThreadsUi = lines.some((line) => THREADS_UI_NOISE_RE.test(line));
  return username && age && hasThreadsUi ? 'threads' : null;
}

/** Remove source UI chrome while preserving the actual listing description. */
export function cleanHousingSourceText(value, options = {}) {
  const text = String(value || '').replace(/\r\n?/g, '\n');
  if (!text.trim()) return '';
  const source = options.source || detectHousingSource(text);
  if (source !== 'threads') return text.trim();

  const rawLines = text.split('\n');
  const nonEmpty = rawLines
    .map((line, index) => ({ line: line.trim(), index }))
    .filter(({ line }) => Boolean(line));

  const drop = new Set();
  if (nonEmpty[0]?.line.match(THREADS_USERNAME_RE)) drop.add(nonEmpty[0].index);
  if (nonEmpty[1] && THREADS_AGE_RE.test(nonEmpty[1].line)) drop.add(nonEmpty[1].index);

  for (const { line, index } of nonEmpty) {
    if (THREADS_UI_NOISE_RE.test(line) || /^threads$/iu.test(line)) drop.add(index);
  }

  return rawLines
    .filter((_, index) => !drop.has(index))
    .join('\n')
    .replace(/[ \t]+$/gm, '')
    .replace(/^\s*\n+|\n+\s*$/g, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Parse source metadata from a copied housing post. For Threads, the account
 * name from the first physical content line becomes the contact.
 */
export function parseHousingSourcePost(value, options = {}) {
  const text = String(value || '');
  const source = options.source || detectHousingSource(text);
  const username = source === 'threads' ? threadsUsernameFromFirstLine(text) : null;
  return Object.freeze({
    source,
    contact: username,
    text: cleanHousingSourceText(text, { source }),
  });
}

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
