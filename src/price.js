import { aliasesOf, findCanonical } from './normalization.js';
import { CURRENCY_TERMS, NUMBER_MULTIPLIERS } from './money.js';
import { maskPhoneLikeSpans } from './contact.js';

const PRICE_NUM = '\\d{1,3}(?:[ \\u00A0.,]\\d{3})+|\\d+';
const PRICE_KEYWORD = '(?:цена|ціна|нарх(?:и)?|narx|price|стоимост[ьи]|аренд(?:а|ная\\s+плата)?|rent)';

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function currencyPattern() {
  const aliases = CURRENCY_TERMS.flatMap((entry) => [entry.canonical, ...aliasesOf(entry)]).filter(Boolean);
  return [...new Set(aliases)]
    .sort((a, b) => String(b).length - String(a).length)
    .map(escapeRegex)
    .join('|');
}

const PRICE_CURRENCY = `(?:${currencyPattern()})`;

function numeric(raw) {
  return Number(String(raw || '').replace(/[\s.,]/g, ''));
}

function currencyFromText(text, fallbackCurrency = '') {
  return findCanonical(text, CURRENCY_TERMS, { partial: true })?.canonical || fallbackCurrency || '';
}

function multiplierFromText(raw) {
  const entry = findCanonical(raw, NUMBER_MULTIPLIERS);
  return entry?.multiplier || 1;
}

export function parsePriceFromText(value, fallbackCurrency = '') {
  const original = String(value || '');
  if (!original) return Object.freeze({ price: null, currency: fallbackCurrency || '' });

  // Contact numbers are classified before any numeric extraction, so they are
  // unavailable to every price branch rather than just the last-resort fallback.
  const text = maskPhoneLikeSpans(original);
  let currency = currencyFromText(text, fallbackCurrency);
  const explicit = Boolean(findCanonical(text, CURRENCY_TERMS, { partial: true }));
  let price = null;

  const labelled = text.match(new RegExp(`${PRICE_KEYWORD}\\s*[:\\-–—]?\\s*(${PRICE_NUM})`, 'i'));
  if (labelled) {
    const n = numeric(labelled[1]);
    if (n >= 50 && n <= 5_000_000_000) price = n;
  }

  if (price == null) {
    let tagged = null;
    const reNumSym = new RegExp(`(${PRICE_NUM})\\s*${PRICE_CURRENCY}`, 'ig');
    const reSymNum = new RegExp(`${PRICE_CURRENCY}\\s*(${PRICE_NUM})`, 'ig');
    for (const re of [reNumSym, reSymNum]) {
      let match;
      while ((match = re.exec(text)) !== null) {
        const n = numeric(match[1]);
        if (n >= 50 && n <= 5_000_000_000 && (tagged == null || n > tagged)) tagged = n;
      }
    }
    price = tagged;
  }

  if (price == null) {
    const scaleAliases = NUMBER_MULTIPLIERS.flatMap((entry) => aliasesOf(entry)).filter(Boolean);
    const scalePattern = [...new Set(scaleAliases)]
      .sort((a, b) => String(b).length - String(a).length)
      .map(escapeRegex)
      .join('|');
    const match = text.match(new RegExp(`(\\d+(?:[.,]\\d+)?)\\s*(${scalePattern})`, 'i'));
    if (match) {
      const base = Number(match[1].replace(',', '.'));
      const n = Math.round(base * multiplierFromText(match[2]));
      if (n >= 1000 && n <= 5_000_000_000) price = n;
    }
  }

  if (price == null) {
    const matches = text.match(/\d{1,3}(?:[ \u00A0.,]\d{3})+|\d{4,}/g) || [];
    let best = null;
    for (const raw of matches) {
      const digits = raw.replace(/[\s.,]/g, '');
      if (digits[0] === '0') continue;
      const n = Number(digits);
      if (n >= 1000 && n <= 5_000_000_000 && (best == null || n > best)) best = n;
    }
    price = best;
  }

  if (!explicit && fallbackCurrency === 'UZS' && price != null) {
    const dailyUzbek = /(?:kunlik|sutkaga|kecha[- ]?kunduz|посуточн|суточн)/i.test(text);
    currency = price >= 1_000_000 || (dailyUzbek && price >= 10_000) ? 'UZS' : 'USD';
  }

  return Object.freeze({ price, currency });
}
