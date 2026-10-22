import { findPhoneLikeSpans, parsePhoneNumbers } from './contact.js';
import { aliasesOf, findCanonical, normalizeUnicode } from './normalization.js';
import {
  CURRENCY_SYMBOL_CANDIDATES,
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
  moneyMentionPattern,
  moneyScaleMultiplier,
  parseNumericAmount,
  parseScaledAmount,
} from './money-core.js';

// A leading boundary keeps "тел"/"phone" etc. from matching as a suffix of an
// unrelated word ("хостел", "котел", "telegraph"), which would wrongly mark a
// following phone-like number as a protected contact span.
const CONTACT_MARKER_RE = /(?<![\p{L}\p{N}_])(?:телефон|тел\.?|phone|mobile|mob\.?|whatsapp|viber|telegram|контакт|contact|aloqa|murojaat|bog(?:['’ʻʼ‘`])?lanish)\s*[:：—-]?\s*$/iu;
const JOBS_I18N_PERIOD_RE = /\bjobs\.per(hour|day|shift|week|month|year|project|piece)\b/iu;
const TIME_RANGE_RE = /(?<!\d)(?:[01]?\d|2[0-3])[:.][0-5]\d\s*(?:[-–—]\s*(?:[01]?\d|2[0-3])[:.][0-5]\d)?(?!\d)/gu;
const WORK_RATIO_RE = /(?<!\d)[1-7]\s*\/\s*[1-7](?!\d)/gu;

function hasSalaryContext(text) {
  return /(?:salary|зарплат|заработ\p{L}*\s+плат|з\s*[\/\\.\-]?\s*п(?=$|[^\p{L}\p{N}_])|оплат|ставк|доход|оклад|компенсац|maosh|oylik|ish\s+haqi|жалақы|айлық|еңбекақы|salariu|💵|💰)/iu.test(text);
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
    if (CONTACT_MARKER_RE.test(prefix)) return true;
    // A label-less international number ("998 953 506 090", typically scraped
    // into a pay field) is a contact, not a 12-digit salary. Require a valid
    // E.164 number of 11+ digits so ordinary grouped salaries stay money.
    // A "998 95… - 998 95…" pair is merged into one span, so test each part.
    return span.raw.split(/\s*[-–—]\s*/u).some((part) => {
      const digits = part.replace(/\D/g, '');
      return digits.length >= 11 && parsePhoneNumbers(`+${digits}`).length > 0;
    });
  });
}

function regexSpans(text, pattern) {
  const spans = [];
  pattern.lastIndex = 0;
  for (const match of text.matchAll(pattern)) {
    const start = match.index ?? 0;
    spans.push({ start, end: start + match[0].length });
  }
  pattern.lastIndex = 0;
  return spans;
}

// Candidate cards put the amount next to age, work history and update dates:
// "45 лет • Обновлено 26 августа", "1 год стажа", "32 года 11 месяцев", "07.10.2026".
// None of those numbers is money, whatever currency sign sits on a neighbouring line.
const NON_MONEY_UNIT = String.raw`(?:лет|года|год|г\.|роки|рік|років|yosh(?:da)?|yo['’ʻʼ]?sh|years?|yrs?|y\.o\.|месяц\p{L}*|мес\.?|місяц\p{L}*|oy(?:lik)?|months?|класс\p{L}*|клас\p{L}*|мест[оа]?\s+работы|места\s+работы)`;
const AGE_OR_TENURE_RE = new RegExp(String.raw`(?<![\p{L}\p{N}.,])\d{1,2}(?:[.,]\d)?\s*${NON_MONEY_UNIT}(?![\p{L}\p{N}_])`, 'giu');
const DAY_MONTH_RE = /(?<![\p{L}\p{N}.,])\d{1,2}\s+(?:янв|фев|мар|апр|ма[йя]|июн|июл|авг|сен|окт|ноя|дек|січ|лют|бер|кві|тра|чер|лип|сер|вер|жов|лис|гру|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec|yanvar|fevral|mart|aprel|iyun|iyul|avgust|sentyabr|oktyabr|noyabr|dekabr)\p{L}*/giu;
const NUMERIC_DATE_RE = /(?<![\d.])\d{1,2}[./]\d{1,2}[./](?:\d{4}|\d{2})(?![\d])/gu;

function protectedNonMoneySpans(text) {
  return [
    ...regexSpans(text, AGE_OR_TENURE_RE),
    ...regexSpans(text, DAY_MONTH_RE),
    ...regexSpans(text, NUMERIC_DATE_RE),
    ...protectedPhoneSpans(text),
    ...regexSpans(text, TIME_RANGE_RE),
    ...regexSpans(text, WORK_RATIO_RE),
  ];
}

function overlapsProtectedSpan(start, end, spans) {
  return spans.some((span) => start < span.end && end > span.start);
}

function moneyContextScore(text, start, end, scaled = false) {
  // The evidence has to be on the amount's own line: a "$" two lines further down
  // belongs to another field of the card, not to this number.
  const lineStart = text.lastIndexOf('\n', start - 1) + 1;
  const lineEndAt = text.indexOf('\n', end);
  const lineEnd = lineEndAt === -1 ? text.length : lineEndAt;
  const window = text.slice(Math.max(lineStart, start - 36), Math.min(lineEnd, end + 40));
  let score = 0;
  if (moneyCurrencyFromText(window)) score += 5;
  if (hasSalaryContext(window)) score += 4;
  if (periodFromText(window)) score += 2;
  if (scaled) score += 1;
  return score;
}

function rangeSearchText(text) {
  // MONEY_RANGE_RE intentionally parses numeric structure only. Currency symbols
  // may legally repeat around both endpoints ("$55 — $65"); blank them with
  // equal-length whitespace so the range parser can see the numbers while all
  // original indices still line up with contact/time protection and scoring.
  let normalized = text;
  for (const symbol of Object.keys(CURRENCY_SYMBOL_CANDIDATES)) {
    normalized = normalized.split(symbol).join(' '.repeat(symbol.length));
  }
  // Some job boards render salary parts as separate UI tokens and join their
  // accessible text with middle dots: "2 500 · - 3 000 · €". Treat those
  // decorative separators as whitespace while preserving source offsets.
  normalized = normalized.replace(/[·•]/gu, ' ');
  return normalized;
}

function isWorkTimeRange(text, match, start, end) {
  if (CLOCK_RANGE_RE.test(match[0])) return true;

  const first = Number(String(match[1] || '').replace(',', '.'));
  const second = Number(String(match[3] || '').replace(',', '.'));
  if (!Number.isFinite(first) || !Number.isFinite(second) || first > 24 || second > 24) return false;

  // Bare 9-19 can be a schedule too. Reject it as money only when the nearby
  // context explicitly talks about working hours/schedule; a real salary such
  // as "$9-19/hour" still survives because it has pay/currency context and no
  // schedule marker.
  const window = text.slice(Math.max(0, start - 48), Math.min(text.length, end + 48));
  return WORK_TIME_CONTEXT_RE.test(window);
}

function bestRange(text, protectedSpans) {
  const ranges = new RegExp(MONEY_RANGE_RE.source, 'giu');
  const candidates = [];
  const searchable = rangeSearchText(text);
  for (const match of searchable.matchAll(ranges)) {
    const start = match.index ?? 0;
    const end = start + match[0].length;
    if (overlapsProtectedSpan(start, end, protectedSpans)) continue;
    const scaled = Boolean(match[2] || match[4]);
    const score = moneyContextScore(text, start, end, scaled);
    if (score <= 0) continue;
    candidates.push({ match, score, start });
  }
  candidates.sort((a, b) => b.score - a.score || a.start - b.start);
  return candidates[0]?.match || null;
}

/**
 * `options.fallbackCurrency` only settles an ambiguous word ("сом"/"som" is both the Kyrgyz
 * and the Uzbek currency); it is never used when the text names no currency at all.
 */
export function parseSalary(value, options = {}) {
  const text = normalizeUnicode(value ?? '');
  if (!text) return null;

  const mentioned = moneyCurrencyFromText(text);
  const currency = mentioned && options?.fallbackCurrency
    ? moneyCurrencyFromText(text, options.fallbackCurrency)
    : mentioned;
  const negotiable = hasModifier(text, 'negotiable');
  const gross = hasModifier(text, 'gross') ? true : hasModifier(text, 'net') ? false : null;
  const period = periodFromText(text);

  const salaryContext = hasSalaryContext(text)
    || Boolean(currency)
    || NUMBER_MULTIPLIERS.some((entry) => findCanonical(text, [entry], { partial: true }));
  if (!salaryContext && !negotiable) return null;

  const protectedSpans = protectedNonMoneySpans(text);
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
      if (overlapsProtectedSpan(start, end, protectedSpans)) continue;
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