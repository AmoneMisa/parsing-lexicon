const PHONE_RUN_RE = /\+?\d[\d\s().-]{7,}\d/gu;
const ADDRESS_LABEL_RE = /(?:адрес|адреса|адресація|адресация|manzil|address|adresă|adresa)\s*[:=\-–—]\s*/iu;
const STREET_MARKER = String.raw`(?:ул(?:ица)?|вул(?:иця)?|просп(?:ект)?|пр-т|переул(?:ок)?|пров(?:улок)?|проезд|наб(?:ережная)?|шоссе|str(?:ada)?\.?|street|st\.?|avenue|ave\.?|road|rd\.?|ko['’ʼ\u02bc]?cha(?:si)?|кўча(?:си)?|көше)`;
const HOUSE_MARKER = String.raw`(?:дом|д\.|будинок|буд\.|house|h\.|uy|уй|nr\.?|no\.?|№)`;
const BUILDING_MARKER = String.raw`(?:корп(?:ус)?\.?|к\.|строен(?:ие)?|стр\.|будова|секц(?:ия|ія)?|bloc|corp|building|bldg\.?|korpus)`;
const NUMBER_TOKEN = String.raw`\d{1,5}[\p{L}]?(?:[\/-]\d{1,4}[\p{L}]?)?`;
const STREET_NAME = String.raw`[\p{L}\p{M}][\p{L}\p{M}\d'’ʼ.\- ]{1,78}?`;

function clean(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(PHONE_RUN_RE, (segment) => segment.replace(/\D/gu, '').length >= 9 ? ' ' : segment)
    .replace(/[\t\f\v]+/gu, ' ')
    .replace(/\s{2,}/gu, ' ')
    .replace(/^[\s,;:.\-–—]+|[\s,;:.\-–—]+$/gu, '')
    .trim();
}

function compactStreet(value) {
  return clean(value)
    .replace(new RegExp(`^${STREET_MARKER}\\s*`, 'iu'), '')
    .replace(/[\s,;:.\-–—]+$/gu, '')
    .trim() || null;
}

function normalizeNumber(value) {
  const result = clean(value).replace(/\s+/gu, '');
  return result || null;
}

function result(address, street = null, houseNumber = null, building = null, confidence = 0) {
  return Object.freeze({
    address: clean(address) || null,
    street: compactStreet(street),
    houseNumber: normalizeNumber(houseNumber),
    building: normalizeNumber(building),
    confidence,
  });
}

function explicitStreetAddress(text) {
  const re = new RegExp(
    `(${STREET_MARKER})\\s+(${STREET_NAME})(?:\\s*[,;]?\\s*(?:${HOUSE_MARKER})?\\s*(${NUMBER_TOKEN}))?(?:\\s*[,;]?\\s*${BUILDING_MARKER}\\s*(${NUMBER_TOKEN}))?`,
    'iu',
  );
  const match = text.match(re);
  if (!match) return null;
  const address = [match[1], match[2], match[3], match[4] ? `корп. ${match[4]}` : null].filter(Boolean).join(' ');
  return result(address, match[2], match[3], match[4], match[3] ? 1 : 0.9);
}

function labelledAddress(text) {
  const label = text.match(ADDRESS_LABEL_RE);
  if (!label) return null;
  const start = (label.index ?? 0) + label[0].length;
  const line = clean(text.slice(start).split(/[\r\n|]/u, 1)[0]).slice(0, 140);
  if (!line) return null;
  return parseHousingAddress(line, { allowBare: true });
}

function bareAddress(text) {
  const buildingTail = new RegExp(`(?:\\s*[,;]?\\s*${BUILDING_MARKER}\\s*(${NUMBER_TOKEN}))\\s*$`, 'iu');
  const buildingMatch = text.match(buildingTail);
  const withoutBuilding = buildingMatch ? clean(text.slice(0, buildingMatch.index)) : text;

  const markedHouse = withoutBuilding.match(new RegExp(`^(.*?)\\s*[,;]?\\s*${HOUSE_MARKER}\\s*(${NUMBER_TOKEN})\\s*$`, 'iu'));
  if (markedHouse && /\p{L}{2,}/u.test(markedHouse[1])) {
    return result(text, markedHouse[1], markedHouse[2], buildingMatch?.[1], 0.95);
  }

  const trailingNumber = withoutBuilding.match(new RegExp(`^(${STREET_NAME})\\s+(${NUMBER_TOKEN})\\s*$`, 'iu'));
  if (trailingNumber && /\p{L}{2,}/u.test(trailingNumber[1])) {
    return result(text, trailingNumber[1], trailingNumber[2], buildingMatch?.[1], 0.85);
  }

  return /\p{L}{2,}/u.test(text) ? result(text, text, null, buildingMatch?.[1], 0.55) : null;
}

/**
 * Parse only textual address structure. This module intentionally contains no
 * coordinates and performs no geocoding.
 *
 * allowBare should be used only when the input is already known to be an
 * address field (for example a source-provided address), not on arbitrary post
 * prose where prices and phone numbers may look like house numbers.
 */
export function parseHousingAddress(value, options = {}) {
  const text = clean(value);
  if (!text) return result(null);

  const labelled = labelledAddress(text);
  if (labelled) return labelled;

  const explicit = explicitStreetAddress(text);
  if (explicit) return explicit;

  if (options.allowBare === true) return bareAddress(text) || result(text);
  return result(null);
}

export function composeHousingAddress(parts = {}) {
  const street = compactStreet(parts.street);
  const houseNumber = normalizeNumber(parts.houseNumber);
  const building = normalizeNumber(parts.building);
  if (!street) return null;
  return [street, houseNumber, building ? `корп. ${building}` : null].filter(Boolean).join(' ');
}
