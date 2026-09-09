import { parsePhoneNumberFromString } from 'libphonenumber-js/min';
import { moneyCurrencyPattern } from './money-core.js';

// Broad phone-like detection used by other parsers for exclusion/classification.
// It deliberately stays tolerant and does not validate against a country plan.
const PHONE_LIKE_RE = /\+?\d(?:[\t \u00a0().-]*\d){9,}/g;

// Contact extraction may start from shorter national formats, but candidates are
// only returned after libphonenumber validation.
const PHONE_EXTENSION_ALTERNATION = 'ext\\.?|extension|x|доб\\.?|дод\\.?';
const PHONE_CANDIDATE_RE = new RegExp(`\\+?\\d(?:[\\t \\u00a0().-]*\\d){6,}(?:[\\t \\u00a0]*(?:${PHONE_EXTENSION_ALTERNATION})\\s*\\d{1,6})?`, 'giu');
const PHONE_EXTENSION_RE = new RegExp(`[\\t \\u00a0]*(?:${PHONE_EXTENSION_ALTERNATION})\\s*(\\d{1,6})$`, 'iu');
const DATE_LIKE_PHONE_RE = /^\d{1,2}[./-]\d{1,2}[./-](?:\d{2}|\d{4})(?:\s+\d{1,2})?$/u;
const PRICE_LABEL_BEFORE_NUMBER_RE = /(?:цена|ціна|нарх(?:и)?|narx(?:i)?|price|стоимост[ьи]|аренд(?:а|ная\s+плата)?|rent)\s*[:=\-–—]?\s*$/iu;
// A currency term/symbol adjacent to a hyphenated digit span is evidence of a
// price range even without an explicit label word ("50000-60000 сум"); a bare
// phone number never carries one. Both sides are fully bounded (unlike
// housing-money.js's number-adjacent variant) since this only scans nearby
// window text, not text touching the digits themselves.
const CURRENCY_TERM_NEARBY_RE = new RegExp(`(?<![\\p{L}\\p{N}_])(?:${moneyCurrencyPattern()})(?![\\p{L}\\p{N}_])`, 'iu');

// Real Telegram usernames must start with a letter (Telegram itself rejects
// a digit-led one), so a digit-led "handle" like "@12345_promo" is more
// likely an order/SKU code than a contact.
const TELEGRAM_USERNAME_RE = /^[A-Za-z][A-Za-z0-9_]{4,31}$/;
const TELEGRAM_LINK_RE = /(?:https?:\/\/)?(?:t\.me|telegram\.me|telegram\.dog)\/([A-Za-z0-9_]{5,32})(?:\/[0-9]+)?(?:[/?#][^\s]*)?/giu;
const TELEGRAM_TG_RE = /tg:\/\/resolve\?[^\s]*?\bdomain=([A-Za-z0-9_]{5,32})\b[^\s]*/giu;
const TELEGRAM_MENTION_RE = /(^|[^\p{L}\p{N}_@])@([A-Za-z0-9_]{5,32})\b/gu;
// Reserved t.me path segments (joinchat/share/... carry no real handle) and
// app-name mentions people write as "@Telegram"/"@WhatsApp" — neither is a
// contactable personal username.
const RESERVED_TELEGRAM_NAME_RE = /^(?:joinchat|share|addstickers|addtheme|addemoji|confirmphone|login|proxy|socks|iv|s|boost|giftcode|setlanguage|telegram|whatsapp|viber|instagram|facebook)$/iu;

function normalizedCountryHint(value) {
  const country = String(value || '').trim().toUpperCase();
  return /^[A-Z]{2}$/.test(country) ? country : undefined;
}

// PHONE_LIKE_RE deliberately accepts punctuation-separated digit sequences.
// That also resembles a grouped monetary range such as
// "Narxi: 950 000 - 1.000.000".  A nearby explicit price label is stronger
// semantic evidence than the broad (unvalidated) ten-digit phone mask, so do
// not hide that span before the money candidate parser sees it.  This does
// not weaken validated national-phone parsing below.
function isExplicitPriceSpan(text, start, raw) {
  if (!/[\-–—]/u.test(raw)) return false;
  const before = text.slice(Math.max(0, start - 48), start);
  if (PRICE_LABEL_BEFORE_NUMBER_RE.test(before)) return true;
  const end = start + raw.length;
  const after = text.slice(end, Math.min(text.length, end + 24));
  return CURRENCY_TERM_NEARBY_RE.test(before) || CURRENCY_TERM_NEARBY_RE.test(after);
}

function splitPhoneExtension(raw) {
  const match = String(raw || '').match(PHONE_EXTENSION_RE);
  if (!match) return { base: String(raw || '').trim(), extension: null };
  return {
    base: String(raw || '').slice(0, match.index).trim(),
    extension: match[1] || null,
  };
}

export function findPhoneLikeSpans(value, options = {}) {
  const text = String(value || '');
  const countryHint = normalizedCountryHint(options.country || options.countryHint);
  const spans = [];
  for (const match of text.matchAll(PHONE_LIKE_RE)) {
    const raw = match[0];
    const digits = raw.replace(/\D/g, '');
    if (digits.length < 10) continue;
    const start = match.index ?? 0;
    if (isExplicitPriceSpan(text, start, raw)) continue;
    spans.push(Object.freeze({
      start,
      end: start + raw.length,
      raw,
      digits,
    }));
  }

  // Uzbekistan's ordinary national presentation is nine digits (for example
  // 99 188 19 19).  It is too short for the deliberately country-neutral
  // broad mask above, but libphonenumber can validate/identify it when the
  // caller has already established UZ context.  Do not generalize this to all
  // countries: a bare nine digit number is often a price or a house number.
  if (countryHint === 'UZ') {
    for (const candidate of parsePhoneNumbers(text, { countryHint, includePossible: true })) {
      // The short masking exception is intentionally narrow. `99` is a
      // common Uzbekistan mobile prefix in listings; accepting every possible
      // nine-digit national number would hide legitimate UZS sale prices.
      if (candidate.digits.length !== 9 || !candidate.digits.startsWith('99') || !candidate.possible) continue;
      if (spans.some((span) => span.start <= candidate.start && span.end >= candidate.end)) continue;
      spans.push(Object.freeze({
        start: candidate.start,
        end: candidate.end,
        raw: candidate.raw,
        digits: candidate.digits,
      }));
    }
  }
  return Object.freeze(spans.sort((a, b) => a.start - b.start || b.end - a.end));
}

export function maskPhoneLikeSpans(value, replacement = ' ', options = {}) {
  // Backward-compatible convenience: maskPhoneLikeSpans(value, { country }).
  if (replacement && typeof replacement === 'object') {
    options = replacement;
    replacement = ' ';
  }
  const text = String(value || '');
  const spans = findPhoneLikeSpans(text, options);
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
    // Date stamps frequently contain enough digits to look phone-like before
    // a following colon (for example "29.08.2026 10:15"). They are temporal
    // evidence, never public contact details.
    if (DATE_LIKE_PHONE_RE.test(raw)) continue;
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
  if (!TELEGRAM_USERNAME_RE.test(normalized) || RESERVED_TELEGRAM_NAME_RE.test(normalized)) return null;
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

export function parsePrimaryContact(value) {
  const text = String(value || '');
  if (!text) return null;
  const intl = text.match(/\+\d[\d\s().-]{7,}\d/);
  if (intl) {
    const digits = intl[0].replace(/\D/g, '');
    if (digits.length >= 10 && digits.length <= 15) return `+${digits}`;
  }
  // Bounded like the `trailing` keyword below: "тел"/"phone" must be a whole
  // word, not a suffix of an unrelated word ("хостел", "котел").
  // Widened beyond bare stems to cover the conjugated imperative forms
  // ('Звоните', 'Позвоните', 'Наберите', 'Дзвоніть') that are the actual
  // everyday phrasing in CIS classifieds — the bare stems alone missed them.
  const keyword = text.match(/(?<![\p{L}\p{N}_])(?:tel|тел|phone|моб|whats?app|viber|telegram|(?:по|пере|за)?звонит\p{L}*|(?:за|під)?дзвоніть\p{L}*|звоніть\p{L}*|наберит\p{L}*|номер\p{L}*|aloqa|byla|contact)(?![\p{L}\p{N}_])[^\d+]{0,20}(\+?\d[\d\s().-]{6,}\d)/iu);
  if (keyword) {
    const digits = keyword[1].replace(/\D/g, '');
    if (digits.length >= 9 && digits.length <= 15) return keyword[1].trim();
  }
  const trailing = text.match(/(\+?\d[\d\s().-]{6,}\d)\s*(?:tel|тел(?:ефон)?|phone|моб|whats?app|viber|telegram|aloqa|contact)(?=$|[^\p{L}\p{N}_])/iu);
  if (trailing) {
    const digits = trailing[1].replace(/\D/g, '');
    if (digits.length >= 9 && digits.length <= 15) return trailing[1].trim();
  }
  return findTelegramContacts(text)[0]?.handle || null;
}

