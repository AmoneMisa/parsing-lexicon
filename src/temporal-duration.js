import { candidate } from './temporal-shared.js';

/**
 * DurationParser: a length of time with an optional bound (min/max/exact)
 * — "3 месяца", "от 3х мес.", "минимум 3 месяца", "на полгода". Semantic
 * purpose (rental duration vs probation vs contract vs generic) is
 * resolved by semanticDurationType from surrounding context, not by the
 * raw duration reading itself.
 */

const DURATION_PREFIX = String.raw`(?:от|минимум|не\s+менее|kamida|eng\s+kam|кемінде|не\s+менш(?:е)?|at\s+least|до|не\s+более|ko'?pi\s+bilan|көп\s+емес|на|uchun|pe\s+o\s+perioadă\s+de)`;
const DURATION_UNIT = String.raw`(?:полгода|год(?:а|ов)?|yil(?:ga)?|жыл(?:ға)?|рок(?:и|ів)?|an(?:i)?|месяц(?:а|ев)?|мес\.?|oy(?:ga)?|місяц(?:і|ів|я)?|luni?|недел[ьяи]|hafta(?:ga)?|апта(?:ға)?|тиж(?:день|ні|нів|ня)|săptămân\p{L}*|saptaman\p{L}*|дн(?:я|ей)?|день|kun(?:ga)?|күн(?:ге)?|день|днів|дні|zi(?:le)?|час(?:а|ов)?|soat(?:ga)?|сағат(?:қа)?|годин(?:а|и|у)?|ore?|мин(?:ут[аы]?|\.)?|daqiqa|минут\p{L}*|minute?)`;
const DURATION_RE = new RegExp(String.raw`(?<![\p{L}\p{N}])(?:(` + DURATION_PREFIX + String.raw`)(?:\s+на)?\s*)?(` + DURATION_UNIT + String.raw`)(?:\s*)?(\d+(?:[.,]\d+)?)?(?![\p{L}\p{N}])`, 'iu');
const DURATION_NUMBER_FIRST_RE = new RegExp(String.raw`(?<![\p{L}\p{N}])(?:(` + DURATION_PREFIX + String.raw`)(?:\s+на)?\s*)?(\d+(?:[.,]\d+)?)(?:-?х)?\s*(` + DURATION_UNIT + String.raw`)(?![\p{L}\p{N}])`, 'iu');

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

export function extractDurationCandidates(text) {
  const candidates = [];
  for (const match of text.matchAll(new RegExp(DURATION_NUMBER_FIRST_RE, 'giu'))) { const value = durationValue(match[1], match[2], match[3]); candidates.push(candidate(semanticDurationType(text, match.index ?? 0, value), value, match, 'temporal.duration.number-unit', .95, [{ type: 'unit', value: match[3] }, ...(match[1] ? [{ type: 'prefix', value: match[1] }] : [])])); }
  for (const match of text.matchAll(new RegExp(DURATION_RE, 'giu'))) {
    if (match[3]) continue;
    // Bare genitive "дня" is almost always part of another phrase ("конца
    // дня", "сегодняшнего дня", "через 2 дня") rather than a standalone
    // 1-day duration. Only accept it here when an explicit duration prefix
    // ("на", "минимум", ...) makes the duration reading unambiguous.
    if (!match[1] && /^дня$/iu.test(match[2])) continue;
    const value = durationValue(match[1], match[3], match[2]); candidates.push(candidate(semanticDurationType(text, match.index ?? 0, value), value, match, 'temporal.duration.word-unit', .94, [{ type: 'unit', value: match[2] }, ...(match[1] ? [{ type: 'prefix', value: match[1] }] : [])]));
  }
  return candidates;
}
