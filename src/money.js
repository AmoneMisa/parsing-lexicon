import { aliasesOf, findCanonical, normalizeUnicode } from './normalization.js';
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
]);

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
  group('billion', { ru: ['млрд', 'миллиард', 'миллиардов'], en: ['bn', 'billion'], uk: ['млрд', 'мільярд'], ro: ['mld', 'miliard'], uzLatn: ['mlrd', 'billion'], uzCyrl: ['млрд', 'миллиард'], kk: ['млрд', 'миллиард'] }, { multiplier: 1_000_000_000 }),
]);

const NUMBER = '\\d{1,3}(?:[ \\u00a0.,]\\d{3})+|\\d+(?:[.,]\\d+)?';
const SCALE = 'k|к|тыс\\.?|тысяч(?:а|и)?|тис\\.?|thousand|ming|мың|m|м|млн\\.?|mln|million|миллион(?:ов)?|мільйон(?:ів)?|bn|млрд|mlrd|billion';
const RANGE_RE = new RegExp(`(${NUMBER})\\s*(${SCALE})?\\s*(?:-|–|—|до|to|bis|dan\\s+gacha)\\s*(${NUMBER})\\s*(${SCALE})?`, 'iu');
const SINGLE_RE = new RegExp(`(${NUMBER})\\s*(${SCALE})?`, 'giu');

function parseNumeric(raw) {
  let value = String(raw || '').replace(/\u00a0/g, ' ').trim();
  if (!value) return null;
  const grouped = /\d[ .]\d{3}(?:[ .]\d{3})*/.test(value);
  if (grouped) value = value.replace(/[ .]/g, '');
  else value = value.replace(/\s+/g, '').replace(',', '.');
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function scaleMultiplier(raw) {
  if (!raw) return 1;
  const entry = findCanonical(raw, NUMBER_MULTIPLIERS);
  return entry?.multiplier || 1;
}

function amount(raw, scale) {
  const value = parseNumeric(raw);
  return value == null ? null : value * scaleMultiplier(scale);
}

function hasSalaryContext(text) {
  return /(?:salary|зарплат|з\s*п\b|оплат|ставк|доход|оклад|компенсац|maosh|oylik|ish\s+haqi|жалақы|айлық|еңбекақы|salariu|зарплат|оплата)/iu.test(text);
}

function currencyFromText(text) {
  if (text.includes('$')) return 'USD';
  if (text.includes('€')) return 'EUR';
  if (text.includes('₴')) return 'UAH';
  if (text.includes('₽')) return 'RUB';
  if (text.includes('£')) return 'GBP';
  if (text.includes('₺')) return 'TRY';
  if (text.includes('₾')) return 'GEL';
  return findCanonical(text, CURRENCY_TERMS, { partial: true })?.canonical || null;
}

function periodFromText(text) {
  return findCanonical(text, SALARY_PERIODS, { partial: true })?.canonical || null;
}

function hasModifier(text, key) {
  return Boolean(findCanonical(text, [SALARY_MODIFIERS[key]], { partial: true }));
}

export function parseSalary(value) {
  const text = normalizeUnicode(value ?? '');
  if (!text) return null;

  const currency = currencyFromText(text);
  const negotiable = hasModifier(text, 'negotiable');
  const gross = hasModifier(text, 'gross') ? true : hasModifier(text, 'net') ? false : null;
  const period = periodFromText(text);

  const salaryContext = hasSalaryContext(text) || Boolean(currency) || NUMBER_MULTIPLIERS.some((entry) => findCanonical(text, [entry], { partial: true }));
  if (!salaryContext && !negotiable) return null;

  const range = text.match(RANGE_RE);
  let min = null;
  let max = null;
  let approximate = hasModifier(text, 'approx');

  if (range) {
    const firstScale = range[2] || range[4] || null;
    const secondScale = range[4] || range[2] || null;
    min = amount(range[1], firstScale);
    max = amount(range[3], secondScale);
    if (min != null && max != null && min > max) [min, max] = [max, min];
  } else {
    SINGLE_RE.lastIndex = 0;
    const candidates = [];
    for (const match of text.matchAll(SINGLE_RE)) {
      const start = match.index ?? 0;
      const end = start + match[0].length;
      const window = text.slice(Math.max(0, start - 24), Math.min(text.length, end + 32));
      const scaled = Boolean(match[2]);
      const relevant = scaled || currencyFromText(window) || hasSalaryContext(window) || periodFromText(window);
      if (!relevant) continue;
      const parsed = amount(match[1], match[2]);
      if (parsed == null) continue;
      // Avoid interpreting calendar years / experience years as salary when there is no strong salary marker nearby.
      if (!scaled && !currencyFromText(window) && parsed >= 1900 && parsed <= 2100 && !hasSalaryContext(window)) continue;
      candidates.push(parsed);
    }
    if (candidates.length) {
      const valueAmount = candidates[0];
      if (hasModifier(text, 'to')) max = valueAmount;
      else if (hasModifier(text, 'from') || /\+\s*(?:$|\D)/u.test(text)) min = valueAmount;
      else min = max = valueAmount;
    }
  }

  if (min == null && max == null && !negotiable) return null;
  return Object.freeze({
    min,
    max,
    currency,
    period,
    gross,
    negotiable,
    approximate,
  });
}

export function salaryCurrency(value) {
  return currencyFromText(String(value || ''));
}

export function salaryPeriod(value) {
  return periodFromText(String(value || ''));
}

export function currencyAliases(code) {
  const entry = CURRENCY_TERMS.find((item) => item.canonical === code);
  return entry ? [entry.canonical, ...aliasesOf(entry)] : [];
}
