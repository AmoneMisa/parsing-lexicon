import { deepFreeze } from './lexicon-core.js';
import { normalizeUnicode } from './normalization.js';

const has = (text, re) => re.test(text);
const TOKEN_LEFT = String.raw`(?:^|[^\p{L}\p{N}_])`;
const TOKEN_RIGHT = String.raw`(?=$|[^\p{L}\p{N}_])`;
const tokenRe = (source) => new RegExp(`${TOKEN_LEFT}(?:${source})${TOKEN_RIGHT}`, 'iu');

export function parseHousingFeatures(value) {
  const text = normalizeUnicode(value ?? '');
  if (!text) return deepFreeze({
    internet: null,
    courtyard: null,
    gazebo: null,
    petsAllowed: null,
  });

  const internet = has(text, tokenRe(String.raw`интернет|wi[ -]?fi|we[ -]?fi|вай[ -]?фай|vayfay|роутер|router|інтернет`)) ? true : null;
  const courtyard = has(text, tokenRe(String.raw`двор(?:ик|а|е|ом)?|внутренн(?:ий|его)\s+двор|подворье|двір(?:ик|і|ом)?|courtyard|yard`)) ? true : null;
  const gazebo = has(text, tokenRe(String.raw`беседк(?:а|и|е|у|ой)|альтанк(?:а|и|у|ою)|gazebo`)) ? true : null;

  let petsAllowed = null;
  if (has(text, tokenRe(String.raw`без\s+животн\p{L}*|с\s+животн\p{L}*\s+нельзя|животн\p{L}*\s+нельзя`))) {
    petsAllowed = false;
  } else if (has(text, tokenRe(String.raw`можно\s+с\s+(?:(?:небольш\p{L}*|маленьк\p{L}*|средн\p{L}*)\s+)?животн\p{L}*|с\s+животн\p{L}*\s+можно|можно\s+с\s+(?:кот\p{L}*|кошк\p{L}*|собак\p{L}*|питомц\p{L}*)`))) {
    petsAllowed = true;
  }

  return deepFreeze({ internet, courtyard, gazebo, petsAllowed });
}
