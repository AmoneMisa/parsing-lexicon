import { findCanonical } from './normalization.js';
import { lexiconEntity } from './lexicon-core.js';
import { findPhoneLikeSpans } from './contact.js';

const group = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, extra);
const KK_RENT_OUT_ALIASES = Object.freeze(['жалға беремін', 'жалға беріледі']);
const RO_SALE_OFFER_ALIASES = Object.freeze(['de vânzare', 'de vanzare']);
const UZ_CONTEXTUAL_RENT_OUT_RE = /(?:^|[^\p{L}\p{N}_])(?:ijaraga|ижарага)(?=$|[^\p{L}\p{N}_])[^.!?\r\n]{0,48}(?:beraman|beriladi|topshiraman|бераман|берилади|топшираман)(?=$|[^\p{L}\p{N}_])/iu;
const UZ_PER_DAY_RE = /(?:^|[^\p{L}\p{N}_])(?:kuniga|кунига)(?=$|[^\p{L}\p{N}_])/iu;
const UZ_DAILY_RENT_PRICE_RE = /(?:narx|нарх|ijara|ижара|to['’`]?lov|т[ўу]лов|оплата)[^.!?\r\n]{0,48}(?:kuniga|кунига)|(?:kuniga|кунига)[^.!?\r\n]{0,48}(?:narx|нарх|ijara|ижара|to['’`]?lov|т[ўу]лов|оплата)/iu;

// "ищу квартиру" / "шукаю квартиру" style aliases only match a literal,
// adjacent phrase. Real posts routinely insert a room count or adjective
// between the search verb and the housing noun ("Ищу 2-комнатную квартиру"),
// which left those posts unclassified -- neither offer nor wanted -- so they
// slipped past the propertyWanted filter and were shown as if someone were
// offering the flat. These contextual patterns allow a short bounded gap
// between the verb and the noun, and the gap is inspected for a "buy" marker
// so "ищу купить 2-комнатную квартиру" still resolves to buy, not rentIn.
const WANTED_GAP = '([^.!?\\r\\n]{0,40}?)';
const WANTED_CONTEXT_RE = Object.freeze([
  new RegExp(`(?:^|[^\\p{L}\\p{N}_])(?:ищу|сниму|хочу\\s+снять|хочу\\s+купить|нужна|нужно|нужен)(?=$|[^\\p{L}\\p{N}_])${WANTED_GAP}(?:квартир\\p{L}*|жиль[ёе]\\p{L}*|комнат\\p{L}*)(?=$|[^\\p{L}\\p{N}_])`, 'iu'),
  new RegExp(`(?:^|[^\\p{L}\\p{N}_])(?:шукаю|зніму|хочу\\s+зняти|хочу\\s+купити|потрібна|потрібно|потрібен)(?=$|[^\\p{L}\\p{N}_])${WANTED_GAP}(?:квартир\\p{L}*|житл\\p{L}*|кімнат\\p{L}*|будин\\p{L}*)(?=$|[^\\p{L}\\p{N}_])`, 'iu'),
]);
const WANTED_BUY_MARKER_RE = /(?:купить|покупки|покупку|купити|купівлі)/iu;

function detectContextualWantedAction(text) {
  for (const re of WANTED_CONTEXT_RE) {
    const match = text.match(re);
    if (match) return WANTED_BUY_MARKER_RE.test(match[1] || '') ? 'buy' : 'rentIn';
  }
  return null;
}

export const HOUSING_ACTIONS = Object.freeze([
  group('sell', {
    ru: ['продам', 'продаю', 'продаётся', 'продается', 'выставил на продажу', 'выставила на продажу'],
    en: ['selling', 'for sale', 'selling apartment', 'selling house'],
    uk: ['продам', 'продаю', 'продається'],
    ro: ['vând', 'vand', ...RO_SALE_OFFER_ALIASES, 'se vinde'],
    uzLatn: ['sotaman', 'sotiladi', 'sotuvga qoyildi', "sotuvga qo'yildi"],
    uzCyrl: ['сотаман', 'сотилади', 'сотувга қўйилди'],
    kk: ['сатамын', 'сатылады', 'сатылымға қойылды'],
  }),
  group('buy', {
    ru: ['куплю', 'хочу купить', 'ищу купить', 'ищу для покупки', 'нужна квартира для покупки'],
    en: ['want to buy', 'looking to buy', 'looking for a property to buy', 'need an apartment to buy'],
    uk: ['куплю', 'хочу купити', 'шукаю купити', 'шукаю для купівлі'],
    ro: ['vreau să cumpăr', 'vreau sa cumpar', 'caut să cumpăr', 'caut sa cumpar'],
    uzLatn: ['sotib olaman', 'sotib olish uchun qidiryapman', 'sotib olishga uy qidiryapman'],
    uzCyrl: ['сотиб оламан', 'сотиб олиш учун қидиряпман', 'сотиб олишга уй қидиряпман'],
    kk: ['сатып аламын', 'сатып алуға іздеймін', 'сатып алуға пәтер іздеймін'],
  }),
  group('rentOut', {
    ru: ['сдам', 'сдаю', 'сдаётся', 'сдается', 'сдаётся в аренду', 'сдается в аренду'],
    en: ['for rent', 'renting out', 'available for rent', 'letting'],
    uk: ['здам', 'здаю', 'здається', 'здається в оренду'],
    ro: ['închiriez', 'inchiriez', 'de închiriat', 'de inchiriat', 'se închiriază', 'se inchiriaza'],
    uzLatn: ['ijaraga beraman', 'ijaraga beriladi', 'ijaraga topshiraman'],
    uzCyrl: ['ижарага бераман', 'ижарага берилади', 'ижарага топшираман'],
    kk: KK_RENT_OUT_ALIASES,
  }),
  group('rentIn', {
    ru: ['сниму', 'хочу снять', 'ищу снять', 'ищу квартиру', 'ищу жильё', 'ищу жилье', 'нужна квартира', 'нужно жильё', 'нужно жилье'],
    en: ['looking to rent', 'want to rent', 'need an apartment', 'looking for an apartment', 'looking for housing'],
    uk: ['зніму', 'хочу зняти', 'шукаю квартиру', 'шукаю житло', 'потрібна квартира'],
    ro: ['vreau să închiriez', 'vreau sa inchiriez', 'caut să închiriez', 'caut sa inchiriez', 'caut apartament'],
    uzLatn: ['ijaraga olaman', 'uy qidiryapman', 'kvartira qidiryapman', 'ijara uchun uy qidiryapman'],
    uzCyrl: ['ижарага оламан', 'уй қидиряпман', 'квартира қидиряпман', 'ижара учун уй қидиряпман'],
    kk: ['жалға аламын', 'пәтер іздеймін', 'үй іздеймін', 'жалға пәтер іздеймін'],
  }),
]);

export const HOUSING_INTENT = Object.freeze([
  group('offer', {
    ru: ['продам', 'продаю', 'продаётся', 'продается', 'сдам', 'сдаю', 'сдаётся', 'сдается'],
    en: ['for sale', 'selling', 'for rent', 'renting out'],
    uk: ['продам', 'продаю', 'продається', 'здам', 'здаю', 'здається'],
    ro: ['vând', 'vand', 'de vânzare', 'de vanzare', 'închiriez', 'inchiriez', 'de închiriat', 'de inchiriat'],
    uzLatn: ['sotaman', 'sotiladi', 'ijaraga beraman', 'ijaraga beriladi'],
    uzCyrl: ['сотаман', 'сотилади', 'ижарага бераман', 'ижарага берилади'],
    kk: ['сатамын', 'сатылады', 'жалға беремін', 'жалға беріледі'],
  }),
  group('wanted', {
    ru: ['куплю', 'ищу купить', 'сниму', 'ищу квартиру', 'ищу жильё', 'ищу жилье', 'нужна квартира'],
    en: ['looking to buy', 'want to buy', 'looking to rent', 'need an apartment'],
    uk: ['куплю', 'шукаю купити', 'зніму', 'шукаю квартиру', 'шукаю житло'],
    ro: ['vreau să cumpăr', 'vreau sa cumpar', 'vreau să închiriez', 'vreau sa inchiriez', 'caut apartament'],
    uzLatn: ['sotib olaman', 'sotib olish uchun qidiryapman', 'ijaraga olaman', 'uy qidiryapman'],
    uzCyrl: ['сотиб оламан', 'сотиб олиш учун қидиряпман', 'ижарага оламан', 'уй қидиряпман'],
    kk: ['сатып аламын', 'сатып алуға іздеймін', 'жалға аламын', 'пәтер іздеймін'],
  }),
]);

// Deal type is transaction mechanics only. Direction is resolved by HOUSING_ACTIONS.
export const HOUSING_DEAL_TYPES = Object.freeze([
  group('sale', {
    ru: ['продажа', 'продать', 'покупка'],
    en: ['sale', 'purchase'],
    uk: ['продаж', 'продати', 'купівля'],
    ro: ['vânzare', 'vanzare', ...RO_SALE_OFFER_ALIASES, 'cumpărare', 'cumparare'],
    uzLatn: ['sotish', 'sotuv', 'sotib olish'],
    uzCyrl: ['сотиш', 'сотув', 'сотиб олиш'],
    kk: ['сату', 'сатып алу', 'сатылым'],
  }),
  group('longRent', {
    ru: ['аренда', 'долгосрочно', 'долгосрочная аренда', 'помесячно', 'на длительный срок'],
    en: ['rent', 'long term rent', 'long-term rent', 'monthly rent'],
    uk: ['оренда', 'довгостроково', 'довгострокова оренда', 'помісячно'],
    ro: ['închiriere', 'inchiriere', 'chirie', 'pe termen lung', 'lunar'],
    uzLatn: ['ijara', 'uzoq muddatga', 'oylik ijara'],
    uzCyrl: ['ижара', 'узоқ муддатга', 'ойлик ижара'],
    kk: ['жалдау', 'жалға', ...KK_RENT_OUT_ALIASES, 'ұзақ мерзімге', 'айлық жалдау'],
  }),
  group('shortRent', {
    ru: ['посуточно', 'посуточная аренда', 'на сутки', 'на час', 'почасово', 'краткосрочно'],
    en: ['daily rent', 'short term', 'short-term rent', 'per day', 'hourly'],
    uk: ['подобово', 'погодинно', 'на добу', 'на годину', 'короткострокова оренда'],
    ro: ['regim hotelier', 'pe zi', 'zilnic', 'pe noapte', 'închiriere pe termen scurt', 'inchiriere pe termen scurt'],
    uzLatn: ['kunlik', 'sutkaga', 'sutkalik', 'soatlik'],
    uzCyrl: ['кунлик', 'суткага', 'суткалик', 'соатлик'],
    kk: ['тәулік', 'тәуліктік', 'тәулігіне', 'сағаттық', 'күндік'],
  }),
]);

export const HOUSING_ACTION_MAP = Object.freeze({
  sell: Object.freeze({ listingKind: 'propertyOffer', dealType: 'sale' }),
  buy: Object.freeze({ listingKind: 'propertyWanted', dealType: 'sale' }),
  rentOut: Object.freeze({ listingKind: 'propertyOffer', dealType: 'longRent' }),
  rentIn: Object.freeze({ listingKind: 'propertyWanted', dealType: 'longRent' }),
});

export function resolveHousingIntent(value) {
  const text = String(value || '');
  if (!text.trim()) return null;

  const actionMatch = findCanonical(text, HOUSING_ACTIONS, { partial: true });
  const action = actionMatch?.canonical
    || (UZ_CONTEXTUAL_RENT_OUT_RE.test(text) ? 'rentOut' : null)
    || detectContextualWantedAction(text);
  const durationDeal = findCanonical(text, HOUSING_DEAL_TYPES, { partial: true });
  const hasContextualUzPerDay = UZ_PER_DAY_RE.test(text)
    && ((action === 'rentOut' || action === 'rentIn') || UZ_DAILY_RENT_PRICE_RE.test(text));

  if (action) {
    const base = HOUSING_ACTION_MAP[action];
    let dealType = base.dealType;
    if ((durationDeal?.canonical === 'shortRent' || hasContextualUzPerDay) && (action === 'rentOut' || action === 'rentIn')) {
      dealType = 'shortRent';
    }
    return Object.freeze({
      action,
      listingKind: base.listingKind,
      dealType,
    });
  }

  if (!durationDeal && !hasContextualUzPerDay) return null;
  return Object.freeze({
    action: null,
    listingKind: null,
    dealType: durationDeal?.canonical || 'shortRent',
  });
}

export function classifyHousingDealType(value) {
  const resolved = resolveHousingIntent(value)?.dealType;
  if (resolved) return resolved;

  // Some housing feeds omit an explicit rent verb but still use established
  // Uzbek offer/share shorthand. Keep this fallback package-owned so consumers
  // do not carry their own multilingual regexes.
  const text = String(value || '');
  if (!text) return null;
  if (/(?:sherik(?:ka|lik)|шерик(?:ка|лик)|(?:1|bir)\s+ta\s+qiz\s+sherik|(?:1|бир)\s*та\s*(?:бола|киши|қиз|киз)\s*керак|1\s*хонага[^\r\n]{0,40}(?:киши|одам)\s*турилади|oila(?:ga)?\s+qo['’`]?yiladi|oila(?:ga)?\s+quyiladi|(?:хонали|квартир)[^\r\n]{0,100}турибди[^\r\n]{0,30}\d+\s*\$|квартира\s+бор)/iu.test(text)) {
    return 'longRent';
  }
  return null;
}

// A bare "сутки/суток" (day-rate) mention outranks a source's generic
// long-rent default, even when the rest of the text does not otherwise
// resolve to shortRent.
const EXPLICIT_SHORT_STAY_RE = /(?:^|[^\p{L}\p{N}_])сут(?:ки|ок)(?=$|[^\p{L}\p{N}_])/iu;

export function looksExplicitDailyRentalMention(value) {
  return EXPLICIT_SHORT_STAY_RE.test(String(value || ''));
}

// A commercial hotel-group advertisement lists several distinct business
// names, several unrelated phone numbers and a scattering of prices — none
// of which cohere into one describable property the way a single owner
// listing does. Each signal alone is common in ordinary listings (a broker
// might list two contact numbers; a listing might mention one hotel by
// name as a nearby landmark), so only their co-occurrence is meaningful.
const HOTEL_BUSINESS_MARKER_RE = /(?:\bhotel\b|гостиниц\p{L}*|отел[ья]?\p{L}*|\bhostel\b|хостел\p{L}*|mehmonxona\p{L}*|guest\s*house|\bb\s*&\s*b\b|bed\s+and\s+breakfast)/giu;
const PROMOTIONAL_MARKER_RE = /(?:скидк\p{L}*|\bакция\b|бронируйте|бронирование|звоните\s+прямо\s+сейчас|call\s+now|book\s+now|chegirma|eng\s+arzon\s+narx|лучшие\s+цены|top\s+prices|специальное\s+предложение)/iu;
const PRICE_LIKE_RE = /\d{2,6}\s*(?:\$|usd|сум|сўм|so['’ʻʼ]?m|som|сом|тенге|kzt)/giu;

/**
 * Weak-signal evidence for a commercial/multi-property advertisement rather
 * than a single owner's listing. Exposed separately from
 * isHousingCommercialAd() so callers can inspect which signals fired.
 */
export function detectHousingCommercialAdSignals(value) {
  const text = String(value || '');
  const hotelNameCount = new Set((text.match(HOTEL_BUSINESS_MARKER_RE) || []).map((match) => match.toLowerCase())).size;
  const phoneCount = findPhoneLikeSpans(text).length;
  const priceCount = (text.match(PRICE_LIKE_RE) || []).length;
  return Object.freeze({
    multipleBusinessNames: hotelNameCount >= 2,
    repeatedContactBlocks: phoneCount >= 3,
    manyPriceMentions: priceCount >= 3,
    promotionalText: PROMOTIONAL_MARKER_RE.test(text),
  });
}

/**
 * True when at least two independent weak signals of a commercial/
 * multi-property advertisement co-occur. A single signal (one hotel name
 * mentioned as a landmark, two phone numbers on a broker listing) is
 * common in ordinary single-property ads and must not trigger this alone.
 */
export function isHousingCommercialAd(value) {
  const signals = detectHousingCommercialAdSignals(value);
  return Object.values(signals).filter(Boolean).length >= 2;
}

