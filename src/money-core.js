import { aliasesOf, findCanonical } from './normalization.js';
import {
  CURRENCY_SYMBOL_CANDIDATES,
  CURRENCY_TERMS,
  NUMBER_MULTIPLIERS,
} from './money-lexicon.js';

// Monetary values in job descriptions commonly combine thousands grouping with
// decimals (e.g. 137,000.00 or 137.000,00). Keep the grouped variants ahead of
// the generic decimal form so a range parser consumes the complete endpoint.
export const MONEY_NUMBER_PATTERN = '(?:\\d{1,3}(?:[ \\u00a0]\\d{3})+(?:[.,]\\d+)?|\\d{1,3}(?:,\\d{3})+(?:\\.\\d+)?|\\d{1,3}(?:\\.\\d{3})+(?:,\\d+)?|\\d+(?:[.,]\\d+)?)';
export const MONEY_SCALE_PATTERN = 'k|к|тыс\\.?|тысяч(?:а|и)?|тис\\.?|thousand|ming|мың|m|м|млн\\.?|mln|million|миллион(?:ов)?|мільйон(?:ів)?|bn|млрд|mlrd|billion';
// Each scale group needs the token-boundary guard MONEY_SINGLE_RE already has
// below: without it, "2 до 3 месяцев" reads "м" off "месяцев" as the million
// abbreviation and turns 3 into 3,000,000. The boundary is nested inside the
// optional group (rather than placed after it) so a scale match that fails
// the boundary check simply falls back to "no scale" instead of failing the
// whole alternative — otherwise a no-space separator like "5до10" (no scale
// present at all) would stop matching, since "до" doesn't satisfy the
// boundary either.
export const MONEY_RANGE_RE = new RegExp(`(${MONEY_NUMBER_PATTERN})\\s*(?:(${MONEY_SCALE_PATTERN})(?=$|[^\\p{L}\\p{N}_]))?\\s*(?:-|–|—|до|to|bis|dan\\s+gacha)\\s*(${MONEY_NUMBER_PATTERN})\\s*(?:(${MONEY_SCALE_PATTERN})(?=$|[^\\p{L}\\p{N}_]))?`, 'iu');
export const MONEY_SINGLE_RE = new RegExp(`(${MONEY_NUMBER_PATTERN})\\s*(${MONEY_SCALE_PATTERN})?(?=$|[^\\p{L}\\p{N}_])`, 'giu');

export function parseNumericAmount(raw) {
  let value = String(raw || '').replace(/\u00a0/g, ' ').trim();
  if (!value) return null;

  // Spaces are unambiguous thousands separators in supported salary formats.
  value = value.replace(/\s+/g, '');

  const lastComma = value.lastIndexOf(',');
  const lastDot = value.lastIndexOf('.');
  if (lastComma >= 0 && lastDot >= 0) {
    // When both separators are present, the final separator is decimal and the
    // other one is grouping: 137,000.00 / 137.000,00.
    const decimal = lastComma > lastDot ? ',' : '.';
    const grouping = decimal === ',' ? /\./g : /,/g;
    value = value.replace(grouping, '');
    if (decimal === ',') value = value.replace(',', '.');
  } else {
    const separator = lastComma >= 0 ? ',' : lastDot >= 0 ? '.' : null;
    if (separator) {
      const escaped = separator === '.' ? '\\.' : ',';
      const groupingRe = new RegExp(`^\\d{1,3}(?:${escaped}\\d{3})+$`);
      if (groupingRe.test(value)) {
        value = value.split(separator).join('');
      } else if (separator === ',') {
        value = value.replace(',', '.');
      }
    }
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function moneyScaleMultiplier(raw) {
  if (!raw) return 1;
  return findCanonical(raw, NUMBER_MULTIPLIERS)?.multiplier || 1;
}

export function parseScaledAmount(raw, scale) {
  const value = parseNumericAmount(raw);
  return value == null ? null : value * moneyScaleMultiplier(scale);
}

function explicitCurrencyFromText(value) {
  const text = String(value || '');
  // Ambiguous glyphs are removed so they cannot hide an explicit ISO/name token.
  const lexicalText = text.replace(/[$¥￥]/g, ' ');
  return findCanonical(lexicalText, CURRENCY_TERMS, { partial: true })?.canonical || null;
}

export function moneyCurrencyCandidatesFromText(value) {
  const text = String(value || '');
  const candidates = [];
  const add = (currency) => {
    if (currency && !candidates.includes(currency)) candidates.push(currency);
  };

  add(explicitCurrencyFromText(text));

  for (const [symbol, currencies] of Object.entries(CURRENCY_SYMBOL_CANDIDATES)) {
    if (!text.includes(symbol)) continue;
    for (const currency of currencies) add(currency);
  }

  if (!candidates.length) {
    add(findCanonical(text, CURRENCY_TERMS, { partial: true })?.canonical);
  }

  return Object.freeze(candidates);
}

export function moneyCurrencyFromText(value, fallbackCurrency = null) {
  const explicit = explicitCurrencyFromText(value);
  if (explicit) return explicit;

  const candidates = moneyCurrencyCandidatesFromText(value);
  if (!candidates.length) return fallbackCurrency;
  const fallback = String(fallbackCurrency || '').trim().toUpperCase();
  if (fallback && candidates.includes(fallback)) return fallback;
  return candidates[0];
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function moneyCurrencyPattern() {
  return [...new Set(CURRENCY_TERMS.flatMap((entry) => [entry.canonical, ...aliasesOf(entry)]).filter(Boolean))]
    .sort((a, b) => String(b).length - String(a).length)
    .map(escapeRegex)
    .join('|');
}
