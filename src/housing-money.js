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

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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
    if (amount != null && amount >= 1 && amount <= 5_000_000) {
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
    if (amount >= 1_000_000 && amount <= 5_000_000_000) {
      price = amount;
      currency = 'UZS';
    }
  }

  const labelled = text.match(new RegExp(`${PRICE_KEYWORD}\\s*[:\\-–—]?\\s*(${MONEY_NUMBER_PATTERN})`, 'i'));
  if (price == null && labelled) {
    const amount = parseNumericAmount(labelled[1]);
    if (amount != null && amount >= 50 && amount <= 5_000_000_000) price = amount;
  }

  if (price == null) {
    let tagged = null;
    // 'u' is required for the \p{L}/\p{N} boundary escapes to work as
    // Unicode property classes — without it they silently match nothing,
    // which had made the boundary guard a no-op.
    const reNumSym = new RegExp(`(${MONEY_NUMBER_PATTERN})\\s*${PRICE_CURRENCY_AFTER_NUMBER}`, 'igu');
    const reSymNum = new RegExp(`${PRICE_CURRENCY_BEFORE_NUMBER}\\s*(${MONEY_NUMBER_PATTERN})`, 'igu');
    for (const regex of [reNumSym, reSymNum]) {
      let match;
      while ((match = regex.exec(text)) !== null) {
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
      if (amount >= 1_000_000 && amount <= 5_000_000_000) price = amount;
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
      if (amount != null && amount >= 1000 && amount <= 5_000_000_000) price = Math.round(amount);
    }
  }

  if (price == null) {
    const matches = text.match(/\d{1,3}(?:[ \u00A0.,]\d{3})+|\d{4,}/g) || [];
    let best = null;
    for (const raw of matches) {
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
