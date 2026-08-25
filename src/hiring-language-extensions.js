import { parseLanguageContext } from './hiring-context.js';
import { findCanonical } from './normalization.js';
import { lexiconEntity } from './lexicon-core.js';

const group = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, extra);

/**
 * Language-level wording observed in real candidate feeds that is not part of
 * the generic CEFR/qualitative catalog yet. Keep source wording here rather
 * than in consuming applications.
 */
export const LANGUAGE_LEVEL_EXTENSIONS = Object.freeze([
  group('professional', {
    ru: ['профессиональный', 'профессиональное владение', 'профессиональный уровень'],
    en: ['professional', 'professional proficiency', 'professional working proficiency'],
    uk: ['професійний', 'професійне володіння'],
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
