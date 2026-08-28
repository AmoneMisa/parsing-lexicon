import { deepFreeze } from './lexicon-core.js';
import { normalizeUnicode } from './normalization.js';
import { parseHousingContext } from './housing-context.js';
import { parseHousingFeatures } from './housing-features.js';

const bool = (text, positive, negative = null) => {
  if (negative?.test(text)) return false;
  return positive.test(text) ? true : null;
};

const number = (match, min, max) => {
  const value = match ? Number(match[1]) : null;
  return Number.isFinite(value) && value >= min && value <= max ? value : null;
};

function parseBedrooms(text) {
  return number(text.match(/(\d+)\s*-?\s*(?:bedroom|спальн|спалень|dormitoare|dormitor|yotoq(?:xona)?|жатын)/iu), 1, 20);
}

function parseBathrooms(text) {
  const match = text.match(/(\d)\s*(?:сан\s?уз(?:е)?л\p{L}*|с\/?у(?=$|[^\p{L}\p{N}_])|ванн[аы]|bathrooms?|sanuzel|hammom)/iu)
    || text.match(/(?:сан\s?уз(?:е)?л\p{L}*|bathrooms?|sanuzel|hammom)\D{0,4}(\d)/iu);
  return number(match, 1, 10);
}

function parseBuildingYear(text) {
  const match = text.match(/(?:год(?:а)?\s+постройк\p{L}*|построен\p{L}*|рік\s+побудов\p{L}*|built|year\s+built|an\s+construc\p{L}*|qurilgan|qurilish\s+yil\p{L}*|жыл(?:ы)?\s+салынған)\D{0,12}(19\d{2}|20[0-3]\d)/iu)
    || text.match(/(19\d{2}|20[0-3]\d)\s*(?:г\.?|года|р\.?|рік|йил|жыл|year)(?=$|[^\p{L}\p{N}_])/iu);
  if (!match) return null;
  const year = Number(match[1]);
  return year >= 1900 && year <= new Date().getFullYear() + 3 ? year : null;
}

function parseMinRentTerm(text) {
  const match = text.match(/(?:минимальн\p{L}*\s+(?:срок|термин)\p{L}*(?:\s+аренд\p{L}*)?|минимум|не\s+менее|від\s+|minimum(?:\s+term)?|at\s+least)\s*[:\-]?\s*(\d{1,3})\s*(дн\p{L}*|сут\p{L}*|недел\p{L}*|тижн\p{L}*|месяц\p{L}*|мес\.?|місяц\p{L}*|год\p{L}*|рік|days?|weeks?|months?|years?)/iu);
  if (!match) return null;
  const value = Number(match[1]);
  const unitText = match[2].toLocaleLowerCase();
  const unit = /дн|сут|day/u.test(unitText) ? 'day'
    : /недел|тижн|week/u.test(unitText) ? 'week'
      : /месяц|мес|місяц|month/u.test(unitText) ? 'month'
        : 'year';
  return value > 0 ? deepFreeze({ value, unit }) : null;
}

function parseAvailableFrom(text) {
  const match = text.match(/(?:доступн\p{L}*\s+с|свободн\p{L}*\s+с|заселени\p{L}*\s+с|заезд\s+с|available\s+from|move[- ]?in\s+from)\s*[:\-]?\s*((?:\d{1,2}[./-]\d{1,2}(?:[./-]\d{2,4})?)|(?:\d{1,2}\s+[\p{L}]{3,12}(?:\s+\d{4})?))/iu);
  if (match?.[1]) return match[1].trim();

  // Uzbek listings commonly attach the ablative suffix directly to the month:
  // "1-sentyabrdan beriladi" / "1-сентябрдан берилади".
  const uzbek = text.match(/(\d{1,2}\s*[-./]?\s*[\p{L}]{3,12})(?:dan|дан)(?=$|[^\p{L}\p{N}_])[^.\r\n]{0,32}(?:beriladi|берилади|bo['’]?sh|бўш)/iu);
  return uzbek?.[1]?.replace(/\s*-\s*/g, '-').trim() || null;
}

function parseUtilitiesAmount(text) {
  const match = text.match(/(?:коммунальн\p{L}*|коммуналк\p{L}*|ком\.?\s*услуг\p{L}*|utilities?|bills?)\D{0,24}(?:около|примерно|~|≈)?\s*(\d{2,8}(?:[.,]\d{1,2})?)\s*(₴|грн|uah|\$|usd|€|eur|сум|uzs|тг|kzt|lei|ron|руб|rub)?/iu);
  if (!match) return null;
  const amount = Number(match[1].replace(',', '.'));
  if (!Number.isFinite(amount) || amount <= 0) return null;
  const raw = (match[2] || '').toLocaleLowerCase();
  const currency = /₴|грн|uah/u.test(raw) ? 'UAH'
    : /\$|usd/u.test(raw) ? 'USD'
      : /€|eur/u.test(raw) ? 'EUR'
        : /сум|uzs/u.test(raw) ? 'UZS'
          : /тг|kzt/u.test(raw) ? 'KZT'
            : /lei|ron/u.test(raw) ? 'RON'
              : /руб|rub/u.test(raw) ? 'RUB' : null;
  return deepFreeze({ amount, currency, approximate: /около|примерно|~|≈/iu.test(match[0]) });
}

function parseCommunalSeparated(text, country) {
  if (/(коммунал\p{L}*(?:\s+услуг\p{L}*)?\s*(?:отдельно|сверху|плюс|оплачива\p{L}*\s*отдельно)|свет\s*вода\s*газ\s*отдельно|kommunal\p{L}*\s*(?:alohida|ustiga)|utilities?\s*(?:separate|extra|not included))/iu.test(text)) return true;
  if (/(коммунал\p{L}*(?:\s+услуг\p{L}*)?\s*(?:включ|входит|в\s*стоимост)|вс[её]\s*включ|all\s*inclusive|kommunal\p{L}*\s*(?:kiritilgan|ichida)|комунал(?:каси)?\s+ичида|коммунал(?:каси)?\s+ичида|utilities?\s*included)/iu.test(text)) return false;
  return String(country || '').toUpperCase() === 'UA' ? true : null;
}

function parseDepositRequired(text) {
  if (/(?:без\s+(?:залога|депозита)|залог\s+не\s+нужен|депозит\s+не\s+нужен|no\s+deposit)/iu.test(text)) return false;
  if (/(?:^|[^\p{L}\p{N}_])(?:залог|депозит|deposit|depozit|garantie|garanție|кепіл)(?=$|[^\p{L}\p{N}_])/iu.test(text)) return true;
  return null;
}

export function parseHousingListingFields(value, { country = '' } = {}) {
  const text = normalizeUnicode(value ?? '');
  const context = parseHousingContext(text);
  const features = parseHousingFeatures(text);
  if (!text) return deepFreeze({});

  const gas = bool(text,
    /(?:^|[^\p{L}\p{N}_])(?:газ|gaz|gas)(?=$|[^\p{L}\p{N}_])|метан|aragaz|gaz\s+ta['’]?min/iu,
    /без\s+газа|нет\s+газа|no\s+gas|gaz\s*yo['’]?q/iu,
  );
  const elevator = bool(text, /лифт|elevator|\blift\b/iu, /без\s*лифт|no\s*elevator|lift\s*yo['’]?q/iu);
  const bareFurniture = /(?:^|[^\p{L}\p{N}_])(?:мебель|мебел|mebel)(?=$|[^\p{L}\p{N}_])/iu.test(text);
  const furnished = context.furniture === 'none' ? false : context.furniture ? true : bareFurniture ? true : null;
  const childrenAllowed = context.tenantPolicies.children === 'allowed' ? true
    : context.tenantPolicies.children === 'notAllowed' ? false : null;
  const smokingAllowed = context.tenantPolicies.smoking === 'allowed' ? true
    : context.tenantPolicies.smoking === 'notAllowed' ? false : null;

  const firstRent = bool(text,
    /первая\s+(?:сдача|аренда)|впервые\s+(?:сда[её]тся|сдается|в\s+аренду)|(?:ранее|раньше|до\s+этого)\s+никто\s+не\s+жил|никто\s+(?:ранее|раньше)\s+не\s+жил|first\s+(?:rental|letting)|never\s+(?:rented|lived\s+in|occupied)/iu,
  );

  return deepFreeze({
    bedrooms: parseBedrooms(text),
    bathrooms: parseBathrooms(text),
    buildingYear: parseBuildingYear(text),
    balcony: bool(text, /балкон|лоджи|balkon|ayvon|balcon|loggia|balcony/iu),
    terrace: bool(text, /террас|terrace|teras[ăa]?/iu),
    privateYard: bool(text, /личн\p{L}*\s+двор|сво[йеё]\s+(?:закрыт\p{L}*\s+)?двор|собственн\p{L}*\s+двор|приватн\p{L}*\s+двір|власн\p{L}*\s+двір|private\s+(?:courtyard|yard)|curte\s+(?:proprie|privat[ăa])|shaxsiy\s+hovli/iu),
    courtyard: features.courtyard,
    gazebo: features.gazebo,
    dishwasher: bool(text, /посудомоечн\p{L}*|посудомойк\p{L}*|dishwasher|mașin[ăa]\s+de\s+spălat\s+vase/iu),
    airConditioner: bool(text, /кондицион|сплит[- ]?систем|konditsioner|kansaner|klimat|air\s*con|aer\s+condi[țt]ionat/iu),
    gas,
    newBuilding: bool(text, /новостро|новобуд|новый\s+дом|novast(?:royka|iroyka)|navast(?:royka|iroyka)|new\s*build|newly\s*built|yangi\s+(?:bino|qurilgan|uy)|bloc\s+nou/iu),
    communalSeparated: parseCommunalSeparated(text, country),
    parking: bool(text, /паркинг|парков|машино[- ]?мест|parking|avtoturargoh|mashina\s*joyi/iu),
    elevator,
    heating: bool(text, /отоплени|heating|otoplenie|isitish|markaziy\s*issiq/iu),
    hotWater: bool(text, /горяч\p{L}*\s*вод|hot\s*water|issiq\s*suv/iu),
    internet: features.internet,
    petsAllowed: features.petsAllowed,
    childrenAllowed,
    smokingAllowed,
    negotiable: context.priceModifiers.includes('fixed') ? false
      : context.priceModifiers.includes('negotiable') ? true : null,
    furnished,
    depositRequired: parseDepositRequired(text),
    firstRent,
    minRentTerm: parseMinRentTerm(text),
    availableFrom: parseAvailableFrom(text),
    utilitiesAmount: parseUtilitiesAmount(text),
  });
}
