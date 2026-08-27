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
  // ro: "închiriere pe termen lung/scurt", "apartamente de vânzare" (subject
  // leads here, so this alt embeds its own subject like the English "for
  // rent/sale" form above), bare "închiriere"/"chirie"/"vânzare"
  + String.raw`|(?:închiri\p{L}*|inchiri\p{L}*)\s+pe\s+termen\s+(?:lung|scurt)`
  + String.raw`|(?:apartament\p{L}*|cas[aă]\p{L}*|case\p{L}*)\s+de\s+(?:vânzare|vanzare|închiriat|inchiriat)`
  + String.raw`|închiri\p{L}*|inchiri\p{L}*|chirie\p{L}*|vânz\p{L}*|vanz\p{L}*`
  // kk: "жалдау"/"жалға"/"жалға беру" (long rent), "ұзақ мерзімге жалдау"
  // (long rent, spelled out), "тәуліктік жалдау" (short rent), "сату"/"сатылым"
  + String.raw`|ұзақ\s+мерзімге\s+жалд\p{L}*|тәулік\p{L}*\s+жалд\p{L}*`
  + String.raw`|жалд\p{L}*|жалғ\p{L}*(?:\s+беру\p{L}*)?|сат\p{L}*`
  + String.raw`)`;

const SUBJECT = String.raw`(?:`
  + String.raw`квартир\p{L}*|кімнат\p{L}*|комнат\p{L}*|будинк\p{L}*|будинків|дом\p{L}*|житл\p{L}*|нерухомост\p{L}*|недвижимост\p{L}*`
  + String.raw`|apartments?|flats?|houses?|rooms?|property|real\s+estate`
  + String.raw`|kvartira\p{L}*|uylar|xona\p{L}*`
  + String.raw`|apartament\p{L}*|cameră\p{L}*|camera\p{L}*|cas[aă]\p{L}*|case\p{L}*|locuinț\p{L}*|locuinta\p{L}*`
  + String.raw`|пәтер\p{L}*|бөлме\p{L}*|үй\p{L}*`
  + String.raw`)`;

// Trailing locality clauses, comma- or dash-separated, such as
// ", Подільський район, біля станції метро". Each clause is capped in length
// so this stays a location tail rather than swallowing real content — but a
// digit anywhere still wins first via SPECIFIC_DETAIL, which is the actual
// guard against misreading a real title as generic.
const LOCALITY_TAIL = String.raw`(?:\s*[,–—-]\s*[^\r\n,]{1,40}){0,3}`;

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
