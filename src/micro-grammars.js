import { createParseCandidate } from './parser-core.js';

/** Small deterministic grammars for the compact shorthand classifieds and job
 * ads are written in. They emit ordinary parse candidates, so they run inside
 * the existing pipeline and are resolved by the existing resolvers -- there is
 * no second parser stack here.
 *
 * Several of these shapes are genuinely ambiguous between domains: "2/2" is a
 * floor fraction in a housing ad and a shift pattern in a job ad. Rather than
 * guess, an ambiguous shape emits a candidate for each reading and lets the
 * resolver and the caller's domain context decide. Passing
 * `context.domain` ('housing' or 'jobs') suppresses the readings that cannot
 * apply. */

const number = (value) => Number(String(value).replace(',', '.'));
const inRange = (value, min, max) => Number.isFinite(value) && value >= min && value <= max;

/** Floors and shifts share this shape, so neither pattern may assume a domain. */
const SLASH_PAIR_RE = /(?<![\d,.])(\d{1,2})\s*[\/\\]\s*(\d{1,3})(?![\d,.%])/gu;
const AREA_TRIPLE_RE = /(?<![\d,.])(\d{1,3}(?:[.,]\d)?)\s*[\/\\]\s*(\d{1,3}(?:[.,]\d)?)\s*[\/\\]\s*(\d{1,3}(?:[.,]\d)?)\s*(?:м²|м2|m²|m2|кв\.?\s*м|kv\.?\s*m)?/giu;
const ROOMS_RE = /(?<![\d,.])(\d{1,2})\s*[-\s]?\s*(?:к(?![\p{L}])|комн\.?|комнат(?:ная|ной|ы|а)?|кімнат\p{L}*|xona(?:li)?|хона(?:ли)?|бөлме\p{L}*|camere|bhk)/giu;
const COMMISSION_PERCENT_RE = /(?:комисси\p{L}*|комісі\p{L}*|commission|comision|komissiya|маклер\p{L}*|makler|ри[еэ]лтор\p{L}*|рієлтор\p{L}*|realtor|broker|агентств\p{L}*|vositachi|делдал)[^\d%\r\n]{0,24}(\d{1,3})\s*%/giu;
const NO_COMMISSION_RE = /(?:без\s+комисси\p{L}*|без\s+комісі\p{L}*|no\s+commission|komissiya(?:siz|\s+yo['’ʻ]?q)|0\s*%\s*комисси\p{L}*|fara\s+comision)/giu;
/** 24/48 and 12/24 are hour cycles, not day counts. */
const HOUR_CYCLE_RE = /(?<![\d,.])(\d{2})\s*[\/\\]\s*(\d{2,3})(?![\d,.%])/gu;
const RATE_RANGE_RE = /([$€₽₴₸]|\bUSD\b|\bEUR\b)?\s*(\d{1,5}(?:[.,]\d{1,2})?)\s*[-–—]\s*(\d{1,5}(?:[.,]\d{1,2})?)\s*([$€₽₴₸])?\s*(?:\/|per\s+|в\s+|за\s+)\s*(h|hr|hour|час|годину|soat|sa?at|ora|day|день|дн\p{L}*|kun|zi|month|мес\p{L}*|міс\p{L}*|oy|luna)/giu;
const EXPERIENCE_RE = /(?<![\d,.])(\d{1,2})\s*\+\s*(?:years?|yrs?|лет|год\p{L}*|рок\p{L}*|рік|yil|жыл|ani)/giu;
const LANGUAGE_LEVEL_RE = /\b([ABC][12])\s*\+/giu;

const CURRENCY_BY_SYMBOL = Object.freeze({ $: 'USD', '€': 'EUR', '₽': 'RUB', '₴': 'UAH', '₸': 'KZT', USD: 'USD', EUR: 'EUR' });
const PERIOD_BY_UNIT = Object.freeze({
  h: 'hour', hr: 'hour', hour: 'hour', час: 'hour', годину: 'hour', soat: 'hour', sat: 'hour', saat: 'hour', ora: 'hour',
  day: 'day', день: 'day', kun: 'day', zi: 'day',
  month: 'month', oy: 'month', luna: 'month',
});
const periodFor = (unit) => PERIOD_BY_UNIT[unit.toLowerCase()] ?? (/^(?:дн|мес|міс)/iu.test(unit) ? (/^(?:мес|міс)/iu.test(unit) ? 'month' : 'day') : 'day');

function candidate(entityType, value, match, parser, confidence, evidence = []) {
  const start = match.index ?? 0;
  return createParseCandidate({
    id: `${entityType}:${start}`, entityType, value: Object.freeze(value),
    raw: match[0], start, end: start + match[0].length, parser, confidence, evidence,
  });
}

/** Every micro-grammar candidate for `text`. Domain-agnostic by default. */
export function extractMicroGrammarCandidates(value, context = {}) {
  const text = String(value ?? '');
  const domain = context.domain ?? null;
  const housing = domain === null || domain === 'housing';
  const jobs = domain === null || domain === 'jobs';
  const found = [];
  const taken = [];
  /** A longer reading of the same span wins: "42/28/8" is one area triple, not
   * a floor fraction followed by a stray number. */
  const claim = (match) => {
    const start = match.index ?? 0, end = start + match[0].length;
    if (taken.some((span) => start < span.end && span.start < end)) return false;
    taken.push({ start, end });
    return true;
  };

  if (housing) {
    for (const match of text.matchAll(AREA_TRIPLE_RE)) {
      const [total, living, kitchen] = [number(match[1]), number(match[2]), number(match[3])];
      if (!inRange(total, 10, 500) || !inRange(living, 5, 500) || !inRange(kitchen, 2, 100)) continue;
      if (living >= total || kitchen >= total) continue;
      if (!claim(match)) continue;
      found.push(candidate('areaBreakdown', { totalSqm: total, livingSqm: living, kitchenSqm: kitchen }, match, 'micro.housing.area-triple', 0.9,
        [{ dimension: 'lexical', source: 'micro.area-triple', weight: 1 }]));
    }
    for (const match of text.matchAll(ROOMS_RE)) {
      const rooms = number(match[1]);
      if (!inRange(rooms, 1, 12) || !claim(match)) continue;
      found.push(candidate('rooms', { rooms }, match, 'micro.housing.rooms', 0.92,
        [{ dimension: 'lexical', source: 'micro.rooms', weight: 1 }]));
    }
    for (const match of text.matchAll(NO_COMMISSION_RE)) {
      if (!claim(match)) continue;
      found.push(candidate('commission', { percent: 0, charged: false }, match, 'micro.housing.no-commission', 0.95,
        [{ dimension: 'lexical', source: 'micro.commission', weight: 1 }]));
    }
    for (const match of text.matchAll(COMMISSION_PERCENT_RE)) {
      const percent = number(match[1]);
      if (!inRange(percent, 0, 100) || !claim(match)) continue;
      found.push(candidate('commission', { percent, charged: percent > 0 }, match, 'micro.housing.commission-percent', 0.93,
        [{ dimension: 'lexical', source: 'micro.commission', weight: 1 }]));
    }
  }

  if (jobs) {
    for (const match of text.matchAll(RATE_RANGE_RE)) {
      const min = number(match[2]), max = number(match[3]);
      if (!Number.isFinite(min) || !Number.isFinite(max) || max < min || !claim(match)) continue;
      const symbol = match[1] || match[4];
      found.push(candidate('rateRange', {
        min, max,
        currency: symbol ? CURRENCY_BY_SYMBOL[symbol] ?? CURRENCY_BY_SYMBOL[symbol.toUpperCase()] ?? null : null,
        period: periodFor(match[5]),
      }, match, 'micro.jobs.rate-range', 0.9, [{ dimension: 'lexical', source: 'micro.rate', weight: 1 }]));
    }
    for (const match of text.matchAll(EXPERIENCE_RE)) {
      const years = number(match[1]);
      if (!inRange(years, 0, 50) || !claim(match)) continue;
      found.push(candidate('experienceYears', { minYears: years }, match, 'micro.jobs.experience', 0.93,
        [{ dimension: 'lexical', source: 'micro.experience', weight: 1 }]));
    }
    for (const match of text.matchAll(LANGUAGE_LEVEL_RE)) {
      if (!claim(match)) continue;
      found.push(candidate('languageLevel', { level: match[1].toUpperCase(), orHigher: true }, match, 'micro.jobs.language-level', 0.95,
        [{ dimension: 'lexical', source: 'micro.language', weight: 1 }]));
    }
    for (const match of text.matchAll(HOUR_CYCLE_RE)) {
      const on = number(match[1]), off = number(match[2]);
      // 24/48 and 12/24 only: two-digit pairs that are not plausible day counts.
      if (!(on >= 8 && on <= 24 && off >= 8 && off <= 168) || !claim(match)) continue;
      found.push(candidate('workSchedule', { onHours: on, offHours: off, kind: 'hour-cycle' }, match, 'micro.jobs.hour-cycle', 0.85,
        [{ dimension: 'lexical', source: 'micro.schedule', weight: 1 }]));
    }
  }

  // Slash pairs last: whatever the longer grammars did not claim. A pair is a
  // floor fraction for housing and a shift pattern for jobs, and with no
  // domain both readings are emitted for the resolver to choose between.
  for (const match of text.matchAll(SLASH_PAIR_RE)) {
    const left = number(match[1]), right = number(match[2]);
    if (!claim(match)) continue;
    if (housing && inRange(left, 0, 40) && inRange(right, 1, 40) && left <= right) {
      found.push(candidate('floorFraction', { floor: left, totalFloors: right }, match, 'micro.housing.floor-fraction', 0.85,
        [{ dimension: 'lexical', source: 'micro.floor', weight: 1 }]));
    }
    if (jobs && inRange(left, 1, 7) && inRange(right, 1, 7)) {
      found.push(candidate('workSchedule', { onDays: left, offDays: right, kind: 'day-cycle' }, match, 'micro.jobs.shift-pattern', 0.8,
        [{ dimension: 'lexical', source: 'micro.schedule', weight: 1 }]));
    }
  }

  return Object.freeze(found.sort((a, b) => a.start - b.start || a.entityType.localeCompare(b.entityType)));
}

/** Pipeline-shaped parser, for use in `runCandidatePipeline({ parsers: [...] })`. */
export function microGrammarParser(input) {
  return extractMicroGrammarCandidates(input?.originalText ?? input?.document?.original ?? '', input?.context ?? {});
}
