import { aliasesOf, findCanonical } from './normalization.js';
import {
  CURRENCY_SYMBOL_CANDIDATES,
  CURRENCY_TERMS,
  NUMBER_MULTIPLIERS,
} from './money-lexicon.js';

export const MONEY_NUMBER_PATTERN = '\\d{1,3}(?:[ \\u00a0.,]\\d{3})+|\\d+(?:[.,]\\d+)?';
export const MONEY_SCALE_PATTERN = 'k|к|тыс\\.?|тысяч(?:а|и)?|тис\\.?|thousand|ming|мың|m|м|млн\\.?|mln|million|миллион(?:ов)?|мільйон(?:ів)?|bn|млрд|mlrd|billion';
export const MONEY_RANGE_RE = new RegExp(`(${MONEY_NUMBER_PATTERN})\\s*(${MONEY_SCALE_PATTERN})?\\s*(?:-|–|—|до|to|bis|dan\\s+gacha)\\s*(${MONEY_NUMBER_PATTERN})\\s*(${MONEY_SCALE_PATTERN})?`, 'iu');
export const MONEY_SINGLE_RE = new RegExp(`(${MONEY_NUMBER_PATTERN})\\s*(${MONEY_SCALE_PATTERN})?`, 'giu');

export function parseNumericAmount(raw) {
  let value = String(raw || '').replace(/\u00a0/g, ' ').trim();
  if (!value) return null;
  const grouped = /\d[ ,. ]\d{3}(?:[ ,. ]\d{3})*/.test(value);
  if (grouped) value = value.replace(/[ ,.]/g, '');
  else value = value.replace(/\s+/g, '').replace(',', '.');
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
