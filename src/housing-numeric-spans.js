import { canonicalCountryCode } from './countries.js';
import { moneyCurrencyPattern, parseNumericAmount } from './money-core.js';

export const HOUSING_NUMERIC_SPAN_TYPES = Object.freeze({
  MONEY: 'money',
  AREA: 'area',
  DISTANCE: 'distance',
  MICRODISTRICT: 'microdistrict',
  UNKNOWN: 'unknown',
});

const PRICE_LABEL_BEFORE_RE = /(?:цена|ціна|нарх(?:и)?|narx(?:i)?|price|стоимост[ьи]|аренд(?:а|ная\s+плата)?|rent)[^\r\n]{0,16}$/iu;
const CURRENCY_AFTER_RE = new RegExp(
  `^\\s*(?:uzbek(?:istan)?\\s+)?(?:${moneyCurrencyPattern()})(?![\\p{L}\\p{N}_])`,
  'iu',
);
const UZ_SALE_SIGNAL_RE = /(?:sotiladi|sotuv(?:da)?|sotaman|прода[её]тся|продам|продаж[аеи]|for\s+sale|sale)/iu;

const MICRODISTRICT_AFTER_RE = /^\s*\/\s*[rр](?=$|[^\p{L}\p{N}_])/iu;
const AREA_BEFORE_RE = /(?:общ(?:ая)?\.?\s*пл(?:ощад[ьи])?\.?|загальн\p{L}*\s+площ\p{L}*|площа|площадь|umumiy\s+maydon|maydon|area|surface|suprafa(?:ță|ta))[^\r\n,;]{0,12}$/iu;
const AREA_AFTER_RE = /^\s*(?:kv\.?\s*m|sqm|sq\.?\s*m|umumiy\s+maydon|maydon|area|surface|suprafa(?:ță|ta))\b/iu;

const DISTANCE_OBJECT = String.raw`(?:metro(?:ga|dan|gacha)?|метро|maktab(?:ga|dan|gacha)?|school|школ\p{L}*|bozor(?:ga|dan|gacha)?|market|рынок\p{L}*|bekat(?:ga|dan|gacha)?|stop|station|остановк\p{L}*|park(?:ga|dan|gacha)?|парк\p{L}*|aeroport(?:ga|dan|gacha)?|airport|аэропорт\p{L}*|do['’ʻʼ]?kon(?:ga|dan|gacha)?|магазин\p{L}*)`;
const DISTANCE_BEFORE_RE = new RegExp(
  `(?:${DISTANCE_OBJECT}|masofa|distance|до\\s+${DISTANCE_OBJECT}|to\\s+${DISTANCE_OBJECT})[^\\r\\n,;]{0,14}$`,
  'iu',
);
const DISTANCE_AFTER_RE = new RegExp(
  `^\\s*(?:(?:gacha|гача|masofa|distance|metr\\p{L}*|метр\\p{L}*)\\b|(?:до|to)\\s+${DISTANCE_OBJECT}\\b|${DISTANCE_OBJECT}\\b|(?:walk(?:ing)?|piyoda)\\s+(?:to\\s+)?${DISTANCE_OBJECT}\\b)`,
  'iu',
);

const SINGLE_M_CANDIDATE_RE = /(?<![\p{L}\p{N}_])(\d{1,4}(?:[.,]\d{1,2})?)([ \u00A0]*)([mм])(?![\p{L}\p{N}_])/giu;

function normalizedDealType(value) {
  const dealType = String(value || '').trim();
  return ['sale', 'longRent', 'shortRent'].includes(dealType) ? dealType : null;
}

function classifySingleMSpan(text, match, { country, dealType }) {
  const start = match.index ?? 0;
  const end = SINGLE_M_CANDIDATE_RE.lastIndex;
  const before = text.slice(Math.max(0, start - 64), start);
  const after = text.slice(end, Math.min(text.length, end + 64));

  if (MICRODISTRICT_AFTER_RE.test(after)) return HOUSING_NUMERIC_SPAN_TYPES.MICRODISTRICT;
  if (AREA_BEFORE_RE.test(before) || AREA_AFTER_RE.test(after)) return HOUSING_NUMERIC_SPAN_TYPES.AREA;
  if (DISTANCE_BEFORE_RE.test(before) || DISTANCE_AFTER_RE.test(after)) return HOUSING_NUMERIC_SPAN_TYPES.DISTANCE;

  const explicitPrice = PRICE_LABEL_BEFORE_RE.test(before);
  const explicitCurrency = CURRENCY_AFTER_RE.test(after);
  if (explicitPrice || explicitCurrency) return HOUSING_NUMERIC_SPAN_TYPES.MONEY;

  const compact = match[2].length === 0;
  const localSaleSignal = country === 'UZ' && UZ_SALE_SIGNAL_RE.test(`${before} ${after}`);
  if (country === 'UZ' && compact && (dealType === 'sale' || localSaleSignal)) {
    return HOUSING_NUMERIC_SPAN_TYPES.MONEY;
  }

  return HOUSING_NUMERIC_SPAN_TYPES.UNKNOWN;
}

export function classifyHousingSingleMSpans(value, options = {}) {
  const text = String(value || '');
  if (!text) return Object.freeze([]);

  const country = canonicalCountryCode(options.country) || String(options.country || '').trim().toUpperCase();
  const dealType = normalizedDealType(options.dealType);
  const spans = [];

  SINGLE_M_CANDIDATE_RE.lastIndex = 0;
  let match;
  while ((match = SINGLE_M_CANDIDATE_RE.exec(text)) !== null) {
    const amount = parseNumericAmount(match[1]);
    if (amount == null) continue;
    const start = match.index ?? 0;
    const end = SINGLE_M_CANDIDATE_RE.lastIndex;
    spans.push(Object.freeze({
      start,
      end,
      raw: match[0],
      amount,
      compact: match[2].length === 0,
      type: classifySingleMSpan(text, match, { country, dealType }),
    }));
  }

  return Object.freeze(spans);
}
