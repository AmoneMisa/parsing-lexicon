import { lexiconEntity } from './lexicon-core.js';
import { findCanonical } from './normalization.js';
import { HOUSING_DEAL_TYPES } from './housing-intent.js';
const group = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, extra);

export const ADDRESS_TERMS = Object.freeze({
  label: group('address', {
    ru: ['адрес', 'адреса', 'местоположение'], en: ['address', 'location'], uk: ['адреса', 'місцезнаходження'], ro: ['adresă', 'adresa', 'locație', 'locatie'],
    uzLatn: ['manzil', 'joylashuv'], uzCyrl: ['манзил', 'жойлашув'], kk: ['мекенжай', 'орналасқан жері', 'орналасуы'],
  }),
  street: group('street', {
    ru: ['улица', 'ул', 'ул.', 'переулок', 'пер', 'проезд'], en: ['street', 'st', 'road', 'rd', 'lane'], uk: ['вулиця', 'вул', 'вул.', 'провулок', 'проїзд'], ro: ['stradă', 'strada', 'str.', 'alee', 'cale'],
    uzLatn: ["ko'cha", 'ko‘cha', 'koʻcha', "ko'chasi", 'ko‘chasi', 'koʻchasi'], uzCyrl: ['кўча', 'кўчаси'], kk: ['көше', 'көшесі'],
  }),
  avenue: group('avenue', {
    ru: ['проспект', 'пр-т'], en: ['avenue', 'ave', 'boulevard', 'blvd'], uk: ['проспект', 'просп.', 'бульвар'], ro: ['bulevard', 'bd.', 'b-dul'],
    uzLatn: ['shoh ko‘cha', "shoh ko'cha", 'shohkocha'], uzCyrl: ['шоҳ кўча'], kk: ['даңғыл', 'даңғылы'],
  }),
  district: group('district', {
    ru: ['район', 'р-н'], en: ['district', 'sector'], uk: ['район', 'р-н'], ro: ['sector', 'cartier administrativ'],
    uzLatn: ['tuman', 'tumani'], uzCyrl: ['туман', 'тумани'], kk: ['аудан', 'ауданы'],
  }),
  neighborhood: group('neighborhood', {
    ru: ['микрорайон', 'мкр', 'мкр.', 'квартал', 'массив', 'махалля', 'махалла'], en: ['neighborhood', 'quarter', 'microdistrict', 'residential area'],
    uk: ['мікрорайон', 'мкр', 'квартал', 'масив'], ro: ['cartier', 'zonă', 'zona', 'ansamblu de cartier'],
    uzLatn: ['mahalla', 'mahallasi', 'mavze', 'daha', 'massiv', 'massivi'], uzCyrl: ['маҳалла', 'маҳалласи', 'мавзе', 'даҳа', 'массив'], kk: ['шағынаудан', 'ықшамаудан', 'квартал'],
  }),
  residentialComplex: group('residentialComplex', {
    ru: ['жилой комплекс', 'жк'], en: ['residential complex', 'residence', 'housing complex'], uk: ['житловий комплекс', 'жк'], ro: ['ansamblu rezidențial', 'ansamblu rezidential', 'complex rezidențial', 'complex rezidential'],
    uzLatn: ['turar joy majmuasi', 'tjm'], uzCyrl: ['турар жой мажмуаси'], kk: ['тұрғын үй кешені', 'түк'],
  }),
  house: group('houseNumber', {
    ru: ['дом', 'д.', 'д'], en: ['house', 'house number', 'no.'], uk: ['будинок', 'буд.', 'б'], ro: ['număr', 'numar', 'nr.', 'casă', 'casa'],
    uzLatn: ['uy', 'uy raqami'], uzCyrl: ['уй', 'уй рақами'], kk: ['үй', 'үй нөмірі'],
  }),
  building: group('building', {
    ru: ['корпус', 'корп.', 'строение'], en: ['block', 'building'], uk: ['корпус', 'корп.', 'будівля'], ro: ['bloc', 'clădire', 'cladire', 'corp'],
    uzLatn: ['bino', 'korpus'], uzCyrl: ['бино', 'корпус'], kk: ['ғимарат', 'корпус'],
  }),
  entrance: group('entrance', {
    ru: ['подъезд', 'подьезд'], en: ['entrance', 'staircase'], uk: ['під’їзд', "під'їзд", 'підїзд'], ro: ['scară', 'scara', 'intrare'],
    uzLatn: ['kirish', 'podyezd'], uzCyrl: ['кириш', 'подъезд'], kk: ['кіреберіс', 'подъезд'],
  }),
  landmark: group('landmark', {
    ru: ['ориентир', 'рядом с', 'возле', 'напротив'], en: ['landmark', 'near', 'next to', 'opposite'], uk: ['орієнтир', 'поруч', 'біля', 'навпроти'], ro: ['reper', 'lângă', 'langa', 'în apropiere', 'in apropiere', 'vizavi'],
    uzLatn: ['mo‘ljal', "mo'ljal", 'yaqinida', 'yonida', 'ro‘parasida'], uzCyrl: ['мўлжал', 'яқинида', 'ёнида', 'рўпарасида'], kk: ['бағдар', 'жанында', 'маңында', 'қарсысында'],
  }),
});

export const DEAL_TYPES = HOUSING_DEAL_TYPES;

/** Occupancy is orthogonal to deal type: longRent + room/sharedRoom is valid. */
export const HOUSING_OCCUPANCY_TYPES = Object.freeze([
  group('wholeProperty', {
    ru: ['целиком', 'вся квартира', 'весь дом'], en: ['whole property', 'entire apartment', 'entire home'], uk: ['цілком', 'вся квартира', 'весь будинок'], ro: ['apartament întreg', 'apartament intreg', 'locuință întreagă', 'locuinta intreaga'],
    uzLatn: ['butun uy', 'butun kvartira'], uzCyrl: ['бутун уй', 'бутун квартира'], kk: ['толық пәтер', 'бүкіл үй'],
  }),
  group('room', {
    ru: ['аренда комнаты', 'сдам комнату', 'сдается комната', 'комната в квартире'], en: ['room for rent', 'rent a room', 'private room'], uk: ['оренда кімнати', 'здам кімнату', 'кімната в квартирі'], ro: ['cameră de închiriat', 'camera de inchiriat', 'închiriez cameră', 'inchiriez camera'],
    uzLatn: ['xona ijaraga', 'xona beriladi', 'alohida xona'], uzCyrl: ['хона ижарага', 'хона берилади', 'алоҳида хона'], kk: ['бөлме жалға', 'бөлме жалға беріледі', 'жеке бөлме'],
  }),
  group('sharedRoom', {
    ru: ['подселение', 'подселюсь', 'ищу соседа', 'ищу соседку', 'сосед в комнату', 'место в комнате'], en: ['room share', 'shared room', 'flatmate wanted', 'roommate wanted', 'looking for roommate'],
    uk: ['підселення', 'підселюсь', 'шукаю сусіда', 'шукаю сусідку', 'місце в кімнаті'], ro: ['cameră la comun', 'camera la comun', 'caut coleg de apartament', 'caut colegă de apartament', 'coleg de cameră'],
    uzLatn: ['sherik kerak', 'xonaga sherik', 'birga turishga', 'qiz olinadi', 'yigit olinadi', 'podseleniye'], uzCyrl: ['шерик керак', 'хонага шерик', 'бирга туришга', 'қиз олинади', 'йигит олинади'], kk: ['бірге тұруға', 'бөлмелес керек', 'көрші керек', 'ортақ бөлме'],
  }),
  group('bedSpace', {
    ru: ['койко-место', 'койкоместо', 'спальное место'], en: ['bed space', 'bedspace', 'bed for rent'], uk: ['ліжко-місце', 'ліжкомісце', 'спальне місце'], ro: ['loc de dormit', 'pat de închiriat', 'pat de inchiriat'],
    uzLatn: ['yotoq joy', 'joy ijaraga', 'koyka joy'], uzCyrl: ['ётоқ жой', 'жой ижарага'], kk: ['жатын орын', 'төсек орын'],
  }),
]);

export const PROPERTY_TYPES = Object.freeze([
  group('flat', {
    ru: ['квартира', 'кв', 'апартаменты'], en: ['apartment', 'flat'], uk: ['квартира', 'апартаменти'], ro: ['apartament', 'apartamente'],
    uzLatn: ['kvartira', 'xonadon'], uzCyrl: ['квартира', 'хонадон'], kk: ['пәтер'],
  }),
  group('house', {
    ru: ['дом', 'частный дом', 'коттедж'], en: ['house', 'home', 'cottage'], uk: ['будинок', 'приватний будинок', 'котедж'], ro: ['casă', 'casa', 'vilă', 'vila'],
    uzLatn: ['hovli', 'xovli'], uzCyrl: ['ҳовли', 'ховли'], kk: ['үй', 'жеке үй', 'коттедж'],
  }),
  group('room', {
    ru: ['комната', 'комнату'], en: ['room'], uk: ['кімната'], ro: ['cameră', 'camera'], uzLatn: ['xona', 'hona'], uzCyrl: ['хона'], kk: ['бөлме'],
  }),
  group('studio', {
    ru: ['студия'], en: ['studio'], uk: ['студія'], ro: ['garsonieră', 'garsoniera', 'studio'], uzLatn: ['studiya'], uzCyrl: ['студия'], kk: ['студия'],
  }),
  group('townhouse', {
    ru: ['таунхаус'], en: ['townhouse', 'town house'], uk: ['таунхаус'], ro: ['casă înșiruită', 'casa insiruita', 'townhouse'], uzLatn: ['taunhaus'], uzCyrl: ['таунхаус'], kk: ['таунхаус'],
  }),
  group('dormitory', {
    ru: ['общежитие', 'общага'], en: ['dormitory', 'dorm', 'hostel room'], uk: ['гуртожиток'], ro: ['cămin', 'camin', 'cămin studențesc', 'camin studentesc'], uzLatn: ['yotoqxona', 'obshijit'], uzCyrl: ['ётоқхона', 'общежитие'], kk: ['жатақхана'],
  }),
]);

export const ROOM_TERMS = Object.freeze({
  room: group('room', { ru: ['комната', 'комнаты', 'комнат', 'комн'], en: ['room', 'rooms'], uk: ['кімната', 'кімнати', 'кімнат'], ro: ['cameră', 'camera', 'camere'], uzLatn: ['xona'], uzCyrl: ['хона'], kk: ['бөлме'] }),
  bedroom: group('bedroom', { ru: ['спальня', 'спальни'], en: ['bedroom', 'bedrooms'], uk: ['спальня', 'спальні'], ro: ['dormitor', 'dormitoare'], uzLatn: ['yotoqxona'], uzCyrl: ['ётоқхона'], kk: ['жатын бөлме'] }),
});

export const FLOOR_TERMS = Object.freeze({
  floor: group('floor', { ru: ['этаж', 'эт'], en: ['floor', 'storey', 'story'], uk: ['поверх', 'пов.'], ro: ['etaj', 'et.'], uzLatn: ['qavat'], uzCyrl: ['қават'], kk: ['қабат'] }),
  totalFloors: group('totalFloors', { ru: ['этажей', 'этажный', 'этажность'], en: ['floors total', 'storeys'], uk: ['поверхів', 'поверховий'], ro: ['etaje', 'număr etaje', 'numar etaje'], uzLatn: ['qavatli'], uzCyrl: ['қаватли'], kk: ['қабатты'] }),
});

export const AREA_TERMS = Object.freeze({
  area: group('area', { ru: ['площадь', 'плошадь', 'квадратов'], en: ['area', 'size'], uk: ['площа', 'квадратів'], ro: ['suprafață', 'suprafata', 'suprafață utilă', 'suprafata utila'], uzLatn: ['maydon', 'maydoni'], uzCyrl: ['майдон', 'майдони'], kk: ['аудан', 'көлемі'] }),
  squareMeter: group('sqm', { ru: ['м2', 'м²', 'кв м', 'кв.м'], en: ['m2', 'm²', 'sqm', 'sq m'], uk: ['м2', 'м²', 'кв м'], ro: ['m2', 'm²', 'mp', 'm.p.'], uzLatn: ['m2', 'm²', 'kv m'], uzCyrl: ['м2', 'м²'], kk: ['м2', 'м²', 'ш.м'] }),
});

export const CURRENCIES = Object.freeze([
  group('USD', { ru: ['$', 'usd', 'доллар', 'долларов', 'у.е.', 'у е'], en: ['$', 'usd', 'dollar', 'dollars'], uk: ['$', 'usd', 'долар', 'доларів'], ro: ['$', 'usd', 'dolari', 'dolar'], uzLatn: ['$', 'usd', 'dollar'], uzCyrl: ['$', 'доллар'], kk: ['$', 'usd', 'доллар'] }),
  group('EUR', { ru: ['€', 'eur', 'евро'], en: ['€', 'eur', 'euro'], uk: ['€', 'eur', 'євро'], ro: ['€', 'eur', 'euro'], uzLatn: ['€', 'eur', 'yevro'], uzCyrl: ['€', 'евро'], kk: ['€', 'eur', 'еуро'] }),
  group('UZS', { ru: ['сум', 'сумов', 'узс'], en: ['uzs'], uk: ['uzs', 'сум'], ro: ['uzs'], uzLatn: ["so'm", 'so‘m', 'soʻm', 'sum', 'uzs'], uzCyrl: ['сўм', 'сум'], kk: ['uzs'] }),
  group('KZT', { ru: ['тенге', 'тг'], en: ['kzt', 'tenge'], uk: ['тенге', 'kzt'], ro: ['kzt', 'tenge'], uzLatn: ['kzt'], uzCyrl: ['kzt'], kk: ['теңге', 'тг', 'kzt'] }),
  group('UAH', { ru: ['грн', 'гривна', 'гривен'], en: ['uah', 'hryvnia'], uk: ['грн', 'гривня', 'гривень', '₴'], ro: ['uah', 'hrivne', 'grivne'], uzLatn: ['uah'], uzCyrl: ['uah'], kk: ['uah'] }),
  group('RON', { ru: ['ron', 'лей', 'леев'], en: ['ron', 'romanian leu', 'lei'], uk: ['ron', 'лей', 'леїв'], ro: ['ron', 'leu', 'lei'], uzLatn: ['ron'], uzCyrl: ['ron'], kk: ['ron'] }),
  group('KGS', { ru: ['kgs', 'сом', 'сомов'], en: ['kgs', 'kyrgyz som'], uk: ['kgs', 'сом'], ro: ['kgs'], uzLatn: ['kgs', 'som'], uzCyrl: ['kgs', 'сом'], kk: ['kgs', 'сом'] }),
]);

export const SELLER_TERMS = Object.freeze({
  owner: group('owner', {
    ru: ['собственник', 'хозяин', 'от хозяина', 'без посредников', 'без посредника', 'без риелтора', 'без риэлтора', 'без маклера', 'без маклер', 'без агента'], en: ['owner', 'direct owner', 'no agent', 'no broker', 'no realtor'], uk: ['власник', 'власниця', 'від власника', 'без посередників'], ro: ['proprietar', 'direct proprietar', 'fără agenție', 'fara agentie', 'fără intermediari'],
    uzLatn: ['egasi', 'uy egasi', 'mulkdor', 'maklersiz', 'vositachisiz'], uzCyrl: ['эгаси', 'уй эгаси', 'мулкдор', 'маклерсиз', 'воситачисиз', 'без маклер'], kk: ['иесі', 'үй иесі', 'меншік иесі', 'делдалсыз'],
  }),
  agency: group('agency', {
    ru: ['агентство', 'агент', 'риелтор', 'риэлтор', 'маклер', 'посредник'], en: ['agency', 'agent', 'realtor', 'broker'], uk: ['агентство', 'агент', 'рієлтор', 'риелтор', 'посередник'], ro: ['agenție', 'agentie', 'agent imobiliar', 'agenție imobiliară', 'agentie imobiliara', 'broker'],
    uzLatn: ['agentlik', 'agent', 'rieltor', 'makler', 'vositachi'], uzCyrl: ['агентлик', 'агент', 'риелтор', 'маклер', 'воситачи'], kk: ['агенттік', 'агент', 'риэлтор', 'делдал'],
  }),
  commission: group('commission', {
    ru: ['комиссия', 'комиссионные'], en: ['commission', 'agency fee'], uk: ['комісія', 'комісійні'], ro: ['comision', 'comision agenție', 'comision agentie'], uzLatn: ['komissiya', 'xizmat haqi'], uzCyrl: ['комиссия', 'хизмат ҳақи'], kk: ['комиссия', 'қызмет ақысы', 'делдал ақысы'],
  }),
  noCommission: group('noCommission', {
    ru: ['без комиссии', 'комиссия 0', '0% комиссия'], en: ['no commission', 'zero commission'], uk: ['без комісії', 'комісія 0', '0% комісії'], ro: ['fără comision', 'fara comision', 'comision 0', '0% comision'], uzLatn: ['komissiyasiz', 'komissiya yoq', "komissiya yo'q"], uzCyrl: ['комиссиясиз', 'комиссия йўқ'], kk: ['комиссиясыз', 'делдалсыз'],
  }),
});

export const DEPOSIT_TERMS = Object.freeze({
  deposit: group('deposit', {
    ru: ['депозит', 'залог', 'страховой депозит', 'обеспечительный платеж'], en: ['deposit', 'security deposit', 'damage deposit'], uk: ['депозит', 'застава', 'страховий депозит', 'гарантійний платіж'], ro: ['garanție', 'garantie', 'depozit', 'garanție chirie', 'garantie chirie'],
    uzLatn: ['depozit', 'zalog', 'garov puli'], uzCyrl: ['депозит', 'залог', 'гаров пули'], kk: ['депозит', 'кепіл', 'кепілақы'],
  }),
  noDeposit: group('noDeposit', {
    ru: ['без депозита', 'без залога'], en: ['no deposit', 'deposit free'], uk: ['без депозиту', 'без застави'], ro: ['fără garanție', 'fara garantie', 'fără depozit'], uzLatn: ['depozitsiz', 'zalogsiz', 'garovsiz'], uzCyrl: ['депозитсиз', 'залогсиз', 'гаровсиз'], kk: ['депозитсіз', 'кепілсіз'],
  }),
  advance: group('advance', {
    ru: ['предоплата', 'аванс', 'оплата вперед'], en: ['advance payment', 'prepayment', 'paid in advance'], uk: ['передоплата', 'аванс', 'оплата наперед'], ro: ['avans', 'plată în avans', 'plata in avans'], uzLatn: ['oldindan tolov', "oldindan to'lov", 'avans'], uzCyrl: ['олдиндан тўлов', 'аванс'], kk: ['алдын ала төлем', 'аванс'],
  }),
  firstAndLastMonth: group('firstAndLastMonth', {
    ru: ['первый и последний месяц', 'за первый и последний месяц'], en: ['first and last month', 'first month plus last month'], uk: ['перший і останній місяць', 'за перший та останній місяць'], ro: ['prima și ultima lună', 'prima si ultima luna'], uzLatn: ['birinchi va oxirgi oy'], uzCyrl: ['биринчи ва охирги ой'], kk: ['бірінші және соңғы ай'],
  }),
  refundable: group('refundableDeposit', {
    ru: ['возвратный депозит', 'залог возвращается'], en: ['refundable deposit'], uk: ['поворотний депозит', 'застава повертається'], ro: ['garanție returnabilă', 'garantie returnabila'], uzLatn: ['qaytariladigan depozit'], uzCyrl: ['қайтариладиган депозит'], kk: ['қайтарылатын депозит'],
  }),
});

export const UTILITY_TERMS = Object.freeze({
  included: group('utilitiesIncluded', { ru: ['коммунальные включены', 'коммуналка включена'], en: ['utilities included', 'bills included'], uk: ['комунальні включені', 'комуналка включена'], ro: ['utilități incluse', 'utilitati incluse', 'întreținere inclusă', 'intretinere inclusa'], uzLatn: ['kommunal ichida', 'kommunal tolovlar ichida'], uzCyrl: ['коммунал ичида', 'коммунал тўловлар ичида'], kk: ['коммуналдық төлемдер кіреді'] }),
  separate: group('utilitiesSeparate', { ru: ['коммунальные отдельно', 'плюс коммунальные'], en: ['utilities separate', 'plus utilities', 'bills extra'], uk: ['комунальні окремо', 'плюс комунальні'], ro: ['utilități separat', 'utilitati separat', 'plus utilități', 'plus utilitati'], uzLatn: ['kommunal alohida'], uzCyrl: ['коммунал алоҳида'], kk: ['коммуналдық төлем бөлек'] }),
});

export const APPLIANCE_TERMS = Object.freeze({
  washingMachine: group('washingMachine', { ru: ['стиральная машина', 'стиралка'], en: ['washing machine', 'washer'], uk: ['пральна машина', 'пралка'], ro: ['mașină de spălat', 'masina de spalat'], uzLatn: ['kir yuvish mashinasi', 'stiralka'], uzCyrl: ['кир ювиш машинаси', 'стиралка'], kk: ['кір жуғыш машина'] }),
  refrigerator: group('refrigerator', { ru: ['холодильник'], en: ['refrigerator', 'fridge'], uk: ['холодильник'], ro: ['frigider'], uzLatn: ['muzlatgich', 'xolodilnik'], uzCyrl: ['музлатгич', 'холодильник'], kk: ['тоңазытқыш'] }),
  dishwasher: group('dishwasher', { ru: ['посудомоечная машина', 'посудомойка'], en: ['dishwasher'], uk: ['посудомийна машина'], ro: ['mașină de spălat vase', 'masina de spalat vase'], uzLatn: ['idish yuvish mashinasi'], uzCyrl: ['идиш ювиш машинаси'], kk: ['ыдыс жуғыш машина'] }),
  television: group('television', { ru: ['телевизор', 'тв'], en: ['television', 'tv'], uk: ['телевізор', 'тв'], ro: ['televizor', 'tv'], uzLatn: ['televizor', 'tv'], uzCyrl: ['телевизор'], kk: ['теледидар'] }),
  airConditioner: group('airConditioner', { ru: ['кондиционер', 'сплит система'], en: ['air conditioner', 'air conditioning', 'ac'], uk: ['кондиціонер'], ro: ['aer condiționat', 'aer conditionat', 'climă', 'clima'], uzLatn: ['konditsioner'], uzCyrl: ['кондиционер'], kk: ['кондиционер'] }),
  microwave: group('microwave', { ru: ['микроволновка', 'свч'], en: ['microwave', 'microwave oven'], uk: ['мікрохвильовка', 'мікрохвильова піч'], ro: ['cuptor cu microunde', 'microunde'], uzLatn: ['mikroto‘lqinli pech', 'mikrovolnovka'], uzCyrl: ['микротўлқинли печ'], kk: ['микротолқынды пеш'] }),
  oven: group('oven', { ru: ['духовка', 'духовой шкаф'], en: ['oven'], uk: ['духовка', 'духова шафа'], ro: ['cuptor'], uzLatn: ['duxovka', 'pech'], uzCyrl: ['духовка', 'печ'], kk: ['пеш', 'духовка'] }),
  stove: group('stove', { ru: ['плита', 'варочная панель'], en: ['stove', 'cooktop', 'hob'], uk: ['плита', 'варильна поверхня'], ro: ['aragaz', 'plită', 'plita'], uzLatn: ['plita', 'gaz plita'], uzCyrl: ['плита', 'газ плита'], kk: ['плита', 'пісіру панелі'] }),
  kettle: group('kettle', { ru: ['чайник', 'электрочайник'], en: ['kettle', 'electric kettle'], uk: ['чайник', 'електрочайник'], ro: ['fierbător', 'fierbator'], uzLatn: ['choynak', 'elektr choynak'], uzCyrl: ['чойнак', 'электр чойнак'], kk: ['шәйнек', 'электр шәйнек'] }),
  boiler: group('boiler', { ru: ['бойлер', 'водонагреватель'], en: ['boiler', 'water heater'], uk: ['бойлер', 'водонагрівач'], ro: ['boiler', 'centrală', 'centrala', 'încălzitor de apă', 'incalzitor de apa'], uzLatn: ['boyler', 'suv isitgich'], uzCyrl: ['бойлер', 'сув иситгич'], kk: ['бойлер', 'су жылытқыш'] }),
  vacuumCleaner: group('vacuumCleaner', { ru: ['пылесос'], en: ['vacuum cleaner'], uk: ['пилосос'], ro: ['aspirator'], uzLatn: ['changyutgich', 'pilesos'], uzCyrl: ['чангютгич', 'пылесос'], kk: ['шаңсорғыш'] }),
  router: group('router', { ru: ['роутер', 'wifi роутер', 'wi-fi роутер'], en: ['router', 'wifi router', 'wi-fi router'], uk: ['роутер', 'wifi роутер'], ro: ['router', 'router wifi'], uzLatn: ['router', 'wifi router'], uzCyrl: ['роутер'], kk: ['роутер', 'wifi роутер'] }),
  iron: group('iron', { ru: ['утюг'], en: ['iron'], uk: ['праска'], ro: ['fier de călcat', 'fier de calcat'], uzLatn: ['dazmol'], uzCyrl: ['дазмол'], kk: ['үтік'] }),
});

export const AMENITY_TERMS = Object.freeze({
  furnished: group('furnished', { ru: ['с мебелью', 'меблированная', 'мебель есть'], en: ['furnished', 'with furniture'], uk: ['з меблями', 'мебльована'], ro: ['mobilat', 'mobilată', 'mobilata'], uzLatn: ['mebelli', 'mebel bor'], uzCyrl: ['мебелли', 'мебель бор'], kk: ['жиһазбен', 'жиһаздалған'] }),
  unfurnished: group('unfurnished', { ru: ['без мебели', 'пустая'], en: ['unfurnished', 'without furniture'], uk: ['без меблів', 'порожня'], ro: ['nemobilat', 'nemobilată'], uzLatn: ['mebelsiz'], uzCyrl: ['мебелсиз'], kk: ['жиһазсыз'] }),
  parking: group('parking', { ru: ['парковка', 'паркинг', 'гараж'], en: ['parking', 'garage'], uk: ['парковка', 'паркінг', 'гараж'], ro: ['parcare', 'loc de parcare', 'garaj'], uzLatn: ['parking', 'avtoturargoh', 'garaj'], uzCyrl: ['паркинг', 'автотураргоҳ', 'гараж'], kk: ['тұрақ', 'автотұрақ', 'гараж'] }),
  internet: group('internet', { ru: ['интернет', 'wifi', 'wi-fi'], en: ['internet', 'wifi', 'wi-fi'], uk: ['інтернет', 'wifi', 'wi-fi'], ro: ['internet', 'wifi', 'wi-fi'], uzLatn: ['internet', 'wifi'], uzCyrl: ['интернет', 'wifi'], kk: ['интернет', 'wifi'] }),
  elevator: group('elevator', { ru: ['лифт'], en: ['elevator', 'lift'], uk: ['ліфт'], ro: ['lift', 'ascensor'], uzLatn: ['lift'], uzCyrl: ['лифт'], kk: ['лифт'] }),
  balcony: group('balcony', { ru: ['балкон', 'лоджия'], en: ['balcony', 'loggia'], uk: ['балкон', 'лоджія'], ro: ['balcon', 'logie'], uzLatn: ['balkon', 'lodjiya'], uzCyrl: ['балкон', 'лоджия'], kk: ['балкон', 'лоджия'] }),
  terrace: group('terrace', { ru: ['терраса'], en: ['terrace'], uk: ['тераса'], ro: ['terasă', 'terasa'], uzLatn: ['terrasa'], uzCyrl: ['терраса'], kk: ['терраса'] }),
  security: group('security', { ru: ['охрана', 'консьерж', 'видеонаблюдение'], en: ['security', 'concierge', 'cctv'], uk: ['охорона', 'консьєрж', 'відеоспостереження'], ro: ['pază', 'paza', 'concierge', 'supraveghere video'], uzLatn: ['qoriqlash', 'kuzatuv kamera'], uzCyrl: ['қўриқлаш', 'кузатув камера'], kk: ['күзет', 'бейнебақылау'] }),
});

export const TENANT_TERMS = Object.freeze({
  family: group('family', { ru: ['семье', 'семейным', 'семейная пара'], en: ['family', 'couple'], uk: ['сім’ї', "сім'ї", 'сімейним', 'сімейна пара'], ro: ['familie', 'cuplu'], uzLatn: ['oilaga', 'oilali', 'oila'], uzCyrl: ['оилага', 'оилали', 'оила'], kk: ['отбасына', 'отбасылы', 'жанұяға'] }),
  students: group('students', { ru: ['студентам', 'студенты'], en: ['students'], uk: ['студентам', 'студенти'], ro: ['studenți', 'studenti'], uzLatn: ['talabalarga', 'talabalar'], uzCyrl: ['талабаларга', 'талабалар'], kk: ['студенттерге', 'студенттер'] }),
  girls: group('girls', { ru: ['девушкам', 'девушки'], en: ['girls', 'women'], uk: ['дівчатам', 'дівчата'], ro: ['fete', 'femei'], uzLatn: ['qizlarga', 'qizlar'], uzCyrl: ['қизларга', 'қизлар'], kk: ['қыздарға', 'қыздар'] }),
  boys: group('boys', { ru: ['парням', 'мужчинам'], en: ['men', 'guys'], uk: ['хлопцям', 'чоловікам'], ro: ['bărbați', 'barbati', 'băieți', 'baieti'], uzLatn: ['yigitlarga', 'yigitlar'], uzCyrl: ['йигитларга', 'йигитлар'], kk: ['жігіттерге', 'жігіттер'] }),
  childrenAllowed: group('childrenAllowed', { ru: ['можно с детьми', 'с детьми можно'], en: ['children allowed', 'kids allowed'], uk: ['можна з дітьми'], ro: ['acceptă copii', 'accepta copii', 'copii acceptați'], uzLatn: ['bolalar mumkin', 'bolali oila'], uzCyrl: ['болалар мумкин', 'болали оила'], kk: ['балалармен болады', 'балаларға болады'] }),
  petsAllowed: group('petsAllowed', { ru: ['можно с животными', 'с питомцами можно'], en: ['pets allowed', 'pet friendly'], uk: ['можна з тваринами'], ro: ['acceptă animale', 'accepta animale', 'pet friendly'], uzLatn: ['hayvon bilan mumkin'], uzCyrl: ['ҳайвон билан мумкин'], kk: ['үй жануарларымен болады'] }),
});

export function flattenAliases(item) {
  if (!item?.aliases) return [];
  return Object.values(item.aliases).flat();
}

export function resolveHousingOccupancy(value) {
  const match = findCanonical(value, HOUSING_OCCUPANCY_TYPES, { partial: true });
  return match?.canonical || null;
}

export function looksHousingRoomOnly(value) {
  const text = String(value || '');
  if (!text) return false;
  const occupancy = resolveHousingOccupancy(text);
  if (occupancy === 'room' || occupancy === 'sharedRoom' || occupancy === 'bedSpace') return true;
  return /подселени|підселен|комнату\s+в|кімнату\s+в|сда[её]тся\s+комната|сдается\s+комната|сдам\s+комнату|здам\s+кімнат|room\s+in\s+a\s+(?:shared\s+)?flat|room\s+for\s+rent|shared\s+(?:flat|apartment|room)|roommate|flatmate|xona\s+ijaraga|xona\s+beriladi|sherik(?:ka|lik)|шерик(?:ка|лик)|(?:1|бир)\s*та\s*(?:бола|киши|қиз|киз)\s*керак|1\s*хонага[^\r\n]{0,40}(?:киши|одам)\s*турилади|бөлме\s+жалға|închiriez\s+camer[ăa]|ищу[^\r\n]{0,60}сосед|ищем[^\r\n]{0,60}сосед|нужен[^\r\n]{0,60}сосед|нужна[^\r\n]{0,60}сосед|шукаю[^\r\n]{0,60}сусід|шукаємо[^\r\n]{0,60}сусід|потрібен[^\r\n]{0,60}сусід|потрібна[^\r\n]{0,60}сусід|співмешкан|співжител|соседк|сусідк/iu.test(text);
}

export function resolveHousingPropertyType(value) {
  const text = String(value || '');
  if (!text) return null;
  const flat = PROPERTY_TYPES.find((entry) => entry.canonical === 'flat');
  if (flat && findCanonical(text, [flat], { partial: true })) return 'flat';
  const genericUzbekHome = /(?:^|[^\p{L}\p{N}_])(?:uy|уй)(?=$|[^\p{L}\p{N}_])/iu.test(text);
  const explicitHouse = /(?:hovli|xovli|ҳовли|ховли|house|casa|dom|villa|будин|коттедж|вілл|вилл|(?:^|[^\p{L}\p{N}_])(?:дом|үй)(?=$|[^\p{L}\p{N}_]))/iu.test(text);
  if (genericUzbekHome && !explicitHouse) return null;
  return findCanonical(text, PROPERTY_TYPES, { partial: true })?.canonical || null;
}

