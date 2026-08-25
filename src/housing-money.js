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

const PRICE_KEYWORD = '(?:цена|ціна|нарх(?:и)?|narx|price|стоимост[ьи]|аренд(?:а|ная\\s+плата)?|rent)';
const PRICE_CURRENCY = `(?:${moneyCurrencyPattern()})`;

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function parseHousingPrice(value, fallbackCurrency = '') {
  const original = String(value || '');
  if (!original) return Object.freeze({ price: null, currency: fallbackCurrency || '' });

  // Contact spans are removed once, before every money branch. A phone can
  // therefore never win as a labelled, currency-tagged or fallback amount.
  const text = maskPhoneLikeSpans(original);
  let currency = moneyCurrencyFromText(text, fallbackCurrency || '') || '';
  const explicit = Boolean(findCanonical(text, CURRENCY_TERMS, { partial: true }));
  let price = null;

  const labelled = text.match(new RegExp(`${PRICE_KEYWORD}\\s*[:\\-–—]?\\s*(${MONEY_NUMBER_PATTERN})`, 'i'));
  if (labelled) {
    const amount = parseNumericAmount(labelled[1]);
    if (amount != null && amount >= 50 && amount <= 5_000_000_000) price = amount;
  }

  if (price == null) {
    let tagged = null;
    const reNumSym = new RegExp(`(${MONEY_NUMBER_PATTERN})\\s*${PRICE_CURRENCY}`, 'ig');
    const reSymNum = new RegExp(`${PRICE_CURRENCY}\\s*(${MONEY_NUMBER_PATTERN})`, 'ig');
    for (const regex of [reNumSym, reSymNum]) {
      let match;
      while ((match = regex.exec(text)) !== null) {
        const amount = parseNumericAmount(match[1]);
        if (amount != null && amount >= 50 && amount <= 5_000_000_000 && (tagged == null || amount > tagged)) tagged = amount;
      }
    }
    price = tagged;
  }

  if (price == null) {
    const scalePattern = [...new Set(NUMBER_MULTIPLIERS.flatMap((entry) => aliasesOf(entry)).filter(Boolean))]
      .sort((a, b) => String(b).length - String(a).length)
      .map(escapeRegex)
      .join('|');
    const match = text.match(new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(${scalePattern})`, 'i'));
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

  return Object.freeze({ price, currency });
}

// Compatibility name for callers migrating from Flat Finder's local parser.
export const parsePriceFromText = parseHousingPrice;
