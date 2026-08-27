import { normalizeUnicode } from './normalization.js';

/**
 * Marketplace category headings that some sources (notably OLX) hand back in
 * place of a real listing title. They name a whole search category rather than
 * one property, so a consumer must not present them as the listing's own title.
 *
 * The English forms already embed the subject ("long-term apartment rentals"),
 * so the subject is matched as an optional trailing word rather than required.
 */
const CATEGORY = String.raw`(?:`
  + String.raw`(?:довгостроков\p{L}*|долгосрочн\p{L}*|короткостроков\p{L}*|краткосрочн\p{L}*|подобов\p{L}*|посуточн\p{L}*)\s+(?:оренда|аренда|найм)`
  + String.raw`|(?:оренда|аренда|найм|продаж|продажа)`
  + String.raw`|(?:long|short)[- ]?term\s+(?:apartment\s+|flat\s+|house\s+|room\s+)?rentals?`
  + String.raw`|(?:apartments?|flats?|houses?|rooms?)\s+for\s+(?:rent|sale)`
  + String.raw`|rentals?|daily\s+rentals?`
  + String.raw`|ijaraga\s+berish|ijara|sotuvi`
  + String.raw`)`;

const SUBJECT = String.raw`(?:`
  + String.raw`квартир\p{L}*|кімнат\p{L}*|комнат\p{L}*|будинк\p{L}*|будинків|дом\p{L}*|житл\p{L}*|нерухомост\p{L}*|недвижимост\p{L}*`
  + String.raw`|apartments?|flats?|houses?|rooms?|property|real\s+estate`
  + String.raw`|kvartira\p{L}*|uylar|xona\p{L}*`
  + String.raw`)`;

// Only a single trailing locality clause counts as part of the heading — one
// short comma- or dash-separated fragment such as ", Подільський район".
// Anything richer means the title is saying something about this property.
const LOCALITY_TAIL = String.raw`(?:\s*[,–—-]\s*[^\r\n,]{1,40})?`;

const GENERIC_TITLE_PATTERN = new RegExp(
  `^\\s*${CATEGORY}(?:\\s+${SUBJECT})?${LOCALITY_TAIL}\\s*$`,
  'iu',
);

// Digits are the cheapest proof a title says something specific: a room count,
// an area, a price or a street number. "2-к квартира, 54 м²" is a real title
// even though it opens with the same words as the category heading.
const SPECIFIC_DETAIL = /\d/u;

function titleContent(value) {
  return normalizeUnicode(value ?? '')
    .replace(
      /[\p{Extended_Pictographic}\p{Emoji_Presentation}\p{Emoji_Modifier}\p{Variation_Selector}\p{Join_Control}]/gu,
      '',
    )
    .replace(/[^\p{L}\p{N}]+/gu, '');
}

/**
 * True when the title is a marketplace category heading rather than a title
 * describing this specific property.
 */
export function isGenericHousingTitle(value) {
  const text = normalizeUnicode(value ?? '').replace(/\s+/g, ' ').trim();
  if (!text) return false;
  if (SPECIFIC_DETAIL.test(text)) return false;
  return GENERIC_TITLE_PATTERN.test(text);
}

/**
 * True when the title can stand on its own in a listing card or popup.
 *
 * Rejects titles carrying almost no letters or digits (emoji- or
 * punctuation-only) as well as marketplace category headings.
 */
export function hasMeaningfulHousingTitle(value) {
  if (titleContent(value).length < 3) return false;
  return !isGenericHousingTitle(value);
}
