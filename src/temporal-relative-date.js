import { nextWeekday, DAY_ALIASES, DAY_PATTERN } from './temporal-weekday.js';
import { addUtcDays, candidate, referenceDate, referenceEntry, temporalContextType } from './temporal-shared.js';

/**
 * RelativeDateParser: dates expressed relative to the reference date —
 * "сегодня"/"завтра"/"через 3 дня", and "next <weekday>". Semantic role
 * (availabilityDate/startDate/plain relativeDate) is assigned by
 * temporalContextType based on nearby wording, not by this parser.
 */

const RELATIVE_RE = /(?<![\p{L}\p{N}])(?:с\s+|з\s+|dan\s+)?(послезавтрашн\p{L}*\s+дн\p{L}*|сегодняшн\p{L}*\s+дн\p{L}*|завтрашн\p{L}*\s+дн\p{L}*|післязавтрашн\p{L}*\s+дн\p{L}*|сьогоднішн\p{L}*\s+дн\p{L}*|сегодня|завтра|послезавтра|сьогодні|післязавтра|bugun|ertaga|indin|бүгін|ертең|бүрсігүні|бүгүн|эртең|бүрсүгүнү|astăzi|azi|mâine|maine|poimâine|poimaine|today|tomorrow|day\s+after\s+tomorrow|через\s+(\d+|неделю|две\s+недели)\s*(?:дн(?:я|ей)?|день|недел[ьюи])?)(?![\p{L}\p{N}])/giu;
const EXTENDED_RELATIVE_RE = /(?<![\p{L}\p{N}])(?:через\s+(\d+)\s+(дні|днів|тижд(?:ень|ні|нів|ня))|peste\s+(\d+)\s+(zile?|săptămân(?:ă|i)|saptaman(?:a|i))|(\d+)\s+(күннен|аптадан|кун(?:дөн|дон)|жумадан)\s+(?:кейін|кийин))(?![\p{L}\p{N}])/giu;
const NEXT_WEEKDAY_RE = new RegExp(`(?<![\\p{L}\\p{N}])(?:со?\\s+следующ(?:его|ей)\\s+|з\\s+наступн(?:ого|ої)\\s+|next\\s+)(${DAY_PATTERN})(?![\\p{L}\\p{N}])`, 'giu');

function relativeDays(raw) { const lower = raw.toLowerCase(); if (/сегодня|сьогодні|bugun|бүгін|бүгүн|astăzi|azi|today/u.test(lower)) return 0; if (/послезавтра|післязавтра|indin|бүрсігүні|бүрсүгүнү|poimâine|poimaine|day\s+after/u.test(lower)) return 2; if (/завтра|ertaga|ертең|эртең|mâine|maine|tomorrow/u.test(lower)) return 1; if (/две\s+недели/u.test(lower)) return 14; if (/неделю/u.test(lower)) return 7; const numeric = Number(lower.match(/\d+/u)?.[0]); return Number.isFinite(numeric) ? numeric : null; }
function relativeDurationDays(amount, unit) {
  const value = Number(amount);
  if (!Number.isFinite(value) || value < 0) return null;
  return /(?:тиж|săptăm|saptaman|апта|жума)/iu.test(unit) ? value * 7 : value;
}

export function extractRelativeDateCandidates(text, context = {}) {
  const candidates = [];
  for (const match of text.matchAll(NEXT_WEEKDAY_RE)) {
    const weekday = DAY_ALIASES[match[1].toLowerCase()]; if (weekday == null) continue;
    candidates.push(candidate(temporalContextType(text, match.index ?? 0, context), nextWeekday(referenceDate(context), weekday), match, 'temporal.relative.next-weekday', .9, [{ type: 'dictionary', dictionary: 'weekdays', key: match[1] }, { type: 'reference-date', value: referenceEntry(context).source }]));
  }
  for (const match of text.matchAll(RELATIVE_RE)) { const days = relativeDays(match[1]); if (days == null) continue; const type = temporalContextType(text, match.index ?? 0, context); candidates.push(candidate(type, addUtcDays(referenceDate(context), days), match, 'temporal.relative-date', .91, [{ type: 'context', value: `relative:${days}d` }, { type: 'reference-date', value: referenceEntry(context).source }])); }
  for (const match of text.matchAll(EXTENDED_RELATIVE_RE)) {
    const amount = match[1] || match[3] || match[5];
    const unit = match[2] || match[4] || match[6];
    const days = relativeDurationDays(amount, unit);
    if (days == null) continue;
    const type = temporalContextType(text, match.index ?? 0, context);
    candidates.push(candidate(type, addUtcDays(referenceDate(context), days), match, 'temporal.relative-date.extended', .91, [{ type: 'context', value: `relative:${days}d` }, { type: 'unit', value: unit }, { type: 'reference-date', value: referenceEntry(context).source }]));
  }
  return candidates;
}
