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
import {
  classifyHousingSingleMSpans,
  HOUSING_NUMERIC_SPAN_TYPES,
} from './housing-numeric-spans.js';

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

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// One-letter `m/м` is deliberately excluded from the generic multiplier set.
// Its meaning is resolved by housing-numeric-spans.js first, so area/distance/
// microdistrict notation cannot leak into money parsing while explicit price
// contexts can still use compact million shorthand.
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

function maskHousingStructuralSpans(text, context) {
  const strictMasked = maskPatternMatches(text, COMMON_HOUSING_STRUCTURE_PATTERNS);
  const nonMoneySpans = classifyHousingSingleMSpans(strictMasked, context)
    .filter((span) => span.type !== HOUSING_NUMERIC_SPAN_TYPES.MONEY);
  return maskRanges(strictMasked, nonMoneySpans);
}

function isPaymentScopedAmount(text, start, end) {
  const left = text
    .slice(Math.max(0, start - 56), start)
    .split(/[\r\n.;!?]/u)
    .pop() || '';
  const right = text
    .slice(end, Math.min(text.length, end + 28))
    .split(/[\r\n.;!?]/u)[0] || '';

  // Prefix payment labels bind to the amount on their right: "deposit 500$".
  if (findCanonical(left, PAYMENT_AMOUNT_TERMS, { partial: true })) return true;

  // A suffix label binds only when it appears before another numeric token.
  // This prevents the listing price in "6000грн+комуналка+6000(залог)" from
  // being suppressed merely because the later deposit keyword is nearby, while
  // still excluding direct suffix forms such as "500$ deposit".
  const nextDigit = right.search(/\d/u);
  const suffixScope = nextDigit === -1 ? right : right.slice(0, nextDigit);
  return !PRICE_KEYWORD_RE.test(left)
    && Boolean(findCanonical(suffixScope, PAYMENT_AMOUNT_TERMS, { partial: true }));
}

function parseContextualSingleLetterMillion(text, context) {
  for (const span of classifyHousingSingleMSpans(text, context)) {
    if (span.type !== HOUSING_NUMERIC_SPAN_TYPES.MONEY) continue;
    if (isPaymentScopedAmount(text, span.start, span.end)) continue;
    const amount = span.amount * 1_000_000;
    if (amount >= 1_000_000 && amount <= 5_000_000_000) return Math.round(amount);
  }
  return null;
}

function candidatePaymentRole(text, start, end) {
  if (isPaymentScopedAmount(text, start, end)) return 'depositOrCommission';
  const around = text.slice(Math.max(0, start - 48), Math.min(text.length, end + 48));
  if (/(?:коммун|utilities?|utility|per\s*(?:sqm|m2|м2)|\/\s*(?:sqm|m2|м2)|за\s*м[²2])/iu.test(around)) return 'nonListingPayment';
  if (/(?:new\s+price|now|yangi\s+narx)/iu.test(text.slice(Math.max(0, start - 28), start))) return 'currentPrice';
  if (/(?:old\s+price|was|from|стар(?:ая|ый)\s+цен[аы]?|\d+\s+dan)/iu.test(text.slice(Math.max(0, start - 20), start))) return 'oldPrice';
  if (/(?:tushirilgan|tushdi|reduced|new\s+price|now)/iu.test(text.slice(end, end + 32))) return 'currentPrice';
  return 'listing';
}

/**
 * Extract monetary spans without deciding which one is the listing price.
 * The public parse result remains backward-compatible; this richer primitive
 * lets callers audit deterministic ranking evidence when needed.
 */
export function extractHousingMoneyCandidates(value, context = '') {
  const { country, currency: fallbackCurrency } = moneyParsingContext(context);
  const text = maskPhoneLikeSpans(String(value || ''), ' ', { country });
  const candidates = [];
  const seen = new Set();
  const addCandidate = ({ amount, currency, start, end, explicitCurrency, scale = null, priceKeyword = false, confidenceBoost = 0 }) => {
    if (amount == null || amount < 1 || amount > 5_000_000_000 || seen.has(`${start}:${end}`)) return;
    seen.add(`${start}:${end}`);
    candidates.push(Object.freeze({
      amount,
      currency,
      start,
      end,
      explicitCurrency,
      scale,
      priceKeyword,
      paymentRole: candidatePaymentRole(text, start, end),
      approximate: APPROXIMATE_RE.test(text.slice(Math.max(0, start - 12), end)),
      confidenceBoost,
      confidence: 0,
    }));
  };

  // Keep regional numeric conventions in the same candidate model as ordinary
  // currency amounts.  In particular, `2500.000 sum` is a grouped Uzbek
  // amount, while `2 million 500` is a single split-million amount rather
  // than two competing prices.  These must be extracted before the shorter
  // generic currency/scale candidates below.
  const expandedUzbekThousandsRe = new RegExp(
    `${PRICE_KEYWORD}[^\\d\\r\\n]{0,16}(\\d{4})[.]000\\s*(?:с[ўу]м|so['‘’ʻʼ]?m|som|sum|uzs)(?=$|[^\\p{L}\\p{N}_])`,
    'igu',
  );
  for (const match of text.matchAll(expandedUzbekThousandsRe)) {
    const start = match.index ?? 0;
    addCandidate({
      amount: Number(match[1]) * 1000,
      currency: 'UZS',
      start,
      end: start + match[0].length,
      explicitCurrency: true,
      priceKeyword: true,
      confidenceBoost: 0.1,
    });
  }

  const splitMillionRe = /(?:^|[^\p{L}\p{N}_])(\d{1,3})\s*(?:млн\.?|mln\.?|миллион(?:а|ов)?|million(?:s)?)\s+(\d{1,3})(?=$|[^\p{L}\p{N}_])/giu;
  for (const match of text.matchAll(splitMillionRe)) {
    const start = match.index ?? 0;
    const numberOffset = match[0].search(/\d/u);
    const candidateStart = start + Math.max(0, numberOffset);
    const before = text.slice(Math.max(0, candidateStart - 42), candidateStart);
    addCandidate({
      amount: Number(match[1]) * 1_000_000 + Number(match[2]) * 1000,
      currency: moneyCurrencyFromText(match[0], fallbackCurrency || '') || fallbackCurrency || '',
      start: candidateStart,
      end: start + match[0].length,
      explicitCurrency: Boolean(moneyCurrencyFromText(match[0], '')),
      scale: 'million',
      priceKeyword: PRICE_KEYWORD_RE.test(before),
      confidenceBoost: 0.1,
    });
  }

  // A labelled scale is an explicit monetary signal even without a currency
  // glyph. In Uzbek listing prose, "narxi 850 ming" conventionally means
  // 850,000 UZS; retaining `scale` prevents a later generic fallback from
  // mistaking the base number for USD.
  const labelledScaleRe = new RegExp(
    `${PRICE_KEYWORD}\\s*[:=\\-–—]?\\s*(${MONEY_NUMBER_PATTERN})\\s*(${SCALE_PATTERN})(?=$|[^\\p{L}\\p{N}_])`,
    'igu',
  );
  for (const match of text.matchAll(labelledScaleRe)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    const scale = match[2];
    const baseAmount = parseNumericAmount(match[1]);
    // A malformed but common marketplace form is `450000 ming som`: the
    // number is already expanded, so applying `ming` a second time would
    // produce a 450,000,000 false price.
    const ignoreRepeatedUzbekThousand = /^(?:ming|минг)$/iu.test(scale)
      && baseAmount != null
      && baseAmount >= 10_000;
    const amount = ignoreRepeatedUzbekThousand ? baseAmount : parsedMoneyAmount(match[1], scale);
    const currency = moneyCurrencyFromText(match[0], '')
      || (country === 'UZ' && /^(?:ming|минг)$/iu.test(scale) ? 'UZS' : fallbackCurrency || '');
    addCandidate({
      amount,
      currency,
      start,
      end,
      explicitCurrency: Boolean(moneyCurrencyFromText(match[0], '')),
      scale,
      priceKeyword: true,
    });
  }

  for (const regex of [
    new RegExp(`(${MONEY_NUMBER_PATTERN})\\s*[.]?\\s*${PRICE_CURRENCY_AFTER_NUMBER}`, 'igu'),
    new RegExp(`${PRICE_CURRENCY_BEFORE_NUMBER}\\s*(${MONEY_NUMBER_PATTERN})`, 'igu'),
  ]) {
    for (const match of text.matchAll(regex)) {
      const amount = parseNumericAmount(match[1]);
      const start = match.index ?? 0; const end = start + match[0].length;
      const before = text.slice(Math.max(0, start - 42), start);
      addCandidate({
        amount,
        currency: moneyCurrencyFromText(match[0], fallbackCurrency || '') || fallbackCurrency || '',
        start,
        end,
        explicitCurrency: true,
        priceKeyword: PRICE_KEYWORD_RE.test(before),
      });
    }
  }
  return Object.freeze(candidates);
}

/** Rank candidate semantics; this intentionally never uses amount magnitude. */
export function rankHousingPriceCandidates(candidates) {
  return Object.freeze([...candidates].map((candidate) => {
    let confidence = candidate.explicitCurrency ? 0.6 : 0.3;
    if (candidate.priceKeyword) confidence += 0.2;
    if (candidate.scale) confidence += 0.15;
    if (candidate.paymentRole === 'currentPrice') confidence += 0.25;
    if (candidate.paymentRole === 'oldPrice') confidence -= 0.35;
    if (candidate.paymentRole === 'depositOrCommission' || candidate.paymentRole === 'nonListingPayment') confidence -= 0.7;
    confidence += candidate.confidenceBoost || 0;
    return Object.freeze({ ...candidate, confidence: Math.max(0, Math.min(1, Number(confidence.toFixed(2)))) });
  }).sort((a, b) => b.confidence - a.confidence || b.start - a.start));
}

export function parseHousingPricePerSqm(value, context = '') {
  const { country, currency: fallbackCurrency } = moneyParsingContext(context);
  const original = String(value || '');
  if (!original) return Object.freeze({ amount: null, currency: fallbackCurrency || '', approximate: false });

  const text = maskPhoneLikeSpans(original, ' ', { country });
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
  const text = maskPhoneLikeSpans(original, ' ', { country });
  // Unit prices are not listing totals. Mask their exact spans first. Then the
  // shared numeric-span classifier masks all N m/Nм spans that resolve to area,
  // distance, microdistrict or unknown; only positively classified money spans
  // remain visible to the price parser.
  const withoutUnitPrices = maskRanges(text, perSquareMeterMatches(text, fallbackCurrency));
  const numericContext = { country, dealType };
  const priceText = maskHousingStructuralSpans(withoutUnitPrices, numericContext);
  const rankedCandidates = rankHousingPriceCandidates(extractHousingMoneyCandidates(priceText, { country, currency: fallbackCurrency, dealType }));
  const preferredCandidate = rankedCandidates[0];
  // Candidate ranking owns the ordinary explicit-price path. The specialised
  // regional formats below remain as deterministic fallbacks until each is
  // represented by a richer candidate extractor.
  if (preferredCandidate && preferredCandidate.confidence >= 0.65) {
    return Object.freeze({
      amount: preferredCandidate.amount,
      currency: preferredCandidate.currency || fallbackCurrency || '',
      approximate: preferredCandidate.approximate,
    });
  }
  let currency = moneyCurrencyFromText(priceText, fallbackCurrency || '')
    || moneyCurrencyFromText(text, fallbackCurrency || '')
    || '';
  const explicit = Boolean(findCanonical(priceText, CURRENCY_TERMS, { partial: true }));
  let price = null;

  // Price changes name both values, so textual order and the change verb are
  // evidence of role.  This runs before the legacy branches below; those
  // branches continue to cover specialised regional notations.
  const reduced = priceText.match(/(?:old\s+price|was|from|с\s*|стар(?:ая|ый)\s+цен[аы]?|\d+\s+dan)\s*(\d+(?:[.,]\d+)?)\s*(?:\$|usd)?\s*(?:to|now|ga|до|на|-|–|—|,)?\s*(\d+(?:[.,]\d+)?)\s*(?:\$|usd)?\s*(?:tush(?:di|irilgan)?|reduc(?:ed|tion)?|now|yangi\s+narx|new\s+price)/iu);
  if (reduced) {
    const amount = parseNumericAmount(reduced[2]);
    if (amount != null && amount >= 50) {
      price = amount;
      if (/\$|usd/iu.test(reduced[0])) currency = 'USD';
    }
  }

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

  // Single-letter million shorthand is accepted only when the numeric-span
  // classifier resolves the span as money. This supports explicit "price 2m"
  // / "2m USD" everywhere and bare compact "800m" only for Uzbek sale context.
  if (price == null) {
    const contextualMillion = parseContextualSingleLetterMillion(priceText, numericContext);
    if (contextualMillion != null) {
      price = contextualMillion;
      currency = moneyCurrencyFromText(priceText, fallbackCurrency || '') || fallbackCurrency || '';
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
    if (amount != null && amount >= 50 && amount <= 5_000_000_000) {
      price = Math.round(amount);
      // `ming` is an explicit Uzbek amount scale, not an unlabelled amount
      // awaiting the historical UZS/USD fallback heuristic.
      if (/^(?:ming|минг)$/iu.test(labelled[2] || '') && country === 'UZ') currency = 'UZS';
    }
  }

  if (price == null) {
    const tagged = [];
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
        if (amount == null || amount < 50 || amount > 5_000_000_000) continue;
        const start = match.index ?? 0;
        const end = regex.lastIndex;
        const around = priceText.slice(Math.max(0, start - 36), Math.min(priceText.length, end + 56));
        let score = 50;
        if (PRICE_KEYWORD_RE.test(around)) score += 40;
        if (/(?:tushirilgan|tushdi|reduced|new\s+price|now)/iu.test(priceText.slice(end, end + 32))) score += 80;
        // The amount before a stated replacement is the old price, even if it
        // is numerically larger than the current price.
        if (/(?:\$|usd)?\s*(?:\.\.\.|dan|from|was|old\s+price)[^\d]{0,16}\d+(?:[.,]\d+)?\s*(?:\$|usd)?\s*(?:tushirilgan|tushdi|reduced|now)/iu.test(priceText.slice(start, start + 90))) score -= 90;
        tagged.push({ amount, score, start });
      }
    }
    tagged.sort((a, b) => b.score - a.score || b.start - a.start || a.amount - b.amount);
    price = tagged[0]?.amount ?? null;
  }

  if (price == null) {
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

  const hasExplicitUzbekThousandScale = country === 'UZ' && /\b(?:ming|минг)\b/iu.test(priceText);
  if (!explicit && !hasExplicitUzbekThousandScale && fallbackCurrency === 'UZS' && price != null) {
    const dailyUzbek = /(?:kunlik|sutkaga|kecha[- ]?kunduz|посуточн|суточн)/i.test(priceText);
    currency = price >= 1_000_000 || (dailyUzbek && price >= 10_000) ? 'UZS' : 'USD';
  }

  return Object.freeze({ amount: price, currency, approximate: price != null && APPROXIMATE_RE.test(priceText) });
}

// Compatibility name for callers migrating from Flat Finder's local parser.
export const parsePriceFromText = parseHousingPrice;
