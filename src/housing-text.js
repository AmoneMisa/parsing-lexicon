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

  // "li" excludes Uzbek "N qavatli" (an N-storey building), which states the
  // building's total floor count, not which floor this unit is on.
  const notLetter = '(?!н|ей|ів|ност|ка|ки|s|li|лик)';
  const single = t.match(new RegExp(`(\\d{1,2})[^\\S\\r\\n]*-?[^\\S\\r\\n]*(?:го|ом|ым|ой|ий|nd|rd|th|st|й|м|е)?[^\\S\\r\\n]*${floorWord}${notLetter}`)) || t.match(new RegExp(`${floorWord}\\s*[:№#]?\\s*(\\d{1,2})\\b`));
  if (single) {
    const floor = Number(single[1]);
    if (valid(floor, null)) {
      const explicitTotal = t.match(/(?:этажность|этажей|этажлик|поверхови|поверховість|qavatlar(?:\s*soni)?|qavatli|қабатты?)\D{0,6}(\d{1,2})/);
      const leadingTotal = t.match(/([1-9]\d?)\s*-?\s*(?:этаж(?:н[а-яё]*|лик)|поверхов[а-яіїґ]*|qavatli|қабатты?)\s*(?:дом|здани|будин|uy|bino)?/i);
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

  // A building's total floor count ("8 qavatli uy", "этажность: 9") is still
  // worth reporting even when no unit floor is stated at all.
  const totalOnly =
    t.match(/(?:этажность|этажей|этажлик|поверхови|поверховість|qavatlar(?:\s*soni)?|qavatli|қабатты?)\D{0,6}(\d{1,2})/) ||
    t.match(/([1-9]\d?)\s*-?\s*(?:этаж(?:н[а-яё]*|лик)|поверхов[а-яіїґ]*|qavatli|қабатты?)\s*(?:дом|здани|будин|uy|bino)?/i);
  if (totalOnly) {
    const total = Number(totalOnly[1]);
    if (total >= 1 && total <= 200) return { floor: null, totalFloors: total };
  }

  return { floor: null, totalFloors: null };
}

export function parseHousingAudience(value) {
  const text = String(value || '');
  if (!text) return null;
  const t = text.toLowerCase();
  if (/(?:семейн|сімейн|для семь|для сім)[^.\n]{0,80}(?:одиноч|мужчин|женщин|чоловік|жінок)|(?:одиноч|мужчин|женщин|чоловік|жінок)[^.\n]{0,80}(?:семейн|сімейн|для семь|для сім)/u.test(t)) return null;
  if (/(для семь|семейн|сімейн|для сім|для родин|for famil|families?|pentru famil|oila(?:ga| uchun|\s+qo['’`]?yiladi|\s+quyiladi)|оила|отбасы)/u.test(t)) return 'family';
  if (/(девуш|девоч|для дівч|дівчат|for girls|for women|only girls|doar fete|\bfete\b|qiz(?:lar|la)?(?:ga| uchun)?|(?:қ|к)из(?:лар|ла)?|қыздар)/u.test(t)) return 'women';
  if (/(парн(ей|ям)|для мужчин|мужчинам|для хлопц|for men\b|for boys|doar b[aă]ie[țt]i|yigit(lar)?(ga| uchun)?|(?:ў|у)гил\s*бол|жігіт|ер адам)/u.test(t)) return 'men';
  return null;
}

export function parseHousingAmenities(value) {
  const text = String(value || '');
  if (!text) return Object.freeze([]);
  const amenities = [];
  if (/(?:посудомо|посудомийн|dishwasher|idish\s*yuvish|idishyuvg|ma[șs]ina de sp[ăa]lat vase)/iu.test(text)) amenities.push('dishwasher');
  if (/(?:комнат\p{L}*\s+раздельн|изолированн\p{L}*\s+комнат|separate\s+rooms?)/iu.test(text)) amenities.push('separateRooms');
  if (/(?:стиральн\p{L}*\s+машин|washing\s+machine|kir\s*yuvish\s*mashin|kirmoshina|кир\s+ювиш\s+машина)/iu.test(text)) amenities.push('washingMachine');
  if (/(?:холодильник|refrigerator|fridge|muzlatgich|музлатгич|xolodilnik)/iu.test(text)) amenities.push('refrigerator');
  if (/(?:телевизор|телевизион|televizor|television|\btv\b)/iu.test(text)) amenities.push('television');
  if (/(?:кондицион|konditsioner|kansaner|air\s*con|aer\s+condi[țt]ionat)/iu.test(text)) amenities.push('airConditioner');
  if (/(?:интернет|internet|wi[ -]?fi|we[ -]?fi|вай\s*фай|vayfay|router|роутер)/iu.test(text)) amenities.push('internet');
  if (/(?:электроплит|электр\s*плит|electric\s+(?:stove|hob)|gaz\s*plita|варочн\p{L}*\s+панел)/iu.test(text)) amenities.push('stove');
  if (/(?:шкаф|гардероб|shkaf|шкафлар)/iu.test(text)) amenities.push('wardrobe');
  if (/(?:мебель|меблирован|mebel|mebelli|мебел)/iu.test(text)) amenities.push('furniture');
  if (/(?:кухонн\p{L}*\s+(?:техник|оборудован|гарнитур)|oshxona\s+jihoz|ошхона\s+жиҳоз)/iu.test(text)) amenities.push('kitchenEquipment');
  if (/(?:пластиков\p{L}*\s+окн|plastic\s+windows?|pvc\s+windows?)/iu.test(text)) amenities.push('plasticWindows');
  if (/(?:т[её]пл\p{L}*\s+пол|heated\s+floor|underfloor\s+heating|issiq\s+pol)/iu.test(text)) amenities.push('heatedFloor');
  if (/(?:бесплатн\p{L}*\s+парков|free\s+parking|bepul\s+(?:parking|avtoturargoh))/iu.test(text)) amenities.push('freeParking');
  if (/(?:вс[её]\s+необходим\p{L}*|для\s+проживани\p{L}*\s+вс[её]\s+есть|yashash\s+uchun\s+barcha\s+jihoz|яшаш\s+учун\s+барча\s+жиҳоз)/iu.test(text)) amenities.push('moveInReady');
  if (/(?:постельн\p{L}*\s+бель|bed\s*linen|toza\s+choyshab|yostiq\s+jild)/iu.test(text)) amenities.push('bedLinen');
  if (/(?:полотенц|towels?|sochiq)/iu.test(text)) amenities.push('towels');
  return Object.freeze(amenities);
}
