import { parsePhoneNumberFromString } from 'libphonenumber-js/min';

// Broad phone-like detection used by other parsers for exclusion/classification.
// It deliberately stays tolerant and does not validate against a country plan.
const PHONE_LIKE_RE = /\+?\d(?:[\t \u00a0().-]*\d){9,}/g;

// Contact extraction may start from shorter national formats, but candidates are
// only returned after libphonenumber validation.
const PHONE_CANDIDATE_RE = /\+?\d(?:[\t \u00a0().-]*\d){6,}(?:[\t \u00a0]*(?:ext\.?|extension|x|доб\.?|дод\.?)\s*\d{1,6})?/giu;
const PHONE_EXTENSION_RE = /[\t \u00a0]*(?:ext\.?|extension|x|доб\.?|дод\.?)\s*(\d{1,6})$/iu;

const TELEGRAM_USERNAME_RE = /^[A-Za-z0-9_]{5,32}$/;
const TELEGRAM_LINK_RE = /(?:https?:\/\/)?(?:t\.me|telegram\.me|telegram\.dog)\/([A-Za-z0-9_]{5,32})(?:\/[0-9]+)?(?:[/?#][^\s]*)?/giu;
const TELEGRAM_TG_RE = /tg:\/\/resolve\?[^\s]*?\bdomain=([A-Za-z0-9_]{5,32})\b[^\s]*/giu;
const TELEGRAM_MENTION_RE = /(^|[^\p{L}\p{N}_@])@([A-Za-z0-9_]{5,32})\b/gu;

function normalizedCountryHint(value) {
  const country = String(value || '').trim().toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : undefined;
}

function splitPhoneExtension(raw) {
  const match = String(raw || '').match(PHONE_EXTENSION_RE);
  if (!match) return { base: String(raw || '').trim(), extension: null };
  return {
    base: String(raw || '').slice(0, match.index).trim(),
    extension: match[1] || null,
  };
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
    const { base, extension } = splitPhoneExtension(raw);
    const parsed = parsePhoneNumberFromString(base, countryHint);
    if (!parsed) continue;
    const valid = parsed.isValid();
    const possible = parsed.isPossible();
    if (!valid && !(includePossible && possible)) continue;

    const key = `${parsed.number}:${extension || parsed.ext || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const start = match.index ?? 0;
    out.push(Object.freeze({
      start,
      end: start + match[0].length,
      raw,
      digits: base.replace(/\D/g, ''),
      number: parsed.number,
      nationalNumber: parsed.nationalNumber,
      national: parsed.formatNational(),
      international: parsed.formatInternational(),
      country: parsed.country || null,
      countryCallingCode: parsed.countryCallingCode,
      extension: extension || parsed.ext || null,
      valid,
      possible,
    }));
  }

  return Object.freeze(out);
}

export function normalizePhone(value, options = {}) {
  return parsePhoneNumbers(value, options)[0] || null;
}

function telegramContact(username, raw, start, source) {
  const normalized = String(username || '').replace(/^@/, '');
  if (!TELEGRAM_USERNAME_RE.test(normalized)) return null;
  return Object.freeze({
    start,
    end: start + raw.length,
    raw,
    username: normalized,
    handle: `@${normalized}`,
    url: `https://t.me/${normalized}`,
    source,
  });
}

/**
 * Extract public Telegram username contacts from mentions and links.
 * Message/channel transport parsing stays in consumers; this helper owns only
 * reusable contact normalization.
 */
export function findTelegramContacts(value) {
  const text = String(value || '');
  const found = [];
  const seen = new Set();

  const push = (username, raw, start, source) => {
    const contact = telegramContact(username, raw, start, source);
    if (!contact) return;
    const key = contact.username.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    found.push(contact);
  };

  for (const match of text.matchAll(TELEGRAM_LINK_RE)) {
    push(match[1], match[0], match.index ?? 0, 'url');
  }
  for (const match of text.matchAll(TELEGRAM_TG_RE)) {
    push(match[1], match[0], match.index ?? 0, 'tg');
  }
  for (const match of text.matchAll(TELEGRAM_MENTION_RE)) {
    const prefix = match[1] || '';
    const raw = `@${match[2]}`;
    push(match[2], raw, (match.index ?? 0) + prefix.length, 'mention');
  }

  return Object.freeze(found.sort((a, b) => a.start - b.start));
}

export function normalizeTelegramContact(value) {
  return findTelegramContacts(value)[0] || null;
}
