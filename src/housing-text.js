const ok10 = (n) => (n >= 1 && n <= 10 ? n : null);

const WORD_ROOMS = Object.freeze({
  одно: 1, одн: 1, двух: 2, двох: 2, трех: 3, трёх: 3, трих: 3, трьох: 3,
  четырех: 4, четырёх: 4, чотирьох: 4, чотирох: 4, пяти: 5,
});

export function parseHousingRoomsFromText(value) {
  const text = String(value || '');
  if (!text) return null;
  const basement = text.match(/(?:^|\n)[^\d\r\n]{0,8}([1-9])\s*\/\s*0\s*\/\s*-1\s*(?:этаж|эт\.?)?[^\r\n]*(?:подвал|цоколь)/im);
  if (basement) return ok10(Number(basement[1]));
  const compact = text.match(/(?:^|\n)[^\d\r\n]{0,8}([1-9])\s*([¹²³⁴⁵⁶⁷⁸⁹])?\s*\/\s*([0-9]{1,2})\s*\/\s*([0-9]{1,2})[.,;:]?(?=\s|$)/m);
  if (compact) {
    const superscript = '¹²³⁴⁵⁶⁷⁸⁹'.indexOf(compact[2]) + 1;
    if (superscript) return ok10(superscript);
    const first = Number(compact[1]);
    const floor = Number(compact[3]);
    const last = Number(compact[4]);
    if (first === floor && last > first && last <= 5) return ok10(last);
    return ok10(first);
  }
  const after = text.match(/(?:количество\s+комнат\w*|комнат(?:ы|а)?(?![а-яё])|кімнат(?:и|а)?(?![а-яіїґ])|xonalar\s*soni|xona\s*soni|хоналар\s*сони|хона\s*сони|number\s+of\s+rooms)[^\S\r\n]*[:\-–—]?[^\S\r\n]*(\d+)/i);
  if (after) return ok10(Number(after[1]));
  const before = text.match(/(\d+)\s*[-хx]?\s*(?:camer|комнатн|комн|ком\.|кімнатн|кімн|кім\.|room|bedroom|xonali|xona|хонали|хона|бөлмел|бөлме)|(\d+)\s*-\s*к(?:омн|\.?\s*кв)/i);
  if (before) return ok10(Number(before[1] ?? before[2]));
  const word = text.toLowerCase().match(/(одно|одн|двух|двох|тр[еёи]х|трьох|четыр[её]х|чотир(?:ьох|ох)|пяти)\s*-?\s*(?:комнат|кімнат)/);
  return word ? ok10(WORD_ROOMS[word[1]] ?? null) : null;
}

const RC_STOP_WORD_RE = /^(?:жк|жм|продаётся|продается|продам|продажа|продаю|срочно|сдаётся|сдается|сдаю|сдам|аренда|арендую|новая|новый|новое|новые|новостройка|вторичка|квартира|квартиры|квартиру|комната|комнаты|комнат|комнатная|комнатной|этаж|этажа|этаж[её]м|ремонт|ремонтом|евроремонт|мебель|мебелью|мебелированная|дом|дома|тел|телефон|цена|торг|собственник|риелтор|посредник|uy|kvartira|xonali|sotiladi|ijaraga|yangi|arzon|tel|narx|new|newbuild|apartment|apartments|flat|for|sale|rent|rooms?|floor|предлагается|предлагаются|предлагаем|продаже|продаж|куплю|обмен|просторные|просторная|две|три|четыре|пять|район|районе|районы|туман|тумани|tumani|district|массив|массиве|massiv|метро|metro|рядом|около|возле|яндекс|город|шахар|shahar)$/iu;
const RC_ATTRIBUTE_TOKEN_RE = /^\d|^[\d/]+$|^[a-zа-яё]?\d+(?:[а-яёa-z]{1,4})?$/iu;
const RC_LATIN_NOISE_RE = /^(?:vip|lux|luxe|elite|premium|euro|evro|new|top|super|best|hot|urgent|srochno|arenda|ijara|sotiladi|sale|rent|for|home|house|flat|apartment|apartments|kvartira|tashkent|toshkent|wifi|wi|fi|tv|ac|internet|telegram|yandex|google|instagram|whatsapp|iphone|samsung|lg|bosch|artel|km|km2|m2|sqm|usd|uzs|eur)$/iu;
const RC_LATIN_WORD_RE = /^[A-Za-z][A-Za-z'’\-]{1,}$/u;
const RC_DISTRICT_MARKER_RE = /^(?:район|районе|районы|туман|тумани|tumani|district)$/iu;
const RC_MARKER_RE = /(?:жк|жм|ж\/к|residential complex|ansamblu(?: rezidential)?|turar[- ]?joy majmuasi)\s*/i;

function leadingLatinName(text) {
  const cyrillic = (String(text).match(/[а-яёіїґ]/giu) || []).length;
  const latin = (String(text).match(/[a-z]/giu) || []).length;
  if (cyrillic <= latin) return null;
  const tokens = String(text).trim().split(/[\s|,;:!]+/).filter(Boolean).slice(0, 12);
  const runs = [];
  let current = [];
  for (const token of tokens) {
    const clean = token.replace(/^[«»"'„“]+|[«»"'„“!|,]+$/g, '');
    const bare = clean.replace(/[-'’]/g, '');
    const usable = RC_LATIN_WORD_RE.test(clean) && !RC_LATIN_NOISE_RE.test(clean) && !RC_LATIN_NOISE_RE.test(bare) && !RC_STOP_WORD_RE.test(clean);
    if (usable && current.length < 3) current.push(clean);
    else { if (current.length) runs.push(current); current = usable ? [clean] : []; }
  }
  if (current.length) runs.push(current);
  const named = runs.find((run) => run.some((word) => word.length >= 3) && run.length < tokens.length);
  return named ? named.join(' ') : null;
}

export function parseHousingResidentialComplex(value) {
  const text = String(value || '');
  if (!text) return null;
  const marker = text.match(RC_MARKER_RE);
  if (!marker) return leadingLatinName(text);
  const rest = text.slice(marker.index + marker[0].length).replace(/^[\s:；;—–\-·•]+/, '');
  const quoted = rest.match(/^["'«»„“]\s*([^"'«»„“\n]{2,60})["'«»„“]?/);
  const candidate = quoted ? quoted[1] : (rest.match(/^([^"'«»„“\n,.;:()!|]{2,60})/) || [, ''])[1];
  const parsed = String(candidate).trim().replace(/([\p{Ll}\d])(\p{Lu})/gu, '$1 $2').replace(/\s{2,}/g, ' ').split(/\s+/).reduce((words, token) => {
    if (words.stopped || words.list.length >= 4) return { ...words, stopped: true };
    const clean = token.replace(/^[«»"'„“]+|[«»"'„“!|,]+$/g, '');
    if (!clean || RC_STOP_WORD_RE.test(clean) || RC_ATTRIBUTE_TOKEN_RE.test(clean)) return { ...words, stopped: true, by: clean };
    return { list: [...words.list, clean], stopped: false, by: words.by };
  }, { list: [], stopped: false, by: '' });
  const words = RC_DISTRICT_MARKER_RE.test(parsed.by) ? parsed.list.slice(0, -1) : parsed.list;
  while (words.length > 1 && [...words[words.length - 1]].length <= 2) words.pop();
  const name = words.join(' ').trim();
  return /[a-zA-Zа-яёіїґ]{2,}/i.test(name) ? name : null;
}

export function parseHousingAreaFromText(value) {
  const text = String(value || '');
  if (!text) return null;
  const match =
    text.match(/(\d{2,4})\s*(?:m2|m²|мкв|м2|м²|sq ?m|кв\.?\s*м|квадрат[а-яё]*)/i) ||
    text.match(/(?:^|\n)[^\d\r\n]{0,8}[1-9]\s*[¹²³⁴⁵⁶⁷⁸⁹]?\s*\/\s*[0-9]{1,2}\s*\/\s*[0-9]{1,2}\s+(\d{2,4})\s*кв(?=\s|$)/im);
  return match ? Number(match[1]) : null;
}

export function parseHousingFloorFromText(value) {
  const text = String(value || '');
  if (!text) return { floor: null, totalFloors: null };
  const t = text.toLowerCase();
  const floorWord = '(?:этаж(?:да)?|поверх|qavat|қабат|қабатт|etaj|floor|эт\\.)';
  const valid = (floor, total) => floor >= 0 && floor <= 200 && (total == null || (total >= floor && total <= 200));

  if (/(?:^|\n)[^\d\r\n]{0,8}[1-9]\s*\/\s*0\s*\/\s*-1\s*(?:этаж|эт\.?)?[^\r\n]*(?:подвал|цоколь)/im.test(t)) return { floor: -1, totalFloors: null };

  const compact = t.match(/(?:^|\n)[^\d\r\n]{0,8}[1-9]\s*[¹²³⁴⁵⁶⁷⁸⁹]?\s*\/\s*([0-9]{1,2})\s*\/\s*([0-9]{1,2})[.,;:]?(?=\s|$)/m);
  if (compact) {
    const floor = Number(compact[1]);
    const total = Number(compact[2]);
    if (floor >= 1 && floor <= 40 && total >= 2 && total <= 40 && floor <= total) return { floor, totalFloors: total };
  }

  const labelledPair = t.match(/([1-9]\d?)\s*-?\s*(?:qavat|этаж|поверх|қабат)\s*(?:\/|из|iz|of)\s*([1-9]\d?)\s*-?\s*(?:qavatli|qavat|этаж(?:ей|ный)?|поверх(?:ів|овий)?|қабатты?)/i);
  if (labelledPair) {
    const floor = Number(labelledPair[1]);
    const total = Number(labelledPair[2]);
    if (floor <= 40 && total <= 40 && floor <= total) return { floor, totalFloors: total };
  }

  const sep = '(?:\\/|из|iz|of)';
  const pair = t.match(new RegExp(`${floorWord}\\D{0,4}(\\d{1,2})\\s*${sep}\\s*(\\d{1,2})`)) || t.match(new RegExp(`(\\d{1,2})\\s*${sep}\\s*(\\d{1,2})\\s*${floorWord}`));
  if (pair) {
    const floor = Number(pair[1]);
    const total = Number(pair[2]);
    if (valid(floor, total)) return { floor, totalFloors: total };
  }

  const notLetter = '(?!н|ей|ів|ност|ка|ки|s)';
  const single = t.match(new RegExp(`(\\d{1,2})[^\\S\\r\\n]*-?[^\\S\\r\\n]*(?:го|ом|ым|ой|ий|nd|rd|th|st|й|м|е)?[^\\S\\r\\n]*${floorWord}${notLetter}`)) || t.match(new RegExp(`${floorWord}\\s*[:№#]?\\s*(\\d{1,2})\\b`));
  if (single) {
    const floor = Number(single[1]);
    if (valid(floor, null)) {
      const explicitTotal = t.match(/(?:этажность|этажей|поверхови|поверховість|qavatlar(?:\s*soni)?|qavatli|қабатты?)\D{0,6}(\d{1,2})/);
      const leadingTotal = t.match(/([1-9]\d?)\s*-?\s*(?:этажн[а-яё]*|поверхов[а-яіїґ]*|qavatli|қабатты?)\s*(?:дом|здани|будин|uy|bino)?/i);
      const total = explicitTotal ? Number(explicitTotal[1]) : leadingTotal ? Number(leadingTotal[1]) : null;
      return { floor, totalFloors: total && total >= floor && total <= 200 ? total : null };
    }
  }

  const bare = t.match(/(?<![\d/])([1-9]\d?)\s*\/\s*([1-9]\d?)(?![\d/])/);
  if (bare) {
    const floor = Number(bare[1]);
    const total = Number(bare[2]);
    if (floor >= 1 && floor <= 40 && total >= 2 && total <= 40 && floor <= total) return { floor, totalFloors: total };
  }
  return { floor: null, totalFloors: null };
}

