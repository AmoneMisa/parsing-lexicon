import { createParseCandidate } from './parser-core.js';

/**
 * Helpers shared by every temporal sub-parser (calendar dates, relative
 * dates, durations, clock/schedule). Kept in one place so reference-date
 * resolution, candidate construction and from/until relation detection
 * cannot drift between parsers.
 */

export function referenceEntry(context = {}) {
  for (const [source, value] of [['referenceDate', context.referenceDate], ['publishedAt', context.publishedAt], ['fetchedAt', context.fetchedAt]]) {
    if (value == null || value === '') continue;
    const date = new Date(value);
    if (Number.isFinite(date.getTime())) return Object.freeze({ date, source });
  }
  return Object.freeze({ date: new Date(), source: 'currentDate' });
}
export function referenceDate(context = {}) { return referenceEntry(context).date; }
export function dateValue(year, month, day) { return Object.freeze({ year, month, day }); }
export function validDate(value) { const date = new Date(Date.UTC(value.year, value.month - 1, value.day)); return date.getUTCFullYear() === value.year && date.getUTCMonth() === value.month - 1 && date.getUTCDate() === value.day; }
export function candidate(entityType, value, match, parser, confidence, evidence) { const start = match.index ?? 0; return createParseCandidate({ id: `${entityType}:${start}`, entityType, value, raw: match[0], start, end: start + match[0].length, parser, confidence, evidence }); }

// Bare "с"/"з"/"до" are single Cyrillic letters and match as a substring of
// countless ordinary words ("Сдаю", "доступна") without a boundary guard —
// "Сдаю до 15.03" was misread as 'from' off the "С" in "Сдаю" alone, hiding
// the actual "до" (until) marker that followed.
const RELATION_FROM_RE = /(?<![\p{L}\p{N}])(?:с|з|from|din|dan|бастап|баштап|доступна\s+(?:с|з)|заезд\s+(?:с|з))(?![\p{L}\p{N}])/iu;
const RELATION_UNTIL_RE = /(?<![\p{L}\p{N}])(?:до|until|p[âa]nă\s+la|gacha|дейін|чейин|не\s+позднее)(?![\p{L}\p{N}])/iu;
export function relationNear(text, start) { const before = text.slice(Math.max(0, start - 32), start); return RELATION_FROM_RE.test(before) ? 'from' : RELATION_UNTIL_RE.test(before) ? 'until' : 'exact'; }

// A year-less date is assumed to refer to its next occurrence when the
// current year's reading has already passed — not just for explicit
// "from"/"until" wording. A bare mention with no relation ('exact') is the
// common case (e.g. "12 января встреча") and would otherwise silently
// resolve to a date up to a year in the past.
export function inferYear(month, day, relation, context) { const reference = referenceDate(context); let year = reference.getUTCFullYear(); const candidateDate = Date.UTC(year, month - 1, day); if (candidateDate < reference.getTime() - 36 * 3_600_000) year += 1; return year; }

export function inferredDateEvidence(inferred, context) { return inferred ? [{ type: 'inferred-year', reference: referenceEntry(context).source }] : []; }

export function dateEntityType(text, start, context, relation = relationNear(text, start)) {
  const around = text.slice(Math.max(0, start - 48), Math.min(text.length, start + 48));
  if (/(?:deadline|apply\s+by|closing\s+date|дедлайн|срок(?:\s+подачи)?|термін(?:\s+подання)?)/iu.test(around)) return 'deadline';
  if (/(?:published|publication|опубликован|опублікован)/iu.test(around)) return 'publicationDate';
  // Direction must belong to this date's local left context. Looking ahead
  // across a whole listing makes "available from 12 February, until March"
  // incorrectly classify the February date as an end date.
  if (relation === 'until') return 'availabilityUntil';
  if (relation === 'from' || (context.domain === 'real-estate' && /(?:свобод|доступ|заезд|заезж|ijara|bo['’`]?sh|вільн|disponibil|move[- ]?in|available)/iu.test(around))) return 'availabilityDate';
  return 'calendarDate';
}

export function temporalContextType(text, start, context) { const around = text.slice(Math.max(0, start - 48), Math.min(text.length, start + 48)); if (/(?:свобод|доступ|заезд|заезж|ijara|bo['’`]?sh|бос|бош|вільн|disponibil|move[- ]?in|available)/iu.test(around)) return 'availabilityDate'; if ((context.domain === 'vacancy' || /(?:ваканс|работ|job|ish\s+grafigi|графік)/iu.test(around)) && /(?:выход|start|приступ|boshlash)/iu.test(around)) return 'startDate'; return 'relativeDate'; }

export function addUtcDays(date, days) { const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days)); return dateValue(copy.getUTCFullYear(), copy.getUTCMonth() + 1, copy.getUTCDate()); }
