import { findPhoneLikeSpans } from './contact.js';
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

const CONTACT_MARKER_RE = /(?:телефон|тел\.?|phone|mobile|mob\.?|whatsapp|viber|telegram|контакт|contact|aloqa|murojaat|bog(?:['’ʻʼ‘`])?lanish)\s*[:：—-]?\s*$/iu;
const JOBS_I18N_PERIOD_RE = /\bjobs\.per(hour|day|shift|week|month|year|project|piece)\b/iu;

function hasSalaryContext(text) {
  return /(?:salary|зарплат|з\s*п\b|оплат|ставк|доход|оклад|компенсац|maosh|oylik|ish\s+haqi|жалақы|айлық|еңбекақы|salariu|оплата)/iu.test(text);
}

function periodFromText(text) {
  // Some vacancy sources leak untranslated i18n keys into salary strings,
  // e.g. "$208K/jobs.perWeek". Treat those markers as first-class periods
  // instead of letting consumers fall back to an incorrect monthly salary.
  const jobsMarker = String(text || '').match(JOBS_I18N_PERIOD_RE);
  if (jobsMarker?.[1]) return jobsMarker[1].toLowerCase();
  return findCanonical(text, SALARY_PERIODS, { partial: true })?.canonical || null;
}

function hasModifier(text, key) {
  return Boolean(findCanonical(text, [SALARY_MODIFIERS[key]], { partial: true }));
}

function protectedPhoneSpans(text) {
  return findPhoneLikeSpans(text).filter((span) => {
    const prefix = text.slice(Math.max(0, span.start - 32), span.start);
    return CONTACT_MARKER_RE.test(prefix);
  });
}

function overlapsProtectedPhone(start, end, spans) {
  return spans.some((span) => start < span.end && end > span.start);
}

function moneyContextScore(text, start, end, scaled = false) {
  const window = text.slice(Math.max(0, start - 36), Math.min(text.length, end + 40));
  let score = 0;
  if (moneyCurrencyFromText(window)) score += 5;
  if (hasSalaryContext(window)) score += 4;
  if (periodFromText(window)) score += 2;
  if (scaled) score += 1;
  return score;
}

function bestRange(text, protectedSpans) {
  const ranges = new RegExp(MONEY_RANGE_RE.source, 'giu');
  const candidates = [];
  for (const match of text.matchAll(ranges)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (overlapsProtectedPhone(start, end, protectedSpans)) continue;
    const scaled = Boolean(match[2] || match[4]);
    const score = moneyContextScore(text, start, end, scaled);
    if (score <= 0) continue;
    candidates.push({ match, score, start });
  }
  candidates.sort((a, b) => b.score - a.score || a.start - b.start);
  return candidates[0]?.match || null;
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

  const protectedSpans = protectedPhoneSpans(text);
  const range = bestRange(text, protectedSpans);
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
      if (overlapsProtectedPhone(start, end, protectedSpans)) continue;
      const window = text.slice(Math.max(0, start - 24), Math.min(text.length, end + 32));
      const scaled = Boolean(match[2]);
      const score = moneyContextScore(text, start, end, scaled);
      if (score <= 0) continue;
      const parsed = parseScaledAmount(match[1], match[2]);
      if (parsed == null) continue;
      if (!scaled && !moneyCurrencyFromText(window) && parsed >= 1900 && parsed <= 2100 && !hasSalaryContext(window)) continue;
      candidates.push({ value: parsed, score, start });
    }
    candidates.sort((a, b) => b.score - a.score || a.start - b.start);
    if (candidates.length) {
      const valueAmount = candidates[0].value;
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
