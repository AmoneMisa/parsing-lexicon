import { parseLanguageContext } from './hiring-context.js';
import { LANGUAGE_LEVELS } from './hiring-languages.js';
import { findAllCanonical } from './normalization.js';
import { lexiconEntity } from './lexicon-core.js';

const group = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, extra);

/**
 * Source/feed wording and inflected qualitative levels that are intentionally
 * kept out of consuming applications. Canonicals mirror the core language
 * level taxonomy so callers receive one stable vocabulary.
 */
export const LANGUAGE_LEVEL_EXTENSIONS = Object.freeze([
  group('basic', {
    ru: ['базовый', 'базовая', 'базовое', 'базового', 'базовой', 'базовом', 'базовым'],
    en: ['basic'],
    uk: ['базовий', 'базова', 'базове', 'базового'],
    uzLatn: ["boshlang'ich", 'boshlang‘ich', 'boshlangʻich'],
    uzCyrl: ['бошланғич'],
    kk: ['бастапқы'],
  }),
  group('intermediate', {
    ru: ['разговорный', 'разговорная', 'разговорное', 'разговорного', 'средний уровень', 'среднего уровня'],
    en: ['intermediate', 'conversational'],
    uk: ['розмовний', 'розмовна', 'середній рівень'],
    uzLatn: ["o'rta daraja", 'o‘rta daraja', 'oʻrta daraja'],
    uzCyrl: ['ўрта даража'],
    kk: ['орта деңгей'],
  }),
  group('fluent', {
    ru: ['свободный', 'свободная', 'свободное', 'свободного', 'свободное владение'],
    en: ['fluent', 'full professional proficiency'],
    uk: ['вільний', 'вільна', 'вільне володіння'],
    uzLatn: ['erkin', 'erkin daraja'],
    uzCyrl: ['эркин'],
    kk: ['еркін'],
  }),
  group('native', {
    ru: ['родной', 'родная', 'родного', 'родным', 'носитель языка'],
    en: ['native', 'native speaker'],
    uk: ['рідна', 'рідний', 'носій мови'],
    uzLatn: ['ona tili'],
    uzCyrl: ['она тили'],
    kk: ['ана тілі'],
  }),
  group('professional', {
    ru: [
      'профессиональный', 'профессиональная', 'профессиональное', 'профессиональные',
      'профессионального', 'профессиональной', 'профессиональном', 'профессиональным',
      'профессиональное владение', 'профессиональный уровень',
    ],
    en: ['professional', 'professional proficiency', 'professional working proficiency'],
    uk: ['професійний', 'професійна', 'професійне', 'професійного', 'професійне володіння'],
    ro: ['profesional', 'nivel profesional'],
    uzLatn: ['professional', 'kasbiy daraja'],
    uzCyrl: ['профессионал', 'касбий даража'],
    kk: ['кәсіби', 'кәсіби деңгей'],
  }),
]);

const ALL_QUALITATIVE_LEVELS = Object.freeze([...LANGUAGE_LEVELS, ...LANGUAGE_LEVEL_EXTENSIONS]);

function distanceToItem(match, item) {
  const itemStart = Number(item?.start || 0);
  const itemEnd = Number(item?.end || itemStart);
  if (match.end <= itemStart) return itemStart - match.end;
  if (match.start >= itemEnd) return match.start - itemEnd;
  return 0;
}

function cefrMatches(text) {
  const out = [];
  for (const match of text.matchAll(/(?<![\p{L}\p{N}])([ABC][12])(?![\p{L}\p{N}])/giu)) {
    const start = match.index ?? 0;
    out.push(Object.freeze({
      canonical: match[1].toUpperCase(),
      start,
      end: start + match[0].length,
      kind: 'cefr',
    }));
  }
  return out;
}

function qualitativeMatches(text) {
  const seen = new Set();
  return findAllCanonical(text, ALL_QUALITATIVE_LEVELS)
    .filter((match) => {
      const key = `${match.start}:${match.end}:${match.canonical}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((match) => Object.freeze({ ...match, kind: 'level' }));
}

function nearestLanguageIndex(token, languages) {
  let bestIndex = -1;
  let bestDistance = Infinity;
  for (let index = 0; index < languages.length; index += 1) {
    const distance = distanceToItem(token, languages[index]);
    if (distance < bestDistance) {
      bestIndex = index;
      bestDistance = distance;
    }
  }
  return bestDistance <= 45 ? bestIndex : -1;
}

function bindLevels(text, languages) {
  const bound = new Map();
  const tokens = [...qualitativeMatches(text), ...cefrMatches(text)];
  for (const token of tokens) {
    const index = nearestLanguageIndex(token, languages);
    if (index < 0) continue;
    const item = languages[index];
    const distance = distanceToItem(token, item);
    const current = bound.get(index);
    if (!current || distance < current.distance || (distance === current.distance && token.start < current.token.start)) {
      bound.set(index, { token, distance });
    }
  }
  return bound;
}

export function parseExtendedLanguageContext(value, options = {}) {
  const text = String(value || '');
  const parsed = parseLanguageContext(text, options);
  const bound = bindLevels(text, parsed);
  return Object.freeze(parsed.map((item, index) => {
    const token = bound.get(index)?.token;
    if (!token) return item;
    return Object.freeze({
      ...item,
      level: token.kind === 'level' ? token.canonical : null,
      cefr: token.kind === 'cefr' ? token.canonical : null,
    });
  }));
}
