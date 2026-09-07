import { aliasesOf, findCanonical } from './normalization.js';
import { CURRENCY_TERMS, NUMBER_MULTIPLIERS } from './money-lexicon.js';
import {
  MONEY_NUMBER_PATTERN,
  moneyCurrencyFromText,
  moneyCurrencyPattern,
  parseNumericAmount,
  parseScaledAmount,
} from './money-core.js';
import { maskPhoneLikeSpans } from './contact.js';
import { DEPOSIT_TERMS, SELLER_TERMS } from './housing.js';
import { COUNTRIES, canonicalCountryCode, countryByCode } from './countries.js';

const PRICE_KEYWORD = '(?:цена|ціна|нарх(?:и)?|narx(?:i)?|price|стоимост[ьи]|аренд(?:а|ная\\s+плата)?|rent)';
// moneyCurrencyPattern() includes short codes (cad, ron, aed...) with no
// boundary of its own, so "100 cadastru" would otherwise read "cad" off an
// unrelated word as the Canadian dollar. Only the side facing away from the
// paired number gets a boundary: the side facing the number is legitimately
// adjacent to a digit with no separator ("350$", "$100"), so guarding it
// too would reject those ordinary forms.
const CURRENCY_ALT = `(?:${moneyCurrencyPattern()})`;
const PRICE_CURRENCY_AFTER_NUMBER = `(?:${CURRENCY_ALT}(?![\\p{L}\\p{N}_]))`;
const PRICE_CURRENCY_BEFORE_NUMBER = `(?:(?<![\\p{L}\\p{N}_])${CURRENCY_ALT})`;
const PAYMENT_AMOUNT_TERMS = Object.freeze([
  DEPOSIT_TERMS.deposit,
  SELLER_TERMS.commission,
].filter(Boolean));
const PRICE_KEYWORD_RE = new RegExp(PRICE_KEYWORD, 'iu');
const PRICE_KEYWORD_NEAR_END_RE = new RegExp(`${PRICE_KEYWORD}[^\\r\\n]{0,16}$`, 'iu');

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// A one-letter `m` is too ambiguous for the generic housing multiplier path:
// the same token is routinely a metre (`80 m`, `606 m/r`). Keep it out of the
// shared fallback and re-enable it only in a country/intent-aware branch where
// the surrounding evidence is strong enough (currently Uzbek sale shorthand).
const SCALE_PATTERN = [...new Set(NUMBER_MULTIPLIERS.flatMap((entry) => aliasesOf(entry)).filter(Boolean))]
  .filter((alias) => !/^[mм]$/iu.test(String(alias)))
  .sort((a, b) => String(b).length - String(a).length)
  .map(escapeRegex)
  .join('|');

const PER_SQM_UNIT = String.raw`(?:m(?:2|²)|м(?:2|²)|м\s*кв\.?|кв\.?\s*м(?:2|²)?|sqm|sq\.?\s*m|square\s+met(?:er|re)s?|квадратн\p{L}*\s+метр\p{L}*)`;
const PER_SQM_NUMBER = `(${MONEY_NUMBER_PATTERN})(?:\\s*(${SCALE_PATTERN})(?=$|[^\\p{L}\\p{N}_]))?`;
const PER_SQM_CURRENCY = `(?:\\s*${CURRENCY_ALT}(?![\\p{L}\\p{N}_]))?`;
const PER_SQM_AFTER_AMOUNT_RE = new RegExp(
  `${PER_SQM_NUMBER}${PER_SQM_CURRENCY}\\s*(?:за\\s*(?:1\\s*)?|по\\s*|/\\s*|per\\s+)${PER_SQM_UNIT}(?=$|[^\\p{L}\\p{N}_])`,
  'igu',
);
const PER_SQM_AFTER_UNIT_RE = new RegExp(
  `${PER_SQM_NUMBER}${PER_SQM_CURRENCY}\\s*${PER_SQM_UNIT}\\s*(?:uchun|учун|ga|га)(?=$|[^\\p{L}\\p{N}_])`,
  'igu',
);
const PER_SQM_BEFORE_AMOUNT_RE = new RegExp(
  `(?:за\\s*(?:1\\s*)?|по\\s*|per\\s+)${PER_SQM_UNIT}\\s*[:=\\-–—]?\\s*${PER_SQM_NUMBER}${PER_SQM_CURRENCY}(?=$|[^\\p{L}\\p{N}_])`,
  'igu',
);

const COMMON_HOUSING_STRUCTURE_PATTERNS = Object.freeze([
  /(?:^|[^\p{L}\p{N}_])\d{1,5}(?:[.,]\d{1,2})?\s*(?:м(?:2|²)|m(?:2|²)|sqm|sq\.?\s*m|м\s*кв\.?)\s*(?=$|[^\p{L}\p{N}_])/giu,
]);

// Only notation whose semantics genuinely vary by country belongs here. The
// parser algorithm stays shared; profiles merely identify spans that cannot be
// money in that country's housing classifieds.
const COUNTRY_HOUSING_STRUCTURE_PATTERNS = Object.freeze({
  UA: Object.freeze([
    // Ukrainian classifieds use `531 м/р`, `606м/р` for microdistricts.
    /(?:^|[^\p{L}\p{N}_])\d{1,4}\s*[mм]\s*\/\s*[rр](?=$|[^\p{L}\p{N}_])/giu,
    // `общ.пл.80 м`, `загальна площа 80 м` are area measurements even when
    // the author omitted the squared sign.
    /(?:общ(?:ая)?\.?\s*пл(?:ощад[ьи])?\.?|загальн\p{L}*\s+площ\p{L}*|площа|площадь)\s*[:=\-–—]?\s*\d{1,5}(?:[.,]\d{1,2})?\s*[mм](?=$|[^\p{L}\p{N}_])/giu,
  ]),
});

const UZ_SINGLE_MILLION_CURRENCY_AFTER_RE = /^\s*(?:uzbek(?:istan)?\s+)?(?:s[ʻʼ'‘’]?o[ʻʼ'‘’]?m|som|sum|с[ўу]м|uzs)(?=$|[^\p{L}\p{N}_])/iu;
const UZ_SINGLE_MILLION_SALE_RE = /(?:sotiladi|sotuv(?:da)?|прода[её]тся|продаж[аеи]|for\s+sale|sale)/iu;
const UZ_SINGLE_MILLION_STRUCTURAL_BEFORE_RE = /(?:площад\p{L}*|площа|майдон|maydon|area|masofa|distance|метро\p{L}*|metro\p{L}*|maktab\p{L}*|school\p{L}*|bozor\p{L}*|рынок\p{L}*)[^\r\n]{0,8}$/iu;
const UZ_SINGLE_MILLION_STRUCTURAL_AFTER_RE = /^\s*(?:gacha|гача|masofa|distance|metr\p{L}*|метр\p{L}*)\b/iu;

function moneyParsingContext(value = '') {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    const country = canonicalCountryCode(value.country) || '';
    const currency = String(value.currency || value.fallbackCurrency || countryByCode(country)?.currency || '')
      .trim()
      .toUpperCase();
    const rawDealType = String(value.dealType || '').trim();
    const dealType = ['sale', 'longRent', 'shortRent'].includes(rawDealType) ? rawDealType : null;
    return { country, currency, dealType };
  }

  const currency = String(value || '').trim().toUpperCase();
  const countryMatches = currency
    ? COUNTRIES.filter((item) => item.currency === currency)
    : [];
  return {
    country: countryMatches.length === 1 ? countryMatches[0].code : '',
    currency,
    dealType: null,
  };
}

function parsedMoneyAmount(numberValue, scaleValue) {
  const amount = scaleValue
    ? parseScaledAmount(numberValue, scaleValue)
    : parseNumericAmount(numberValue);
  return amount != null && amount >= 1 && amount <= 5_000_000_000
    ? Math.round(amount)
    : null;
}

const APPROXIMATE_RE = /около|примерно|~|≈/iu;

function perSquareMeterMatches(text, fallbackCurrency = '') {
  const matches = [];
  const seen = new Set();

  for (const regex of [PER_SQM_AFTER_AMOUNT_RE, PER_SQM_AFTER_UNIT_RE, PER_SQM_BEFORE_AMOUNT_RE]) {
    regex.lastIndex = 0;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const amount = parsedMoneyAmount(match[1], match[2]);
      if (amount == null) continue;
      const start = match.index ?? 0;
      const end = regex.lastIndex;
      const key = `${start}:${end}`;
      if (seen.has(key)) continue;
      seen.add(key);
      matches.push({
        start,
        end,
        amount,
        currency: moneyCurrencyFromText(match[0], fallbackCurrency || '') || fallbackCurrency || '',
        approximate: APPROXIMATE_RE.test(match[0]),
      });
    }
  }

  return matches.sort((a, b) => a.start - b.start);
}

function maskRanges(text, ranges) {
  if (!ranges.length) return text;
  let masked = text;
  for (const { start, end } of [...ranges].sort((a, b) => b.start - a.start)) {
    masked = `${masked.slice(0, start)}${' '.repeat(Math.max(0, end - start))}${masked.slice(end)}`;
  }
  return masked;
}

function maskPatternMatches(text, patterns) {
  let masked = text;
  for (const pattern of patterns) {
    pattern.lastIndex = 0;
    masked = masked.replace(pattern, (match) => ' '.repeat(match.length));
  }
  return masked;
}

function maskHousingStructuralSpans(text, country) {
  const countryPatterns = COUNTRY_HOUSING_STRUCTURE_PATTERNS[country] || [];
  return maskPatternMatches(text, [...COMMON_HOUSING_STRUCTURE_PATTERNS, ...countryPatterns]);
}

function isPaymentScopedAmount(text, start, end) {
  const left = text
    .slice(Math.max(0, start - 56), start)
    .split(/[\r\n.;!?]/u)
    .pop() || '';
  const right = text
    .slice(end, Math.min(text.length, end + 28))
    .split(/[\r\n.;!?]/u)[0] || '';

  // "deposit 500$" / "commission 100$" are payment details, not the
  // listing price. For the reverse form ("500$ deposit"), only suppress the
  // amount when there is no explicit price/rent label immediately to its left;
  // this preserves text such as "rent 800$, deposit 500$".
  if (findCanonical(left, PAYMENT_AMOUNT_TERMS, { partial: true })) return true;
  return !PRICE_KEYWORD_RE.test(left)
    && Boolean(findCanonical(right, PAYMENT_AMOUNT_TERMS, { partial: true }));
}

function parseUzbekSingleLetterMillion(text, { country, dealType }) {
  if (country !== 'UZ') return null;

  const candidateRe = /(?<![\p{L}\p{N}_])(\d{1,4}(?:[.,]\d{1,2})?)([ \u00A0]*)([mм])(?![\p{L}\p{N}_])/giu;
  let match;
  while ((match = candidateRe.exec(text)) !== null) {
    const start = match.index ?? 0;
    const end = candidateRe.lastIndex;
    if (isPaymentScopedAmount(text, start, end)) continue;

    const before = text.slice(Math.max(0, start - 48), start);
    const after = text.slice(end, Math.min(text.length, end + 48));
    const explicitlyPriceLabelled = PRICE_KEYWORD_NEAR_END_RE.test(before);
    const explicitlyUzs = UZ_SINGLE_MILLION_CURRENCY_AFTER_RE.test(after);
    const compact = match[2].length === 0;
    const localSaleSignal = UZ_SINGLE_MILLION_SALE_RE.test(`${before} ${after}`);

    // Strong price/currency evidence wins. Otherwise a bare compact `800m`
    // is accepted only for an Uzbek sale and only if its immediate context
    // does not identify a measurement/distance such as `metro 800m`.
    if (!explicitlyPriceLabelled && !explicitlyUzs) {
      if (UZ_SINGLE_MILLION_STRUCTURAL_BEFORE_RE.test(before)
        || UZ_SINGLE_MILLION_STRUCTURAL_AFTER_RE.test(after)) continue;
      if (!(compact && (dealType === 'sale' || localSaleSignal))) continue;
    }

    const baseAmount = parseNumericAmount(match[1]);
    const amount = baseAmount == null ? null : baseAmount * 1_000_000;
    if (amount != null && amount >= 1_000_000 && amount <= 5_000_000_000) {
      return Math.round(amount);
    }
  }

  return null;
}

export function parseHousingPricePerSqm(value, context = '') {
  const { currency: fallbackCurrency } = moneyParsingContext(context);
  const original = String(value || '');
  if (!original) return Object.freeze({ amount: null, currency: fallbackCurrency || '', approximate: false });

  const text = maskPhoneLikeSpans(original);
  const candidates = perSquareMeterMatches(text, fallbackCurrency);
  if (!candidates.length) {
    return Object.freeze({ amount: null, currency: fallbackCurrency || '', approximate: false });
  }

  const candidate = candidates[0];
  return Object.freeze({
    amount: candidate.amount,
    currency: candidate.currency,
    approximate: candidate.approximate,
  });
}

export function parseHousingPrice(value, context = '') {
  const { country, currency: fallbackCurrency, dealType } = moneyParsingContext(context);
  const original = String(value || '');
  if (!original) return Object.freeze({ amount: null, currency: fallbackCurrency || '', approximate: false });

  // Contact spans are removed once, before every money branch. A phone can
  // therefore never win as a labelled, currency-tagged or fallback amount.
  const text = maskPhoneLikeSpans(original);
  // Unit prices are not listing totals. Mask their exact spans before running
  // the ordinary total-price parser so "От 13 млн за m2" cannot become a
  // 13,000,000 UZS apartment price. Country-aware structural masking then
  // removes local area/microdistrict notation before any money fallback sees it.
  const withoutUnitPrices = maskRanges(text, perSquareMeterMatches(text, fallbackCurrency));
  const priceText = maskHousingStructuralSpans(withoutUnitPrices, country);
  let currency = moneyCurrencyFromText(priceText, fallbackCurrency || '')
    || moneyCurrencyFromText(text, fallbackCurrency || '')
    || '';
  const explicit = Boolean(findCanonical(priceText, CURRENCY_TERMS, { partial: true }));
  let price = null;

  // Common Ukrainian/Russian classifieds shorthand: "10 т грн" / "10 т гр".
  // Keep this housing-specific instead of adding globally ambiguous aliases
  // `т` (tonne) and `гр` (gram) to the shared money lexicon. A nearby price
  // keyword plus an explicit hryvnia shorthand makes the intent unambiguous.
  const compactThousandUah = priceText.match(new RegExp(
    `${PRICE_KEYWORD}[^\\r\\n]{0,48}?(\\d{1,6}(?:[.,]\\d{1,2})?)\\s*т(?:ыс\\.?)?\\s*(?:гр(?:н)?|₴|uah)(?=$|[^\\p{L}\\p{N}_])`,
    'iu',
  ));
  if (compactThousandUah) {
    const amount = parseNumericAmount(compactThousandUah[1]);
    if (amount != null && amount >= 1 && amount <= 5_000_000) {
      price = Math.round(amount * 1000);
      currency = 'UAH';
    }
  }

  // Uzbek ads also use a dot as a thousands separator after four leading
  // digits: "2500.000 сум" means 2,500,000 UZS, not 2,500 UZS.
  const expandedUzbekThousands = priceText.match(new RegExp(
    `${PRICE_KEYWORD}[^\\d\\r\\n]{0,16}(\\d{4})[.]000\\s*(?:с[ўу]м|so['‘’ʻʼ]?m|som|sum|uzs)(?=$|[^\\p{L}\\p{N}_])`,
    'iu',
  ));
  if (price == null && expandedUzbekThousands) {
    const amount = Number(expandedUzbekThousands[1]) * 1000;
    if (amount >= 1_000_000 && amount <= 5_000_000_000) {
      price = amount;
      currency = 'UZS';
    }
  }

  // Split-million forms must win before a generic labelled amount. Otherwise
  // "Narxi 2 миллион 500" would stop at 2,000,000 and lose the trailing 500k.
  if (price == null) {
    const splitMillion = priceText.match(/(?:^|[^\p{L}\p{N}_])(\d{1,3})\s*(?:млн\.?|mln\.?|миллион(?:а|ов)?|million(?:s)?)\s+(\d{1,3})(?=$|[^\p{L}\p{N}_])/iu);
    if (splitMillion) {
      const millions = Number(splitMillion[1]);
      const thousands = Number(splitMillion[2]);
      const amount = millions * 1_000_000 + thousands * 1_000;
      if (amount >= 1_000_000 && amount <= 5_000_000_000) price = amount;
    }
  }

  // Uzbekistan uses compact `m/м` for million in sale ads. Do not put that
  // alias back into the generic multiplier vocabulary: it is accepted here
  // only with country plus sale/price/currency evidence, after structural
  // spans and phone numbers have already been removed.
  if (price == null) {
    const uzbekSingleMillion = parseUzbekSingleLetterMillion(priceText, { country, dealType });
    if (uzbekSingleMillion != null) {
      price = uzbekSingleMillion;
      currency = moneyCurrencyFromText(priceText, fallbackCurrency || '') || fallbackCurrency || 'UZS';
    }
  }

  const labelled = priceText.match(new RegExp(
    `${PRICE_KEYWORD}\\s*[:\\-–—]?\\s*(${MONEY_NUMBER_PATTERN})(?:\\s*(${SCALE_PATTERN})(?=$|[^\\p{L}\\p{N}_]))?`,
    'iu',
  ));
  if (price == null && labelled) {
    const baseAmount = parseNumericAmount(labelled[1]);
    // A common malformed Uzbek marketplace form is "450000 ming som". The
    // already-expanded amount is the intended 450,000; multiplying it by
    // another thousand would create a 450,000,000 false price. Keep normal
    // shorthand such as "450 ming" and "2500 ming" scaled.
    const ignoreRepeatedUzbekThousand = labelled[2]
      && /^(?:ming|минг)$/iu.test(labelled[2])
      && baseAmount != null
      && baseAmount >= 10_000;
    const amount = labelled[2] && !ignoreRepeatedUzbekThousand
      ? parseScaledAmount(labelled[1], labelled[2])
      : baseAmount;
    if (amount != null && amount >= 50 && amount <= 5_000_000_000) price = Math.round(amount);
  }

  if (price == null) {
    let tagged = null;
    // 'u' is required for the \p{L}/\p{N} boundary escapes to work as
    // Unicode property classes — without it they silently match nothing,
    // which had made the boundary guard a no-op.
    // Source ads sometimes insert a stray period before the currency symbol:
    // "500.$". Treat that punctuation as a separator, not as part of the
    // numeric amount.
    const reNumSym = new RegExp(`(${MONEY_NUMBER_PATTERN})\\s*[.]?\\s*${PRICE_CURRENCY_AFTER_NUMBER}`, 'igu');
    const reSymNum = new RegExp(`${PRICE_CURRENCY_BEFORE_NUMBER}\\s*(${MONEY_NUMBER_PATTERN})`, 'igu');
    for (const regex of [reNumSym, reSymNum]) {
      let match;
      while ((match = regex.exec(priceText)) !== null) {
        if (isPaymentScopedAmount(priceText, match.index ?? 0, regex.lastIndex)) continue;
        const amount = parseNumericAmount(match[1]);
        if (amount != null && amount >= 50 && amount <= 5_000_000_000 && (tagged == null || amount > tagged)) tagged = amount;
      }
    }
    price = tagged;
  }

  if (price == null) {
    // Only unambiguous scale aliases participate in an unlabeled fallback.
    // Single-letter `m` is deliberately excluded above because in housing it
    // is overwhelmingly a metre/microdistrict token rather than a million.
    const match = priceText.match(new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(${SCALE_PATTERN})(?=$|[^\\p{L}\\p{N}_])`, 'iu'));
    if (match) {
      const amount = parseScaledAmount(match[1], match[2]);
      if (amount != null && amount >= 1000 && amount <= 5_000_000_000) price = Math.round(amount);
    }
  }

  if (price == null) {
    const bareAmountRe = /\d{1,3}(?:[ \u00A0.,]\d{3})+|\d{4,}/g;
    let best = null;
    for (const match of priceText.matchAll(bareAmountRe)) {
      const raw = match[0];
      const start = match.index ?? 0;
      if (isPaymentScopedAmount(priceText, start, start + raw.length)) continue;
      const digits = raw.replace(/[\s.,]/g, '');
      if (digits[0] === '0') continue;
      const amount = parseNumericAmount(raw);
      if (amount != null && amount >= 1000 && amount <= 5_000_000_000 && (best == null || amount > best)) best = amount;
    }
    price = best;
  }

  if (!explicit && fallbackCurrency === 'UZS' && price != null) {
    const dailyUzbek = /(?:kunlik|sutkaga|kecha[- ]?kunduz|посуточн|суточн)/i.test(priceText);
    currency = price >= 1_000_000 || (dailyUzbek && price >= 10_000) ? 'UZS' : 'USD';
  }

  return Object.freeze({ amount: price, currency, approximate: price != null && APPROXIMATE_RE.test(priceText) });
}

// Compatibility name for callers migrating from Flat Finder's local parser.
export const parsePriceFromText = parseHousingPrice;
