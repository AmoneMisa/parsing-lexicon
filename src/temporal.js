import { HIRING_MONTHS } from './hiring-temporal.js';
import { createParseCandidate, resolveParseCandidates } from './parser-core.js';

const MONTH_NAMES = Object.freeze(Object.keys(HIRING_MONTHS).sort((a, b) => b.length - a.length).join('|'));
const DATE_WORD_RE = new RegExp(`(?<![\\p{L}\\p{N}])(\\d{1,2})\\s+(${MONTH_NAMES})(?:\\s+(20\\d{2}))?(?![\\p{L}\\p{N}])`, 'iu');
const DATE_MONTH_FIRST_RE = new RegExp(`(?<![\\p{L}\\p{N}])(${MONTH_NAMES})\\s+(\\d{1,2})(?:,?\\s+(20\\d{2}))?(?![\\p{L}\\p{N}])`, 'iu');
const DATE_NUMERIC_RE = /(?<!\d)(?:(20\d{2})-(\d{1,2})-(\d{1,2})|(\d{1,2})[./](\d{1,2})[./](20\d{2}))(?!\d)/u;
const DATE_NUMERIC_PARTIAL_RE = /(?<![\d.])(\d{1,2})[./](\d{1,2})(?![\d.])/u;
const TIME_SUFFIX = String.raw`(?:am|pm|утра|вечера|ранку|вечора|ertalab|kechqurun)`;
const TIME_RE = new RegExp(String.raw`(?<![\d.:])(\d{1,2})(?:[:.](\d{2}))?\s*(${TIME_SUFFIX})?(?![\d.:])`, 'iu');
const TIME_RANGE_RE = new RegExp(String.raw`(?:с|з|from|dan)?\s*(\d{1,2}(?:[:.]\d{2})?\s*${TIME_SUFFIX}?)\s*(?:до|to|gacha|дейін|чейин|-|–|—)\s*(\d{1,2}(?:[:.]\d{2})?\s*${TIME_SUFFIX}?)`, 'iu');
const DURATION_PREFIX = String.raw`(?:от|минимум|не\s+менее|kamida|eng\s+kam|кемінде|не\s+менш(?:е)?|at\s+least|до|не\s+более|ko'?pi\s+bilan|көп\s+емес|на|uchun|pe\s+o\s+perioadă\s+de)`;
const DURATION_UNIT = String.raw`(?:полгода|год(?:а|ов)?|yil(?:ga)?|жыл(?:ға)?|рок(?:и|ів)?|an(?:i)?|месяц(?:а|ев)?|мес\.?|oy(?:ga)?|місяц(?:і|ів|я)?|luni?|недел[ьяи]|hafta(?:ga)?|апта(?:ға)?|тиж(?:день|ні|нів|ня)|săptămân\p{L}*|saptaman\p{L}*|дн(?:я|ей)?|день|kun(?:ga)?|күн(?:ге)?|день|днів|дні|zi(?:le)?|час(?:а|ов)?|soat(?:ga)?|сағат(?:қа)?|годин(?:а|и|у)?|ore?|мин(?:ут[аы]?|\.)?|daqiqa|минут\p{L}*|minute?)`;
const DURATION_RE = new RegExp(String.raw`(?<![\p{L}\p{N}])(?:(` + DURATION_PREFIX + String.raw`)(?:\s+на)?\s*)?(` + DURATION_UNIT + String.raw`)(?:\s*)?(\d+(?:[.,]\d+)?)?(?![\p{L}\p{N}])`, 'iu');
const DURATION_NUMBER_FIRST_RE = new RegExp(String.raw`(?<![\p{L}\p{N}])(?:(` + DURATION_PREFIX + String.raw`)(?:\s+на)?\s*)?(\d+(?:[.,]\d+)?)(?:-?х)?\s*(` + DURATION_UNIT + String.raw`)(?![\p{L}\p{N}])`, 'iu');
const WEEKDAYS = Object.freeze(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']);
const DAY_ALIASES = Object.freeze({
  пн: 0, понедельник: 0, понедельника: 0, понеділок: 0, понеділка: 0, mon: 0, monday: 0, dushanba: 0, дүйсенбі: 0, дүйшөмбү: 0, luni: 0,
  вт: 1, вторник: 1, вторника: 1, вівторок: 1, вівторка: 1, tue: 1, tuesday: 1, seshanba: 1, сейсенбі: 1, шейшемби: 1, marți: 1, marti: 1,
  ср: 2, среда: 2, среды: 2, середа: 2, середи: 2, wed: 2, wednesday: 2, chorshanba: 2, сәрсенбі: 2, шаршемби: 2, miercuri: 2,
  чт: 3, четверг: 3, четверга: 3, четвер: 3, четверга: 3, thu: 3, thursday: 3, payshanba: 3, бейсенбі: 3, бейшемби: 3, joi: 3,
  пт: 4, пятница: 4, пятницы: 4, "п'ятниця": 4, 'п’ятниця': 4, пятниця: 4, fri: 4, friday: 4, juma: 4, жұма: 4, жума: 4, vineri: 4,
  сб: 5, суббота: 5, субботы: 5, субота: 5, sat: 5, saturday: 5, shanba: 5, сенбі: 5, ишемби: 5, sâmbătă: 5, sambata: 5,
  вс: 6, воскресенье: 6, воскресенья: 6, неділя: 6, неділю: 6, sun: 6, sunday: 6, yakshanba: 6, жексенбі: 6, жекшемби: 6, duminică: 6, duminica: 6,
});
const RELATIVE_RE = /(?<![\p{L}\p{N}])(?:с\s+|з\s+|dan\s+)?(сегодня|завтра|послезавтра|сьогодні|післязавтра|bugun|ertaga|indin|бүгін|ертең|бүрсігүні|бүгүн|эртең|бүрсүгүнү|astăzi|azi|mâine|maine|poimâine|poimaine|today|tomorrow|day\s+after\s+tomorrow|через\s+(\d+|неделю|две\s+недели)\s*(?:дн(?:я|ей)?|день|недел[ьюи])?)(?![\p{L}\p{N}])/giu;
const EXTENDED_RELATIVE_RE = /(?<![\p{L}\p{N}])(?:через\s+(\d+)\s+(дні|днів|тижд(?:ень|ні|нів|ня))|peste\s+(\d+)\s+(zile?|săptămân(?:ă|i)|saptaman(?:a|i))|(\d+)\s+(күннен|аптадан|кун(?:дөн|дон)|жумадан)\s+(?:кейін|кийин))(?![\p{L}\p{N}])/giu;
const DAY_PATTERN = Object.keys(DAY_ALIASES).sort((a, b) => b.length - a.length).join('|');
const WEEKDAY_RANGE_RE = new RegExp(`(?<![\\p{L}\\p{N}])(${DAY_PATTERN})\\s*(?:-|–|—|до|to|по)\\s*(${DAY_PATTERN})(?![\\p{L}\\p{N}])`, 'giu');
const NEXT_WEEKDAY_RE = new RegExp(`(?<![\\p{L}\\p{N}])(?:со?\\s+следующ(?:его|ей)\\s+|з\\s+наступн(?:ого|ої)\\s+|next\\s+)(${DAY_PATTERN})(?![\\p{L}\\p{N}])`, 'giu');
const END_OF_MONTH_RE = new RegExp(`(?<![\\p{L}\\p{N}])(?:до|until|p[âa]nă\\s+la|gacha|дейін|чейин|available\\s+until)\\s+(?:конца|кінця|sf[âa]rșit(?:ul)?(?:\\s+lunii)?|end\\s+of)\\s+(${MONTH_NAMES})(?:\\s+(20\\d{2}))?(?![\\p{L}\\p{N}])`, 'giu');
const START_OF_MONTH_RE = /(?<![\p{L}\p{N}])(?:с|з|from|din|dan|бастап|баштап)\s+(?:начала\s+месяца|початку\s+місяця|începutul\s+lunii|start\s+of\s+(?:the\s+)?month)(?![\p{L}\p{N}])/giu;
const SHIFT_RE = /(?<!\d)(\d{1,2})\s*(?:смен[аы]|shift)\s*(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm|утра|вечера)?)\s*(?:-|–|—|до|to)\s*(\d{1,2}(?:[:.]\d{2})?\s*(?:am|pm|утра|вечера)?)/giu;

function referenceDate(context = {}) { return new Date(context.referenceDate || context.publishedAt || context.fetchedAt || Date.now()); }
function dateValue(year, month, day) { return Object.freeze({ year, month, day }); }
function validDate(value) { const date = new Date(Date.UTC(value.year, value.month - 1, value.day)); return date.getUTCFullYear() === value.year && date.getUTCMonth() === value.month - 1 && date.getUTCDate() === value.day; }
function candidate(entityType, value, match, parser, confidence, evidence) { const start = match.index ?? 0; return createParseCandidate({ id: `${entityType}:${start}`, entityType, value, raw: match[0], start, end: start + match[0].length, parser, confidence, evidence }); }
function relationNear(text, start) { const before = text.slice(Math.max(0, start - 32), start); return /(?:с|з|from|din|dan|бастап|баштап|доступна\s+(?:с|з)|заезд\s+(?:с|з))/iu.test(before) ? 'from' : /(?:до|until|p[âa]nă\s+la|gacha|дейін|чейин|не\s+позднее)/iu.test(before) ? 'until' : 'exact'; }
function inferYear(month, day, relation, context) { const reference = referenceDate(context); let year = reference.getUTCFullYear(); const candidateDate = Date.UTC(year, month - 1, day); if (relation === 'from' && candidateDate < reference.getTime() - 36 * 3_600_000) year += 1; if (relation === 'until' && candidateDate < reference.getTime() - 36 * 3_600_000) year += 1; return year; }
function parseClock(raw) { const match = String(raw).trim().match(new RegExp(String.raw`^(\d{1,2})(?:[:.](\d{2}))?\s*(${TIME_SUFFIX})?$`, 'iu')); if (!match) return null; let hour = Number(match[1]); const minute = Number(match[2] || 0); const suffix = String(match[3] || '').toLowerCase(); if (suffix === 'pm' && hour < 12) hour += 12; if (suffix === 'am' && hour === 12) hour = 0; if (/(?:вечера|вечора|kechqurun)/u.test(suffix) && hour < 12) hour += 12; return hour < 24 && minute < 60 ? Object.freeze({ hour, minute }) : null; }
function durationValue(prefix, amount, unit) { const normalized = String(unit).toLowerCase(); const value = normalized === 'полгода' ? .5 : Number(amount || 1); const canonicalUnit = /год|year|yil|жыл|рок|\ban/i.test(normalized) || normalized === 'полгода' ? 'year' : /месяц|мес|month|\boy|місяц|lun/i.test(normalized) ? 'month' : /нед|week|hafta|апта|тиж|săptăm|saptaman/i.test(normalized) ? 'week' : /дн|день|day|\bkun|күн|zi/i.test(normalized) ? 'day' : /мин|minute|daqiqa/i.test(normalized) ? 'minute' : 'hour'; const bound = /от|минимум|не\s+менее|kamida|eng\s+kam|кемінде|не\s+менш|at\s+least/iu.test(prefix || '') ? 'min' : /до|не\s+более|ko'?pi\s+bilan|көп\s+емес/iu.test(prefix || '') ? 'max' : 'exact'; return Object.freeze({ value, unit: canonicalUnit, bound }); }
function semanticDurationType(text, start, duration) {
  const before = text.slice(Math.max(0, start - 56), start);
  const after = text.slice(start, Math.min(text.length, start + 56));
  if (/(?:испытательн(?:ый)?\s+срок|probation)[^.;\n]{0,30}$/iu.test(before)) return 'probationDuration';
  if (/(?:контракт|contract)[^.;\n]{0,30}$/iu.test(before)) return 'contractDuration';
  if (/(?:сда[её]т|квартир|аренд|ijara|rent|ijaraga\s+beril|оренд)[^.;\n]{0,45}$/iu.test(before) || /(?:сда[её]т|квартир|аренд|ijara|rent|ijaraga\s+beril|оренд)/iu.test(after)) {
    if (duration?.bound === 'max') return 'maximumRentalDuration';
    if (duration?.bound === 'exact') return 'fixedRentalDuration';
    return 'minimumRentalDuration';
  }
  return 'duration';
}
function addUtcDays(date, days) { const copy = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + days)); return dateValue(copy.getUTCFullYear(), copy.getUTCMonth() + 1, copy.getUTCDate()); }
function relativeDays(raw) { const lower = raw.toLowerCase(); if (/сегодня|сьогодні|bugun|бүгін|бүгүн|astăzi|azi|today/u.test(lower)) return 0; if (/послезавтра|післязавтра|indin|бүрсігүні|бүрсүгүнү|poimâine|poimaine|day\s+after/u.test(lower)) return 2; if (/завтра|ertaga|ертең|эртең|mâine|maine|tomorrow/u.test(lower)) return 1; if (/две\s+недели/u.test(lower)) return 14; if (/неделю/u.test(lower)) return 7; const numeric = Number(lower.match(/\d+/u)?.[0]); return Number.isFinite(numeric) ? numeric : null; }
function relativeDurationDays(amount, unit) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value < 0) return null;
  return /(?:тиж|săptăm|saptaman|апта|жума)/iu.test(unit) ? value * 7 : value;
}
function temporalContextType(text, start, context) { const around = text.slice(Math.max(0, start - 48), Math.min(text.length, start + 48)); if (/(?:свобод|доступ|заезд|заезж|ijara|bo['’`]?sh|бос|бош|вільн|disponibil|move[- ]?in|available)/iu.test(around)) return 'availabilityDate'; if ((context.domain === 'vacancy' || /(?:ваканс|работ|job|ish\s+grafigi|графік)/iu.test(around)) && /(?:выход|start|приступ|boshlash)/iu.test(around)) return 'startDate'; return 'relativeDate'; }
function dateEntityType(text, start, context, relation = relationNear(text, start)) {
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
function inferredDateEvidence(inferred, context) { return inferred ? [{ type: 'inferred-year', reference: context.referenceDate ? 'referenceDate' : context.publishedAt ? 'publishedAt' : context.fetchedAt ? 'fetchedAt' : 'currentDate' }] : []; }
const SCHEDULE_CONTEXT_RE = /(?:график|смен[аы]|режим\s+работы|work\s*schedule|shift|работ[аы]|job|графік|змін[аи]|program(?:ul)?\s+de\s+lucru|ish\s+grafigi|жұмыс\s+кестесі|жумуш\s+графиги)/iu;
function scheduleDaysOffMode(text) {
  if (/(?:плавающ|floating|flexible\s+days\s+off)/iu.test(text)) return 'floating';
  if (/(?:скользящ|сменн|rotating\s+days\s+off|выходные\s+по\s+графику)/iu.test(text)) return 'rotating';
  return 'fixed';
}
function cycleScheduleValue(work, rest, daysOffMode) {
  // Day cycles such as 2/2 and 5/2 are common. Values larger than a week in
  // an explicit schedule context are the conventional shift notation 24/48
  // or 12/24, not a claim of dozens of working days.
  if (Math.max(work, rest) > 7) {
    // An hour cycle has no fixed weekday rest days. Keep an explicitly
    // floating mode, otherwise expose the inherent repeating rotation.
    return Object.freeze({ type: 'cycle', cycleHours: Object.freeze({ work, rest }), daysOffMode: daysOffMode === 'fixed' ? 'rotating' : daysOffMode });
  }
  return Object.freeze({ type: 'cycle', workDays: work, restDays: rest, daysOffMode });
}
function isTimeRangeContextual(match, text) {
  if (/[.:]|\b(?:am|pm|утра|вечера|ранку|вечора|ertalab|kechqurun)\b/iu.test(match[0])) return true;
  if (/^\s*(?:с|from)\b/iu.test(match[0])) return true;
  const start = match.index ?? 0;
  return SCHEDULE_CONTEXT_RE.test(text.slice(Math.max(0, start - 32), start + match[0].length + 32));
}
function isClockContextual(match, text) {
  if (/(?:am|pm|утра|вечера|ранку|вечора|ertalab|kechqurun)/iu.test(match[0])) return true;
  const start = match.index ?? 0;
  return SCHEDULE_CONTEXT_RE.test(text.slice(Math.max(0, start - 24), start + match[0].length + 24));
}
function dateAtMonthEnd(year, month) { return dateValue(year, month, new Date(Date.UTC(year, month, 0)).getUTCDate()); }
function nextWeekday(date, weekday) { const current = (date.getUTCDay() + 6) % 7; let days = (weekday - current + 7) % 7; if (days === 0) days = 7; return addUtcDays(date, days); }

/** Extract generic temporal candidates without silently fabricating a Date. */
export function extractTemporalCandidates(value, context = {}) {
  const text = String(value || ''); const candidates = [];
  for (const match of text.matchAll(new RegExp(DATE_NUMERIC_RE, 'gu'))) {
    const date = match[1] ? dateValue(Number(match[1]), Number(match[2]), Number(match[3])) : dateValue(Number(match[6]), Number(match[5]), Number(match[4]));
    if (validDate(date)) candidates.push(candidate(dateEntityType(text, match.index ?? 0, context), date, match, 'temporal.calendar.numeric', .98, [{ type: 'regex', rule: 'numeric-date' }]));
  }
  for (const match of text.matchAll(new RegExp(DATE_NUMERIC_PARTIAL_RE, 'gu'))) {
    const start = match.index ?? 0; const around = text.slice(Math.max(0, start - 40), start + match[0].length + 40);
    if (!/(?:deadline|apply\s+by|closing\s+date|дедлайн|срок(?:\s+подачи)?|термін(?:\s+подання)?|свобод|доступ|заезд|заезж|available|move[- ]?in|\b(?:с|до|from|until)\b)/iu.test(around)) continue;
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
    candidates.push(candidate(temporalContextType(text, match.index ?? 0, context), date, match, 'temporal.relative.month-start', .88, [{ type: 'context', value: 'month-start' }, { type: 'reference-date', value: context.referenceDate ? 'referenceDate' : context.publishedAt ? 'publishedAt' : context.fetchedAt ? 'fetchedAt' : 'currentDate' }]));
  }
  for (const match of text.matchAll(NEXT_WEEKDAY_RE)) {
    const weekday = DAY_ALIASES[match[1].toLowerCase()]; if (weekday == null) continue;
    candidates.push(candidate(temporalContextType(text, match.index ?? 0, context), nextWeekday(referenceDate(context), weekday), match, 'temporal.relative.next-weekday', .9, [{ type: 'dictionary', dictionary: 'weekdays', key: match[1] }, { type: 'reference-date', value: context.referenceDate ? 'referenceDate' : context.publishedAt ? 'publishedAt' : context.fetchedAt ? 'fetchedAt' : 'currentDate' }]));
  }
  for (const match of text.matchAll(RELATIVE_RE)) { const days = relativeDays(match[1]); if (days == null) continue; const type = temporalContextType(text, match.index ?? 0, context); candidates.push(candidate(type, addUtcDays(referenceDate(context), days), match, 'temporal.relative-date', .91, [{ type: 'context', value: `relative:${days}d` }, { type: 'reference-date', value: context.referenceDate ? 'referenceDate' : context.publishedAt ? 'publishedAt' : context.fetchedAt ? 'fetchedAt' : 'currentDate' }])); }
  for (const match of text.matchAll(EXTENDED_RELATIVE_RE)) {
    const amount = match[1] || match[3] || match[5];
    const unit = match[2] || match[4] || match[6];
    const days = relativeDurationDays(amount, unit);
    if (days == null) continue;
    const type = temporalContextType(text, match.index ?? 0, context);
    candidates.push(candidate(type, addUtcDays(referenceDate(context), days), match, 'temporal.relative-date.extended', .91, [{ type: 'context', value: `relative:${days}d` }, { type: 'unit', value: unit }, { type: 'reference-date', value: context.referenceDate ? 'referenceDate' : context.publishedAt ? 'publishedAt' : context.fetchedAt ? 'fetchedAt' : 'currentDate' }]));
  }
  for (const match of text.matchAll(new RegExp(DURATION_NUMBER_FIRST_RE, 'giu'))) { const value = durationValue(match[1], match[2], match[3]); candidates.push(candidate(semanticDurationType(text, match.index ?? 0, value), value, match, 'temporal.duration.number-unit', .95, [{ type: 'unit', value: match[3] }, ...(match[1] ? [{ type: 'prefix', value: match[1] }] : [])])); }
  for (const match of text.matchAll(new RegExp(DURATION_RE, 'giu'))) { if (match[3]) continue; const value = durationValue(match[1], match[3], match[2]); candidates.push(candidate(semanticDurationType(text, match.index ?? 0, value), value, match, 'temporal.duration.word-unit', .94, [{ type: 'unit', value: match[2] }, ...(match[1] ? [{ type: 'prefix', value: match[1] }] : [])])); }
  const timeRangeSpans = [];
  for (const match of text.matchAll(new RegExp(TIME_RANGE_RE, 'giu'))) {
    const start = parseClock(match[1]); const end = parseClock(match[2]);
    if (!start || !end || !isTimeRangeContextual(match, text)) continue;
    timeRangeSpans.push([match.index ?? 0, (match.index ?? 0) + match[0].length]);
    candidates.push(candidate('timeRange', Object.freeze({ start, end, crossesMidnight: start.hour * 60 + start.minute > end.hour * 60 + end.minute }), match, 'temporal.time-range', .98, [{ type: 'range', value: 'clock-time' }]));
  }
  for (const match of text.matchAll(new RegExp(TIME_RE, 'giu'))) {
    const start = match.index ?? 0; const end = start + match[0].length;
    if (timeRangeSpans.some(([rangeStart, rangeEnd]) => start >= rangeStart && end <= rangeEnd) || !isClockContextual(match, text)) continue;
    const clock = parseClock(match[0]); if (clock) candidates.push(candidate('clockTime', clock, match, 'temporal.clock-time', .94, [{ type: 'clock', value: 'explicit' }]));
  }
  const scheduleContext = SCHEDULE_CONTEXT_RE;
  for (const match of text.matchAll(/(?<![\d:.])(\d{1,2})\s*(?:\/|\\|через|-)\s*(\d{1,2})(?![\d:.])/giu)) {
    const around = text.slice(Math.max(0, (match.index ?? 0) - 32), (match.index ?? 0) + match[0].length + 32); if (!scheduleContext.test(around)) continue;
    const daysOffMode = scheduleDaysOffMode(around);
    const work = Number(match[1]); const rest = Number(match[2]);
    candidates.push(candidate('workSchedule', cycleScheduleValue(work, rest, daysOffMode), match, 'temporal.schedule-cycle', .99, [{ type: 'context', value: 'schedule' }, { type: 'range', value: Math.max(work, rest) > 7 ? 'cycle-hours' : 'cycle' }, { type: 'days-off-mode', value: daysOffMode }]));
  }
  for (const match of text.matchAll(/(?<![\p{L}\p{N}])два\s+через\s+два(?![\p{L}\p{N}])/giu)) {
    const around = text.slice(Math.max(0, (match.index ?? 0) - 32), (match.index ?? 0) + match[0].length + 32); if (!scheduleContext.test(around)) continue;
    const daysOffMode = scheduleDaysOffMode(around);
    candidates.push(candidate('workSchedule', Object.freeze({ type: 'cycle', workDays: 2, restDays: 2, daysOffMode }), match, 'temporal.schedule-cycle.words', .97, [{ type: 'context', value: 'schedule' }, { type: 'range', value: 'cycle' }, { type: 'days-off-mode', value: daysOffMode }]));
  }
  for (const match of text.matchAll(WEEKDAY_RANGE_RE)) {
    const start = DAY_ALIASES[match[1].toLowerCase()]; const end = DAY_ALIASES[match[2].toLowerCase()];
    if (start == null || end == null || end < start) continue;
    candidates.push(candidate('workSchedule', Object.freeze({ type: 'weekdays', workingDays: WEEKDAYS.slice(start, end + 1), daysOffMode: 'fixed' }), match, 'temporal.schedule-weekdays', .97, [{ type: 'range', value: 'weekday' }]));
  }
  for (const match of text.matchAll(/(?<![\p{L}\p{N}])(?:по\s+будням|weekdays?)(?![\p{L}\p{N}])/giu)) {
    candidates.push(candidate('workSchedule', Object.freeze({ type: 'weekdays', workingDays: WEEKDAYS.slice(0, 5), daysOffMode: 'fixed' }), match, 'temporal.schedule-weekdays.named', .96, [{ type: 'context', value: 'weekdays' }]));
  }
  for (const match of text.matchAll(/(?<![\p{L}\p{N}])(?:только\s+по\s+выходным|weekends?\s+only)(?![\p{L}\p{N}])/giu)) {
    candidates.push(candidate('workSchedule', Object.freeze({ type: 'weekdays', workingDays: WEEKDAYS.slice(5), daysOffMode: 'fixed' }), match, 'temporal.schedule-weekends', .96, [{ type: 'context', value: 'weekends' }]));
  }
  const shifts = [];
  let firstShift = null; let lastShift = null;
  for (const match of text.matchAll(SHIFT_RE)) { const start = parseClock(match[2]); const end = parseClock(match[3]); if (!start || !end) continue; firstShift ||= match; lastShift = match; shifts.push(Object.freeze({ name: `${match[1]} shift`, hours: Object.freeze({ start, end, crossesMidnight: start.hour * 60 + start.minute > end.hour * 60 + end.minute }) })); }
  if (shifts.length) candidates.push(candidate('shifts', Object.freeze(shifts), { 0: text.slice(firstShift.index, (lastShift.index ?? 0) + lastShift[0].length), index: firstShift.index }, 'temporal.multiple-shifts', .98, [{ type: 'context', value: 'shift' }, { type: 'range', value: 'clock-time' }]));
  return Object.freeze(candidates);
}

export function parseTemporal(value, context = {}) { const candidates = extractTemporalCandidates(value, context); const resolved = resolveParseCandidates(candidates); const data = Object.fromEntries(resolved.selected.map((item) => [item.entityType, item.value])); if (data.workSchedule && data.timeRange) data.workSchedule = Object.freeze({ ...data.workSchedule, workingHours: data.timeRange }); return Object.freeze({ data: Object.freeze(data), confidence: Object.freeze(Object.fromEntries(resolved.selected.map((item) => [item.entityType, item.confidence]))), debug: Object.freeze({ candidates, discardedCandidates: resolved.discarded, refinersApplied: Object.freeze(['missing-year', 'relative-date', 'duration-context', 'schedule-context', 'conflict-resolver']) }) }); }
