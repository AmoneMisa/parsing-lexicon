import { deepFreeze } from './lexicon-core.js';
import { normalizeUnicode } from './normalization.js';

const has = (text, re) => re.test(text);

export function parseHousingFeatures(value) {
  const text = normalizeUnicode(value ?? '');
  if (!text) return deepFreeze({
    internet: null,
    courtyard: null,
    gazebo: null,
    petsAllowed: null,
  });

  const internet = has(text, /(?:\bинтернет\b|\bwi[ -]?fi\b|\bроутер\b|\brouter\b|\bінтернет\b)/iu) ? true : null;
  const courtyard = has(text, /(?:\bдвор(?:ик|а|е|ом)?\b|\bвнутренн(?:ий|его)\s+двор\b|\bподворье\b|\bдвір(?:ик|і|ом)?\b|\bcourtyard\b|\byard\b)/iu) ? true : null;
  const gazebo = has(text, /(?:\bбеседк(?:а|и|е|у|ой)\b|\bальтанк(?:а|и|у|ою)\b|\bgazebo\b)/iu) ? true : null;

  let petsAllowed = null;
  if (has(text, /(?:\bбез\s+животн\p{L}*\b|\bс\s+животн\p{L}*\s+нельзя\b|\bживотн\p{L}*\s+нельзя\b)/iu)) {
    petsAllowed = false;
  } else if (has(text, /(?:\bможно\s+с\s+(?:(?:небольш\p{L}*|маленьк\p{L}*|средн\p{L}*)\s+)?животн\p{L}*\b|\bс\s+животн\p{L}*\s+можно\b|\bможно\s+с\s+(?:кот\p{L}*|кошк\p{L}*|собак\p{L}*|питомц\p{L}*)\b)/iu)) {
    petsAllowed = true;
  }

  return deepFreeze({ internet, courtyard, gazebo, petsAllowed });
}
