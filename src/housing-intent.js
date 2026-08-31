import { findCanonical } from './normalization.js';
import { lexiconEntity } from './lexicon-core.js';

const group = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, extra);
const KK_RENT_OUT_ALIASES = Object.freeze(['жалға беремін', 'жалға беріледі']);
const RO_SALE_OFFER_ALIASES = Object.freeze(['de vânzare', 'de vanzare']);
const UZ_CONTEXTUAL_RENT_OUT_RE = /(?:^|[^\p{L}\p{N}_])(?:ijaraga|ижарага)(?=$|[^\p{L}\p{N}_])[^.!?\r\n]{0,48}(?:beraman|beriladi|topshiraman|бераман|берилади|топшираман)(?=$|[^\p{L}\p{N}_])/iu;
const UZ_PER_DAY_RE = /(?:^|[^\p{L}\p{N}_])(?:kuniga|кунига)(?=$|[^\p{L}\p{N}_])/iu;
const UZ_DAILY_RENT_PRICE_RE = /(?:narx|нарх|ijara|ижара|to['’`]?lov|т[ўу]лов|оплата)[^.!?\r\n]{0,48}(?:kuniga|кунига)|(?:kuniga|кунига)[^.!?\r\n]{0,48}(?:narx|нарх|ijara|ижара|to['’`]?lov|т[ўу]лов|оплата)/iu;

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
  const action = actionMatch?.canonical || (UZ_CONTEXTUAL_RENT_OUT_RE.test(text) ? 'rentOut' : null);
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

