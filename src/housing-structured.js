import { deepFreeze } from './lexicon-core.js';
import { findAllCanonical, findCanonical, normalizeUnicode } from './normalization.js';
import { CURRENCY_TERMS } from './money.js';
import { moneyCurrencyFromText } from './money-core.js';
import { DEPOSIT_TERMS, SELLER_TERMS, UTILITY_TERMS } from './housing.js';
import { GENERIC_LANDMARK_TERMS } from './landmarks.js';
import { LOCATION_RELATIONS, parseHousingContext } from './housing-context.js';
import { resolveHousingIntent } from './housing-intent.js';
import { countryCurrency, countryPhoneHint } from './country-context.js';
import { findTelegramContacts, maskPhoneLikeSpans, parsePhoneNumbers } from './contact.js';
import { parseHousingAddress } from './housing-address.js';
import { parseHousingListingFields } from './housing-listing-fields.js';
import { parseHousingPrice } from './housing-money.js';
import { parseHousingAmenities, parseHousingResidentialComplex } from './housing-text.js';
import { parseHousingSourcePost } from './housing-source-aliases.js';

const NUMBER_WORDS = Object.freeze([
  [/(?<![\p{L}\p{N}_])(?:однушк\p{L}*|однокомнатн\p{L}*|bir\s+xona(?:li)?|бир\s+хона(?:ли|лик)?|1\s*(?:-\s*)?к(?:омн\p{L}*)?|1\s*(?:-\s*)?xona(?:li)?|1\s*(?:-\s*)?хона(?:лик|ли)?|1\s*бөлмелі|one[- ]bedroom|one[- ]room)(?![\p{L}\p{N}_])/iu, 1],
  [/(?<![\p{L}\p{N}_])(?:двушк\p{L}*|двухкомнатн\p{L}*|ikki\s+xona(?:li)?|икки\s+хона(?:ли|лик)?|2\s*(?:-\s*)?к(?:омн\p{L}*)?|2\s*(?:-\s*)?xona(?:li)?|2\s*(?:-\s*)?хона(?:лик|ли)?|2\s*бөлмелі|two[- ]bedroom|two[- ]room)(?![\p{L}\p{N}_])/iu, 2],
  [/(?<![\p{L}\p{N}_])(?:тр[её]шк\p{L}*|трехкомнатн\p{L}*|трёхкомнатн\p{L}*|uch\s+xona(?:li)?|уч\s+хона(?:ли|лик)?|3\s*(?:-\s*)?к(?:омн\p{L}*)?|3\s*(?:-\s*)?xona(?:li)?|3\s*(?:-\s*)?хона(?:лик|ли)?|3\s*бөлмелі|three[- ]bedroom|three[- ]room)(?![\p{L}\p{N}_])/iu, 3],
  [/(?<![\p{L}\p{N}_])(?:четыр[её]хкомнатн\p{L}*|четыр[её]шк\p{L}*|to['’]?rt\s+xona(?:li)?|tort\s+xona(?:li)?|тўрт\s+хона(?:ли|лик)?|турт\s+хона(?:ли|лик)?|4\s*(?:-\s*)?к(?:омн\p{L}*)?|4\s*(?:-\s*)?xona(?:li)?|4\s*(?:-\s*)?хона(?:лик|ли)?|4\s*бөлмелі|four[- ]bedroom|four[- ]room)(?![\p{L}\p{N}_])/iu, 4],
  [/(?<![\p{L}\p{N}_])(?:пятикомнатн\p{L}*|besh\s+xona(?:li)?|беш\s+хона(?:ли|лик)?|5\s*(?:-\s*)?к(?:омн\p{L}*)?|5\s*(?:-\s*)?xona(?:li)?|5\s*(?:-\s*)?хона(?:лик|ли)?|five[- ]bedroom|five[- ]room)(?![\p{L}\p{N}_])/iu, 5],
  [/(?<![\p{L}\p{N}_])(?:шестикомнатн\p{L}*|olti\s+xona(?:li)?|олти\s+хона(?:ли|лик)?|6\s*(?:-\s*)?к(?:омн\p{L}*)?|6\s*(?:-\s*)?xona(?:li)?|6\s*(?:-\s*)?хона(?:лик|ли)?|six[- ]bedroom|six[- ]room)(?![\p{L}\p{N}_])/iu, 6],
  [/(?<![\p{L}\p{N}_])(?:семикомнатн\p{L}*|yetti\s+xona(?:li)?|етти\s+хона(?:ли|лик)?|7\s*(?:-\s*)?к(?:омн\p{L}*)?|7\s*(?:-\s*)?xona(?:li)?|7\s*(?:-\s*)?хона(?:лик|ли)?|seven[- ]bedroom|seven[- ]room)(?![\p{L}\p{N}_])/iu, 7],
  [/(?<![\p{L}\p{N}_])(?:восьмикомнатн\p{L}*|sakkiz\s+xona(?:li)?|саккиз\s+хона(?:ли|лик)?|8\s*(?:-\s*)?к(?:омн\p{L}*)?|8\s*(?:-\s*)?xona(?:li)?|8\s*(?:-\s*)?хона(?:лик|ли)?|eight[- ]bedroom|eight[- ]room)(?![\p{L}\p{N}_])/iu, 8],
  [/(?<![\p{L}\p{N}_])(?:девятикомнатн\p{L}*|to['’]?qqiz\s+xona(?:li)?|toqqiz\s+xona(?:li)?|тўққиз\s+хона(?:ли|лик)?|токкиз\s+хона(?:ли|лик)?|9\s*(?:-\s*)?к(?:омн\p{L}*)?|9\s*(?:-\s*)?xona(?:li)?|9\s*(?:-\s*)?хона(?:лик|ли)?|nine[- ]bedroom|nine[- ]room)(?![\p{L}\p{N}_])/iu, 9],
  [/(?<![\p{L}\p{N}_])(?:десятикомнатн\p{L}*|o['’]?n\s+xona(?:li)?|on\s+xona(?:li)?|ўн\s+хона(?:ли|лик)?|он\s+хона(?:ли|лик)?|10\s*(?:-\s*)?к(?:омн\p{L}*)?|10\s*(?:-\s*)?xona(?:li)?|10\s*(?:-\s*)?хона(?:лик|ли)?|ten[- ]bedroom|ten[- ]room)(?![\p{L}\p{N}_])/iu, 10],
]);

const FIRST_FLOOR_WORD_RE = /(?<![\p{L}\p{N}_])(?:перш(?:ий\s+поверх|ому\s+поверс(?:і|у))|(?:на\s+)?першому\s+поверсі|перв(?:ый\s+этаж|ом\s+этаже)|(?:на\s+)?первом\s+этаже)(?![\p{L}\p{N}_])/iu;

function toNumber(value) {
  if (value == null) return null;
  const normalized = String(value).replace(/\s+/g, '').replace(',', '.');
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function currencyNear(text) {
  // findCanonical's partial match requires the alias to be its own
  // space-delimited token, so a currency symbol glued directly to its
  // number with no space ("500.$", "350$") never matches. Fall back to
  // moneyCurrencyFromText, which detects symbols and codes independent of
  // surrounding whitespace (used by parseHousingPrice for the same reason).
  return findCanonical(text, CURRENCY_TERMS, { partial: true })?.canonical
    || moneyCurrencyFromText(text) || null;
}

export function parseHousingRoomCount(value) {
  const text = normalizeUnicode(value ?? '');
  if (!text) return null;

  // Uzbek market shorthand: a unit formally registered as N rooms that was
  // physically converted into a different count ("1 xonali ... 2 xona
  // qilingan" — nominally 1-room, made into 2). The converted count is the
  // one that matters and must win over the nominal count mentioned earlier
  // in the same text.
  const converted = text.match(/(\d{1,2})\s*(?:ta\s*)?xona(?:ga)?\s+(?:qilingan|aylantirilgan|bo['’ʻʼ‘`]?lingan)(?=$|[^\p{L}\p{N}_])/iu);
  if (converted) {
    const rooms = toNumber(converted[1]);
    if (rooms != null && rooms >= 1 && rooms <= 20) return rooms;
  }

  const describedRooms = [...text.matchAll(/(?:^|[^\p{L}\p{N}_])(\d{1,2})\s*ta\s+(?:katta|kichkina)\s+xona(?=$|[^\p{L}\p{N}_])/giu)];
  if (describedRooms.length > 1) {
    const total = describedRooms.reduce((sum, match) => sum + Number(match[1]), 0);
    if (total >= 1 && total <= 20) return total;
  }
  for (const [re, rooms] of NUMBER_WORDS) if (re.test(text)) return rooms;
  const numeric = text.match(/(?:^|[^\p{L}\p{N}])(\d{1,2})\s*(?:(?:-\s*)?комнат\p{L}*|(?:-\s*)?к(?:\.|\b)|(?:-\s*)?xona(?:li)?|(?:-\s*)?хона(?:лик|ли)?|бөлмелі|rooms?)(?=$|[^\p{L}\p{N}])/iu);
  if (numeric) {
    const rooms = toNumber(numeric[1]);
    if (rooms != null && rooms >= 1 && rooms <= 20) return rooms;
  }

  // Structured "Label - Value" reposts (Telegram channel copies of OLX ads)
  // put the label before the number: "Комнат - 4" instead of "4 комнаты".
  const reversed = text.match(/(?:комнат\p{L}*|xona(?:lar)?(?:i)?|хона(?:лар)?(?:и|лик|ли)?|rooms?)\s*[-:–—]\s*(\d{1,2})(?=$|[^\p{L}\p{N}])/iu);
  const reversedRooms = toNumber(reversed?.[1]);
  return reversedRooms != null && reversedRooms >= 1 && reversedRooms <= 20 ? reversedRooms : null;
}

export function parseHousingFloor(value) {
  const text = normalizeUnicode(value ?? '');
  if (!text) return deepFreeze({ floor: null, totalFloors: null });

  // Common classifieds shorthand is rooms/floor/total floors, e.g. 2/10/16.
  // It must be checked before the generic floor/total fraction parser or the
  // first two numbers would incorrectly become floor=2, totalFloors=10.
  // Requiring the triple to occupy its own line avoids treating dates as this
  // housing-specific shorthand inside ordinary prose.
  const compactTriple = text.match(/(?:^|[\r\n])\s*(\d{1,2})\s*[\/\\]\s*(\d{1,3})\s*[\/\\]\s*(\d{1,3})\s*(?=$|[\r\n])/u);
  if (compactTriple) {
    const rooms = toNumber(compactTriple[1]);
    const floor = toNumber(compactTriple[2]);
    const totalFloors = toNumber(compactTriple[3]);
    if (rooms != null && rooms >= 1 && rooms <= 20
      && floor != null && totalFloors != null
      && floor >= 1 && floor <= totalFloors && totalFloors <= 200) {
      return deepFreeze({ floor, totalFloors });
    }
  }

  const fraction = text.match(/(?:^|[^\d])(\d{1,3})\s*[\/\\]\s*(\d{1,3})(?=$|[^\d])/u);
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

  // Prefer the common "7 этаж" form before trying "этаж 7". Otherwise the
  // marker-first parser can consume the next unrelated number (for example
  // "7 этаж 44м²") and report floor 44.
  const beforeMarker = text.match(/(?:^|[^\d])(\d{1,3})\s*-?\s*(?:(?:chi|чи)\s*)?(?:этаж(?:да)?|поверх|floor|etaj|qavat(?:i(?:da(?:gi)?)?|da)?|қабат(?:ы(?:нда(?:ғы)?)?|та)?|кават(?:и(?:да(?:ги)?)?|да)?|қават(?:и(?:да(?:gi)?)?|да)?)(?=$|[^\p{L}\p{N}_])/iu);
  let floor = toNumber(beforeMarker?.[1]);
  let totalFloors = null;

  if (floor == null) {
    const explicit = text.match(/(?:этаж|поверх|floor|etaj|qavat|қабат|кават|қават)[^\S\r\n]*[:№#-]?[^\S\r\n]*(\d{1,3})[^\S\r\n]*(?:[,;/]|из|of|din|dan)?[^\S\r\n]*(?:дом[^\S\r\n]*)?(?:из[^\S\r\n]*)?(\d{1,3})?[^\S\r\n]*(?:этаж\p{L}*|поверх\p{L}*|floors?|etaje|qavatli|қабатты|каватли|қаватли)?/iu);
    floor = toNumber(explicit?.[1]);
    totalFloors = toNumber(explicit?.[2]);
  }

  if (floor == null && FIRST_FLOOR_WORD_RE.test(text)) floor = 1;

  if (totalFloors == null) {
    const total = text.match(/(?:дом\s*)?(\d{1,3})\s*(?:[- ]?этаж(?:н\p{L}*|лик)|поверхов\p{L}*|storey|story|floors?\s+total|qavatli|қабатты|каватли|қаватли)/iu);
    totalFloors = toNumber(total?.[1]);
  }

  if (totalFloors == null) {
    // Structured "Label - Value" reposts: "Этажность - 5" instead of "5 этажей".
    const reversedTotal = text.match(/(?:этажность|поверховість|qavatlilik|қабаттылық)\s*[-:–—]\s*(\d{1,3})(?=$|[^\p{L}\p{N}])/iu);
    totalFloors = toNumber(reversedTotal?.[1]);
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

const AREA_UNIT_RE = String.raw`(?:м²|м2|m²|m2|sqm|sq\.?\s*m|mp|кв\.?\s*м|кв2|квадрат\p{L}*)`;

function areaAfterLabel(text, labelRe) {
  const re = new RegExp(`${labelRe.source}\\s*[:=-]?\\s*(\\d{1,4}(?:[.,]\\d{1,2})?)\\s*${AREA_UNIT_RE}`, 'iu');
  return toNumber(text.match(re)?.[1]);
}

export function parseHousingAreas(value) {
  const text = normalizeUnicode(value ?? '');
  const result = { total: null, living: null, kitchen: null, balcony: null, terrace: null };
  if (!text) return deepFreeze(result);

  for (const [key, re] of AREA_LABELS) result[key] = areaAfterLabel(text, re);
  if (result.total == null) {
    const generic = text.match(new RegExp(`(?:^|[^\\d])(\\d{1,4}(?:[.,]\\d{1,2})?)\\s*${AREA_UNIT_RE}(?=$|[^\\p{L}\\p{N}])`, 'iu'));
    result.total = toNumber(generic?.[1]);
  }
  for (const key of Object.keys(result)) {
    const number = result[key];
    if (number != null && (number <= 0 || number > 100000)) result[key] = null;
  }
  return deepFreeze(result);
}

function amountAroundKeyword(text, keywordRe) {
  const value = maskPhoneLikeSpans(text);
  const after = value.match(new RegExp(`${keywordRe.source}[^\\d$€₴₸\\r\\n]{0,24}([$€₴₸])?\\s*(\\d{1,3}(?:[ \\u00a0]\\d{3})+|\\d{1,9}(?:[.,]\\d{1,2})?)\\s*([\\p{L}.'$€₴₸]{0,12})`, 'iu'));
  const before = value.match(new RegExp(`([$€₴₸])?\\s*(\\d{1,3}(?:[ \\u00a0]\\d{3})+|\\d{1,9}(?:[.,]\\d{1,2})?)\\s*([\\p{L}.']{0,12})[^\\d\\r\\n]{0,16}${keywordRe.source}`, 'iu'));
  const match = after || before;
  if (!match) return { amount: null, currency: null };
  const amount = toNumber(match[2]);
  const context = match[0];
  return { amount, currency: currencyNear(context) };
}

const DEPOSIT_KEYWORD_RE = /(?:депозит|залог|deposit|depozit|depazit(?:i)?|garanție|garantie|кепіл)/iu;
const COMMISSION_KEYWORD_RE = /(?:комисси\p{L}*|commission|comision|komissiya|маклер|makler|rieltor|vositachi)/iu;

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
  const depositAmount = amountAroundKeyword(text, DEPOSIT_KEYWORD_RE);
  const depositIsDuration = new RegExp(`${DEPOSIT_KEYWORD_RE.source}\\D{0,18}\\d{1,2}\\s*(?:месяц\\p{L}*|months?|oy|ай)(?=$|[^\\p{L}\\p{N}_])`, 'iu').test(text);

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

function parseHousingPaymentDetails(value) {
  const text = normalizeUnicode(value ?? '');
  const base = parseHousingPayments(text);
  const depositDuration = text.match(new RegExp(`${DEPOSIT_KEYWORD_RE.source}\\D{0,18}(\\d{1,2})\\s*(?:месяц\\p{L}*|months?|oy|ай)(?=$|[^\\p{L}\\p{N}_])`, 'iu'));
  const depositMonths = base.deposit.required === false ? null : toNumber(depositDuration?.[1]);
  const commissionAmount = base.commission.required === true && base.commission.percent == null
    ? amountAroundKeyword(text, COMMISSION_KEYWORD_RE)
    : { amount: null, currency: null };

  return deepFreeze({
    ...base,
    depositMonths,
    commissionAmount: {
      amount: commissionAmount.amount,
      currency: commissionAmount.currency,
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

function landmarkIdentity(text, match) {
  const before = text.slice(Math.max(0, match.start - 72), match.start);
  let rawStart = match.start;
  let name = null;
  let number = null;

  const quoted = before.match(/["'«“„]\s*([^"'«»“”„\r\n]{2,60})\s*["'»”]\s*$/u);
  if (quoted) {
    name = quoted[1].trim() || null;
    rawStart = match.start - quoted[0].length;
  }

  const numbered = before.match(/(\d{1,4})\s*[-№#]?\s*$/u);
  if (numbered) {
    const localStart = before.length - numbered[0].length;
    const previous = localStart > 0 ? before[localStart - 1] : '';
    if (!previous || !/[\p{L}\p{N}_]/u.test(previous)) {
      number = Number(numbered[1]);
      rawStart = match.start - numbered[0].length;
    }
  }

  return {
    raw: text.slice(rawStart, match.end).trim() || match.alias,
    name,
    number,
  };
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
    const identity = landmarkIdentity(text, match);
    out.push(deepFreeze({
      poi: match.canonical,
      raw: identity.raw,
      name: identity.name,
      number: identity.number,
      relation: findCanonical(window, LOCATION_RELATIONS, { partial: true })?.canonical || null,
      distance: distanceFromWindow(window, match.start - left),
      start: match.start,
      end: match.end,
    }));
  }
  return Object.freeze(out);
}

const CONTACT_NAME_STOP_RE = /^(?:тел(?:ефон)?|phone|contact|контакт|моб|mobile|whats?app|viber|telegram|агент(?:ство)?|риелтор|риэлтор|маклер|owner|хозяин|собственник|aloqa|звонить|звоните)$/iu;

function normalizeContactName(value) {
  const raw = String(value || '').trim().replace(/^[\s:;,()\-–—]+|[\s:;,()\-–—]+$/gu, '');
  if (!raw || raw.length > 64) return null;
  const words = raw.split(/\s+/u).filter(Boolean);
  if (!words.length || words.length > 3 || words.some((word) => CONTACT_NAME_STOP_RE.test(word))) return null;
  return words.every((word) => /^[\p{L}][\p{L}'’.-]{1,30}$/u.test(word)) ? words.join(' ') : null;
}

function contactNameNear(text, phone) {
  const lineEnd = text.indexOf('\n', phone.end);
  const after = text.slice(phone.end, lineEnd === -1 ? Math.min(text.length, phone.end + 72) : Math.min(lineEnd, phone.end + 72));
  const afterMatch = after.match(/^[\s:;,()\-–—]*([\p{L}][\p{L}'’.-]{1,30}(?:\s+[\p{L}][\p{L}'’.-]{1,30}){0,2})/u);
  const afterName = normalizeContactName(afterMatch?.[1]);
  if (afterName) return afterName;

  const lineStart = text.lastIndexOf('\n', Math.max(0, phone.start - 1));
  const before = text.slice(Math.max(0, lineStart + 1), phone.start).slice(-72);
  const beforeMatch = before.match(/([\p{L}][\p{L}'’.-]{1,30}(?:\s+[\p{L}][\p{L}'’.-]{1,30}){0,2})[\s:;,()\-–—]*$/u);
  return normalizeContactName(beforeMatch?.[1]);
}

function parseHousingContacts(text, { countryHint = null, sourcePost = null } = {}) {
  const phones = parsePhoneNumbers(text, { countryHint }).map((phone) => Object.freeze({
    ...phone,
    name: contactNameNear(text, phone),
  }));
  const telegram = findTelegramContacts(text);
  const source = sourcePost?.contact
    ? Object.freeze({ source: sourcePost.source, value: sourcePost.contact })
    : null;
  return Object.freeze({ phones: Object.freeze(phones), telegram, source });
}

export function parseHousingStructured(value, options = {}) {
  const original = String(value ?? '');
  const sourcePost = parseHousingSourcePost(original, { source: options.source });
  const text = sourcePost.text;
  const country = String(options.country || '').trim();
  const fallbackCurrency = options.fallbackCurrency || countryCurrency(country) || '';
  const phoneCountry = options.phoneCountry || countryPhoneHint(country) || null;

  return deepFreeze({
    text,
    source: {
      platform: sourcePost.source,
      contact: sourcePost.contact,
    },
    intent: resolveHousingIntent(text),
    context: parseHousingContext(text),
    rooms: parseHousingRoomCount(text),
    floor: parseHousingFloor(text),
    area: parseHousingAreas(text),
    price: parseHousingPrice(text, fallbackCurrency),
    address: parseHousingAddress(text, {
      knownStreet: options.knownStreet || null,
      allowDelimitedBare: options.allowDelimitedBareAddress === true,
      allowBare: options.allowBareAddress === true,
    }),
    residentialComplex: parseHousingResidentialComplex(text),
    amenities: parseHousingAmenities(text),
    listingFields: parseHousingListingFields(text, { country }),
    payments: parseHousingPaymentDetails(text),
    seller: parseHousingSeller(text),
    infrastructure: parseHousingInfrastructure(text),
    contacts: parseHousingContacts(text, { countryHint: phoneCountry, sourcePost }),
  });
}
