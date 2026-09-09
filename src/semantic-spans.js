import { findPhoneLikeSpans } from './contact.js';
import { extractHousingMoneyCandidates } from './housing-money.js';
import { extractTemporalCandidates } from './temporal.js';

/**
 * A shared, reusable classification of text spans that already belong to
 * another semantic domain (money, contact, temporal) before any address/geo
 * parsing runs. This deliberately does not reimplement money/date/contact
 * detection — it orchestrates the existing domain extractors so a span
 * claimed by one domain (e.g. "от 1 месяца", "99 1881919", "100$ депозит")
 * can be recognized as NOT_ADDRESS evidence by any consumer, instead of each
 * parser independently growing its own local guard against the same class
 * of cross-domain contamination.
 */
export const NON_ADDRESS_SPAN_TYPE = Object.freeze({
  CONTACT: 'contact',
  MONEY: 'money',
  TEMPORAL: 'temporal',
});

function moneySpans(text, context) {
  // A bare unlabelled number (a plausible house number) must not be treated
  // as money evidence — only candidates with an explicit currency marker or
  // a recognized price keyword/scale are strong enough non-address evidence.
  return extractHousingMoneyCandidates(text, context)
    .filter((candidate) => candidate.explicitCurrency || candidate.priceKeyword || candidate.scale)
    .map((candidate) => ({ type: NON_ADDRESS_SPAN_TYPE.MONEY, start: candidate.start, end: candidate.end }));
}

function contactSpans(text, context) {
  return findPhoneLikeSpans(text, context)
    .map((span) => ({ type: NON_ADDRESS_SPAN_TYPE.CONTACT, start: span.start, end: span.end }));
}

// Calendar dates built from a literal "<day> <month-name>" pattern
// (temporal.calendar.month-name/month-first/month-end) are the one temporal
// shape that collides with real street names: many Soviet-legacy streets
// ("8 Марта", "9 Января", "1 Мая") are themselves day-plus-month-name
// phrases. Everything else temporal.js recognizes — durations, schedules,
// clock times, relative wording ("завтра", "через 3 дня") — has no such
// collision risk and is safe to treat as non-address evidence.
const CALENDAR_MONTH_NAME_PARSERS = new Set([
  'temporal.calendar.month-name',
  'temporal.calendar.month-first',
  'temporal.calendar.month-end',
]);

function temporalSpans(text, context) {
  return extractTemporalCandidates(text, context)
    .filter((candidate) => (Number(candidate.confidence) || 0) >= 0.5 && !CALENDAR_MONTH_NAME_PARSERS.has(candidate.parser))
    .map((candidate) => ({ type: NON_ADDRESS_SPAN_TYPE.TEMPORAL, start: candidate.start, end: candidate.end }));
}

const ALL_SPAN_TYPES = Object.freeze(Object.values(NON_ADDRESS_SPAN_TYPE));

/**
 * Detect spans in free-form listing/vacancy text that already belong to the
 * money, contact or temporal domain. Each span carries its type, start and
 * end offset (into the original string) so a consumer can mask or reject an
 * overlapping candidate from an unrelated parser (typically address/geo).
 *
 * Pass `context.types` (an array of NON_ADDRESS_SPAN_TYPE values) to skip
 * running the other extractors entirely — useful when a caller only cares
 * about one domain (e.g. money/contact but not temporal, since calendar-
 * date-shaped street names like "8 Марта" make TEMPORAL a poor address-line
 * exclusion signal) and wants to avoid the unused extractor's cost.
 */
export function detectNonAddressSpans(value, context = {}) {
  const text = String(value || '');
  if (!text) return Object.freeze([]);
  const types = Array.isArray(context.types) && context.types.length ? context.types : ALL_SPAN_TYPES;
  const spans = [
    ...(types.includes(NON_ADDRESS_SPAN_TYPE.CONTACT) ? contactSpans(text, context) : []),
    ...(types.includes(NON_ADDRESS_SPAN_TYPE.MONEY) ? moneySpans(text, context) : []),
    ...(types.includes(NON_ADDRESS_SPAN_TYPE.TEMPORAL) ? temporalSpans(text, context) : []),
  ];
  return Object.freeze(spans.sort((a, b) => a.start - b.start || a.end - b.end));
}

/** True when [start, end) overlaps any span in the given (sorted or unsorted) span list. */
export function overlapsAnySpan(start, end, spans) {
  return spans.some((span) => start < span.end && span.start < end);
}
