import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ADDRESS_TERMS,
  APPLIANCE_TERMS,
  CANDIDATE_FIELD_TERMS,
  DEAL_TYPES,
  DEPOSIT_TERMS,
  EMPLOYMENT_TYPES,
  HIRING_INTENT,
  HOUSING_OCCUPANCY_TYPES,
  PROBATION_TERMS,
  SCHEDULE_TERMS,
  TASHKENT_METRO,
  WORK_MODES,
  canonicalAnyCity,
  canonicalCity,
  canonicalCountry,
  canonicalCountryCode,
  canonicalRegion,
  canonicalTashkentDistrict,
  canonicalTashkentMetro,
  findCanonical,
  foldCyrillicForSearch,
  matchDictionaryLocation,
  normalizeForMatch,
} from '../src/index.js';

const aliasValues = (entry) => Object.values(entry.aliases).flat();

test('normalizes Uzbek apostrophe variants to the same match form', () => {
  const variants = ["O'zbekiston", 'O‘zbekiston', 'Oʻzbekiston', 'Oʼzbekiston'];
  assert.equal(new Set(variants.map(normalizeForMatch)).size, 1);
});

test('folds Uzbek and Kazakh Cyrillic search characters', () => {
  assert.equal(foldCyrillicForSearch('Ўзбекистон'), 'ozbekiston');
  assert.equal(foldCyrillicForSearch('Қарағанды'), 'qaragandy');
  assert.equal(foldCyrillicForSearch('Өскемен'), 'oskemen');
});

test('canonicalizes country names across project languages', () => {
  assert.equal(canonicalCountryCode('Ўзбекистон'), 'UZ');
  assert.equal(canonicalCountryCode('Қазақстан Республикасы'), 'KZ');
  assert.equal(canonicalCountryCode('Україна'), 'UA');
  assert.equal(canonicalCountryCode('România'), 'RO');
  assert.equal(canonicalCountry('Ucraina'), 'Ukraine');
  assert.equal(canonicalCountry('Румунія'), 'Romania');
});

test('canonicalizes Uzbek cities across scripts', () => {
  assert.equal(canonicalCity('Тошкент', 'UZ'), 'Tashkent');
  assert.equal(canonicalCity('Samarqand', 'UZ'), 'Samarkand');
  assert.equal(canonicalCity('Фарғона', 'UZ'), 'Fergana');
  assert.equal(canonicalCity('Қарши', 'UZ'), 'Qarshi');
});

test('canonicalizes Kazakh cities using Kazakh, Russian and historical names', () => {
  assert.equal(canonicalCity('Қарағанды', 'KZ'), 'Karaganda');
  assert.equal(canonicalCity('Ақтөбе', 'KZ'), 'Aktobe');
  assert.equal(canonicalCity('Нур-Султан', 'KZ'), 'Astana');
  assert.equal(canonicalCity('Усть-Каменогорск', 'KZ'), 'Oskemen');
});

test('canonicalizes Ukrainian and Romanian cities and regions', () => {
  assert.equal(canonicalAnyCity('Чернівці', 'UA'), 'Chernivtsi');
  assert.equal(canonicalAnyCity('Cernăuți', 'UA'), 'Chernivtsi');
  assert.equal(canonicalAnyCity('București', 'RO'), 'Bucharest');
  assert.equal(canonicalAnyCity('Яссы', 'RO'), 'Iasi');
  assert.equal(canonicalRegion('Київська область', 'UA'), 'Kyiv Oblast');
  assert.equal(canonicalRegion('județul Brașov', 'RO'), 'Brasov County');
  assert.equal(canonicalRegion('Қарағанды облысы', 'KZ'), 'Karaganda Region');
  assert.equal(canonicalRegion('Тошкент вилояти', 'UZ'), 'Tashkent Region');
});

test('canonicalizes Tashkent districts across Uzbek and Russian forms', () => {
  assert.equal(canonicalTashkentDistrict('Шайхонтоҳур тумани'), 'Shaykhantahur');
  assert.equal(canonicalTashkentDistrict('Чиланзарский район'), 'Chilanzar');
  assert.equal(canonicalTashkentDistrict('Yakkasaroy tumani'), 'Yakkasaray');
});

test('Tashkent metro keeps all 50 canonical stations and legacy aliases', () => {
  assert.equal(TASHKENT_METRO.length, 50);
  assert.equal(canonicalTashkentMetro('метро Максим Горький'), 'Buyuk Ipak Yoli');
  assert.equal(canonicalTashkentMetro('Бунёдкор'), 'Xalqlar Dostligi');
  assert.equal(canonicalTashkentMetro('Қўйлиқ'), 'Qoyliq');
  assert.equal(canonicalTashkentMetro('Gʻafur Gʻulom'), 'Gafur Gulom');
});

test('location dictionaries expose street, metro, residential complex and landmark entities once', () => {
  assert.equal(matchDictionaryLocation('Calea Victoriei, lângă Piața Victoriei', 'RO', 'Bucharest')?.type, 'streets');
  assert.equal(matchDictionaryLocation('вул. Сумська, біля майдану Свободи', 'UA', 'Kharkiv')?.name, 'Sumska Street');
  assert.equal(matchDictionaryLocation('Абай даңғылы, метро Алмалы', 'KZ', 'Almaty')?.name, 'Almaly');
  assert.equal(matchDictionaryLocation('Toshkent, NRG Oybek yonida', 'UZ', 'Tashkent')?.name, 'NRG Oybek');
});

test('housing lexicon covers Ukrainian Romanian Kazakh and Uzbek address/deal vocabulary', () => {
  assert.ok(aliasValues(ADDRESS_TERMS.street).includes('кўчаси'));
  assert.ok(aliasValues(ADDRESS_TERMS.street).includes('көшесі'));
  assert.ok(aliasValues(ADDRESS_TERMS.street).includes('вулиця'));
  assert.ok(aliasValues(ADDRESS_TERMS.street).includes('stradă'));
  assert.equal(findCanonical('жалға беріледі', DEAL_TYPES)?.canonical, 'longRent');
  assert.equal(findCanonical('подобово', DEAL_TYPES)?.canonical, 'shortRent');
  assert.equal(findCanonical('regim hotelier', DEAL_TYPES)?.canonical, 'shortRent');
  assert.equal(findCanonical('de vânzare', DEAL_TYPES)?.canonical, 'sale');
});

test('housing occupancy, deposits and appliance vocabulary stay independent from deal type', () => {
  assert.equal(findCanonical('підселення', HOUSING_OCCUPANCY_TYPES)?.canonical, 'sharedRoom');
  assert.equal(findCanonical('cameră de închiriat', HOUSING_OCCUPANCY_TYPES)?.canonical, 'room');
  assert.equal(findCanonical('койко-место', HOUSING_OCCUPANCY_TYPES)?.canonical, 'bedSpace');
  assert.ok(aliasValues(DEPOSIT_TERMS.deposit).includes('garanție'));
  assert.ok(aliasValues(DEPOSIT_TERMS.noDeposit).includes('без депозиту'));
  assert.ok(aliasValues(APPLIANCE_TERMS.washingMachine).includes('mașină de spălat'));
  assert.ok(aliasValues(APPLIANCE_TERMS.refrigerator).includes('тоңазытқыш'));
});

test('hiring lexicon covers Uzbek Cyrillic Kazakh Ukrainian and Romanian CV language', () => {
  assert.ok(aliasValues(CANDIDATE_FIELD_TERMS.experience).includes('тажриба'));
  assert.ok(aliasValues(CANDIDATE_FIELD_TERMS.skills).includes('дағдылар'));
  assert.ok(aliasValues(CANDIDATE_FIELD_TERMS.skills).includes('навички'));
  assert.ok(aliasValues(CANDIDATE_FIELD_TERMS.skills).includes('competențe'));
  assert.ok(aliasValues(HIRING_INTENT.candidate).includes('жұмыс іздеймін'));
  assert.ok(aliasValues(HIRING_INTENT.employer).includes('angajăm'));
});

test('employment, work mode, schedule and probation taxonomy covers requested work forms', () => {
  assert.equal(findCanonical('повний робочий день', EMPLOYMENT_TYPES)?.canonical, 'fullTime');
  assert.equal(findCanonical('jumătate de normă', EMPLOYMENT_TYPES)?.canonical, 'partTime');
  assert.equal(findCanonical('волонтёрство', EMPLOYMENT_TYPES)?.canonical, 'volunteer');
  assert.equal(findCanonical('muncă pe proiect', EMPLOYMENT_TYPES)?.canonical, 'project');
  assert.equal(findCanonical('үйден жұмыс', WORK_MODES)?.canonical, 'remote');
  assert.equal(findCanonical('program în schimburi', SCHEDULE_TERMS)?.canonical, 'shift');
  assert.ok(aliasValues(PROBATION_TERMS.probation).includes('perioadă de probă'));
  assert.ok(aliasValues(PROBATION_TERMS.noProbation).includes('без випробувального терміну'));
});
