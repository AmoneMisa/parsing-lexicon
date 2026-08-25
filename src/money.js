import { aliasesOf, findCanonical, normalizeUnicode } from './normalization.js';
import {
  CURRENCY_TERMS,
  NUMBER_MULTIPLIERS,
  SALARY_MODIFIERS,
  SALARY_PERIODS,
} from './money-lexicon.js';
import {
  MONEY_RANGE_RE,
  MONEY_SINGLE_RE,
  moneyCurrencyFromText,
  parseScaledAmount,
} from './money-core.js';

export { CURRENCY_TERMS, NUMBER_MULTIPLIERS, SALARY_MODIFIERS, SALARY_PERIODS } from './money-lexicon.js';
export {
  MONEY_NUMBER_PATTERN,
  MONEY_RANGE_RE,
  MONEY_SCALE_PATTERN,
  MONEY_SINGLE_RE,
  moneyCurrencyFromText,
  moneyCurrencyPattern,
  moneyScaleMultiplier,
  parseNumericAmount,
  parseScaledAmount,
} from './money-core.js';

function hasSalaryContext(text) {
  return /(?:salary|зарплат|з\s*п\b|оплат|ставк|доход|оклад|компенсац|maosh|oylik|ish\s+haqi|жалақы|айлық|еңбекақы|salariu|оплата)/iu.test(text);
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

  const currency = moneyCurrencyFromText(text);
  const negotiable = hasModifier(text, 'negotiable');
  const gross = hasModifier(text, 'gross') ? true : hasModifier(text, 'net') ? false : null;
  const period = periodFromText(text);

  const salaryContext = hasSalaryContext(text)
    || Boolean(currency)
    || NUMBER_MULTIPLIERS.some((entry) => findCanonical(text, [entry], { partial: true }));
  if (!salaryContext && !negotiable) return null;

  const range = text.match(MONEY_RANGE_RE);
  let min = null;
  let max = null;
  const approximate = hasModifier(text, 'approx');

  if (range) {
    const firstScale = range[2] || range[4] || null;
    const secondScale = range[4] || range[2] || null;
    min = parseScaledAmount(range[1], firstScale);
    max = parseScaledAmount(range[3], secondScale);
    if (min != null && max != null && min > max) [min, max] = [max, min];
  } else {
    MONEY_SINGLE_RE.lastIndex = 0;
    const candidates = [];
    for (const match of text.matchAll(MONEY_SINGLE_RE)) {
      const start = match.index ?? 0;
      const end = start + match[0].length;
      const window = text.slice(Math.max(0, start - 24), Math.min(text.length, end + 32));
      const scaled = Boolean(match[2]);
      const relevant = scaled || moneyCurrencyFromText(window) || hasSalaryContext(window) || periodFromText(window);
      if (!relevant) continue;
      const parsed = parseScaledAmount(match[1], match[2]);
      if (parsed == null) continue;
      if (!scaled && !moneyCurrencyFromText(window) && parsed >= 1900 && parsed <= 2100 && !hasSalaryContext(window)) continue;
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
  return moneyCurrencyFromText(String(value || ''));
}

export function salaryPeriod(value) {
  return periodFromText(String(value || ''));
}

export function currencyAliases(code) {
  const entry = CURRENCY_TERMS.find((item) => item.canonical === code);
  return entry ? [entry.canonical, ...aliasesOf(entry)] : [];
}
