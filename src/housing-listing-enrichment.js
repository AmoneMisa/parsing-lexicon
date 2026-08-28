import { deepFreeze } from './lexicon-core.js';
import { findAllCanonical, normalizeUnicode } from './normalization.js';
import { GENERIC_LANDMARK_TERMS } from './landmarks.js';
import { matchTashkentHousingDistrict, matchTashkentHousingMetro, matchTashkentHousingQuarter } from './tashkent-housing-geography.js';
import { TASHKENT_LANDMARKS } from './tashkent-pois.js';
import { parseHousingRoomCount, parseHousingFloor, parseHousingAreas } from './housing-structured.js';
import { parseHousingListingFields } from './housing-listing-fields.js';
import { parseHousingResidentialComplex } from './housing-text.js';
import { parseHousingAddress } from './housing-address.js';
import { HOUSING_LANDMARK_EXTENSIONS, HOUSING_POI_EXTENSIONS } from './housing-poi-extensions.js';

const GENERIC_CATEGORY = Object.freeze({
  Park: 'park', Metro: 'metro', 'Bus stop': 'transport', 'Public transport': 'transport', 'Main road': 'transport',
  Clinic: 'medical', 'Maternity hospital': 'medical', Hospital: 'medical', School: 'school', Kindergarten: 'kindergarten',
  Childcare: 'childcare', University: 'university', 'Shopping center': 'mall', Shop: 'shop', Korzinka: 'supermarket',
  Supermarket: 'supermarket', Market: 'market', Cafe: 'cafe', Restaurant: 'restaurant', Playground: 'playground',
  Pharmacy: 'pharmacy', Mosque: 'religious', Church: 'religious', 'Railway station': 'railway', Airport: 'airport',
});

const APPLIANCE_PATTERNS = Object.freeze([
  ['Washing machine', /(?:кир\s*машин|кирмошин\p{L}*|стиральн\p{L}*\s+машин|washing\s+machine|kir\s*moshina|kirmoshina|kir\s*yuvish\s+mashin)/iu],
  ['Microwave', /(?:микроволнов|микравалноф\p{L}*|microwave|mikrovolnov|mikravolnof)/iu],
  ['Vacuum cleaner', /(?:пылесос|педесос|vacuum\s+cleaner|pilesos|pedesos)/iu],
  ['Oven', /(?:духовк|дхофк\p{L}*|oven|duxovka|duhofka|dxofka)/iu],
  ['Kitchen', /(?:кухн|kitchen|oshxona|kuxn\p{L}*)/iu],
]);

const FIRST_RENT_UZ_RE = /(?:hali\s+hech\s+kim\s+(?:yashamagan|turmagan)|ҳали\s+ҳеч\s+ким\s+(?:яшамаган|турмаган))/iu;
const LANDLORD_PRESENT_RE = /(?:xozaykali|hojaykali|xo['’]?jaykali|с\s+хозяйк(?:ой|ой\s+в\s+квартире)|хозяйк\p{L}*\s+(?:жив[её]т|прожива\p{L}*))/iu;
const STUDENT_RE = /(?:studentlar\s+uchun|talabalar\s+uchun|студент(?:ам|ы|ок|ов)?\s+(?:можно|для)|для\s+студент)/iu;
const NO_BROKER_RE = /(?:bez\s+makler|maklersiz|vositachisiz|без\s+(?:маклер|посредник|риелтор|риэлтор|комисси))/iu;
const BROKER_RE = /(?:makler|vositachi|макл(?:ер[а-яё]*)?|ри[еэ]лтор[а-яё]*|агентств[а-яё]*|комисси[а-яё]*|broker|realtor|commission)/iu;
const MEN_RE = /(?:o['’ʻʼ‘`]?g['’ʻʼ‘`]?il\s+bola(?:lar)?(?:ga)?|ogil\s+bola(?:lar)?(?:ga)?|sherik\s+bola|эркак(?:лар)?|erkak(?:lar)?(?:ga)?|только\s+(?:мужчин|парн))/iu;
const WOMEN_RE = /(?:qiz(?:lar)?(?:ga)?|ayol(?:lar)?(?:ga|ni)?|киз(?:лар)?(?:га)?|аёл(?:лар)?(?:га|ни)?|девушк\p{L}*|женщин\p{L}*|girls?\s+only|women\s+only)/iu;
const FAMILY_RE = /(?:семь\p{L}*|family|oila(?:ga|lar|li)?|oila\s+uchun|оилага|оелага|оилавий|oelaga)/iu;
const ROOM_SHARE_RE = /(?:sherik(?:ka|lik|likga)?|шерик(?:ка|лик)?|roommate|flatmate|подселени|койко[-\s]?мест|место\s+в\s+(?:комнат|квартир)|birga\s+yashash(?:ga)?|kvartira(?:ga|da)?[^\r\n.!?]{0,36}(?:\d+|bitta|1)\s*(?:ta\s*)?(?:qiz|ayol)[^\r\n.!?]{0,20}(?:ijarachi\s*)?(?:kerak|kere))/iu;
const AIR_CONDITIONER_RE = /(?:кондицион|air\s*con|konditsioner|kandit(?:s|c)?aner|kanditsaner|кандитсанер)/iu;
const PER_PERSON_PRICE_RE = /(?:kishi\s+boshiga|киши\s+бошига)\s*(\d{1,3}(?:[\s.,]\d{3})*|\d+(?:[.,]\d+)?)\s*(ming|минг|million|mln|млн)?(?:dan|дан)?/iu;
const WALK_MINUTES_RE = /(?:yayov|piyoda|пешком)\s*(\d{1,2})\s*(?:daqiqa|min(?:ute)?s?|минут)/iu;
const TRANSIT_ROUTES_RE = /(?:aftobuslar|avtobuslar|автобуслар|автобусы)[^\r\n\d]{0,24}((?:\d{1,4}[\s,;/]*){1,10})/iu;

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function categoryOf(entry) {
  return entry?.category || GENERIC_CATEGORY[entry?.canonical] || 'landmark';
}

function extensionMatches(text) {
  return findAllCanonical(text, HOUSING_POI_EXTENSIONS).map((match) => ({
    canonical: match.canonical,
    category: categoryOf(match.entry),
    start: match.start,
  }));
}

function catalogPoiMatches(text) {
  const matches = [];
  for (const entry of TASHKENT_LANDMARKS) {
    const match = text.match(entry.re);
    if (!match) continue;
    const start = match.index ?? 0;
    if (entry.contextRequired && entry.contextRe) {
      const context = text.slice(Math.max(0, start - 48), Math.min(text.length, start + match[0].length + 56));
      if (!entry.contextRe.test(context)) continue;
    }
    matches.push({ canonical: entry.name, category: entry.category || 'landmark', start });
  }
  return matches;
}

function genericMatches(text) {
  const base = findAllCanonical(text, GENERIC_LANDMARK_TERMS);
  const extensions = findAllCanonical(text, HOUSING_LANDMARK_EXTENSIONS);
  return [...base, ...extensions].map((match) => ({
    canonical: match.canonical,
    category: categoryOf(match.entry),
    start: match.start,
  }));
}

export function parseHousingNearby(value) {
  const text = normalizeUnicode(value ?? '');
  if (!text) return deepFreeze([]);
  const specific = [...extensionMatches(text), ...catalogPoiMatches(text)].sort((a, b) => a.start - b.start);
  const specificCategories = new Set(specific.map((item) => item.category));
  const generic = genericMatches(text)
    .filter((item) => !specificCategories.has(item.category))
    .sort((a, b) => a.start - b.start);
  return deepFreeze(unique([...specific, ...generic].map((item) => item.canonical)).slice(0, 16));
}

export function parseHousingAudience(value) {
  const text = normalizeUnicode(value ?? '');
  const family = FAMILY_RE.test(text);
  const women = WOMEN_RE.test(text);
  const men = MEN_RE.test(text);
  if (family && women) return deepFreeze({ primary: 'family', alternatives: ['family', 'women'] });
  if (family) return deepFreeze({ primary: 'family', alternatives: ['family'] });
  if (women) return deepFreeze({ primary: 'women', alternatives: ['women'] });
  if (men) return deepFreeze({ primary: 'men', alternatives: ['men'] });
  return deepFreeze({ primary: null, alternatives: [] });
}

export function parseHousingRoomShare(value) {
  return ROOM_SHARE_RE.test(normalizeUnicode(value ?? ''));
}

export function parseHousingLandlordPresent(value) {
  return LANDLORD_PRESENT_RE.test(normalizeUnicode(value ?? ''));
}

export function parseHousingStudentTarget(value) {
  return STUDENT_RE.test(normalizeUnicode(value ?? ''));
}

export function parseHousingCommission(value) {
  const text = normalizeUnicode(value ?? '');
  if (NO_BROKER_RE.test(text)) return false;
  if (BROKER_RE.test(text)) return true;
  return null;
}

export function parseHousingPerPersonPrice(value, { country = '' } = {}) {
  const text = normalizeUnicode(value ?? '');
  const match = text.match(PER_PERSON_PRICE_RE);
  if (!match) return null;
  let amount = Number(String(match[1]).replace(/\s+/g, '').replace(',', '.'));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const scale = String(match[2] || '').toLowerCase();
  if (scale === 'ming' || scale === 'минг') amount *= 1000;
  else if (scale === 'million' || scale === 'mln' || scale === 'млн') amount *= 1_000_000;
  const currency = String(country || '').toUpperCase() === 'UZ' || /(?:ming|минг)/iu.test(match[0]) ? 'UZS' : null;
  const approximate = /около|примерно|~|≈/iu.test(text);
  return deepFreeze({ amount, currency, approximate, scope: 'person' });
}

const COMMISSION_AMOUNT_RE = /(?:риэлтор\p{L}*|риелтор\p{L}*|маклер(?:у|ской)?|агентств\p{L}*|makler(?:ga)?|vositachi(?:ga)?|commission|broker(?:'s)?\s+fee)[^\r\n\d]{0,24}(\d{1,3}(?:[\s.,]\d{3})*|\d+(?:[.,]\d+)?)\s*(\$|usd|€|eur|сум|uzs|₴|грн|uah|тг|kzt)?/iu;
const COMMISSION_AMOUNT_LEADING_RE = /(\d{1,3}(?:[\s.,]\d{3})*|\d+(?:[.,]\d+)?)\s*(\$|usd|€|eur|сум|uzs|₴|грн|uah|тг|kzt)?[^\r\n\d]{0,24}(?:риэлтор\p{L}*|риелтор\p{L}*|маклер(?:у|ской)?|агентств\p{L}*|makler(?:ga)?|vositachi(?:ga)?|commission|broker(?:'s)?\s+fee)/iu;

export function parseHousingCommissionAmount(value) {
  const text = normalizeUnicode(value ?? '');
  // A listing that explicitly says "no broker/commission" cannot also have a
  // commission amount — without this guard, an unrelated number near the
  // negated broker word (e.g. a room count in "2 xonali ... maklersiz")
  // could be misread as the commission amount.
  if (NO_BROKER_RE.test(text)) return null;
  const match = text.match(COMMISSION_AMOUNT_RE) || text.match(COMMISSION_AMOUNT_LEADING_RE);
  if (!match) return null;
  const amount = Number(String(match[1]).replace(/\s+/g, '').replace(',', '.'));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const raw = (match[2] || '').toLocaleLowerCase();
  const currency = /\$|usd/u.test(raw) ? 'USD'
    : /€|eur/u.test(raw) ? 'EUR'
      : /сум|uzs/u.test(raw) ? 'UZS'
        : /₴|грн|uah/u.test(raw) ? 'UAH'
          : /тг|kzt/u.test(raw) ? 'KZT' : null;
  return deepFreeze({ amount, currency, approximate: /около|примерно|~|≈/iu.test(match[0]) });
}

export function parseHousingTransitRoutes(value) {
  const text = normalizeUnicode(value ?? '');
  const match = text.match(TRANSIT_ROUTES_RE);
  if (!match?.[1]) return deepFreeze([]);
  return deepFreeze(unique(match[1].split(/[^\d]+/).filter((item) => /^\d{1,4}$/.test(item))).slice(0, 12));
}

export function parseHousingObservedAmenities(value) {
  const text = normalizeUnicode(value ?? '');
  const amenities = APPLIANCE_PATTERNS.filter(([, pattern]) => pattern.test(text)).map(([name]) => name);
  return deepFreeze(unique(amenities));
}

function specificResidentialComplex(text) {
  const match = findAllCanonical(text, HOUSING_POI_EXTENSIONS)
    .find((item) => item.entry?.category === 'residential_complex');
  return match?.canonical || null;
}

function firstRental(text, listingFields) {
  if (listingFields.firstRent != null) return listingFields.firstRent;
  return FIRST_RENT_UZ_RE.test(text) ? true : null;
}

function walkMinutes(text) {
  const match = text.match(WALK_MINUTES_RE);
  const value = Number(match?.[1]);
  return Number.isInteger(value) && value > 0 && value <= 180 ? value : null;
}

export function parseHousingListingEnrichment(value, { country = '' } = {}) {
  const text = normalizeUnicode(value ?? '');
  if (!text) return deepFreeze({});
  const listingFields = parseHousingListingFields(text, { country });
  const floor = parseHousingFloor(text);
  const areas = parseHousingAreas(text);
  const audience = parseHousingAudience(text);
  const perPersonPrice = parseHousingPerPersonPrice(text, { country });
  const observedAmenities = parseHousingObservedAmenities(text);
  const quarter = matchTashkentHousingQuarter(text);
  const district = matchTashkentHousingDistrict(text)?.name || quarter?.district || null;
  const metro = matchTashkentHousingMetro(text)?.name || null;
  const parsedRc = specificResidentialComplex(text) || parseHousingResidentialComplex(text);
  const commission = parseHousingCommission(text);
  const commissionAmount = parseHousingCommissionAmount(text);
  const address = parseHousingAddress(text);

  return deepFreeze({
    rooms: parseHousingRoomCount(text),
    areaSqm: areas.total,
    floor: floor.floor,
    totalFloors: floor.totalFloors,
    bedrooms: listingFields.bedrooms ?? null,
    bathrooms: listingFields.bathrooms ?? null,
    balcony: listingFields.balcony ?? null,
    terrace: listingFields.terrace ?? null,
    privateYard: listingFields.privateYard ?? null,
    dishwasher: listingFields.dishwasher ?? null,
    airConditioner: listingFields.airConditioner ?? (AIR_CONDITIONER_RE.test(text) ? true : null),
    gas: listingFields.gas ?? null,
    newBuilding: listingFields.newBuilding ?? null,
    communalSeparated: listingFields.communalSeparated ?? null,
    parking: listingFields.parking ?? null,
    elevator: listingFields.elevator ?? null,
    heating: listingFields.heating ?? null,
    hotWater: listingFields.hotWater ?? null,
    internet: listingFields.internet ?? null,
    petsAllowed: listingFields.petsAllowed ?? null,
    childrenAllowed: listingFields.childrenAllowed ?? null,
    smokingAllowed: listingFields.smokingAllowed ?? null,
    negotiable: listingFields.negotiable ?? null,
    furnished: listingFields.furnished ?? null,
    deposit: listingFields.depositRequired ?? null,
    firstRental: firstRental(text, listingFields),
    utilitiesAmount: listingFields.utilitiesAmount ?? null,
    commission,
    commissionPercent: commission === false ? 0 : null,
    commissionAmount,
    audience: audience.primary,
    audienceAlternatives: audience.alternatives,
    roomOnly: parseHousingRoomShare(text),
    studentTarget: parseHousingStudentTarget(text),
    landlordPresent: parseHousingLandlordPresent(text),
    priceScope: perPersonPrice?.scope || null,
    perPersonPrice,
    transitRoutes: parseHousingTransitRoutes(text),
    walkMinutes: walkMinutes(text),
    nearby: parseHousingNearby(text),
    amenities: observedAmenities,
    district: district || null,
    quarter: quarter ? { number: quarter.number, suffix: quarter.suffix } : null,
    metro: metro || null,
    residenceComplex: parsedRc || null,
    address: address.address,
    addressStreet: address.street,
    addressHouseNumber: address.houseNumber,
    addressBuilding: address.building,
  });
}
