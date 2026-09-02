import { lexiconEntity } from './lexicon-core.js';

const group = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, extra);

export const CURRENCY_TERMS = Object.freeze([
  group('USD', { ru: ['$', 'usd', 'доллар', 'доллара', 'долларов', 'бакс', 'у.е.', 'у е'], en: ['$', 'usd', 'dollar', 'dollars', 'us dollar'], uk: ['$', 'usd', 'долар', 'долари', 'доларів'], ro: ['$', 'usd', 'dolar', 'dolari'], uzLatn: ['$', 'usd', 'dollar'], uzCyrl: ['$', 'доллар'], kk: ['$', 'usd', 'доллар'] }),
  group('EUR', { ru: ['€', 'eur', 'евро'], en: ['€', 'eur', 'euro', 'euros'], uk: ['€', 'eur', 'євро'], ro: ['€', 'eur', 'euro'], uzLatn: ['€', 'eur', 'yevro'], uzCyrl: ['€', 'евро'], kk: ['€', 'eur', 'еуро'] }),
  group('UZS', { ru: ['сум', 'сумов', 'узс'], en: ['uzs', 'uzbek som'], uk: ['uzs', 'сум'], ro: ['uzs'], uzLatn: ["so'm", 'so‘m', 'soʻm', 'sum', 'uzs'], uzCyrl: ['сўм', 'сум'], kk: ['uzs'] }),
  group('KZT', { ru: ['тенге', 'тг', 'kzt'], en: ['kzt', 'tenge'], uk: ['тенге', 'kzt'], ro: ['kzt', 'tenge'], uzLatn: ['kzt', 'tenge'], uzCyrl: ['kzt', 'тенге'], kk: ['теңге', 'тенге', 'тг', 'kzt'] }),
  group('UAH', { ru: ['грн', 'гривна', 'гривны', 'гривен', '₴', 'uah'], en: ['uah', 'hryvnia', 'hryvnias', '₴'], uk: ['грн', 'гривня', 'гривні', 'гривень', '₴', 'uah'], ro: ['uah', 'hrivne', 'grivne'], uzLatn: ['uah'], uzCyrl: ['uah'], kk: ['uah'] }),
  group('RUB', { ru: ['₽', 'руб', 'руб.', 'рубль', 'рубля', 'рублей', 'rub', 'rur'], en: ['₽', 'rub', 'rur', 'ruble', 'rubles'], uk: ['₽', 'руб', 'рублів', 'rub'], ro: ['₽', 'rub', 'ruble'], uzLatn: ['₽', 'rub', 'rubl'], uzCyrl: ['₽', 'рубль'], kk: ['₽', 'rub', 'рубль'] }),
  group('GBP', { ru: ['£', 'gbp', 'фунт', 'фунтов'], en: ['£', 'gbp', 'pound', 'pounds', 'sterling'], uk: ['£', 'gbp', 'фунт', 'фунтів'], ro: ['£', 'gbp', 'liră sterlină', 'lira sterlina'], uzLatn: ['£', 'gbp', 'funt'], uzCyrl: ['£', 'фунт'], kk: ['£', 'gbp', 'фунт'] }),
  group('TRY', { ru: ['₺', 'try', 'лира', 'лир'], en: ['₺', 'try', 'turkish lira'], uk: ['₺', 'try', 'ліра', 'лір'], ro: ['₺', 'try', 'liră turcească', 'lira turceasca'], uzLatn: ['₺', 'try', 'lira'], uzCyrl: ['₺', 'лира'], kk: ['₺', 'try', 'лира'] }),
  group('GEL', { ru: ['₾', 'gel', 'лари'], en: ['₾', 'gel', 'lari'], uk: ['₾', 'gel', 'ларі'], ro: ['₾', 'gel', 'lari'], uzLatn: ['₾', 'gel', 'lari'], uzCyrl: ['₾', 'лари'], kk: ['₾', 'gel', 'лари'] }),
  group('AED', { ru: ['aed', 'дирхам', 'дирхамов'], en: ['aed', 'dirham', 'dirhams'], uk: ['aed', 'дирхам', 'дирхамів'], ro: ['aed', 'dirham'], uzLatn: ['aed', 'dirham'], uzCyrl: ['aed', 'дирҳам'], kk: ['aed', 'дирхам'] }),
  group('PLN', { ru: ['pln', 'злотый', 'злотых'], en: ['pln', 'zloty', 'zł'], uk: ['pln', 'злотий', 'злотих'], ro: ['pln', 'zlot'], uzLatn: ['pln', 'zloty'], uzCyrl: ['pln'], kk: ['pln'] }),
  group('RON', { ru: ['ron', 'лей', 'леев'], en: ['ron', 'romanian leu', 'lei'], uk: ['ron', 'лей', 'леїв'], ro: ['ron', 'leu', 'lei'], uzLatn: ['ron'], uzCyrl: ['ron'], kk: ['ron'] }),
  group('KGS', { ru: ['kgs', 'сом', 'сомов'], en: ['kgs', 'kyrgyz som'], uk: ['kgs', 'сом'], ro: ['kgs'], uzLatn: ['kgs', 'som'], uzCyrl: ['kgs', 'сом'], kk: ['kgs', 'сом'] }),
  group('CHF', { ru: ['chf', 'швейцарский франк', 'швейцарских франков'], en: ['chf', 'swiss franc', 'swiss francs'], uk: ['chf', 'швейцарський франк'], ro: ['chf', 'franc elvețian', 'franc elvetian'], uzLatn: ['chf', 'shveytsariya franki'], uzCyrl: ['chf'], kk: ['chf', 'швейцар франкі'] }),
  group('CNY', { ru: ['cny', 'rmb', 'юань', 'юаней', '元'], en: ['cny', 'rmb', 'yuan', 'renminbi', '元'], uk: ['cny', 'юань', 'юанів'], ro: ['cny', 'yuan'], uzLatn: ['cny', 'yuan'], uzCyrl: ['cny', 'юань'], kk: ['cny', 'юань'] }),
  group('JPY', { ru: ['jpy', 'иена', 'иены', 'иен', '円'], en: ['jpy', 'yen', 'japanese yen', '円'], uk: ['jpy', 'єна', 'єн'], ro: ['jpy', 'yen'], uzLatn: ['jpy', 'yen'], uzCyrl: ['jpy', 'иена'], kk: ['jpy', 'иена'] }),
  group('KRW', { ru: ['₩', 'krw', 'вона', 'вон'], en: ['₩', 'krw', 'won', 'south korean won'], uk: ['₩', 'krw', 'вона'], ro: ['₩', 'krw', 'won'], uzLatn: ['₩', 'krw', 'won'], uzCyrl: ['₩', 'krw'], kk: ['₩', 'krw', 'вон'] }),
  group('CAD', { ru: ['cad', 'канадский доллар', 'канадских долларов'], en: ['cad', 'canadian dollar', 'canadian dollars'], uk: ['cad', 'канадський долар'], ro: ['cad', 'dolar canadian'], uzLatn: ['cad', 'kanada dollari'], uzCyrl: ['cad'], kk: ['cad', 'канада доллары'] }),
  group('AUD', { ru: ['aud', 'австралийский доллар', 'австралийских долларов'], en: ['aud', 'australian dollar', 'australian dollars'], uk: ['aud', 'австралійський долар'], ro: ['aud', 'dolar australian'], uzLatn: ['aud', 'avstraliya dollari'], uzCyrl: ['aud'], kk: ['aud', 'австралия доллары'] }),
  group('NZD', { ru: ['nzd', 'новозеландский доллар'], en: ['nzd', 'new zealand dollar', 'new zealand dollars'], uk: ['nzd', 'новозеландський долар'], ro: ['nzd', 'dolar neozeelandez'], uzLatn: ['nzd'], uzCyrl: ['nzd'], kk: ['nzd'] }),
  group('SGD', { ru: ['sgd', 'сингапурский доллар'], en: ['sgd', 'singapore dollar', 'singapore dollars'], uk: ['sgd', 'сінгапурський долар'], ro: ['sgd', 'dolar singaporez'], uzLatn: ['sgd'], uzCyrl: ['sgd'], kk: ['sgd'] }),
  group('HKD', { ru: ['hkd', 'гонконгский доллар'], en: ['hkd', 'hong kong dollar', 'hong kong dollars'], uk: ['hkd', 'гонконзький долар'], ro: ['hkd', 'dolar hong kong'], uzLatn: ['hkd'], uzCyrl: ['hkd'], kk: ['hkd'] }),
  group('INR', { ru: ['₹', 'inr', 'рупия', 'рупии', 'рупий'], en: ['₹', 'inr', 'indian rupee', 'indian rupees', 'rupee', 'rupees'], uk: ['₹', 'inr', 'рупія', 'рупій'], ro: ['₹', 'inr', 'rupie indiană', 'rupie indiana'], uzLatn: ['₹', 'inr', 'rupiya'], uzCyrl: ['₹', 'inr'], kk: ['₹', 'inr', 'рупия'] }),
  group('CZK', { ru: ['czk', 'чешская крона', 'чешских крон'], en: ['czk', 'czech koruna', 'czech crown'], uk: ['czk', 'чеська крона'], ro: ['czk', 'coroană cehă', 'coroana ceha'], uzLatn: ['czk'], uzCyrl: ['czk'], kk: ['czk'] }),
  group('HUF', { ru: ['huf', 'форинт', 'форинтов'], en: ['huf', 'forint', 'hungarian forint'], uk: ['huf', 'форинт'], ro: ['huf', 'forint'], uzLatn: ['huf'], uzCyrl: ['huf'], kk: ['huf'] }),
  group('BGN', { ru: ['bgn', 'лев', 'лева', 'левов'], en: ['bgn', 'bulgarian lev', 'lev'], uk: ['bgn', 'болгарський лев'], ro: ['bgn', 'leva bulgărească', 'leva bulgareasca'], uzLatn: ['bgn'], uzCyrl: ['bgn'], kk: ['bgn'] }),
  group('MDL', { ru: ['mdl', 'молдавский лей', 'молдавских леев'], en: ['mdl', 'moldovan leu', 'moldovan lei'], uk: ['mdl', 'молдовський лей'], ro: ['mdl', 'leu moldovenesc', 'lei moldovenești', 'lei moldovenesti'], uzLatn: ['mdl'], uzCyrl: ['mdl'], kk: ['mdl'] }),
  group('AZN', { ru: ['₼', 'azn', 'манат', 'манатов'], en: ['₼', 'azn', 'azerbaijani manat', 'manat'], uk: ['₼', 'azn', 'манат'], ro: ['₼', 'azn', 'manat azer'], uzLatn: ['₼', 'azn', 'manat'], uzCyrl: ['₼', 'azn'], kk: ['₼', 'azn', 'манат'] }),
  group('AMD', { ru: ['֏', 'amd', 'драм', 'драмов'], en: ['֏', 'amd', 'armenian dram', 'dram'], uk: ['֏', 'amd', 'драм'], ro: ['֏', 'amd', 'dram armean'], uzLatn: ['֏', 'amd'], uzCyrl: ['֏', 'amd'], kk: ['֏', 'amd', 'драм'] }),
  group('TJS', { ru: ['tjs', 'сомони'], en: ['tjs', 'tajikistani somoni', 'somoni'], uk: ['tjs', 'сомоні'], ro: ['tjs', 'somoni'], uzLatn: ['tjs', 'somoni'], uzCyrl: ['tjs', 'сомони'], kk: ['tjs', 'сомони'] }),
  group('TMT', { ru: ['tmt', 'туркменский манат'], en: ['tmt', 'turkmen manat'], uk: ['tmt', 'туркменський манат'], ro: ['tmt', 'manat turkmen'], uzLatn: ['tmt', 'turkman manati'], uzCyrl: ['tmt'], kk: ['tmt'] }),
]);

export const CURRENCY_SYMBOL_CANDIDATES = Object.freeze({
  '$': Object.freeze(['USD', 'CAD', 'AUD', 'NZD', 'SGD', 'HKD']),
  '€': Object.freeze(['EUR']),
  '₴': Object.freeze(['UAH']),
  '₽': Object.freeze(['RUB']),
  '£': Object.freeze(['GBP']),
  '₺': Object.freeze(['TRY']),
  '₾': Object.freeze(['GEL']),
  '₩': Object.freeze(['KRW']),
  '₹': Object.freeze(['INR']),
  '₼': Object.freeze(['AZN']),
  '֏': Object.freeze(['AMD']),
  '¥': Object.freeze(['JPY', 'CNY']),
  '￥': Object.freeze(['JPY', 'CNY']),
});

export const SALARY_PERIODS = Object.freeze([
  group('hour', { ru: ['в час', 'за час', 'почасово', 'часовая ставка'], en: ['per hour', 'hourly', '/hour', '/hr'], uk: ['за годину', 'на годину', 'погодинно'], ro: ['pe oră', 'pe ora', 'orar'], uzLatn: ['soatiga', 'soatlik'], uzCyrl: ['соатига', 'соатлик'], kk: ['сағатына', 'сағаттық'] }),
  group('day', { ru: ['в день', 'за день', 'дневная ставка'], en: ['per day', 'daily', '/day'], uk: ['за день', 'на день', 'щодня'], ro: ['pe zi', 'zilnic'], uzLatn: ['kuniga', 'kunlik'], uzCyrl: ['кунига', 'кунлик'], kk: ['күніне', 'күндік'] }),
  group('shift', { ru: ['за смену', 'смена', 'за выход'], en: ['per shift', 'shift rate'], uk: ['за зміну', 'зміна'], ro: ['pe tură', 'pe tura'], uzLatn: ['smenaga', 'smena uchun'], uzCyrl: ['сменага', 'смена учун'], kk: ['ауысымға', 'ауысым үшін'] }),
  group('week', { ru: ['в неделю', 'за неделю', 'еженедельно'], en: ['per week', 'weekly', '/week'], uk: ['на тиждень', 'за тиждень', 'щотижня'], ro: ['pe săptămână', 'pe saptamana', 'săptămânal'], uzLatn: ['haftasiga', 'haftalik'], uzCyrl: ['ҳафтасига', 'ҳафталик'], kk: ['аптасына', 'апталық'] }),
  group('month', { ru: ['в месяц', 'за месяц', 'месячная', 'ежемесячно', 'в мес'], en: ['per month', 'monthly', '/month', '/mo', 'pcm'], uk: ['на місяць', 'за місяць', 'щомісяця'], ro: ['pe lună', 'pe luna', 'lunar'], uzLatn: ['oyiga', 'oylik'], uzCyrl: ['ойига', 'ойлик'], kk: ['айына', 'айлық'] }),
  group('year', { ru: ['в год', 'за год', 'годовая', 'годовых'], en: ['per year', 'yearly', 'annual', 'annually', '/year', 'p.a.'], uk: ['на рік', 'за рік', 'річна'], ro: ['pe an', 'anual'], uzLatn: ['yiliga', 'yillik'], uzCyrl: ['йилига', 'йиллик'], kk: ['жылына', 'жылдық'] }),
  group('project', { ru: ['за проект', 'за заказ'], en: ['per project', 'project fee'], uk: ['за проєкт', 'за замовлення'], ro: ['pe proiect'], uzLatn: ['loyiha uchun', 'buyurtma uchun'], uzCyrl: ['лойиҳа учун', 'буюртма учун'], kk: ['жобаға', 'тапсырысқа'] }),
  group('piece', { ru: ['сдельно', 'за единицу', 'за штуку'], en: ['piece rate', 'per piece', 'per item'], uk: ['відрядно', 'за одиницю'], ro: ['la bucată', 'la bucata'], uzLatn: ['dona uchun', 'ishbay'], uzCyrl: ['дона учун', 'ишбай'], kk: ['данасына', 'кесімді'] }),
]);

export const SALARY_MODIFIERS = Object.freeze({
  from: group('from', { ru: ['от', 'начиная с'], en: ['from', 'starting at', 'at least'], uk: ['від', 'починаючи від'], ro: ['de la', 'începând de la', 'incepand de la'], uzLatn: ['dan', 'kamida'], uzCyrl: ['дан', 'камида'], kk: ['бастап', 'кемінде'] }),
  to: group('to', { ru: ['до', 'максимум'], en: ['up to', 'maximum', 'max'], uk: ['до', 'максимум'], ro: ['până la', 'pana la', 'maximum'], uzLatn: ['gacha', 'maksimum'], uzCyrl: ['гача', 'максимум'], kk: ['дейін', 'максимум'] }),
  approx: group('approx', { ru: ['около', 'примерно', 'порядка'], en: ['about', 'approx', 'approximately', 'around'], uk: ['близько', 'приблизно'], ro: ['aproximativ', 'circa'], uzLatn: ['taxminan', 'atrofida'], uzCyrl: ['тахминан', 'атрофида'], kk: ['шамамен', 'шамасы'] }),
  negotiable: group('negotiable', { ru: ['по договоренности', 'по договорённости', 'договорная', 'обсуждается'], en: ['negotiable', 'competitive salary', 'salary discussed', 'doe'], uk: ['за домовленістю', 'договірна'], ro: ['negociabil', 'salariu negociabil'], uzLatn: ['kelishiladi', 'kelishilgan holda'], uzCyrl: ['келишилади'], kk: ['келісім бойынша', 'келісіледі'] }),
  gross: group('gross', { ru: ['gross', 'гросс', 'до налогов', 'до вычета налогов', 'до вычета ндфл'], en: ['gross', 'before tax', 'pre-tax'], uk: ['gross', 'до податків', 'до вирахування податків'], ro: ['brut', 'înainte de taxe', 'inainte de taxe'], uzLatn: ['soliqdan oldin', 'gross'], uzCyrl: ['солиқдан олдин'], kk: ['салыққа дейін', 'gross'] }),
  net: group('net', { ru: ['net', 'нетто', 'на руки', 'чистыми', 'после налогов', 'после вычета налогов'], en: ['net', 'after tax', 'take home', 'take-home'], uk: ['net', 'нетто', 'на руки', 'після податків'], ro: ['net', 'după taxe', 'dupa taxe'], uzLatn: ['qo‘lga', "qo'lga", 'soliqdan keyin', 'net'], uzCyrl: ['қўлга', 'солиқдан кейин'], kk: ['қолға', 'салықтан кейін', 'net'] }),
});

export const NUMBER_MULTIPLIERS = Object.freeze([
  group('thousand', { ru: ['к', 'тыс', 'тыс.', 'тысяч', 'тысячи'], en: ['k', 'thousand'], uk: ['к', 'тис', 'тис.', 'тисяч'], ro: ['k', 'mii'], uzLatn: ['k', 'ming'], uzCyrl: ['минг'], kk: ['k', 'мың'] }, { multiplier: 1_000 }),
  group('million', { ru: ['м', 'млн', 'млн.', 'миллион', 'миллионов'], en: ['m', 'mln', 'million', 'millions'], uk: ['м', 'млн', 'мільйон', 'мільйонів'], ro: ['m', 'mil', 'milioane'], uzLatn: ['m', 'mln', 'million'], uzCyrl: ['млн', 'миллион'], kk: ['м', 'млн', 'миллион'] }, { multiplier: 1_000_000 }),
  group('billion', { ru: ['млрд', 'миллиард', 'миллиардов'], en: ['bn', 'billion'], uk: ['млрд', 'мільярд'], ro: ['mld', 'miliard', 'miliarde'], uzLatn: ['mlrd', 'billion'], uzCyrl: ['млрд', 'миллиард'], kk: ['млрд', 'миллиард'] }, { multiplier: 1_000_000_000 }),
]);
