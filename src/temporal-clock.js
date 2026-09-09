import { SCHEDULE_CONTEXT_RE } from './temporal-schedule.js';
import { candidate } from './temporal-shared.js';

/**
 * ClockTimeParser + TimeRangeRefiner: a time-of-day ("07:00", "7 утра")
 * and time ranges ("с 07.00 до 19.00", "22:00-06:00", detecting an
 * overnight range that crosses midnight). A bare clock time is only kept
 * when it carries an am/pm-style suffix or nearby schedule-context
 * wording — otherwise a bare "7" is at least as likely to be a price or
 * an unrelated number, so it stays unresolved.
 */

export const TIME_SUFFIX = String.raw`(?:am|pm|утра|вечера|ранку|вечора|ertalab|kechqurun)`;
const TIME_RE = new RegExp(String.raw`(?<![\d.:])(\d{1,2})(?:[:.](\d{2}))?\s*(${TIME_SUFFIX})?(?![\d.:])`, 'iu');
const TIME_RANGE_RE = new RegExp(String.raw`(?:с|з|from|dan)?\s*(\d{1,2}(?:[:.]\d{2})?\s*${TIME_SUFFIX}?)\s*(?:до|to|gacha|дейін|чейин|-|–|—)\s*(\d{1,2}(?:[:.]\d{2})?\s*${TIME_SUFFIX}?)`, 'iu');

export function parseClock(raw) { const match = String(raw).trim().match(new RegExp(String.raw`^(\d{1,2})(?:[:.](\d{2}))?\s*(${TIME_SUFFIX})?$`, 'iu')); if (!match) return null; let hour = Number(match[1]); const minute = Number(match[2] || 0); const suffix = String(match[3] || '').toLowerCase(); if (suffix === 'pm' && hour < 12) hour += 12; if (suffix === 'am' && hour === 12) hour = 0; if (/(?:вечера|вечора|kechqurun)/u.test(suffix) && hour < 12) hour += 12; return hour < 24 && minute < 60 ? Object.freeze({ hour, minute }) : null; }

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

export function extractClockCandidates(text) {
  const candidates = [];
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
  return candidates;
}
