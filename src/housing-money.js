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
const UNIT_PRICE_SUFFIX_RE = /^\s*(?:\/\s*|(?:за|на|per)\s+(?:1\s*)?)(?:m2|m²|м2|м²|кв\.?\s*м(?:2|²)?|квадратн(?:ый|ого)?\s+метр(?:а|ов)?|sqm)(?![\p{L}\p{N}_])/iu;

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

function isUnitPriceScopedAmount(text, end) {
  const right = text.slice(end, Math.min(text.length, end + 40));
  return UNIT_PRICE_SUFFIX_RE.test(right);
}

const APPROXIMATE_RE = /около|примерно|~|≈/iu;

export function parseHousingPrice(value, fallbackCurrency = '') {
  const original = String(value || '');
  if (!original) return Object.freeze({ amount: null, currency: fallbackCurrency || '', approximate: false });

  // Contact spans are removed once, before every money branch. A phone can
  // therefore never win as a labelled, currency-tagged or fallback amount.
  const text = maskPhoneLikeSpans(original);
  let currency = moneyCurrencyFromText(text, fallbackCurrency || '') || '';
  const explicit = Boolean(findCanonical(text, CURRENCY_TERMS, { partial: true }));
  let price = null;

  // Common Ukrainian/Russian classifieds shorthand: "10 т грн" / "10 т гр".
  // Keep this housing-specific instead of adding globally ambiguous aliases
  // `т` (tonne) and `гр` (gram) to the shared money lexicon. A nearby price
  // keyword plus an explicit hryvnia shorthand makes the intent unambiguous.
  const compactThousandUah = text.match(new RegExp(
    `${PRICE_KEYWORD}[^\\r\\n]{0,48}?(\\d{1,6}(?:[.,]\\d{1,2})?)\\s*т(?:ыс\\.?)?\\s*(?:гр(?:н)?|₴|uah)(?=$|[^\\p{L}\\p{N}_])`,
    'iu',
  ));
  if (compactThousandUah) {
    const amount = parseNumericAmount(compactThousandUah[1]);
    const end = (compactThousandUah.index ?? 0) + compactThousandUah[0].length;
    if (amount != null && amount >= 1 && amount <= 5_000_000 && !isUnitPriceScopedAmount(text, end)) {
      price = Math.round(amount * 1000);
      currency = 'UAH';
    }
  }

  // Uzbek ads also use a dot as a thousands separator after four leading
  // digits: "2500.000 сум" means 2,500,000 UZS, not 2,500 UZS.
  const expandedUzbekThousands = text.match(new RegExp(
    `${PRICE_KEYWORD}[^\\d\\r\\n]{0,16}(\\d{4})[.]000\\s*(?:с[ўу]м|so['‘’ʻʼ]?m|som|sum|uzs)(?=$|[^\\p{L}\\p{N}_])`,
    'iu',
  ));
  if (price == null && expandedUzbekThousands) {
    const amount = Number(expandedUzbekThousands[1]) * 1000;
    const end = (expandedUzbekThousands.index ?? 0) + expandedUzbekThousands[0].length;
    if (amount >= 1_000_000 && amount <= 5_000_000_000 && !isUnitPriceScopedAmount(text, end)) {
      price = amount;
      currency = 'UZS';
    }
  }

  const labelled = text.match(new RegExp(`${PRICE_KEYWORD}\\s*[:\\-–—]?\\s*(${MONEY_NUMBER_PATTERN})`, 'i'));
  if (price == null && labelled) {
    const amount = parseNumericAmount(labelled[1]);
    const end = (labelled.index ?? 0) + labelled[0].length;
    if (amount != null && amount >= 50 && amount <= 5_000_000_000 && !isUnitPriceScopedAmount(text, end)) price = amount;
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
      while ((match = regex.exec(text)) !== null) {
        if (isPaymentScopedAmount(text, match.index ?? 0, regex.lastIndex)) continue;
        if (isUnitPriceScopedAmount(text, regex.lastIndex)) continue;
        const amount = parseNumericAmount(match[1]);
        if (amount != null && amount >= 50 && amount <= 5_000_000_000 && (tagged == null || amount > tagged)) tagged = amount;
      }
    }
    price = tagged;
  }

  // Uzbek classifieds often split a round million and the trailing thousands:
  // "2 млн 500" / "2 миллион 500" means 2,500,000, not 2,000,000 plus an unrelated 500.
  if (price == null) {
    const splitMillion = text.match(/(?:^|[^\p{L}\p{N}_])(\d{1,3})\s*(?:млн\.?|mln\.?|миллион(?:а|ов)?|million(?:s)?)\s+(\d{1,3})(?=$|[^\p{L}\p{N}_])/iu);
    if (splitMillion) {
      const millions = Number(splitMillion[1]);
      const thousands = Number(splitMillion[2]);
      const amount = millions * 1_000_000 + thousands * 1_000;
      const end = (splitMillion.index ?? 0) + splitMillion[0].length;
      if (amount >= 1_000_000 && amount <= 5_000_000_000 && !isUnitPriceScopedAmount(text, end)) price = amount;
    }
  }

  if (price == null) {
    const scalePattern = [...new Set(NUMBER_MULTIPLIERS.flatMap((entry) => aliasesOf(entry)).filter(Boolean))]
      .sort((a, b) => String(b).length - String(a).length)
      .map(escapeRegex)
      .join('|');
    // Multiplier aliases include useful one-letter forms such as `m` and `k`.
    // Require the alias to end at a token boundary so measurements/words like
    // `500 m2` and `5 minut` cannot be promoted to 500 million / 5 million.
    const match = text.match(new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(${scalePattern})(?=$|[^\\p{L}\\p{N}_])`, 'iu'));
    if (match) {
      const amount = parseScaledAmount(match[1], match[2]);
      const end = (match.index ?? 0) + match[0].length;
      if (amount != null && amount >= 1000 && amount <= 5_000_000_000 && !isUnitPriceScopedAmount(text, end)) price = Math.round(amount);
    }
  }

  if (price == null) {
    const bareAmountRe = /\d{1,3}(?:[ \u00A0.,]\d{3})+|\d{4,}/g;
    let best = null;
    for (const match of text.matchAll(bareAmountRe)) {
      const raw = match[0];
      const start = match.index ?? 0;
      const end = start + raw.length;
      if (isPaymentScopedAmount(text, start, end)) continue;
      if (isUnitPriceScopedAmount(text, end)) continue;
      const digits = raw.replace(/[\s.,]/g, '');
      if (digits[0] === '0') continue;
      const amount = parseNumericAmount(raw);
      if (amount != null && amount >= 1000 && amount <= 5_000_000_000 && (best == null || amount > best)) best = amount;
    }
    price = best;
  }

  if (!explicit && fallbackCurrency === 'UZS' && price != null) {
    const dailyUzbek = /(?:kunlik|sutkaga|kecha[- ]?kunduz|посуточн|суточн)/i.test(text);
    currency = price >= 1_000_000 || (dailyUzbek && price >= 10_000) ? 'UZS' : 'USD';
  }

  return Object.freeze({ amount: price, currency, approximate: price != null && APPROXIMATE_RE.test(text) });
}

// Compatibility name for callers migrating from Flat Finder's local parser.
export const parsePriceFromText = parseHousingPrice;
