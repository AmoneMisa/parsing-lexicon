import { deepFreeze } from './lexicon-core.js';
import { findAllCanonical, findCanonical, normalizeUnicode } from './normalization.js';
import { CURRENCY_TERMS } from './money.js';
import { DEPOSIT_TERMS, SELLER_TERMS, UTILITY_TERMS } from './housing.js';
import { GENERIC_LANDMARK_TERMS } from './landmarks.js';
import { LOCATION_RELATIONS, parseHousingContext } from './housing-context.js';
import { resolveHousingIntent } from './housing-intent.js';

const NUMBER_WORDS = Object.freeze([
  [/(?<![\p{L}\p{N}_])(?:однушк\p{L}*|однокомнатн\p{L}*|1\s*[- ]?к(?:омн\p{L}*)?|1\s*[- ]?xona(?:li)?|1\s*[- ]?хона(?:лик|ли)?|1\s*бөлмелі|one[- ]bedroom|one[- ]room)(?![\p{L}\p{N}_])/iu, 1],
  [/(?<![\p{L}\p{N}_])(?:двушк\p{L}*|двухкомнатн\p{L}*|2\s*[- ]?к(?:омн\p{L}*)?|2\s*[- ]?xona(?:li)?|2\s*[- ]?хона(?:лик|ли)?|2\s*бөлмелі|two[- ]bedroom|two[- ]room)(?![\p{L}\p{N}_])/iu, 2],
  [/(?<![\p{L}\p{N}_])(?:тр[её]шк\p{L}*|трехкомнатн\p{L}*|трёхкомнатн\p{L}*|3\s*[- ]?к(?:омн\p{L}*)?|3\s*[- ]?xona(?:li)?|3\s*[- ]?хона(?:лик|ли)?|3\s*бөлмелі|three[- ]bedroom|three[- ]room)(?![\p{L}\p{N}_])/iu, 3],
  [/(?<![\p{L}\p{N}_])(?:четыр[её]хкомнатн\p{L}*|четыр[её]шк\p{L}*|4\s*[- ]?к(?:омн\p{L}*)?|4\s*[- ]?xona(?:li)?|4\s*[- ]?хона(?:лик|ли)?|4\s*бөлмелі|four[- ]bedroom|four[- ]room)(?![\p{L}\p{N}_])/iu, 4],
]);

function toNumber(value) {
  if (value == null) return null;
  const normalized = String(value).replace(/\s+/g, '').replace(',', '.');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function currencyNear(text) {
  return findCanonical(text, CURRENCY_TERMS, { partial: true })?.canonical || null;
}

export function parseHousingRoomCount(value) {
  const text = normalizeUnicode(value ?? '');
  if (!text) return null;
  for (const [re, rooms] of NUMBER_WORDS) if (re.test(text)) return rooms;
  const numeric = text.match(/(?:^|[^\p{L}\p{N}])(\d{1,2})\s*(?:[- ]?комнат\p{L}*|[- ]?к(?:\.|\b)|[- ]?xona(?:li)?|[- ]?хона(?:лик|ли)?|бөлмелі|rooms?)(?=$|[^\p{L}\p{N}])/iu);
  const rooms = toNumber(numeric?.[1]);
  return rooms != null && rooms >= 1 && rooms <= 20 ? rooms : null;
}

export function parseHousingFloor(value) {
  const text = normalizeUnicode(value ?? '');
  if (!text) return deepFreeze({ floor: null, totalFloors: null });

  const fraction = text.match(/(?:^|[^\d])(\d{1,3})\s*\/\s*(\d{1,3})(?=$|[^\d])/u);
  if (fraction) {
    const floor = toNumber(fraction[1]);
    const totalFloors = toNumber(fraction[2]);
    if (floor != null && totalFloors != null && floor <= totalFloors && totalFloors <= 200) {
      return deepFreeze({ floor, totalFloors });
    }
  }

  const reversePair = text.match(/(?:^|[^\d])(\d{1,3})\s*-?\s*(?:этаж|поверх|floor|etaj|qavat|қабат|кават|қават)\s*(?:\/|из|of|iz)\s*(\d{1,3})(?=$|[^\d])/iu);
  if (reversePair) {
    const floor = toNumber(reversePair[1]);
    const totalFloors = toNumber(reversePair[2]);
    if (floor != null && totalFloors != null && floor <= totalFloors && totalFloors <= 200) {
      return deepFreeze({ floor, totalFloors });
    }
  }

  const explicit = text.match(/(?:этаж|поверх|floor|etaj|qavat|қабат|кават|қават)\s*[:№#-]?\s*(\d{1,3})\s*(?:[,;/]|из|of|din|dan)?\s*(?:дом\s*)?(?:из\s*)?(\d{1,3})?\s*(?:этаж\p{L}*|поверх\p{L}*|floors?|etaje|qavatli|қабатты|каватли|қаватли)?/iu);
  let floor = toNumber(explicit?.[1]);
  let totalFloors = toNumber(explicit?.[2]);

  if (floor == null) {
    const beforeMarker = text.match(/(?:^|[^\d])(\d{1,3})\s*-?\s*(?:этаж(?:да)?|поверх|floor|etaj|qavat(?:da)?|қабат(?:та)?|кават(?:да)?|қават(?:да)?)(?=$|[^\p{L}\p{N}_])/iu);
    floor = toNumber(beforeMarker?.[1]);
  }

  if (totalFloors == null) {
    const total = text.match(/(?:дом\s*)?(\d{1,3})\s*(?:[- ]?этаж(?:н\p{L}*|лик)|поверхов\p{L}*|storey|story|floors?\s+total|qavatli|қабатты|каватли|қаватли)/iu);
    totalFloors = toNumber(total?.[1]);
  }

  if (floor != null && (floor < -5 || floor > 200)) floor = null;
  if (totalFloors != null && (totalFloors < 1 || totalFloors > 200)) totalFloors = null;
  if (floor != null && totalFloors != null && floor > totalFloors) totalFloors = null;
  return deepFreeze({ floor, totalFloors });
}

const AREA_LABELS = Object.freeze([
  ['living', /(?:жилая\s+площадь|жилая|living\s+area|suprafa(?:ță|ta)\s+locuibil(?:ă|a)|yashash\s+maydoni|тұрғын\s+аудан)/iu],
  ['kitchen', /(?:площадь\s+кухни|кухня|kitchen(?:\s+area)?|bucătărie|bucatarie|oshxona|асүй)/iu],
  ['balcony', /(?:балкон|лоджия|balcony|loggia|balcon|balkon)/iu],
  ['terrace', /(?:терраса|terrace|teras(?:ă|a)|terrasa)/iu],
  ['total', /(?:общая\s+площадь|площадь|total\s+area|surface\s+area|suprafa(?:ță|ta)(?:\s+total(?:ă|a))?|umumiy\s+maydon|жалпы\s+аудан)/iu],
]);

function areaAfterLabel(text, labelRe) {
  const re = new RegExp(`${labelRe.source}\\s*[:=-]?\\s*(\\d{1,4}(?:[.,]\\d{1,2})?)\\s*(?:м²|м2|m²|m2|sqm|sq\\.?\\s*m|mp|кв\\.?\\s*м)`, 'iu');
  return toNumber(text.match(re)?.[1]);
}

export function parseHousingAreas(value) {
  const text = normalizeUnicode(value ?? '');
  const result = { total: null, living: null, kitchen: null, balcony: null, terrace: null };
  if (!text) return deepFreeze(result);

  for (const [key, re] of AREA_LABELS) result[key] = areaAfterLabel(text, re);
  if (result.total == null) {
    const generic = text.match(/(?:^|[^\d])(\d{1,4}(?:[.,]\d{1,2})?)\s*(?:м²|м2|m²|m2|sqm|sq\.?\s*m|mp)(?=$|[^\p{L}\p{N}])/iu);
    result.total = toNumber(generic?.[1]);
  }
  for (const key of Object.keys(result)) {
    const number = result[key];
    if (number != null && (number <= 0 || number > 100000)) result[key] = null;
  }
  return deepFreeze(result);
}

function amountAroundKeyword(text, keywordRe) {
  const after = text.match(new RegExp(`${keywordRe.source}[^\\d$€₴₸]{0,24}([$€₴₸])?\\s*(\\d{1,9}(?:[.,]\\d{1,2})?)\\s*([\\p{L}.']{0,12})`, 'iu'));
  const before = text.match(new RegExp(`([$€₴₸])?\\s*(\\d{1,9}(?:[.,]\\d{1,2})?)\\s*([\\p{L}.']{0,12})[^\\d]{0,16}${keywordRe.source}`, 'iu'));
  const match = after || before;
  if (!match) return { amount: null, currency: null };
  const amount = toNumber(match[2]);
  const context = match[0];
  return { amount, currency: currencyNear(context) };
}

export function parseHousingPayments(value) {
  const text = normalizeUnicode(value ?? '');
  if (!text) return deepFreeze({
    deposit: { required: null, kind: null, amount: null, currency: null },
    prepaymentMonths: null,
    utilities: null,
    commission: { required: null, percent: null },
  });

  const depositMatches = Object.values(DEPOSIT_TERMS)
    .map((entry) => findCanonical(text, [entry], { partial: true })?.canonical)
    .filter(Boolean);
  const depositPriority = ['noDeposit', 'firstAndLastMonth', 'advance', 'refundableDeposit', 'deposit'];
  const depositKind = depositPriority.find((item) => depositMatches.includes(item)) || null;
  const depositAmount = amountAroundKeyword(text, /(?:депозит|залог|deposit|depozit|garanție|garantie|кепіл)/iu);
  const depositIsDuration = /(?:депозит|залог|deposit|depozit|garanție|garantie|кепіл)\D{0,18}\d{1,2}\s*(?:месяц\p{L}*|months?|oy|ай)(?=$|[^\p{L}\p{N}_])/iu.test(text);

  let prepaymentMonths = toNumber(text.match(/(?:предоплат\p{L}*|оплат\p{L}*\s+впер[её]д|prepay(?:ment)?|advance\s+payment|oldindan\s+to['’]?lov|алдын\s+ала\s+төлем)\D{0,18}(\d{1,2})\s*(?:месяц\p{L}*|months?|oy|ай)/iu)?.[1]);
  if (depositKind === 'firstAndLastMonth' && prepaymentMonths == null) prepaymentMonths = 2;

  let utilities = null;
  for (const entry of Object.values(UTILITY_TERMS)) {
    const matched = findCanonical(text, [entry], { partial: true });
    if (matched) { utilities = matched.canonical; break; }
  }

  const noCommission = SELLER_TERMS.noCommission && findCanonical(text, [SELLER_TERMS.noCommission], { partial: true });
  const shorthandCommission = text.match(/(?:^|[^\p{L}\p{N}_])[mм]\s*[:.\-]?\s*(\d{1,3})\s*%/iu);
  const commissionAfterKeyword = text.match(/(?:комисси\p{L}*|commission|comision|komissiya|маклер|makler|rieltor|vositachi)[^\d%]{0,16}(\d{1,3}(?:[.,]\d+)?)\s*%/iu);
  const commissionBeforeKeyword = text.match(/(\d{1,3}(?:[.,]\d+)?)\s*%\s*(?:комисси\p{L}*|commission|comision|komissiya|маклер|makler|rieltor|vositachi)/iu);
  const commissionPercent = toNumber(shorthandCommission?.[1] ?? commissionAfterKeyword?.[1] ?? commissionBeforeKeyword?.[1]);
  const commissionMentioned = Boolean(shorthandCommission) || (SELLER_TERMS.commission && findCanonical(text, [SELLER_TERMS.commission], { partial: true }));

  return deepFreeze({
    deposit: {
      required: depositKind === 'noDeposit' ? false : depositKind ? true : null,
      kind: depositKind,
      amount: depositIsDuration ? null : depositAmount.amount,
      currency: depositIsDuration ? null : depositAmount.currency,
    },
    prepaymentMonths,
    utilities,
    commission: {
      required: noCommission ? false : (commissionMentioned || commissionPercent != null ? true : null),
      percent: commissionPercent,
    },
  });
}

export function parseHousingSeller(value) {
  const text = normalizeUnicode(value ?? '');
  if (!text) return deepFreeze({ type: null, confidence: 0 });
  const owner = SELLER_TERMS.owner && findCanonical(text, [SELLER_TERMS.owner], { partial: true });
  const agencyTerm = SELLER_TERMS.agency && findCanonical(text, [SELLER_TERMS.agency], { partial: true });
  const commissionTerm = SELLER_TERMS.commission && findCanonical(text, [SELLER_TERMS.commission], { partial: true });
  const agencyTypo = /(?:^|[^\p{L}\p{N}_])агенств[аоы](?=$|[^\p{L}\p{N}_])/iu.test(text);
  const brokerageProse = /(?:профессиональн\p{L}*\s+)?подбор[^.\r\n]{0,80}(?:вариант\p{L}*|недвижим\p{L}*)/iu.test(text);
  const shorthandCommission = /(?:^|[^\p{L}\p{N}_])[mм]\s*\d{1,3}\s*%/iu.test(text);
  const agency = agencyTerm || commissionTerm || agencyTypo || brokerageProse || shorthandCommission;
  if (owner && !agency) return deepFreeze({ type: 'owner', confidence: 1 });
  if (agency && !owner) return deepFreeze({ type: 'agency', confidence: 1 });
  if (owner && agency) return deepFreeze({ type: null, confidence: 0.45 });
  return deepFreeze({ type: null, confidence: 0 });
}

function distanceFromWindow(window, entityOffset = 0) {
  const candidates = [];
  const minuteRe = /(\d{1,3})\s*(?:мин(?:ут[аы]?)?|minutes?|min\.?|daqiqa|минут|мин|минөт)/giu;
  for (const match of window.matchAll(minuteRe)) {
    const index = match.index ?? 0;
    const local = window.slice(Math.max(0, index - 18), Math.min(window.length, index + match[0].length + 28));
    const mode = /(?:пешком|walk(?:ing)?|on\s+foot|piyoda|жаяу)/iu.test(local)
      ? 'walk'
      : /(?:на\s+машине|by\s+car|drive|mashinada|көлікпен)/iu.test(local) ? 'drive' : null;
    candidates.push({ distance: Math.abs(index - entityOffset), value: Number(match[1]), unit: 'minute', mode });
  }
  const metricRe = /(\d{1,4}(?:[.,]\d+)?)\s*(км|km|километр\p{L}*|м|meter(?:s)?|метр\p{L}*)/giu;
  for (const match of window.matchAll(metricRe)) {
    const index = match.index ?? 0;
    const rawUnit = match[2].toLocaleLowerCase();
    candidates.push({ distance: Math.abs(index - entityOffset), value: toNumber(match[1]), unit: /км|km|километр/u.test(rawUnit) ? 'kilometer' : 'meter', mode: null });
  }
  candidates.sort((a, b) => a.distance - b.distance);
  if (!candidates.length) return null;
  const { value, unit, mode } = candidates[0];
  return { value, unit, mode };
}

export function parseHousingInfrastructure(value) {
  const text = normalizeUnicode(value ?? '');
  if (!text) return [];
  const matches = findAllCanonical(text, GENERIC_LANDMARK_TERMS);
  const out = [];
  const seen = new Set();
  for (const match of matches) {
    const key = `${match.canonical}:${match.start}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const left = Math.max(0, match.start - 80);
    const right = Math.min(text.length, match.end + 80);
    const window = text.slice(left, right);
    out.push(deepFreeze({
      poi: match.canonical,
      relation: findCanonical(window, LOCATION_RELATIONS, { partial: true })?.canonical || null,
      distance: distanceFromWindow(window, match.start - left),
      start: match.start,
      end: match.end,
    }));
  }
  return Object.freeze(out);
}

export function parseHousingStructured(value) {
  const text = String(value ?? '');
  return deepFreeze({
    intent: resolveHousingIntent(text),
    context: parseHousingContext(text),
    rooms: parseHousingRoomCount(text),
    floor: parseHousingFloor(text),
    area: parseHousingAreas(text),
    payments: parseHousingPayments(text),
    seller: parseHousingSeller(text),
    infrastructure: parseHousingInfrastructure(text),
  });
}