import { resolveParseCandidates } from './parser-core.js';
import { extractCalendarDateCandidates } from './temporal-calendar-date.js';
import { extractRelativeDateCandidates } from './temporal-relative-date.js';
import { extractDurationCandidates } from './temporal-duration.js';
import { extractClockCandidates, parseClock } from './temporal-clock.js';
import { extractScheduleCandidates } from './temporal-schedule.js';

/**
 * Parser Engine V2's temporal subsystem. Each semantic category — calendar
 * dates, relative dates, durations, clock/time-ranges, work schedules — has
 * its own parser module (temporal-calendar-date.js, temporal-relative-
 * date.js, temporal-duration.js, temporal-clock.js, temporal-schedule.js);
 * this file only orchestrates them, resolves cross-category conflicts, and
 * exposes the public parseTemporal()/extractTemporalCandidates() API.
 * Nothing here returns a bare Date — every result is a typed entity
 * (calendarDate/duration/workSchedule/timeRange/clockTime/...) with its own
 * evidence, confidence and span.
 */

/** Extract generic temporal candidates without silently fabricating a Date. */
export function extractTemporalCandidates(value, context = {}) {
  const text = String(value || '');
  return Object.freeze([
    ...extractCalendarDateCandidates(text, context),
    ...extractRelativeDateCandidates(text, context),
    ...extractDurationCandidates(text),
    ...extractClockCandidates(text),
    ...extractScheduleCandidates(text, parseClock),
  ]);
}

// The default resolver only rejects overlapping candidates of the *same*
// entityType. That is right in general — e.g. an extended relative-date
// reading of "через 3 дні" legitimately outranks a spurious bare-duration
// reading of the same "3 дні" text, and a blanket cross-type overlap ban
// would keep whichever has the higher raw confidence, which is not always
// the correct one. But a schedule cycle like "2/2" (workSchedule) and a
// bare clock-time match on its own leading "2" (clockTime) are never two
// competing *interpretations* worth ranking — clockTime's schedule-context
// fallback (isClockContextual) was only ever meant to recognize genuine
// standalone times near schedule language, not to double-read a cycle
// ratio's digits. Drop clockTime candidates that overlap a workSchedule
// candidate's span specifically, rather than loosening compatibility for
// every entity-type pair.
function suppressClockTimeInsideWorkSchedule(candidates) {
  const scheduleSpans = candidates.filter((item) => item.entityType === 'workSchedule');
  if (!scheduleSpans.length) return candidates;
  return candidates.filter((item) => item.entityType !== 'clockTime'
    || !scheduleSpans.some((schedule) => item.start < schedule.end && schedule.start < item.end));
}

export function parseTemporal(value, context = {}) { const candidates = suppressClockTimeInsideWorkSchedule(extractTemporalCandidates(value, context)); const resolved = resolveParseCandidates(candidates); const data = Object.fromEntries(resolved.selected.map((item) => [item.entityType, item.value])); if (data.workSchedule && data.timeRange) data.workSchedule = Object.freeze({ ...data.workSchedule, workingHours: data.timeRange }); return Object.freeze({ data: Object.freeze(data), confidence: Object.freeze(Object.fromEntries(resolved.selected.map((item) => [item.entityType, item.confidence]))), debug: Object.freeze({ candidates, discardedCandidates: resolved.discarded, refinersApplied: Object.freeze(['missing-year', 'relative-date', 'duration-context', 'schedule-context', 'conflict-resolver']) }) }); }
