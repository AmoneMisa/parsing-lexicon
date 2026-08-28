import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHousingListingEnrichment, parseHousingCommissionAmount } from '../src/housing-listing-enrichment.js';
import { parseHousingPrice } from '../src/housing-money.js';

// #3419 — real Telegram-repost of an OLX ad, using the channel's structured
// "Label - Value" bullet format (label before number) rather than natural
// "4 комнаты" phrasing.
const LISTING_3419 = 'ID #3419 #Аренда квартиры • Район - #Юнусабадский • Ориентир - #Юнусабад -19 Частная школа Vosiq School • Комнат - 4 • Этаж - 4 • Этажность - 5 • Площадь - 100 кв.м • Описание - Звоните в любое время или пишите 24/7 Отличная развитая инфраструктура рядом есть Супермаркет школы (частная и государственная) детский садики ближе к автобусной остановке дружные соседи Спальный тихий район • Цена - 800$ • Тел: 993430909 Жахонгир • подпишись на канал • • Каналга уланинг • | TELEGRAM | INSTAGRAM |';

test('#3419 Vosiq School listing: rooms/floor/area parse from the structured Telegram-repost format', () => {
  const enrichment = parseHousingListingEnrichment(LISTING_3419, { country: 'UZ' });
  assert.equal(enrichment.rooms, 4);
  assert.equal(enrichment.floor, 4);
  assert.equal(enrichment.totalFloors, 5);
  assert.equal(enrichment.areaSqm, 100);
});

test('#3419 Vosiq School listing: price parses separately as 800 USD', () => {
  assert.deepEqual(parseHousingPrice(LISTING_3419, 'UZS'), { amount: 800, currency: 'USD', approximate: false });
});

test('#3419 Vosiq School listing: nearby typo variants canonicalize without duplicates', () => {
  const enrichment = parseHousingListingEnrichment(LISTING_3419, { country: 'UZ' });
  assert.ok(enrichment.nearby.includes('Vosiq School'));
  assert.ok(enrichment.nearby.includes('Supermarket'));
  assert.ok(enrichment.nearby.includes('Kindergarten'));
  assert.ok(enrichment.nearby.includes('Bus stop'));
  assert.equal(new Set(enrichment.nearby).size, enrichment.nearby.length);
});

// Assalom Jomiy — floor 12/15, ЖК Assalom Jomiy, family audience, 600 USD
// rent + 300 USD realtor commission, utilities separate (amount unstated),
// and a structured "общая площадь 35" that must win over a wrong "20 м²"
// a source site might otherwise attach as stale metadata (that merge-priority
// concern is a consumer-side (flat-finder) responsibility — this only proves
// the lexicon itself resolves the in-text conflict correctly).
const LISTING_ASSALOM_JOMIY = 'Сдается квартира в ЖК Assalom Jomiy, круг Жомий, этаж 12/15. Общая площадь 35 м², хотя на фото указано 20 м² — не смотрите на старое фото. Для семьи. Цена 600$ в месяц, риэлтору 300$. Коммунальные отдельно.';

test('Assalom Jomiy listing: floor, residential complex, audience and structured area', () => {
  const enrichment = parseHousingListingEnrichment(LISTING_ASSALOM_JOMIY, { country: 'UZ' });
  assert.equal(enrichment.floor, 12);
  assert.equal(enrichment.totalFloors, 15);
  assert.equal(enrichment.audience, 'family');
  assert.equal(enrichment.areaSqm, 35, 'explicit "общая площадь 35" must win over the incidental "20 м²" mention');
  assert.equal(enrichment.communalSeparated, true);
});

test('Assalom Jomiy listing: commission amount parses separately from the main rent', () => {
  const enrichment = parseHousingListingEnrichment(LISTING_ASSALOM_JOMIY, { country: 'UZ' });
  assert.deepEqual(enrichment.commissionAmount, { amount: 300, currency: 'USD', approximate: false });
  assert.deepEqual(parseHousingPrice(LISTING_ASSALOM_JOMIY, 'UZS'), { amount: 600, currency: 'USD', approximate: false });
});

test('parseHousingCommissionAmount ignores listings with no monetary commission mention', () => {
  assert.equal(parseHousingCommissionAmount('Сдается квартира, без комиссии'), null);
});

test('housing enrichment does not turn a metro-only Olmazor mention into Almazar district', () => {
  const metro = parseHousingListingEnrichment('Квартира рядом с метро Олмазор', { country: 'UZ' });
  assert.equal(metro.metro, 'Olmazor');
  assert.equal(metro.district, null);

  const district = parseHousingListingEnrichment('Квартира, Алмазарский район', { country: 'UZ' });
  assert.equal(district.district, 'Almazar');
  assert.equal(district.metro, null);
});

test('housing enrichment keeps Kuylyuk massif distinct from Qoyliq metro', () => {
  const massif = parseHousingListingEnrichment('Сдам квартиру, Куйлюк 5 массив', { country: 'UZ' });
  assert.equal(massif.metro, null);

  const metro = parseHousingListingEnrichment('Сдам квартиру рядом с метро Куйлюк', { country: 'UZ' });
  assert.equal(metro.metro, 'Qoyliq');
});

const LISTING_BUKHARA_450 = '8 каватли янги гиштли лифтли домнинг 4 Чи каватидаги 2 хонали люкс квартира ижарага берилади. Ориентир Крытий рынок Давр банк. 2 та смарт ТВ 2 та кондиционер холодильник WF бор. Нархи:450 $';

test('Bukhara OLX listing: parses Cyrillic Uzbek floor prose, Wi-Fi typo and core fields', () => {
  const enrichment = parseHousingListingEnrichment(LISTING_BUKHARA_450, { country: 'UZ' });
  assert.equal(enrichment.rooms, 2);
  assert.equal(enrichment.floor, 4);
  assert.equal(enrichment.totalFloors, 8);
  assert.equal(enrichment.elevator, true);
  assert.equal(enrichment.internet, true);
  assert.equal(enrichment.airConditioner, true);
  assert.deepEqual(parseHousingPrice(LISTING_BUKHARA_450, 'UZS'), { amount: 450, currency: 'USD', approximate: false });
});

const LISTING_SERGELI_500 = 'Assalomu Alaykoʻm kvartira juda yaxshi xolatda 2 ta katta xona 1 ta kichkina xona kuxnisi aloxida dush tualet aloxida bitta oila bemalol yashasa boʻladi yashashga tayyor zaks qogʻozi yuqlar bezota qilmasin. Yilning oxiri dekabrgacha yashasa buladi. Uyning depaziti xam bor 500.$';

test('Sergeli OLX listing: parses room sum, kitchen typo, family audience and deposit typo', () => {
  const enrichment = parseHousingListingEnrichment(LISTING_SERGELI_500, { country: 'UZ' });
  assert.equal(enrichment.rooms, 3);
  assert.ok(enrichment.amenities.includes('Kitchen'));
  assert.equal(enrichment.audience, 'family');
  assert.equal(enrichment.deposit, true);
  assert.deepEqual(parseHousingPrice(LISTING_SERGELI_500, 'UZS'), { amount: 500, currency: 'USD', approximate: false });
});

const LISTING_CENTRAL_HOUSE_800 = 'СТУДЕНТАМ И РАБОТАЮЩИМ РЕБЯТАМ НЕ СДАЁТСЯ !!! Сдается упакованная квартира. Рядом есть вся инфраструктура: супермаркеты, базар, транспорт, кафе и рестораны, парки, детские площадки. Все находится в шаговой доступности. Имеется Риэлторская услуга. Уй атрофида, метро, бозор, богча, мактаб, кафе, ресторан, шифохона, сайлгохлар мавжуд. Риэлтор хизмати мавжуд.';

test('Central House OLX listing: nearby categories are canonical and negated student wording is not positive targeting', () => {
  const enrichment = parseHousingListingEnrichment(LISTING_CENTRAL_HOUSE_800, { country: 'UZ' });
  for (const poi of ['Supermarket', 'Market', 'Cafe', 'Restaurant', 'Park', 'Playground', 'Metro', 'Kindergarten', 'School', 'Hospital']) {
    assert.ok(enrichment.nearby.includes(poi), `expected nearby to include ${poi}`);
  }
  assert.equal(new Set(enrichment.nearby).size, enrichment.nearby.length);
  assert.equal(enrichment.studentTarget, false);
  assert.equal(enrichment.audience, null);
  assert.equal(enrichment.commission, true);
});

// TODO(follow-up): add exact-text regressions for #3428, #8398667, #8390002,
// #8388527, #8390008, #8386865, #8386867, and a Mercor job-posting example
// once the raw source text for each is supplied — see the plan's "Known
// follow-up" section.
