const PHONE_RUN_RE = /\+?\d[\d\s().-]{7,}\d/gu;
const ADDRESS_LABEL_RE = /(?:адрес|адреса|адресація|адресация|manzil|address|adresă|adresa)\s*[:=\-–—]\s*/iu;
const PREFIX_STREET_MARKER = String.raw`(?:(?:ул(?:ица)?|вул(?:иця)?|просп(?:ект)?|пр-т|переул(?:ок)?|пров(?:улок)?|проезд|наб(?:ережная)?|шоссе|str(?:ada)?|street|st|avenue|ave|road|rd|көше)\.?)`;
const POSTFIX_STREET_MARKER = String.raw`(?:ko['’ʼ\u02bc]?cha(?:si)?|кўча(?:си)?|коча(?:си)?|kocha(?:si)?)`;
const POSTFIX_STREET_TYPE = String.raw`(?:вулиця|улица|провулок|переулок|проспект|бульвар|набережна|набережная|шосе|шоссе|площа|площадь|узвіз|спуск|алея|аллея|дорога|тупик)`;
const HOUSE_MARKER = String.raw`(?:дом|д\.|будинок|буд\.|house|h\.|uy|уй|nr\.?|no\.?|№)`;
const BUILDING_MARKER = String.raw`(?:корп(?:ус)?\.?|к\.|строен(?:ие)?|стр\.|будова|секц(?:ия|ія)?|bloc|corp|building|bldg\.?|korpus)`;
const NUMBER_TOKEN = String.raw`\d{1,5}(?:[-\/]?[\p{L}])?(?:[\/-]\d{1,4}(?:[-\/]?[\p{L}])?)?`;
const STREET_WORD = String.raw`[\p{L}'’.-]{2,48}`;
const PROPERTY_AREA_LINE_RE = /(?:^|[^\p{L}\p{N}_])(?:(?:общая|жилая|полезная|кухонная)\s+площадь|площадь\s+(?:квартиры|дома|комнаты))(?=$|[^\p{L}\p{N}_])/iu;

function clean(value) {
  return String(value ?? '')
    .normalize('NFKC')
    .replace(PHONE_RUN_RE, (segment) => segment.replace(/\D/gu, '').length >= 9 ? ' ' : segment)
    .replace(/[\t\f\v]+/gu, ' ')
    .replace(/\s{2,}/gu, ' ')
    .replace(/^[\s,;:.\-–—]+|[\s,;:.\-–—]+$/gu, '')
    .trim();
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
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

function postfixTypedStreetAddress(line) {
  const suffix = line.match(new RegExp(
    `(?:^|[^\\p{L}\\p{N}])((?:${STREET_WORD}\\s+){0,4}${STREET_WORD}\\s+${POSTFIX_STREET_TYPE})` +
      `\\s*[,;]?\\s*(${NUMBER_TOKEN})` +
      `(?:\\s*[,;]?\\s*${BUILDING_MARKER}\\s*(${NUMBER_TOKEN}))?` +
      `(?=$|[^\\p{L}\\p{N}])`,
    'iu',
  ));
  if (!suffix) return null;

  const street = suffix[1];
  const houseNumber = suffix[2];
  const building = suffix[3] || null;
  const address = composeHousingAddress({ street, houseNumber, building });
  return result(address, street, houseNumber, building, 1);
}

function prefixTypedStreetAddress(line) {
  const prefix = line.match(new RegExp(
    `(?:^|[\\s,;])${PREFIX_STREET_MARKER}\\s+` +
      `((?:${STREET_WORD}\\s+){0,4}${STREET_WORD})` +
      `\\s*[,;]?\\s*(?:${HOUSE_MARKER}\\s*)?(${NUMBER_TOKEN})` +
      `(?:\\s*[,;]?\\s*${BUILDING_MARKER}\\s*(${NUMBER_TOKEN}))?` +
      `(?=$|[^\\p{L}\\p{N}])`,
    'iu',
  ));
  if (!prefix) return null;

  const street = prefix[1];
  const houseNumber = prefix[2];
  const building = prefix[3] || null;
  const address = composeHousingAddress({ street, houseNumber, building });
  return result(address, street, houseNumber, building, 1);
}

function explicitStreetAddress(text) {
  const lines = text
    .split(/[\r\n|]/u)
    .map((part) => clean(part).slice(0, 160))
    .filter(Boolean)
    .slice(0, 12);

  for (const line of lines) {
    // Property measurements such as "Общая площадь 51,7 кв.м" used to be
    // mistaken for a named square followed by house number 51.
    if (PROPERTY_AREA_LINE_RE.test(line)) continue;

    const postfixTyped = postfixTypedStreetAddress(line);
    if (postfixTyped) return postfixTyped;

    const prefixTyped = prefixTypedStreetAddress(line);
    if (prefixTyped) return prefixTyped;

    const boundedPrefix = line.match(new RegExp(
      `(?:^|[\\s,;])${PREFIX_STREET_MARKER}\\s*((?:${STREET_WORD}\\s+){0,3}${STREET_WORD})(?=$|[,;])`,
      'iu',
    ));
    if (boundedPrefix) return result(boundedPrefix[0], boundedPrefix[1], null, null, 0.9);

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
  }

  return null;
}

function knownStreetAddress(text, knownStreet) {
  const street = compactStreet(knownStreet);
  if (!street) return null;
  const streetPattern = street.split(/\s+/u).map(escapeRegExp).join('\\s+');
  const re = new RegExp(
    `(?:^|[^\\p{L}\\p{N}])(?:${PREFIX_STREET_MARKER}\\s+)?(${streetPattern})(?:\\s+${POSTFIX_STREET_MARKER})?` +
      `(?:\\s*[,;]?\\s*(?:${HOUSE_MARKER})?\\s*(${NUMBER_TOKEN}))?` +
      `(?:\\s*[,;]?\\s*${BUILDING_MARKER}\\s*(${NUMBER_TOKEN}))?` +
      `(?=$|[^\\p{L}\\p{N}])`,
    'iu',
  );
  const match = text.match(re);
  if (!match) return null;
  const houseNumber = match[2] || null;
  const building = match[3] || null;
  const address = composeHousingAddress({ street, houseNumber, building });
  return result(address, street, houseNumber, building, houseNumber ? 0.98 : 0.9);
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
  if (PROPERTY_AREA_LINE_RE.test(text)) return null;
  const tail = splitAddressTail(text);
  if (!tail) return null;
  if (/^(?:центр|centre|center)$/iu.test(compactStreet(tail.street) || '')) return null;
  const confidence = tail.houseNumber ? 0.85 : 0.55;
  return result(text, tail.street, tail.houseNumber, tail.building, confidence);
}

/**
 * Parse only textual address structure. This module intentionally contains no
 * coordinates and performs no geocoding.
 *
 * `knownStreet` may be supplied when a location dictionary has already
 * canonicalized the street. In that mode the parser only accepts a house/building
 * number immediately adjacent to that exact street mention.
 *
 * `allowBare` should be used only when the input is already known to be an
 * address field (for example a source-provided address), not on arbitrary post
 * prose where prices and phone numbers may look like house numbers.
 */
export function parseHousingAddress(value, options = {}) {
  const text = clean(value);
  if (!text) return result(null);

  const labelled = labelledAddress(text);
  if (labelled) return labelled;

  if (options.knownStreet) {
    const known = knownStreetAddress(text, options.knownStreet);
    if (known) return known;
  }

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
