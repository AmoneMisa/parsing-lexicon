import { deepFreeze } from './lexicon-core.js';
import { normalizeUnicode } from './normalization.js';

const has = (text, re) => re.test(text);

export function parseHousingFeatures(value) {
  const text = normalizeUnicode(value ?? '');
  if (!text) return deepFreeze({
    internet: null,
    courtyard: null,
    gazebo: null,
  });

  const internet = has(text, /(?:\bинтернет\b|\bwi[ -]?fi\b|\bроутер\b|\brouter\b|\bінтернет\b)/iu) ? true : null;
  const courtyard = has(text, /(?:\bдвор(?:ик|а|е|ом)?\b|\bвнутренн(?:ий|его)\s+двор\b|\bподворье\b|\bдвір(?:ик|і|ом)?\b|\bcourtyard\b|\byard\b)/iu) ? true : null;
  const gazebo = has(text, /(?:\bбеседк(?:а|и|е|у|ой)\b|\bальтанк(?:а|и|у|ою)\b|\bgazebo\b)/iu) ? true : null;

  return deepFreeze({ internet, courtyard, gazebo });
}
