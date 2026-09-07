import { HIRING_MONTHS } from './hiring-temporal.js';
import { createParseCandidate, resolveParseCandidates } from './parser-core.js';

const MONTH_NAMES = Object.freeze(Object.keys(HIRING_MONTHS).sort((a, b) => b.length - a.length).join('|'));
const DATE_WORD_RE = new RegExp(`(?<![\\p{L}\\p{N}])(\\d{1,2})\\s+(${MONTH_NAMES})(?:\\s+(20\\d{2}))?(?![\\p{L}\\p{N}])`, 'iu');
const DATE_NUMERIC_RE = /(?<!\d)(?:(20\d{2})-(\d{1,2})-(\d{1,2})|(\d{1,2})[./](\d{1,2})[./](20\d{2}))(?!\d)/u;
const TIME_RE = /(?<![\d.:])(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|утра|вечера)?(?![\d.:])/iu;
const TIME_RANGE_RE = /(?:с|from)?\s*(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm|утра|вечера)?)\s*(?:до|to|-|–|—)\s*(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm|утра|вечера)?)/iu;
const DURATION_RE = /(?<![\p{L}\p{N}])(?:(от|минимум|не\s+менее|до|не\s+более|на)(?:\s+на)?\s*)?(полгода|год|месяц(?:а|ев)?|мес\.?|недел[ьяи]|дн(?:я|ей)?|день|час(?:а|ов)?|hours?|months?|weeks?|days?|years?)(?:\s*)?(\d+(?:[.,]\d+)?)?(?![\p{L}\p{N}])/iu;
const DURATION_NUMBER_FIRST_RE = /(?<![\p{L}\p{N}])(?:(от|минимум|не\s+менее|до|не\s+более|на)(?:\s+на)?\s*)?(\d+(?:[.,]\d+)?)\s*(месяц(?:а|ев)?|мес\.?|недел[ьяи]|дн(?:я|ей)?|день|час(?:а|ов)?|hours?|months?|weeks?|days?|years?)(?![\p{L}\p{N}])/iu;
const WEEKDAYS = Object.freeze(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
const DAY_ALIASES = Object.freeze({ пн: 0, понедельник: 0, mon: 0, monday: 0, вт: 1, вторник: 1, tue: 1, tuesday: 1, ср: 2, среда: 2, wed: 2, wednesday: 2, чт: 3, четверг: 3, thu: 3, thursday: 3, пт: 4, пятница: 4, fri: 4, friday: 4, сб: 5, суббота: 5, sat: 5, saturday: 5, вс: 6, воскресенье: 6, sun: 6, sunday: 6 });

function referenceDate(context = {}) { return new Date(context.referenceDate || context.publishedAt || context.fetchedAt || Date.now()); }
function dateValue(year, month, day) { return Object.freeze({ year, month, day }); }
function validDate(value) { const date = new Date(Date.UTC(value.year, value.month - 1, value.day)); return date.getUTCFullYear() === value.year && date.getUTCMonth() === value.month - 1 && date.getUTCDate() === value.day; }
function candidate(entityType, value, match, parser, confidence, evidence) { const start = match.index ?? 0; return createParseCandidate({ id: `${entityType}:${start}`, entityType, value, raw: match[0], start, end: start + match[0].length, parser, confidence, evidence }); }
function relationNear(text, start) { const before = text.slice(Math.max(0, start - 32), start); return /(?:с|from|доступна\s+с|заезд\s+с)/iu.test(before) ? 'from' : /(?:до|until|не\s+позднее)/iu.test(before) ? 'until' : 'exact'; }
function inferYear(month, day, relation, context) { const reference = referenceDate(context); let year = reference.getUTCFullYear(); const candidateDate = Date.UTC(year, month - 1, day); if (relation === 'from' && candidateDate < reference.getTime() - 36 * 3_600_000) year += 1; if (relation === 'until' && candidateDate < reference.getTime() - 36 * 3_600_000) year += 1; return year; }
function parseClock(raw) { const match = String(raw).trim().match(/^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm|утра|вечера)?$/iu); if (!match) return null; let hour = Number(match[1]); const minute = Number(match[2] || 0); const suffix = String(match[3] || '').toLowerCase(); if (suffix === 'pm' && hour < 12) hour += 12; if (suffix === 'am' && hour === 12) hour = 0; if (/вечера/u.test(suffix) && hour < 12) hour += 12; return hour < 24 && minute < 60 ? Object.freeze({ hour, minute }) : null; }
function durationValue(prefix, amount, unit) { const normalized = String(unit).toLowerCase(); const value = normalized === 'полгода' ? .5 : Number(amount || 1); const canonicalUnit = /год|year/u.test(normalized) || normalized === 'полгода' ? 'year' : /месяц|мес|month/u.test(normalized) ? 'month' : /нед|week/u.test(normalized) ? 'week' : /дн|день|day/u.test(normalized) ? 'day' : 'hour'; const bound = /от|минимум|не\s+менее/iu.test(prefix || '') ? 'min' : /до|не\s+более/iu.test(prefix || '') ? 'max' : 'exact'; return Object.freeze({ value, unit: canonicalUnit, bound }); }
function semanticDurationType(text, start) { const around = text.slice(Math.max(0, start - 64), Math.min(text.length, start + 64)); if (/(?:сда[её]т|квартир|аренд|ijara|rent)/iu.test(around)) return 'minimumRentalDuration'; if (/(?:испытательн|probation)/iu.test(around)) return 'probationDuration'; if (/(?:контракт|contract)/iu.test(around)) return 'contractDuration'; return 'duration'; }

/** Extract generic temporal candidates without silently fabricating a Date. */
export function extractTemporalCandidates(value, context = {}) {
  const text = String(value || ''); const candidates = [];
  for (const match of text.matchAll(new RegExp(DATE_NUMERIC_RE, 'gu'))) {
    const date = match[1] ? dateValue(Number(match[1]), Number(match[2]), Number(match[3])) : dateValue(Number(match[6]), Number(match[5]), Number(match[4]));
    if (validDate(date)) candidates.push(candidate(relationNear(text, match.index ?? 0) === 'from' ? 'availabilityDate' : 'calendarDate', date, match, 'temporal.calendar.numeric', .98, [{ type: 'regex', rule: 'numeric-date' }]));
  }
  for (const match of text.matchAll(new RegExp(DATE_WORD_RE, 'giu'))) {
    const monthIndex = HIRING_MONTHS[match[2].toLocaleLowerCase('ru')]; if (monthIndex == null) continue;
    const relation = relationNear(text, match.index ?? 0); const inferred = !match[3]; const date = dateValue(inferred ? inferYear(monthIndex + 1, Number(match[1]), relation, context) : Number(match[3]), monthIndex + 1, Number(match[1]));
    if (validDate(date)) candidates.push(candidate(relation === 'from' ? 'availabilityDate' : relation === 'until' ? 'availabilityUntil' : 'calendarDate', date, match, 'temporal.calendar.month-name', inferred ? .88 : .96, [{ type: 'dictionary', dictionary: 'months', key: match[2] }, ...(inferred ? [{ type: 'inferred-year', reference: context.referenceDate ? 'referenceDate' : context.publishedAt ? 'publishedAt' : context.fetchedAt ? 'fetchedAt' : 'currentDate' }] : [])]));
  }
  for (const match of text.matchAll(new RegExp(DURATION_NUMBER_FIRST_RE, 'giu'))) { const value = durationValue(match[1], match[2], match[3]); candidates.push(candidate(semanticDurationType(text, match.index ?? 0), value, match, 'temporal.duration.number-unit', .95, [{ type: 'unit', value: match[3] }, ...(match[1] ? [{ type: 'prefix', value: match[1] }] : [])])); }
  for (const match of text.matchAll(new RegExp(DURATION_RE, 'giu'))) { if (match[3]) continue; const value = durationValue(match[1], match[3], match[2]); candidates.push(candidate(semanticDurationType(text, match.index ?? 0), value, match, 'temporal.duration.word-unit', .94, [{ type: 'unit', value: match[2] }, ...(match[1] ? [{ type: 'prefix', value: match[1] }] : [])])); }
  for (const match of text.matchAll(new RegExp(TIME_RANGE_RE, 'giu'))) { const start = parseClock(match[1]); const end = parseClock(match[2]); if (start && end) candidates.push(candidate('timeRange', Object.freeze({ start, end, crossesMidnight: start.hour * 60 + start.minute > end.hour * 60 + end.minute }), match, 'temporal.time-range', .98, [{ type: 'range', value: 'clock-time' }])); }
  const scheduleContext = /(?:график|смен[аы]|режим\s+работы|work\s*schedule|shift)/iu;
  for (const match of text.matchAll(/(\d{1,2})\s*(?:\/|\\|через|-)\s*(\d{1,2})/giu)) {
    const around = text.slice(Math.max(0, (match.index ?? 0) - 32), (match.index ?? 0) + match[0].length + 32); if (!scheduleContext.test(around)) continue;
    candidates.push(candidate('workSchedule', Object.freeze({ type: 'cycle', workDays: Number(match[1]), restDays: Number(match[2]), daysOffMode: /плавающ|скользящ|сменн/iu.test(around) ? 'rotating' : 'fixed' }), match, 'temporal.schedule-cycle', .99, [{ type: 'context', value: 'schedule' }, { type: 'range', value: 'cycle' }]));
  }
  return Object.freeze(candidates);
}

export function parseTemporal(value, context = {}) { const candidates = extractTemporalCandidates(value, context); const resolved = resolveParseCandidates(candidates); const data = Object.fromEntries(resolved.selected.map((item) => [item.entityType, item.value])); return Object.freeze({ data: Object.freeze(data), confidence: Object.freeze(Object.fromEntries(resolved.selected.map((item) => [item.entityType, item.confidence]))), debug: Object.freeze({ candidates, discardedCandidates: resolved.discarded, refinersApplied: Object.freeze(['missing-year', 'duration-context', 'schedule-context', 'conflict-resolver']) }) }); }
