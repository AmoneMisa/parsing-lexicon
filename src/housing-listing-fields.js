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
  const forward = number(text.match(/(\d+)\s*-?\s*(?:bedroom|спальн|спалень|dormitoare|dormitor|yotoq(?:xona)?|жатын)/iu), 1, 20);
  if (forward != null) return forward;
  // Structured "Label - Value" reposts: "Спальни: 3" instead of "3 спальни".
  return number(text.match(/(?:спальн\p{L}*|bedrooms?)\s*[:=\-–—]\s*(\d+)/iu), 1, 20);
}

function parseBathrooms(text) {
  const bathroom = '(?:сан\\s?уз(?:е)?л\\p{L}*|с\\/?у(?=$|[^\\p{L}\\p{N}_])|ванн[аы]|bathrooms?|sanuzel|hammom)';
  const areaUnit = '(?:м²|м2|m²|m2|sqm|sq\\.?\\s*m|кв\\.?\\s*м(?:²|2)?)';

  // Room-area rows such as "Санузел4.52 м²" carry the size of a singular
  // bathroom, not a bathroom count. Resolve these before generic count forms
  // so another nearby number cannot win.
  const singularArea = text.match(new RegExp(
    `(?:сан\\s?уз(?:е)?л|bathroom|sanuzel|hammom)\\s*[:=\\-–—]?\\s*\\d{1,4}(?:[.,]\\d{1,2})?\\s*${areaUnit}(?=$|[^\\p{L}\\p{N}_])`,
    'iu',
  ));
  if (singularArea) return 1;

  const forward = text.match(new RegExp(`(\\d{1,2})\\s*${bathroom}`, 'iu'));
  const forwardCount = number(forward, 1, 10);
  if (forwardCount != null) return forwardCount;

  const reversed = text.match(new RegExp(
    `${bathroom}\\D{0,4}(\\d{1,2})(?![.,]\\d)(?!\\s*${areaUnit})`,
    'iu',
  ));
  const reversedCount = number(reversed, 1, 10);
  return reversedCount;
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
  if (/(коммунал\p{L}*(?:\s+услуг\p{L}*)?\s*(?:отдельно|сверху|плюс|оплачива\p{L}*\s*отдельно)|свет\s*вода\s*газ\s*отдельно|k[oa]munal\p{L}*\s*(?:alohida|aloxida|ustiga)|камунал\s+туловлари\s+алохида|коммунал\s+тўловлари\s+алоҳида|utilities?\s*(?:separate|extra|not included))/iu.test(text)) return true;
  if (/(коммунал\p{L}*(?:\s+услуг\p{L}*)?\s*(?:включ|входит|в\s*стоимост)|вс[её]\s*включ|all\s*inclusive|kommunal\p{L}*\s*(?:kiritilgan|ichida)|комунал(?:каси)?\s+ичида|коммунал(?:каси)?\s+ичида|utilities?\s*included)/iu.test(text)) return false;
  return String(country || '').toUpperCase() === 'UA' ? true : null;
}

function parseDepositRequired(text) {
  if (/(?:без\s+(?:залога|депозита)|залог\s+не\s+нужен|депозит\s+не\s+нужен|no\s+deposit)/iu.test(text)) return false;
  if (/(?:^|[^\p{L}\p{N}_])(?:залог|депозит|deposit|depozit|depazit(?:i)?|garantie|garanție|кепіл)(?=$|[^\p{L}\p{N}_])/iu.test(text)) return true;
  return null;
}

export function parseHousingListingFields(value, { country = '' } = {}) {
  const text = normalizeUnicode(value ?? '');
  const context = parseHousingContext(text);
  const features = parseHousingFeatures(text);
  if (!text) return deepFreeze({});

  const gas = bool(text,
    /(?:^|[^\p{L}\p{N}_])(?:газ|gaz|gas)(?=$|[^\p{L}\p{N}_])|метан|aragaz|gaz\s+ta['’]?min/iu,
    /без\s+газа|нет\s+газа|газа\s+нет|no\s+gas|gaz\s*yo['’]?q|газ\s+йўқ/iu,
  );
  const elevator = bool(
    text,
    /лифт|elevator|\blift\b/iu,
    /без\s*лифт\p{L}*|нет\s+лифт\p{L}*|лифт\p{L}*\s+нет|no\s*elevator|lift\s*yo['’]?q|лифт\s+йўқ/iu,
  );
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
    balcony: bool(
      text,
      /балкон|лоджи|balkon|ayvon|balcon|loggia|balcony/iu,
      /без\s+(?:балкон\p{L}*|лоджи\p{L}*)|нет\s+(?:балкон\p{L}*|лоджи\p{L}*)|(?:балкон\p{L}*|лоджи\p{L}*)\s+нет|no\s+(?:balcony|loggia)|balkon\s+yo['’]?q/iu,
    ),
    terrace: bool(text, /террас|terrace|teras[ăa]?/iu, /без\s+террас\p{L}*|нет\s+террас\p{L}*|террас\p{L}*\s+нет|no\s+terrace/iu),
    privateYard: bool(
      text,
      /личн\p{L}*\s+двор|сво[йеё]\s+(?:закрыт\p{L}*\s+)?двор|собственн\p{L}*\s+двор|приватн\p{L}*\s+двір|власн\p{L}*\s+двір|private\s+(?:courtyard|yard)|curte\s+(?:proprie|privat[ăa])|shaxsiy\s+hovli/iu,
      /без\s+(?:своего\s+|личного\s+)?двора|нет\s+(?:своего\s+|личного\s+)?двора|(?:своего\s+|личного\s+)?двора\s+нет|no\s+private\s+(?:courtyard|yard)|shaxsiy\s+hovli\s+yo['’]?q/iu,
    ),
    courtyard: features.courtyard,
    gazebo: features.gazebo,
    dishwasher: bool(
      text,
      /посудомоечн\p{L}*|посудомойк\p{L}*|dishwasher|mașin[ăa]\s+de\s+spălat\s+vase/iu,
      /без\s+посудомоечн\p{L}*(?:\s+машин\p{L}*)?|нет\s+посудомоечн\p{L}*(?:\s+машин\p{L}*)?|посудомоечн\p{L}*(?:\s+машин\p{L}*)?\s+нет|no\s+dishwasher/iu,
    ),
    airConditioner: bool(
      text,
      /кондицион|сплит[- ]?систем|konditsioner|kansaner|kandisaner|klimat|air\s*con|aer\s+condi[țt]ionat/iu,
      /без\s+(?:кондицион\p{L}*|сплит[- ]?систем\p{L}*)|нет\s+(?:кондицион\p{L}*|сплит[- ]?систем\p{L}*)|(?:кондицион\p{L}*|сплит[- ]?систем\p{L}*)\s+нет|no\s+air\s*con(?:ditioner)?|konditsioner\s+yo['’]?q|кондиционер\s+йўқ/iu,
    ),
    // "тв"/"tv" are bare 2-letter abbreviations that collide with real words
    // (e.g. "твой" = "your") unless bounded on both sides by a non-letter --
    // the same class of bug as the "пр" abbreviation fixed earlier in
    // compactStreet(); do not relax these boundaries to a bare \b.
    tv: bool(
      text,
      /телевизор|(?:^|[^\p{L}\p{N}_])(?:тв|tv)(?=$|[^\p{L}\p{N}_])|television|televizor/iu,
      /без\s+телевизор\p{L}*|нет\s+телевизор\p{L}*|телевизор\p{L}*\s+нет|no\s+tv|no\s+television/iu,
    ),
    microwave: bool(
      text,
      /микроволнов\p{L}*|(?:^|[^\p{L}\p{N}_])свч(?=$|[^\p{L}\p{N}_])|microwave|mikro(?:to['’]?lqinli|talqinli)\s*pech/iu,
      /без\s+микроволнов\p{L}*|нет\s+микроволнов\p{L}*|микроволнов\p{L}*\s+нет|no\s+microwave/iu,
    ),
    oven: bool(
      text,
      /духовк\p{L}*|духов\p{L}*\s+шкаф\p{L}*|oven|(?:^|[^\p{L}\p{N}_])pech(?=$|[^\p{L}\p{N}_])/iu,
      /без\s+духовк\p{L}*|нет\s+духовк\p{L}*|духовк\p{L}*\s+нет|no\s+oven/iu,
    ),
    bidet: bool(
      text,
      /биде|bidet/iu,
      /без\s+биде|нет\s+биде|биде\s+нет|no\s+bidet/iu,
    ),
    walkInCloset: bool(
      text,
      /гардеробн\p{L}*|walk[- ]?in\s+closet|dressing\s+room|garderob(?:naya)?/iu,
      /без\s+гардеробн\p{L}*|нет\s+гардеробн\p{L}*|гардеробн\p{L}*\s+нет|no\s+walk[- ]?in\s+closet/iu,
    ),
    // "ванна" (the tub fixture) and "ванная" (the bathroom-as-a-room) share a
    // stem, so this only matches the shorter nominative/accusative tub forms
    // with a hard boundary -- it will miss instrumental/genitive tub mentions
    // ("с ванной") since those are spelled identically to the room noun and
    // aren't safely disambiguable by regex alone.
    bathtub: bool(
      text,
      /(?:^|[^\p{L}\p{N}_])(?:ванна|ванну|vanna(?:si)?)(?=$|[^\p{L}\p{N}_])|bathtub/iu,
      /без\s+ванн\p{L}*|нет\s+ванн\p{L}*|ванн\p{L}*\s+нет|no\s+bathtub/iu,
    ),
    shower: bool(
      text,
      /(?:^|[^\p{L}\p{N}_])душ(?=$|[^\p{L}\p{N}_])|душев\p{L}*\s+кабин\p{L}*|shower|dush(?:kabina)?/iu,
      /без\s+душ\p{L}*|нет\s+душ\p{L}*|душ\p{L}*\s+нет|no\s+shower/iu,
    ),
    // "Euro-layout" (евродвушка/евротрёшка/евро-N/европланировка) is a CIS
    // real-estate term for an open-plan flat with the kitchen merged into the
    // living room, as opposed to a conventional flat of the same room count
    // with a separate closed kitchen. Positive-only: there's no common way
    // listings state the absence of this, only its presence.
    euroLayout: bool(
      text,
      /евро[- ]?(?:студи\p{L}*|двушк\p{L}*|трёшк\p{L}*|трешк\p{L}*|четырёшк\p{L}*|четрешк\p{L}*|планировк\p{L}*|[1-9](?!\p{N}))|европланировк\p{L}*|euro[- ]?layout/iu,
    ),
    gas,
    newBuilding: bool(text, /новостро|новобуд|новый\s+дом|novast(?:royka|iroyka)|navast(?:royka|iroyka)|new\s*build|newly\s+built|yangi\s+(?:bino|qurilgan|uy)|bloc\s+nou/iu),
    communalSeparated: parseCommunalSeparated(text, country),
    parking: bool(
      text,
      /паркинг|парков|машино[- ]?мест|parking|avtoturargoh|mashina\s*joyi/iu,
      /без\s+(?:паркинг\p{L}*|парковк\p{L}*|машино[- ]?мест\p{L}*)|нет\s+(?:паркинг\p{L}*|парковк\p{L}*|машино[- ]?мест\p{L}*)|(?:паркинг\p{L}*|парковк\p{L}*|машино[- ]?мест\p{L}*)\s+нет|no\s+parking|(?:parking|avtoturargoh|mashina\s*joyi)\s+yo['’]?q/iu,
    ),
    elevator,
    heating: bool(
      text,
      /отоплени|heating|otoplenie|isitish|markaziy\s*issiq/iu,
      /без\s+отоплени\p{L}*|нет\s+отоплени\p{L}*|отоплени\p{L}*\s+нет|no\s+heating|isitish\s+yo['’]?q/iu,
    ),
    hotWater: bool(
      text,
      /горяч\p{L}*\s*вод|hot\s*water|issiq\s*suv/iu,
      /без\s+горяч\p{L}*\s+вод\p{L}*|нет\s+горяч\p{L}*\s+вод\p{L}*|горяч\p{L}*\s+вод\p{L}*\s+нет|no\s+hot\s*water|issiq\s+suv\s+yo['’]?q/iu,
    ),
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
