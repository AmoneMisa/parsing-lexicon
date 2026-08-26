const PHONE_RUN_RE = /\+?\d[\d\s().-]{7,}\d/gu;
const ADDRESS_LABEL_RE = /(?:адрес|адреса|адресація|адресация|manzil|address|adresă|adresa)\s*[:=\-–—]\s*/iu;
const PREFIX_STREET_MARKER = String.raw`(?:ул(?:ица)?|вул(?:иця)?|просп(?:ект)?|пр-т|переул(?:ок)?|пров(?:улок)?|проезд|наб(?:ережная)?|шоссе|str(?:ada)?\.?|street|st\.?|avenue|ave\.?|road|rd\.?|көше)`;
const POSTFIX_STREET_MARKER = String.raw`(?:ko['’ʼ\u02bc]?cha(?:si)?|кўча(?:си)?|коча(?:си)?|kocha(?:si)?)`;
const HOUSE_MARKER = String.raw`(?:дом|д\.|будинок|буд\.|house|h\.|uy|уй|nr\.?|no\.?|№)`;
const BUILDING_MARKER = String.raw`(?:корп(?:ус)?\.?|к\.|строен(?:ие)?|стр\.|будова|секц(?:ия|ія)?|bloc|corp|building|bldg\.?|korpus)`;
const NUMBER_TOKEN = String.raw`\d{1,5}[\p{L}]?(?:[\/-]\d{1,4}[\p{L}]?)?`;

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
    .replace(new RegExp(`^${PREFIX_STREET_MARKER}\\s*`, 'iu'), '')
    .replace(new RegExp(`\\s+${POSTFIX_STREET_MARKER}$`, 'iu'), '')
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

function splitAddressTail(raw) {
  const text = clean(raw);
  if (!text) return null;

  const buildingRe = new RegExp(`(?:\\s*[,;]?\\s*${BUILDING_MARKER}\\s*(${NUMBER_TOKEN}))\\s*$`, 'iu');
  const buildingMatch = text.match(buildingRe);
  const building = buildingMatch?.[1] || null;
  const withoutBuilding = buildingMatch ? clean(text.slice(0, buildingMatch.index)) : text;

  const markedHouse = withoutBuilding.match(new RegExp(`^(.*?)\\s*[,;]?\\s*${HOUSE_MARKER}\\s*(${NUMBER_TOKEN})\\s*$`, 'iu'));
  if (markedHouse && /\p{L}{2,}/u.test(markedHouse[1])) {
    return { street: markedHouse[1], houseNumber: markedHouse[2], building };
  }

  const trailingHouse = withoutBuilding.match(new RegExp(`^(.*?\\p{L}.*?)\\s+(${NUMBER_TOKEN})\\s*$`, 'iu'));
  if (trailingHouse && /\p{L}{2,}/u.test(trailingHouse[1])) {
    return { street: trailingHouse[1], houseNumber: trailingHouse[2], building };
  }

  return /\p{L}{2,}/u.test(withoutBuilding)
    ? { street: withoutBuilding, houseNumber: null, building }
    : null;
}

function explicitStreetAddress(text) {
  const line = clean(text.split(/[\r\n|]/u, 1)[0]).slice(0, 160);

  const prefix = line.match(new RegExp(`(?:^|[\\s,;])(${PREFIX_STREET_MARKER})\\s+(.+)$`, 'iu'));
  if (prefix) {
    const tail = splitAddressTail(prefix[2]);
    if (tail) return result(line, tail.street, tail.houseNumber, tail.building, tail.houseNumber ? 1 : 0.9);
  }

  const postfix = line.match(new RegExp(`^(.+?)\\s+(${POSTFIX_STREET_MARKER})(.*)$`, 'iu'));
  if (postfix) {
    const tailText = clean(`${postfix[1]} ${postfix[3]}`);
    const tail = splitAddressTail(tailText);
    if (tail) return result(line, tail.street, tail.houseNumber, tail.building, tail.houseNumber ? 1 : 0.9);
  }

  return null;
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
  const tail = splitAddressTail(text);
  if (!tail) return null;
  const confidence = tail.houseNumber ? 0.85 : 0.55;
  return result(text, tail.street, tail.houseNumber, tail.building, confidence);
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
