import test from 'node:test';
import assert from 'node:assert/strict';
import {
  parseHousingAreas,
  parseHousingFloor,
  parseHousingInfrastructure,
  parseHousingPayments,
  parseHousingRoomCount,
  parseHousingSeller,
  parseHousingStructured,
} from '../src/housing-structured.js';
import { parseHousingPrice } from '../src/housing-money.js';
import { parseHousingAddress } from '../src/housing-address.js';
import {
  parseHousingAmenities,
  parseHousingAreaFromText,
  parseHousingAudience,
  parseHousingResidentialComplex,
} from '../src/housing-text.js';
import { parseHousingListingFields } from '../src/housing-listing-fields.js';
import { parseHousingContext } from '../src/housing-context.js';
import { resolveHousingIntent } from '../src/housing-intent.js';
import { resolveHousingOccupancy, resolveHousingPropertyType } from '../src/housing.js';
import { matchCentralAsiaLocationEntities } from '../src/central-asia-locations.js';

test('normalizes multilingual room counts and floor fractions', () => {
  assert.equal(parseHousingRoomCount('Сдам 2-к квартиру'), 2);
  assert.equal(parseHousingRoomCount('3 xona kvartira'), 3);
  assert.equal(parseHousingRoomCount('4 бөлмелі пәтер'), 4);
  assert.equal(parseHousingRoomCount('1- хоналик квартира'), 1);
  assert.equal(parseHousingRoomCount('2 хона'), 2);
  assert.deepEqual(parseHousingFloor('Этаж 3/9'), { floor: 3, totalFloors: 9 });
  assert.deepEqual(parseHousingFloor('4- каватда квартира'), { floor: 4, totalFloors: null });
  assert.deepEqual(parseHousingFloor('16 этажлик дом, 13-этаж'), { floor: 13, totalFloors: 16 });
  assert.deepEqual(parseHousingFloor('Перший поверх'), { floor: 1, totalFloors: null });
  assert.deepEqual(parseHousingFloor('Квартира на першому поверсі'), { floor: 1, totalFloors: null });
});

test('parses written room counts across Russian and Uzbek scripts', () => {
  assert.equal(parseHousingRoomCount('ikki xonali kvartira'), 2);
  assert.equal(parseHousingRoomCount('уч хонали квартира'), 3);
  assert.equal(parseHousingRoomCount('пятикомнатная квартира'), 5);
  assert.equal(parseHousingRoomCount("o'n xonali uy"), 10);
});

test('parses the supplied Uzbek family rental description without dropping structured details', () => {
  const text = 'Assalomu Alaykoʻm kvartira juda yaxshi xolatda 2 ta katta xona 1 ta kichkina xona kuxnisi aloxida dush tualet aloxida bitta oila bemalol yashasa boʻladi yashashga tayyor zaks qogʻozi yuqlar bezota qilmasin. Yilning oxiri dekabrgacha yashasa buladi. Uyning depaziti xam bor 500.$ &#x20;';
  const result = parseHousingStructured(text, { country: 'UZ', fallbackCurrency: 'USD' });

  assert.equal(result.rooms, 3);
  assert.equal(result.context.condition, 'good');
  assert.equal(result.context.rentDuration, 'fixedTerm');
  assert.equal(parseHousingAudience(text), 'family');
  assert.equal(result.listingFields.depositRequired, true);
  assert.deepEqual(result.payments.deposit, {
    required: true,
    kind: 'deposit',
    amount: 500,
    currency: 'USD',
  });
  assert.deepEqual(result.price, { amount: null, currency: 'USD', approximate: false });
});

test('parses the supplied Uzbek women-only flat-share description', () => {
  const text = 'Yaxshi tartibli ozoda qiz bosa sherik olaman 2 ta bob yashimiz uy yevro remont telivizor kirmoshina kandisaner hamma sharoitlari bir';
  const result = parseHousingStructured(text, { country: 'UZ', fallbackCurrency: 'USD' });

  assert.equal(resolveHousingOccupancy(text), 'sharedRoom');
  assert.equal(parseHousingAudience(text), 'women');
  assert.equal(result.context.condition, 'euroRenovation');
  assert.equal(result.listingFields.airConditioner, true);
  assert.deepEqual(result.amenities, [
    'washingMachine',
    'television',
    'airConditioner',
    'moveInReady',
  ]);
});

test('parses the supplied Uzbek men-only courtyard bed-space description', () => {
  const text = 'Arenda kvartira Chilonzor faqat ogil bollarga student yandex taksida ishlidigonlarga zor variant hamma sharoit bor 24/7 ishlimiz hovli joy kvartira emas narxi 450000 ming som oyiga 50,000 ming som kamunalka aloxida hamma sharoit 210 tagacha odam olamiz qogan malumot telefon orqali +998909160285';
  const result = parseHousingStructured(text, { country: 'UZ' });

  assert.equal(parseHousingAudience(text), 'men');
  assert.equal(resolveHousingOccupancy(text), 'bedSpace');
  assert.equal(resolveHousingPropertyType(text), 'house');
  assert.ok(result.amenities.includes('moveInReady'));
  assert.equal(result.listingFields.communalSeparated, true);
  assert.deepEqual(result.price, { amount: 450_000, currency: 'UZS', approximate: false });
});

test('parses the supplied Navoiy rental without inventing a location from prose', () => {
  const text = 'Ижарага берилади Орентир 3 поликленика ПАНОРАМА ресторан якин 2 хонали 3 этаж Нархи 2500.000 сум КАМИ ЙУК БУЛИШИ КАМУНАЛ ТУЛОВЛАРИ АЛОХИДА (оилага) МАКЛЕР ХИЗМАТИ БОР 90 6467376 кунгирок килинг ёки телеграмга хабар ёзинг вариантлар бор СРОЧНО ИЖАРАГА БЕРИЛАДИ';
  const result = parseHousingStructured(text, { country: 'UZ' });
  const locations = matchCentralAsiaLocationEntities(text, 'UZ', 'Navoiy');

  assert.equal(result.rooms, 2);
  assert.deepEqual(result.floor, { floor: 3, totalFloors: null });
  assert.deepEqual(result.price, { amount: 2_500_000, currency: 'UZS', approximate: false });
  assert.equal(result.listingFields.communalSeparated, true);
  assert.equal(result.payments.utilities, 'utilitiesSeparate');
  assert.equal(result.address.address, null);
  assert.deepEqual(locations.matches, []);
});

test('extracts typed area details without collapsing labels', () => {
  assert.deepEqual(parseHousingAreas('Общая площадь 75 м², жилая 44 м², кухня 12 м², балкон 5 м²'), {
    total: 75,
    living: 44,
    kitchen: 12,
    balcony: 5,
    terrace: null,
  });
});

test('extracts deposit, utilities and commission context', () => {
  const result = parseHousingPayments('Депозит 500 USD. Предоплата за 2 месяца. Коммунальные отдельно. Без комиссии.');
  assert.equal(result.deposit.required, true);
  assert.equal(result.deposit.amount, 500);
  assert.equal(result.deposit.currency, 'USD');
  assert.deepEqual(parseHousingPayments('Депозит 1 500 000 UZS').deposit, {
    required: true, kind: 'deposit', amount: 1_500_000, currency: 'UZS',
  });
  assert.equal(result.prepaymentMonths, 2);
  assert.equal(result.utilities, 'utilitiesSeparate');
  assert.equal(result.commission.required, false);
});

test('does not confuse a following phone number with a deposit amount', () => {
  const result = parseHousingPayments('Цена 450$\n\nИмеется договорной депозит.\n\n+998903720270 @arenda_tashkent10');
  assert.deepEqual(result.deposit, { required: true, kind: 'deposit', amount: null, currency: null });
});

test('does not confuse a deposit duration with a money amount', () => {
  const result = parseHousingPayments('Депозит за 1 месяц');
  assert.equal(result.deposit.required, true);
  assert.equal(result.deposit.amount, null);
  assert.equal(result.deposit.currency, null);
});

test('structured parser keeps deposit duration and fixed commission amount', () => {
  const result = parseHousingStructured('Депозит за 2 месяца. Комиссия 300 USD.');
  assert.equal(result.payments.deposit.required, true);
  assert.equal(result.payments.depositMonths, 2);
  assert.equal(result.payments.deposit.amount, null);
  assert.equal(result.payments.commission.required, true);
  assert.equal(result.payments.commission.percent, null);
  assert.equal(result.payments.commissionAmount.amount, 300);
  assert.equal(result.payments.commissionAmount.currency, 'USD');
});

test('parses percent placed before the commission keyword', () => {
  const result = parseHousingPayments('Цена 1200 у.е. + 50% комиссия агенства от первого месяца');
  assert.equal(result.commission.required, true);
  assert.equal(result.commission.percent, 50);
});

test('owner context remains independent from no-commission semantics', () => {
  assert.deepEqual(parseHousingSeller('От хозяина, без комиссии'), { type: 'owner', confidence: 1 });
});

test('agency seller recognizes misspelling, service commission and brokerage prose', () => {
  assert.deepEqual(parseHousingSeller('50% комиссия агенства от первого месяца'), { type: 'agency', confidence: 1 });
  assert.deepEqual(parseHousingSeller('2 млн 500 + агентство хизмати'), { type: 'agency', confidence: 1 });
  assert.deepEqual(
    parseHousingSeller('Оперативный, профессиональный подбор лучших вариантов на рынке Недвижимости по Вашим пожеланиям!'),
    { type: 'agency', confidence: 1 },
  );
});

test('binds infrastructure distance to nearby POI', () => {
  const matches = parseHousingInfrastructure('До метро 5 минут пешком, до школы 15 минут.');
  const metro = matches.find(({ poi }) => poi === 'Metro');
  const school = matches.find(({ poi }) => poi === 'School');
  assert.equal(metro?.distance?.value, 5);
  assert.equal(metro?.distance?.mode, 'walk');
  assert.equal(school?.distance?.value, 15);
});

test('covers the supplied Dream House listing across shared housing parsers', () => {
  const text = `
    ЖК Dream House Яккасарайский район 8 этаж из 10
    2 комнаты полноценные + кухня, гардеробная отдельной комнатой
    2 санузла 80 квадратов Депозит за 1 месяц
    Свое бесплатное парковочное место!
    Ор-р 8 роддом, улица Абдулла Каххара
    Цена 1200 у.е. + 50% комиссия агенства от первого месяца
  `;

  assert.equal(parseHousingResidentialComplex(text), 'Dream House');
  assert.equal(parseHousingRoomCount(text), 2);
  assert.deepEqual(parseHousingFloor(text), { floor: 8, totalFloors: 10 });
  assert.equal(parseHousingAreaFromText(text), 80);
  assert.equal(parseHousingPayments(text).deposit.required, true);
  assert.equal(parseHousingPayments(text).deposit.amount, null);
  assert.equal(parseHousingPayments(text).commission.percent, 50);
  assert.deepEqual(parseHousingSeller(text), { type: 'agency', confidence: 1 });
  assert.deepEqual(parseHousingPrice(text), { amount: 1200, currency: 'USD', approximate: false });
  assert.ok(parseHousingInfrastructure(text).some(({ poi }) => poi === 'Maternity hospital'));
});

test('unified structured parser composes the supplied Dream House listing', () => {
  const text = `
    ЖК Dream House Яккасарайский район 8 этаж из 10
    2 комнаты полноценные + кухня, гардеробная отдельной комнатой
    2 санузла 80 квадратов Депозит за 1 месяц
    Свое бесплатное парковочное место!
    Ор-р 8 роддом, улица Абдулла Каххара Цена 1200 у.е. + 50% комиссия агенства от первого месяца
  `;
  const result = parseHousingStructured(text);

  assert.equal(result.residentialComplex, 'Dream House');
  assert.equal(result.rooms, 2);
  assert.deepEqual(result.floor, { floor: 8, totalFloors: 10 });
  assert.equal(result.area.total, 80);
  assert.deepEqual(result.price, { amount: 1200, currency: 'USD', approximate: false });
  assert.equal(result.address.street, 'Абдулла Каххара');
  assert.equal(result.address.houseNumber, null);
  assert.equal(result.listingFields.bathrooms, 2);
  assert.equal(result.listingFields.parking, true);
  assert.equal(result.payments.depositMonths, 1);
  assert.equal(result.payments.commission.percent, 50);
});

test('covers the supplied Qorasuv Cyrillic Uzbek listing semantics', () => {
  const text = `
    ЗУДЛИК БИЛАН УЙ ИЖАРАГА БЕРИЛАДИ!!!
    Корасув Массиви
    81-мактаб атрофида
    16 этажлик дом
    13-этаж
    2 хона
    2 млн 500 + агентство хизмати
  `;

  assert.equal(parseHousingRoomCount(text), 2);
  assert.deepEqual(parseHousingFloor(text), { floor: 13, totalFloors: 16 });
  assert.deepEqual(parseHousingPrice(text, 'UZS'), { amount: 2_500_000, currency: 'UZS', approximate: false });
  assert.deepEqual(parseHousingSeller(text), { type: 'agency', confidence: 1 });
  assert.ok(parseHousingInfrastructure(text).some(({ poi }) => poi === 'School'));
});

test('structured contacts bind a same-line contact person to the phone', () => {
  const result = parseHousingStructured(`
    Корасув Массиви
    2 хона
    2 млн 500 + агентство хизмати
    +998997990183 Сохиба
  `, { country: 'UZ' });

  assert.deepEqual(result.price, { amount: 2_500_000, currency: 'UZS', approximate: false });
  assert.equal(result.contacts.phones.length, 1);
  assert.equal(result.contacts.phones[0].number, '+998997990183');
  assert.equal(result.contacts.phones[0].name, 'Сохиба');
});

test('covers the supplied Uzbek Latin equipment and infrastructure listing end to end', () => {
  const text = `
    Shahar hokimiyat orqasida "Yulduzcha" boxcha hududi.

    Mavjud jihozlari
    - splani, shkaf, mebel va oshxona jihozlari
    - televizor, muzlatgich, konditsioner, wefi
    - kir yuvish mashinasi (Samsung aftomat)

    yashash uchun barcha jihozlari bor. Qulayliklar
    - katta yulga yaqin, yulovchi transport qatnovi bor,
    - boxcha, supermarket, korzinka yaqin.
    - tinch hudud

    Hujjatlari joyida shartnoma ham qilib beriladi.
    Narxi 250$
  `;

  assert.deepEqual(parseHousingPrice(text, 'UZS'), { amount: 250, currency: 'USD', approximate: false });

  const pois = new Set(parseHousingInfrastructure(text).map(({ poi }) => poi));
  for (const poi of ['Main road', 'Public transport', 'Kindergarten', 'Supermarket', 'Korzinka']) {
    assert.equal(pois.has(poi), true, `missing POI: ${poi}`);
  }

  const amenities = new Set(parseHousingAmenities(text));
  for (const amenity of [
    'bed',
    'washingMachine',
    'refrigerator',
    'television',
    'airConditioner',
    'internet',
    'wardrobe',
    'furniture',
    'kitchenEquipment',
    'moveInReady',
  ]) {
    assert.equal(amenities.has(amenity), true, `missing amenity: ${amenity}`);
  }

  const context = parseHousingContext(text);
  assert.ok(context.documents.includes('documentsReady'));
  assert.ok(context.documents.includes('contractAvailable'));
  assert.ok(context.locationRelations.includes('near'));
});

test('covers the supplied Russian infrastructure and brokerage prose listing', () => {
  const text = 'Отличное расположение дома - всё рядом - много магазинов, Центральный рынок, метро, детские учреждения, кафе, парковая зона!! Звоните! Оперативный, профессиональный подбор лучших вариантов на рынке Недвижимости по Вашим пожеланиям!';

  const pois = new Set(parseHousingInfrastructure(text).map(({ poi }) => poi));
  for (const poi of ['Shop', 'Market', 'Metro', 'Childcare', 'Cafe', 'Park']) {
    assert.equal(pois.has(poi), true, `missing POI: ${poi}`);
  }
  assert.deepEqual(parseHousingSeller(text), { type: 'agency', confidence: 1 });
});

test('covers the supplied delayed Uzbek rent-out phrase with move-in date', () => {
  const text = 'Горгaзда 1- хоналик 4- каватда квартира ижарага 1-сентябрдан берилади';

  assert.deepEqual(resolveHousingIntent(text), {
    action: 'rentOut',
    listingKind: 'propertyOffer',
    dealType: 'longRent',
  });
  assert.equal(parseHousingRoomCount(text), 1);
  assert.deepEqual(parseHousingFloor(text), { floor: 4, totalFloors: null });
  assert.equal(parseHousingListingFields(text).availableFrom, '1-сентябр');
});

test('does not parse a following price as the house number of a named street', () => {
  const parsed = parseHousingAddress('Ор-р 8 роддом, улица Абдулла Каххара Цена 1200 у.е. + 50% комиссия');
  assert.equal(parsed.street, 'Абдулла Каххара');
  assert.equal(parsed.houseNumber, null);
});

test('negative amenity wording wins over bare amenity mentions', () => {
  const result = parseHousingListingFields(`
    Без кондиционера. Парковки нет. Нет горячей воды. Лифта нет.
    Без интернета. Отопления нет. Балкона нет. Посудомоечной машины нет.
    Двора нет. Беседки нет.
  `);

  assert.equal(result.airConditioner, false);
  assert.equal(result.parking, false);
  assert.equal(result.hotWater, false);
  assert.equal(result.elevator, false);
  assert.equal(result.internet, false);
  assert.equal(result.heating, false);
  assert.equal(result.balcony, false);
  assert.equal(result.dishwasher, false);
  assert.equal(result.courtyard, false);
  assert.equal(result.gazebo, false);
});

test('parses split millions written with the full million word', () => {
  assert.deepEqual(parseHousingPrice('Narxi 2 миллион 500', 'UZS'), { amount: 2_500_000, currency: 'UZS', approximate: false });
  assert.deepEqual(parseHousingPrice('2 млн. 500', 'UZS'), { amount: 2_500_000, currency: 'UZS', approximate: false });
});

test('preserves numbered and named landmark identity around canonical POIs', () => {
  const matches = parseHousingInfrastructure('81-мактаб атрофида, Ор-р 8 роддом, "Yulduzcha" boxcha hududi');
  const school = matches.find(({ poi }) => poi === 'School');
  const maternity = matches.find(({ poi }) => poi === 'Maternity hospital');
  const kindergarten = matches.find(({ poi }) => poi === 'Kindergarten');

  assert.equal(school?.number, 81);
  assert.equal(school?.raw, '81-мактаб');
  assert.equal(maternity?.number, 8);
  assert.equal(maternity?.raw, '8 роддом');
  assert.equal(kindergarten?.name, 'Yulduzcha');
  assert.equal(kindergarten?.raw, '"Yulduzcha" boxcha');
});

test('structured parser strips Threads chrome and preserves the account as source contact', () => {
  const result = parseHousingStructured(`
    nika_imgrund
    3d
    Сдам 2 комнатную квартиру. Цена 1200$. Wi-Fi.
    Translate
  `);

  assert.equal(result.source.platform, 'Threads');
  assert.equal(result.source.contact, 'nika_imgrund');
  assert.deepEqual(result.contacts.source, { source: 'Threads', value: 'nika_imgrund' });
  assert.equal(result.text.includes('nika_imgrund'), false);
  assert.equal(result.text.includes('Translate'), false);
  assert.equal(result.rooms, 2);
  assert.deepEqual(result.price, { amount: 1200, currency: 'USD', approximate: false });
  assert.equal(result.listingFields.internet, true);
});
