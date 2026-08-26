import { parsePhoneNumberFromString } from 'libphonenumber-js/min';

// Broad phone-like detection used by other parsers for exclusion/classification.
// It deliberately stays tolerant and does not validate against a country plan.
const PHONE_LIKE_RE = /\+?\d(?:[\t \u00a0().-]*\d){9,}/g;

// Contact extraction may start from shorter national formats, but candidates are
// only returned after libphonenumber validation.
const PHONE_CANDIDATE_RE = /\+?\d(?:[\t \u00a0().-]*\d){6,}(?:[\t \u00a0]*(?:ext\.?|extension|x|доб\.?|дод\.?)\s*\d{1,6})?/giu;

function normalizedCountryHint(value) {
  const country = String(value || '').trim().toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : undefined;
}

export function findPhoneLikeSpans(value) {
  const text = String(value || '');
  const spans = [];
  for (const match of text.matchAll(PHONE_LIKE_RE)) {
    const raw = match[0];
    const digits = raw.replace(/\D/g, '');
    if (digits.length < 10) continue;
    const start = match.index ?? 0;
    spans.push(Object.freeze({
      start,
      end: start + raw.length,
      raw,
      digits,
    }));
  }
  return Object.freeze(spans);
}

export function maskPhoneLikeSpans(value, replacement = ' ') {
  const text = String(value || '');
  const spans = findPhoneLikeSpans(text);
  if (!spans.length) return text;

  let out = '';
  let cursor = 0;
  for (const span of spans) {
    out += text.slice(cursor, span.start);
    out += replacement;
    cursor = span.end;
  }
  return out + text.slice(cursor);
}

export function parsePhoneNumbers(value, options = {}) {
  const text = String(value || '');
  const countryHint = normalizedCountryHint(options.countryHint);
  const includePossible = options.includePossible === true;
  const out = [];
  const seen = new Set();

  for (const match of text.matchAll(PHONE_CANDIDATE_RE)) {
    const raw = match[0].trim();
    const parsed = parsePhoneNumberFromString(raw, countryHint);
    if (!parsed) continue;
    if (!parsed.isValid() && !(includePossible && parsed.isPossible())) continue;

    const key = `${parsed.number}:${parsed.ext || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const start = match.index ?? 0;
    out.push(Object.freeze({
      start,
      end: start + match[0].length,
      raw,
      digits: raw.replace(/\D/g, ''),
      number: parsed.number,
      nationalNumber: parsed.nationalNumber,
      country: parsed.country || null,
      countryCallingCode: parsed.countryCallingCode,
      extension: parsed.ext || null,
      valid: parsed.isValid(),
      possible: parsed.isPossible(),
    }));
  }

  return Object.freeze(out);
}

export function normalizePhone(value, options = {}) {
  return parsePhoneNumbers(value, options)[0] || null;
}
