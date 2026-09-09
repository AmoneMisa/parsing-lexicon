import { HIRING_MONTHS } from './hiring-temporal.js';
import {
  candidate,
  dateEntityType,
  dateValue,
  inferYear,
  inferredDateEvidence,
  referenceDate,
  referenceEntry,
  relationNear,
  temporalContextType,
  validDate,
} from './temporal-shared.js';

/**
 * CalendarDateParser: absolute calendar dates — numeric ("12.01.2027",
 * "2027-01-12"), month-name ("12 января" / "January 12"), and "end of
 * <month>" phrasing. Produces calendarDate/availabilityDate/
 * availabilityUntil/deadline/publicationDate candidates depending on
 * nearby from/until wording and domain context (see dateEntityType).
 */

const MONTH_NAMES = Object.freeze(Object.keys(HIRING_MONTHS).sort((a, b) => b.length - a.length).join('|'));
const DATE_WORD_RE = new RegExp(`(?<![\\p{L}\\p{N}])(\\d{1,2})\\s+(${MONTH_NAMES})(?:\\s+(20\\d{2}))?(?![\\p{L}\\p{N}])`, 'iu');
const DATE_MONTH_FIRST_RE = new RegExp(`(?<![\\p{L}\\p{N}])(${MONTH_NAMES})\\s+(\\d{1,2})(?:,?\\s+(20\\d{2}))?(?![\\p{L}\\p{N}])`, 'iu');
const DATE_NUMERIC_RE = /(?<!\d)(?:(20\d{2})-(\d{1,2})-(\d{1,2})|(\d{1,2})[./](\d{1,2})[./](20\d{2}))(?!\d)/u;
const DATE_NUMERIC_PARTIAL_RE = /(?<![\d.])(\d{1,2})[./](\d{1,2})(?![\d.])/u;
const END_OF_MONTH_RE = new RegExp(`(?<![\\p{L}\\p{N}])(?:до|until|p[âa]nă\\s+la|gacha|дейін|чейин|available\\s+until)\\s+(?:конца|кінця|sf[âa]rșit(?:ul)?(?:\\s+lunii)?|end\\s+of)\\s+(${MONTH_NAMES})(?:\\s+(20\\d{2}))?(?![\\p{L}\\p{N}])`, 'giu');
const START_OF_MONTH_RE = /(?<![\p{L}\p{N}])(?:с|з|from|din|dan|бастап|баштап)\s+(?:начала\s+месяца|початку\s+місяця|începutul\s+lunii|start\s+of\s+(?:the\s+)?month|1(?:-го)?\s+числа|первого\s+числа|1(?:-го)?\s+числа\s+місяця)(?![\p{L}\p{N}])/giu;
const NEXT_MONTH_RE = /(?<![\p{L}\p{N}])(?:next\s+month|со?\s+следующего\s+месяца|з\s+наступного\s+місяця)(?![\p{L}\p{N}])/giu;

function dateAtMonthEnd(year, month) { return dateValue(year, month, new Date(Date.UTC(year, month, 0)).getUTCDate()); }
function dateAtNextMonthStart(reference) { const month = reference.getUTCMonth() + 2; const year = reference.getUTCFullYear() + Math.floor((month - 1) / 12); return dateValue(year, ((month - 1) % 12) + 1, 1); }

export function extractCalendarDateCandidates(text, context = {}) {
  const candidates = [];
  for (const match of text.matchAll(new RegExp(DATE_NUMERIC_RE, 'gu'))) {
    const date = match[1] ? dateValue(Number(match[1]), Number(match[2]), Number(match[3])) : dateValue(Number(match[6]), Number(match[5]), Number(match[4]));
    if (validDate(date)) candidates.push(candidate(dateEntityType(text, match.index ?? 0, context), date, match, 'temporal.calendar.numeric', .98, [{ type: 'regex', rule: 'numeric-date' }]));
  }
  for (const match of text.matchAll(new RegExp(DATE_NUMERIC_PARTIAL_RE, 'gu'))) {
    const start = match.index ?? 0; const around = text.slice(Math.max(0, start - 40), start + match[0].length + 40);
    if (!/(?:deadline|apply\s+by|closing\s+date|дедлайн|срок(?:\s+подачи)?|термін(?:\s+подання)?|свобод|доступ|заезд|заезж|available|move[- ]?in|(?<![\p{L}\p{N}])(?:с|до|from|until)(?![\p{L}\p{N}]))/iu.test(around)) continue;
    const relation = relationNear(text, start); const inferred = true;
    const date = dateValue(inferYear(Number(match[2]), Number(match[1]), relation, context), Number(match[2]), Number(match[1]));
    if (validDate(date)) candidates.push(candidate(dateEntityType(text, start, context, relation), date, match, 'temporal.calendar.numeric-partial', .86, [{ type: 'regex', rule: 'numeric-partial-date' }, ...inferredDateEvidence(inferred, context)]));
  }
  for (const match of text.matchAll(new RegExp(DATE_WORD_RE, 'giu'))) {
    const monthIndex = HIRING_MONTHS[match[2].toLocaleLowerCase('ru')]; if (monthIndex == null) continue;
    const relation = relationNear(text, match.index ?? 0); const inferred = !match[3]; const date = dateValue(inferred ? inferYear(monthIndex + 1, Number(match[1]), relation, context) : Number(match[3]), monthIndex + 1, Number(match[1]));
    if (validDate(date)) candidates.push(candidate(dateEntityType(text, match.index ?? 0, context, relation), date, match, 'temporal.calendar.month-name', inferred ? .88 : .96, [{ type: 'dictionary', dictionary: 'months', key: match[2] }, ...inferredDateEvidence(inferred, context)]));
  }
  for (const match of text.matchAll(new RegExp(DATE_MONTH_FIRST_RE, 'giu'))) {
    const monthIndex = HIRING_MONTHS[match[1].toLocaleLowerCase('ru')]; if (monthIndex == null) continue;
    const relation = relationNear(text, match.index ?? 0); const inferred = !match[3]; const date = dateValue(inferred ? inferYear(monthIndex + 1, Number(match[2]), relation, context) : Number(match[3]), monthIndex + 1, Number(match[2]));
    if (validDate(date)) candidates.push(candidate(dateEntityType(text, match.index ?? 0, context, relation), date, match, 'temporal.calendar.month-first', inferred ? .88 : .96, [{ type: 'dictionary', dictionary: 'months', key: match[1] }, ...inferredDateEvidence(inferred, context)]));
  }
  for (const match of text.matchAll(END_OF_MONTH_RE)) {
    const monthIndex = HIRING_MONTHS[match[1].toLocaleLowerCase('ru')]; if (monthIndex == null) continue;
    const inferred = !match[2]; const year = inferred ? inferYear(monthIndex + 1, 1, 'until', context) : Number(match[2]);
    candidates.push(candidate('availabilityUntil', dateAtMonthEnd(year, monthIndex + 1), match, 'temporal.calendar.month-end', inferred ? .86 : .94, [{ type: 'dictionary', dictionary: 'months', key: match[1] }, { type: 'relation', value: 'until-month-end' }, ...inferredDateEvidence(inferred, context)]));
  }
  for (const match of text.matchAll(START_OF_MONTH_RE)) {
    const reference = referenceDate(context); const date = dateValue(reference.getUTCFullYear(), reference.getUTCMonth() + 1, 1);
    candidates.push(candidate(temporalContextType(text, match.index ?? 0, context), date, match, 'temporal.relative.month-start', .88, [{ type: 'context', value: 'month-start' }, { type: 'reference-date', value: referenceEntry(context).source }]));
  }
  for (const match of text.matchAll(NEXT_MONTH_RE)) {
    const date = dateAtNextMonthStart(referenceDate(context));
    candidates.push(candidate(temporalContextType(text, match.index ?? 0, context), date, match, 'temporal.relative.next-month', .88, [{ type: 'context', value: 'next-month' }, { type: 'reference-date', value: referenceEntry(context).source }]));
  }
  return candidates;
}
