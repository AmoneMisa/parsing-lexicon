import { deepFreeze } from './lexicon-core.js';
import { normalizeUnicode } from './normalization.js';

const has = (text, re) => re.test(text);
const TOKEN_LEFT = String.raw`(?:^|[^\p{L}\p{N}_])`;
const TOKEN_RIGHT = String.raw`(?=$|[^\p{L}\p{N}_])`;
const tokenRe = (source) => new RegExp(`${TOKEN_LEFT}(?:${source})${TOKEN_RIGHT}`, 'iu');
const bool = (text, positive, negative = null) => {
  if (negative && has(text, negative)) return false;
  return has(text, positive) ? true : null;
};

export function parseHousingFeatures(value) {
  const text = normalizeUnicode(value ?? '');
  if (!text) return deepFreeze({
    internet: null,
    courtyard: null,
    gazebo: null,
    petsAllowed: null,
  });

  const internet = bool(
    text,
    tokenRe(String.raw`интернет|wi[ -]?fi|we[ -]?fi|wf|вай[ -]?фай|vayfay|роутер|router|інтернет`),
    /(?:без\s+(?:интернет|wi[ -]?fi|вай[ -]?фай)|нет\s+(?:интернет\p{L}*|wi[ -]?fi)|(?:интернет|wi[ -]?fi)\s+нет|internet\s+(?:yo['’]?q|mavjud\s+emas)|интернет\s+йўқ)/iu,
  );
  const courtyard = bool(
    text,
    tokenRe(String.raw`двор(?:ик|а|е|ом)?|внутренн(?:ий|его)\s+двор|подворье|двір(?:ик|і|ом)?|courtyard|yard`),
    /(?:без\s+двора|нет\s+двора|двор(?:а)?\s+нет|hovli\s+yo['’]?q|ҳовли\s+йўқ|no\s+(?:courtyard|yard))/iu,
  );
  const gazebo = bool(
    text,
    tokenRe(String.raw`беседк(?:а|и|е|у|ой)|альтанк(?:а|и|у|ою)|gazebo`),
    /(?:без\s+беседк\p{L}*|нет\s+беседк\p{L}*|беседк\p{L}*\s+нет|no\s+gazebo)/iu,
  );

  let petsAllowed = null;
  if (has(text, tokenRe(String.raw`без\s+животн\p{L}*|с\s+животн\p{L}*\s+нельзя|животн\p{L}*\s+нельзя`))) {
    petsAllowed = false;
  } else if (has(text, tokenRe(String.raw`можно\s+с\s+(?:(?:небольш\p{L}*|маленьк\p{L}*|средн\p{L}*)\s+)?животн\p{L}*|с\s+животн\p{L}*\s+можно|можно\s+с\s+(?:кот\p{L}*|кошк\p{L}*|собак\p{L}*|питомц\p{L}*)`))) {
    petsAllowed = true;
  }

  return deepFreeze({ internet, courtyard, gazebo, petsAllowed });
}
