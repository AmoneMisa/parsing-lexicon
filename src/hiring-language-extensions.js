import { parseLanguageContext } from './hiring-context.js';
import { findCanonical } from './normalization.js';
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

function extendedLevelNear(text, item) {
  const start = Math.max(0, Number(item?.start || 0) - 45);
  const end = Math.min(text.length, Number(item?.end || 0) + 70);
  return findCanonical(text.slice(start, end), LANGUAGE_LEVEL_EXTENSIONS, { partial: true })?.canonical || null;
}

export function parseExtendedLanguageContext(value, options = {}) {
  const text = String(value || '');
  const parsed = parseLanguageContext(text, options);
  return Object.freeze(parsed.map((item) => Object.freeze({
    ...item,
    level: item.level || item.cefr ? item.level : extendedLevelNear(text, item),
  })));
}
