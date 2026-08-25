import { findCanonical } from './normalization.js';

const group = (canonical, aliases, extra = {}) => Object.freeze({ canonical, aliases: Object.freeze(aliases), ...extra });

export const HOUSING_ACTIONS = Object.freeze([
  group('sell', {
    ru: ['продам', 'продаю', 'продаётся', 'продается', 'выставил на продажу', 'выставила на продажу'],
    en: ['selling', 'for sale', 'selling apartment', 'selling house'],
    uk: ['продам', 'продаю', 'продається'],
    ro: ['vând', 'vand', 'de vânzare', 'de vanzare', 'se vinde'],
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
    kk: ['жалға беремін', 'жалға беріледі'],
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
    ro: ['vânzare', 'vanzare', 'cumpărare', 'cumparare'],
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
    kk: ['жалдау', 'ұзақ мерзімге', 'айлық жалдау'],
  }),
  group('shortRent', {
    ru: ['посуточно', 'посуточная аренда', 'на сутки', 'на час', 'почасово', 'краткосрочно'],
    en: ['daily rent', 'short term', 'short-term rent', 'per day', 'hourly'],
    uk: ['подобово', 'погодинно', 'на добу', 'на годину', 'короткострокова оренда'],
    ro: ['regim hotelier', 'pe zi', 'zilnic', 'pe noapte', 'închiriere pe termen scurt', 'inchiriere pe termen scurt'],
    uzLatn: ['kunlik', 'sutkaga', 'sutkalik', 'soatlik', 'kuniga'],
    uzCyrl: ['кунлик', 'суткага', 'суткалик', 'соатлик', 'кунига'],
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

  const action = findCanonical(text, HOUSING_ACTIONS, { partial: true });
  const durationDeal = findCanonical(text, HOUSING_DEAL_TYPES, { partial: true });

  if (action) {
    const base = HOUSING_ACTION_MAP[action.canonical];
    let dealType = base.dealType;
    if (durationDeal?.canonical === 'shortRent' && (action.canonical === 'rentOut' || action.canonical === 'rentIn')) {
      dealType = 'shortRent';
    }
    return Object.freeze({
      action: action.canonical,
      listingKind: base.listingKind,
      dealType,
    });
  }

  if (!durationDeal) return null;
  return Object.freeze({
    action: null,
    listingKind: null,
    dealType: durationDeal.canonical,
  });
}
