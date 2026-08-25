// Generic contact-number detection for shared parsers.
// The goal is classification/exclusion, not phone-number validation by country.

const PHONE_LIKE_RE = /\+?\d(?:[\t \u00a0().-]*\d){9,}/g;

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
