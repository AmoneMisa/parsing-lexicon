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

// TODO(follow-up): add exact-text regressions for #3428, #8398667, #8390002,
// #8388527, #8390008, #8386865, #8386867, and a Mercor job-posting example
// once the raw source text for each is supplied — see the plan's "Known
// follow-up" section.
