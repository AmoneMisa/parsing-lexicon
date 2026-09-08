import test from 'node:test';
import assert from 'node:assert/strict';
import { maskPhoneLikeSpans } from '../src/contact.js';
import { canonicalTashkentDistrict } from '../src/geo.js';
import { matchSkill, matchSkillCandidates } from '../src/hiring-skills.js';
import { classifyHousingCommercialAdvertisement } from '../src/housing-commercial.js';
import { extractHousingMoneyCandidates, parseHousingPrice, rankHousingPriceCandidates } from '../src/housing-money.js';
import { matchTashkentHousingMetro } from '../src/tashkent-housing-geography.js';

test('housing price ranks the replacement price above an old price and deposit', () => {
  assert.deepEqual(parseHousingPrice('350$ ... 400$ 350$ tushirilgan 100$ depazit', { country: 'UZ' }), {
    amount: 350, currency: 'USD', approximate: false,
  });
  assert.deepEqual(parseHousingPrice('price reduced from 400 to 350 USD', 'USD'), {
    amount: 350, currency: 'USD', approximate: false,
  });
});

test('money candidates retain ranking evidence rather than selecting by magnitude', () => {
  const ranked = rankHousingPriceCandidates(extractHousingMoneyCandidates('old price 400$, new price 350$', { country: 'UZ' }));
  assert.equal(ranked[0].amount, 350);
  assert.equal(ranked[0].paymentRole, 'currentPrice');
  assert.equal(ranked.at(-1).amount, 400);
});

test('explicit Uzbek thousand scale owns its UZS currency and UZ phones are masked', () => {
  assert.deepEqual(parseHousingPrice('Narxi 850 ming', { country: 'UZ' }), {
    amount: 850000, currency: 'UZS', approximate: false,
  });
  assert.equal(maskPhoneLikeSpans('99 188 19 19', ' ', { country: 'UZ' }).trim(), '');
  assert.equal(parseHousingPrice('99 1881919', { country: 'UZ' }).amount, null);
  assert.equal(maskPhoneLikeSpans('12/3', ' ', { country: 'UZ' }), '12/3');
});

test('Tashkent business context suppresses ambiguous metro names but explicit metro survives', () => {
  assert.equal(matchTashkentHousingMetro("Olmos to'yxonasi"), null);
  assert.equal(matchTashkentHousingMetro('Olmos metrosi')?.name, 'Olmos');
  assert.equal(canonicalTashkentDistrict('Yashnobot'), 'Yashnobod');
});

test('commercial lodging classification requires group/service evidence', () => {
  assert.equal(classifyHousingCommercialAdvertisement('Hotel Alpha, Hotel Beta. Booking via our channel. +998 90 111 11 11 +998 90 222 22 22 +998 90 333 33 33').commercial, true);
  assert.equal(classifyHousingCommercialAdvertisement('2 xona apartment, two contacts for the owner').commercial, false);
});

test('bounded hiring fuzzy matching is opt-in and protects ambiguous short skills', () => {
  assert.equal(matchSkill('Postgress', { fuzzy: true })?.canonical, 'PostgreSQL');
  assert.equal(matchSkill('Kubernets', { fuzzy: true })?.canonical, 'Kubernetes');
  assert.equal(matchSkill('reactive', { fuzzy: true }), null);
  assert.equal(matchSkill('good', { fuzzy: true }), null);
  assert.equal(matchSkill('restaurant', { fuzzy: true }), null);
  assert.equal(matchSkill('Spring'), null);
  assert.equal(matchSkillCandidates('spring season', { fuzzy: true }).some((match) => match.canonical === 'Spring'), false);
  assert.equal(matchSkill('Typescript')?.matchType, 'normalized');
  assert.equal(matchSkill('Spring', { allowAmbiguousExact: true })?.matchType, 'exact');
  assert.equal(matchSkill('Postgress'), null);
  assert.equal(matchSkillCandidates(['Postgress', 'PostgreSQL'], { fuzzy: true })[0].matchType, 'exact');
});
