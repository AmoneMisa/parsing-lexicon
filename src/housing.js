const group = (canonical, aliases) => Object.freeze({ canonical, aliases: Object.freeze(aliases) });

export const ADDRESS_TERMS = Object.freeze({
  label: group('address', {
    ru: ['адрес', 'адреса', 'местоположение'], en: ['address', 'location'],
    uzLatn: ['manzil', 'joylashuv'], uzCyrl: ['манзил', 'жойлашув'], kk: ['мекенжай', 'орналасқан жері', 'орналасуы'],
  }),
  street: group('street', {
    ru: ['улица', 'ул', 'ул.', 'переулок', 'пер', 'проезд'], en: ['street', 'st', 'road', 'rd', 'lane'],
    uzLatn: ["ko'cha", 'ko‘cha', 'koʻcha', "ko'chasi", 'ko‘chasi', 'koʻchasi'], uzCyrl: ['кўча', 'кўчаси'], kk: ['көше', 'көшесі'],
  }),
  avenue: group('avenue', {
    ru: ['проспект', 'пр-т'], en: ['avenue', 'ave'], uzLatn: ['shoh ko‘cha', "shoh ko'cha", 'shohkocha'], uzCyrl: ['шоҳ кўча'], kk: ['даңғыл', 'даңғылы'],
  }),
  district: group('district', {
    ru: ['район', 'р-н'], en: ['district'], uzLatn: ['tuman', 'tumani'], uzCyrl: ['туман', 'тумани'], kk: ['аудан', 'ауданы'],
  }),
  neighborhood: group('neighborhood', {
    ru: ['микрорайон', 'мкр', 'мкр.', 'квартал', 'массив', 'махалля', 'махалла'], en: ['neighborhood', 'quarter', 'microdistrict'],
    uzLatn: ['mahalla', 'mahallasi', 'mavze', 'daha'], uzCyrl: ['маҳалла', 'маҳалласи', 'мавзе', 'даҳа'], kk: ['шағынаудан', 'ықшамаудан', 'квартал'],
  }),
  residentialComplex: group('residentialComplex', {
    ru: ['жилой комплекс', 'жк'], en: ['residential complex', 'residence'], uzLatn: ['turar joy majmuasi', 'tjm'], uzCyrl: ['турар жой мажмуаси'], kk: ['тұрғын үй кешені', 'түк'],
  }),
  house: group('houseNumber', {
    ru: ['дом', 'д.', 'д'], en: ['house', 'building'], uzLatn: ['uy', 'uy raqami'], uzCyrl: ['уй', 'уй рақами'], kk: ['үй', 'үй нөмірі'],
  }),
  building: group('building', {
    ru: ['корпус', 'корп.', 'строение'], en: ['block', 'building'], uzLatn: ['bino', 'korpus'], uzCyrl: ['бино', 'корпус'], kk: ['ғимарат', 'корпус'],
  }),
});

export const DEAL_TYPES = Object.freeze([
  group('sale', {
    ru: ['продажа', 'продаётся', 'продается', 'продам', 'купить'], en: ['for sale', 'sale', 'selling'],
    uzLatn: ['sotiladi', 'sotaman', 'sotuv', 'sotish', 'sotuvda'], uzCyrl: ['сотилади', 'сотаман', 'сотув', 'сотиш'], kk: ['сатылады', 'сатамын', 'сату', 'сатылым'],
  }),
  group('longRent', {
    ru: ['аренда', 'сдаётся', 'сдается', 'сдам', 'снять', 'долгосрочно', 'помесячно'], en: ['for rent', 'rent', 'long term', 'monthly'],
    uzLatn: ['ijara', 'ijaraga', 'ijaraga beriladi', 'oyiga', 'uzoq muddatga'], uzCyrl: ['ижара', 'ижарага', 'ижарага берилади', 'ойига', 'узоқ муддатга'], kk: ['жалға', 'жалдау', 'жалға беріледі', 'айына', 'ұзақ мерзімге'],
  }),
  group('shortRent', {
    ru: ['посуточно', 'посуточная', 'на сутки', 'на час', 'почасово'], en: ['daily rent', 'short term', 'per day', 'hourly'],
    uzLatn: ['kunlik', 'sutkaga', 'sutkalik', 'soatlik', 'kuniga'], uzCyrl: ['кунлик', 'суткага', 'суткалик', 'соатлик', 'кунига'], kk: ['тәулік', 'тәуліктік', 'тәулігіне', 'сағаттық', 'күндік'],
  }),
]);

export const PROPERTY_TYPES = Object.freeze([
  group('flat', {
    ru: ['квартира', 'кв', 'апартаменты'], en: ['apartment', 'flat'], uzLatn: ['kvartira', 'xonadon'], uzCyrl: ['квартира', 'хонадон'], kk: ['пәтер'],
  }),
  group('house', {
    ru: ['дом', 'частный дом', 'коттедж'], en: ['house', 'home', 'cottage'], uzLatn: ['uy', 'hovli', 'xovli'], uzCyrl: ['уй', 'ҳовли', 'ховли'], kk: ['үй', 'жеке үй', 'коттедж'],
  }),
  group('room', {
    ru: ['комната', 'комнату'], en: ['room'], uzLatn: ['xona', 'honа'], uzCyrl: ['хона'], kk: ['бөлме'],
  }),
  group('studio', {
    ru: ['студия'], en: ['studio'], uzLatn: ['studiya'], uzCyrl: ['студия'], kk: ['студия'],
  }),
]);

export const ROOM_TERMS = Object.freeze({
  room: group('room', { ru: ['комната', 'комнаты', 'комнат', 'комн'], en: ['room', 'rooms'], uzLatn: ['xona'], uzCyrl: ['хона'], kk: ['бөлме'] }),
  bedroom: group('bedroom', { ru: ['спальня', 'спальни'], en: ['bedroom', 'bedrooms'], uzLatn: ['yotoqxona'], uzCyrl: ['ётоқхона'], kk: ['жатын бөлме'] }),
});

export const FLOOR_TERMS = Object.freeze({
  floor: group('floor', { ru: ['этаж', 'эт'], en: ['floor', 'storey', 'story'], uzLatn: ['qavat'], uzCyrl: ['қават'], kk: ['қабат'] }),
  totalFloors: group('totalFloors', { ru: ['этажей', 'этажный', 'этажность'], en: ['floors total', 'storeys'], uzLatn: ['qavatli'], uzCyrl: ['қаватли'], kk: ['қабатты'] }),
});

export const AREA_TERMS = Object.freeze({
  area: group('area', { ru: ['площадь', 'плошадь', 'квадратов'], en: ['area', 'size'], uzLatn: ['maydon', 'maydoni'], uzCyrl: ['майдон', 'майдони'], kk: ['аудан', 'көлемі'] }),
  squareMeter: group('sqm', { ru: ['м2', 'м²', 'кв м', 'кв.м'], en: ['m2', 'm²', 'sqm', 'sq m'], uzLatn: ['m2', 'm²', 'kv m'], uzCyrl: ['м2', 'м²'], kk: ['м2', 'м²', 'ш.м'] }),
});

export const CURRENCIES = Object.freeze([
  group('USD', { ru: ['$', 'usd', 'доллар', 'долларов', 'у.е.', 'у е'], en: ['$', 'usd', 'dollar', 'dollars'], uzLatn: ['$', 'usd', 'dollar'], uzCyrl: ['$', 'доллар'], kk: ['$', 'usd', 'доллар'] }),
  group('UZS', { ru: ['сум', 'сумов', 'узс'], en: ['uzs'], uzLatn: ["so'm", 'so‘m', 'soʻm', 'sum', 'uzs'], uzCyrl: ['сўм', 'сум'], kk: ['uzs'] }),
  group('KZT', { ru: ['тенге', 'тг'], en: ['kzt', 'tenge'], uzLatn: ['kzt'], uzCyrl: ['kzt'], kk: ['теңге', 'тг', 'kzt'] }),
  group('EUR', { ru: ['€', 'eur', 'евро'], en: ['€', 'eur', 'euro'], uzLatn: ['€', 'eur', 'yevro'], uzCyrl: ['€', 'евро'], kk: ['€', 'eur', 'еуро'] }),
]);

export const SELLER_TERMS = Object.freeze({
  owner: group('owner', {
    ru: ['собственник', 'хозяин', 'от хозяина', 'без посредников'], en: ['owner', 'direct owner', 'no agent'],
    uzLatn: ['egasi', 'uy egasi', 'mulkdor', 'maklersiz', 'vositachisiz'], uzCyrl: ['эгаси', 'уй эгаси', 'мулкдор', 'маклерсиз', 'воситачисиз'],
    kk: ['иесі', 'үй иесі', 'меншік иесі', 'делдалсыз'],
  }),
  agency: group('agency', {
    ru: ['агентство', 'агент', 'риелтор', 'риэлтор', 'маклер', 'посредник'], en: ['agency', 'agent', 'realtor', 'broker'],
    uzLatn: ['agentlik', 'agent', 'rieltor', 'makler', 'vositachi'], uzCyrl: ['агентлик', 'агент', 'риелтор', 'маклер', 'воситачи'],
    kk: ['агенттік', 'агент', 'риэлтор', 'делдал'],
  }),
  commission: group('commission', {
    ru: ['комиссия', 'комиссионные'], en: ['commission', 'agency fee'], uzLatn: ['komissiya', 'xizmat haqi'], uzCyrl: ['комиссия', 'хизмат ҳақи'], kk: ['комиссия', 'қызмет ақысы', 'делдал ақысы'],
  }),
  noCommission: group('noCommission', {
    ru: ['без комиссии', 'комиссия 0', '0% комиссия'], en: ['no commission', 'zero commission'], uzLatn: ['komissiyasiz', 'komissiya yoq', "komissiya yo'q"], uzCyrl: ['комиссиясиз', 'комиссия йўқ'], kk: ['комиссиясыз', 'делдалсыз'],
  }),
});

export const AMENITY_TERMS = Object.freeze({
  furnished: group('furnished', { ru: ['с мебелью', 'меблированная', 'мебель есть'], en: ['furnished', 'with furniture'], uzLatn: ['mebelli', 'mebel bor'], uzCyrl: ['мебелли', 'мебель бор'], kk: ['жиһазбен', 'жиһаздалған'] }),
  parking: group('parking', { ru: ['парковка', 'паркинг', 'гараж'], en: ['parking', 'garage'], uzLatn: ['parking', 'avtoturargoh', 'garaj'], uzCyrl: ['паркинг', 'автотураргоҳ', 'гараж'], kk: ['тұрақ', 'автотұрақ', 'гараж'] }),
  airConditioner: group('airConditioner', { ru: ['кондиционер'], en: ['air conditioner', 'ac'], uzLatn: ['konditsioner'], uzCyrl: ['кондиционер'], kk: ['кондиционер'] }),
  internet: group('internet', { ru: ['интернет', 'wifi', 'wi-fi'], en: ['internet', 'wifi', 'wi-fi'], uzLatn: ['internet', 'wifi'], uzCyrl: ['интернет', 'wifi'], kk: ['интернет', 'wifi'] }),
});

export const TENANT_TERMS = Object.freeze({
  family: group('family', { ru: ['семье', 'семейным', 'семейная пара'], en: ['family', 'couple'], uzLatn: ['oilaga', 'oilali', 'oila'], uzCyrl: ['оилага', 'оилали', 'оила'], kk: ['отбасына', 'отбасылы', 'жанұяға'] }),
  students: group('students', { ru: ['студентам', 'студенты'], en: ['students'], uzLatn: ['talabalarga', 'talabalar'], uzCyrl: ['талабаларга', 'талабалар'], kk: ['студенттерге', 'студенттер'] }),
  girls: group('girls', { ru: ['девушкам', 'девушки'], en: ['girls', 'women'], uzLatn: ['qizlarga', 'qizlar'], uzCyrl: ['қизларга', 'қизлар'], kk: ['қыздарға', 'қыздар'] }),
  boys: group('boys', { ru: ['парням', 'мужчинам'], en: ['men', 'guys'], uzLatn: ['yigitlarga', 'yigitlar'], uzCyrl: ['йигитларга', 'йигитлар'], kk: ['жігіттерге', 'жігіттер'] }),
});

export function flattenAliases(item) {
  if (!item?.aliases) return [];
  return Object.values(item.aliases).flat();
}
