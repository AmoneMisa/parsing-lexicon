// Non-residential/commercial listing signals that should be excluded from
// residential housing feeds. Kept conservative so nearby amenities (for
// example "магазин рядом") do not classify an otherwise valid home as commercial.
const COMMERCIAL_HOUSING_RE =
  /(офис[ _|,/.]|под ?офис|офисн|\boffice\b|\bofis\b|кеңсе|коммерческ|commercial|бизнес[ -]?центр|не\s?жил(?:ое|ой|ый|ых|ым|ого)|помещени[ея]|торгов(?:ое|ая) ?площад|торгов(?:ое|ое помещ)|warehouse|(?<![а-яёіїґ])склад(?!н|ыв)|производствен(?:ное|ых) ?помещ|spatiu comercial|(?:închiriez|inchiriez|vând|vand)\s+birou|birou\s+de\s+(?:închiriat|inchiriat|vânzare|vanzare)|\d+\s*sot(?:ix|ka)|\d+\s*сот(?:ок|ка|ки|ых)|yer\s*maydoni|bosh\s*yer|уч[аа]сток\s*земл|servis\s*uchun|kassaprav|avtomoyka|автомойк|car\s?wash|шиномонтаж|салон\s*красот|zallik\s*saloni|beauty\s*salon|beauty[\s-]?кабинет|космет(?:ическ|олог)[а-яё]*\s*кабинет|массажн[а-яё]*\s*кабинет|маникюрн[а-яё]*\s*(?:кабинет|студи)|nail\s*(?:bar|studio|salon)|аренда\s+(?:beauty\s+)?кабинет|парикмахерск|барбершоп|barbershop|аренда\s+рабоч(?:его|ее)\s*мест|рабоч(?:ее|его)\s*мест[оае]\s+(?:мастер|для\s+мастер|под\s+)|оренд[аи]\s+робоч(?:ого|е)\s*місц|аренда\s+гараж|гараж[ае]?\s+(?:аренд|сда[её]тся|ijara)|\bgaraj\b|\bgarage\b|o[\u2018\u2019\u02bb\u02bc'`ʻʼ]?quv\s*xona|o[\u2018\u2019\u02bb\u02bc'`ʻʼ]?quv\s*markaz|учебн(?:ый|ое|ая|ого)\s*(?:класс|помещ|кабинет|центр)|под\s+(?:бар|каф[её]|ресторан|магазин|салон|склад|бизнес|спортпит|спорт\s*пит|аптек|пекарн|пункт|шоурум|showroom|офис)|шоурум|showroom|спортпит|sportpit|\bsklad(?:lar)?\b|\bombor(?:xona)?\b|(?:avto\s*)?ser?vis\s+(?:arenda|ijara|beriladi)|авто\s?сервис\s+(?:аренд|сда[её]тся)|детейлинг|detailing|^\s*парковк|avtoturargoh|sot(?:ish|uv)\w*\s*joy|savdo\s*(?:uchun|joy)|(?:ijara\w*|arenda\w*|sot(?:ish|uv)\w*)\s+do[\u2018\u2019'`ʻʼ]?kon|do[\u2018\u2019'`ʻʼ]?kon\s+(?:ijara\w*|arenda\w*|sot(?:ish|uv)\w*)|(?:аренд|сда[её]т|сдам|прода|продаж)[а-яё]*\s+(?:(?:в|под|аренду|готов[а-яё]*|действующ[а-яё]*|срочно|отдельн[а-яё]*|стоящ[а-яё]*|цел[а-яё]*)\s+){0,3}(?:здани|каф[её])|бутик|[|,/]\s*(?:салон|бутик|аптек)|arenda\w*\s+joy|ijara\w*\s+joy|готов[а-яё]*\s+бизнес|tayyor\s+biznes|бизнес\s+(?:ресторан|каф[её]|магазин)|(?:сда[её]тся|аренда|прода[её]тся)\s+(?:готов[а-яё]*\s+)?(?:ресторан|каф[её]|чайхан|choyxona)|marojni|muzqaymoq)/i;

export function looksCommercialHousing(value) {
  return value ? COMMERCIAL_HOUSING_RE.test(String(value)) : false;
}

const GROUP_LODGING_RE = /(?:hotel|hostel|mehmonxona|гостиниц[аы]|отел[ьи]|хостел|booking|брон(?:ь|ировать)|rezervatsiya|номера\s+от|rooms?\s+from|сеть\s+(?:отел|гостиниц)|hotel\s+group|группа\s+отел)/iu;
const GROUP_PROMOTION_RE = /(?:kanal(?:imiz|ga)?|канал(?:е|ымыз)?|group\s+of\s+(?:hotels?|properties)|bizning\s+(?:hotel|hostel)|our\s+(?:hotels?|properties)|catalog(?:ue)?|каталог)/iu;

/** Evidence-based guard for hotel/hostel catalog promotions. */
export function classifyHousingCommercialAdvertisement(value) {
  const text = String(value || '');
  if (!text.trim()) return Object.freeze({ commercial: false, confidence: 0, signals: Object.freeze([]) });
  const signals = [];
  if (COMMERCIAL_HOUSING_RE.test(text)) signals.push('commercialPremises');
  if (GROUP_LODGING_RE.test(text)) signals.push('lodgingService');
  if (GROUP_PROMOTION_RE.test(text)) signals.push('groupPromotion');
  const properties = text.match(/(?:hotel|hostel|mehmonxona|гостиниc[аы]|гостиниц[аы]|отел[ьи]|хостел)\s*[«"']?[\p{L}\d-]+/giu) || [];
  if (properties.length >= 2) signals.push('multipleProperties');
  const contacts = text.match(/\+?\d(?:[\s().-]*\d){7,}/gu) || [];
  if (contacts.length >= 3) signals.push('manyContacts');
  const commercial = signals.includes('commercialPremises') ||
    (signals.includes('lodgingService') && (signals.includes('groupPromotion') || signals.includes('multipleProperties') || signals.includes('manyContacts')));
  return Object.freeze({ commercial, confidence: commercial ? Math.min(1, 0.45 + signals.length * 0.15) : 0, signals: Object.freeze(signals) });
}

// A "parking space" mention is only commercial when the same text does not
// also name a residential unit (owners often list a parking spot alongside
// the flat itself, e.g. "квартира с парковочным местом").
const PARKING_OBJECT_RE = /(?:парко?мест[а-яёіїґ]*|парковочн[а-яёіїґ]*\s+мест[а-яёіїґ]*|машино[-\s]?мест[а-яёіїґ]*|мест[а-яёіїґ]*\s+(?:в|на)\s+(?:паркинг[а-яёіїґ]*|парковк[а-яёіїґ]*)|parking\s+(?:space|spot)s?)/iu;
const HOUSING_OBJECT_RE = /(?:квартир[а-яёіїґ]*|апартамент[а-яёіїґ]*|студи[яії][а-яёіїґ]*|будин[а-яіїґ]*|(?:^|[^\p{L}\p{N}_])дом(?:а|ом|у|ов)?(?=$|[^\p{L}\p{N}_])|жиль[а-яё]*|житл[а-яіїґ]*|flat\b|apartment\b|studio\b|house\b|xonadon\b|kvartira\b|apartament\b|garsonier[ăa]\b)/iu;

export function looksParkingOnly(value) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (!text || !PARKING_OBJECT_RE.test(text)) return false;
  return !HOUSING_OBJECT_RE.test(text);
}

// Cross-language "no agency" / "direct from owner" signals.
//
// This is a separate, deliberately broader/stricter pattern than
// SELLER_TERMS.owner (housing.js) / parseHousingSeller (housing-structured.js)
// — not an accidental duplicate. Consumers use isDirectOwner as a
// high-confidence override checked BEFORE falling back to
// parseHousingSeller's owner-vs-agency comparative scoring (see
// classifyTelegramAgency in whiteslove.me-backend-platform's
// apps/flats/src/scrapers/telegram.js). If you're tempted to merge these,
// check that call site's expectations first.
const DIRECT_OWNER_RE = /(?:без\s+(?:макл(?:ер[а-яё]*)?|посредник[а-яё]*|ри[еэ]?лтор[а-яё]*|агент[а-яё]*)|от\s+(?:собственник[а-яё]*|хозяин[а-яё]*)|від\s+(?:власник[а-яіїґ]*|власниц[яії][а-яіїґ]*|господар[а-яіїґ]*)|без\s+(?:посередник[а-яіїґ]*|рі[єе]лтор[а-яіїґ]*|агент[а-яіїґ]*)|прямо\s+від\s+(?:власник[а-яіїґ]*|власниц[яії][а-яіїґ]*|господар[а-яіїґ]*)|(?:власник|власниця)\s+(?:зда[єе]|прода[єе])|no\s+(?:agency|broker|realtor|agent)|owner\s+direct|direct\s+from\s+(?:owner|landlord)|f(?:ă|a)r(?:ă|a)\s+(?:agen(?:ț|t)ie|intermediar\w*)|direct\s+(?:de\s+la\s+)?proprietar|makler\s*[- ]?siz|maklersiz|bez\s*makler(?:a|ov)?|bezmakler(?:a|ov)?|vositachi\s*[- ]?siz|vositachisiz|egasidan|uy\s+egasidan|делдалсыз|делдал\s*жоқ|иесінен|үй\s+иесінен)/iu;

// Cross-language "no commission" signals. Direct-owner language implies zero
// commission even without an explicit "no commission" phrase.
const EXPLICIT_ZERO_COMMISSION_RE = /(?:без\s+(?:комисси[а-яё]*|комісі[а-яіїґ]*|комиссионн[а-яё]*)|no\s+(?:commission|agency\s+fee|broker\s+fee|realtor\s+fee|agent\s+fee)|f(?:ă|a)r(?:ă|a)\s+comision|komissiya\s*[- ]?siz|komissiyasiz|комиссиясыз|комиссия\s*жоқ)/iu;

export function isDirectOwner(value) {
  return Boolean(value) && DIRECT_OWNER_RE.test(String(value));
}

export function hasZeroCommissionSignal(value) {
  return isDirectOwner(value) || (Boolean(value) && EXPLICIT_ZERO_COMMISSION_RE.test(String(value)));
}

// A Telegram group's own "welcome"/intro post routinely names the group
// itself, and a real-estate group is typically named after what it rents
// out ("Оренда квартир Одеса"). That alone can satisfy HOUSING_RE-style
// content gates even though the message describes no property at all -- it
// is a greeting, not a listing. No genuine single-property ad opens with
// "welcome to the group", so this is safe to treat as a strong, low-noise
// signal on its own.
const GROUP_WELCOME_RE = /(?:добро\s+пожаловать\s+в\s+групп\p{L}*|ласкаво\s+просимо\s+(?:до|в)\s+груп\p{L}*|welcome\s+to\s+(?:the\s+|our\s+)?group|bine\s+a[țt]i\s+venit\s+[îi]n\s+grup|guruhga\s+xush\s+kelibsiz|топқа\s+қош\s+келдіңіз)/iu;

/**
 * A group's channel welcome/intro post, or an off-topic channel
 * cross-promotion riding on the group's housing-flavored name -- neither
 * describes a specific property and both should be excluded from listing
 * feeds even when they incidentally contain housing keywords.
 */
export function looksLikeGroupWelcomeMessage(value) {
  return Boolean(value) && GROUP_WELCOME_RE.test(String(value));
}
