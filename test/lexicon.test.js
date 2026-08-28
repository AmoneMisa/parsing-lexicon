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
  TASHKENT_DISTRICTS,
  TASHKENT_LANDMARKS,
  TASHKENT_METRO,
  TASHKENT_POI_GROUPS,
  TASHKENT_RESIDENTIAL_COMPLEXES,
  WORK_MODES,
  canonicalAnyCity,
  canonicalCity,
  canonicalCountry,
  canonicalCountryCode,
  canonicalRegion,
  canonicalTashkentDistrict,
  canonicalTashkentMetro,
  canonicalTashkentResidentialComplex,
  canonicalUkraineCity,
  findCanonical,
  foldCyrillicForSearch,
  matchDictionaryLocation,
  matchOdesaMetropolitanEntities,
  matchTashkentPoi,
  matchTashkentResidentialComplex,
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

test('Ukraine canonical city layer keeps historical and second-priority aliases', () => {
  assert.equal(canonicalUkraineCity('Днепропетровск'), 'Dnipro');
  assert.equal(canonicalUkraineCity('Kirovograd'), 'Kropyvnytskyi');
  assert.equal(canonicalUkraineCity('Ровно'), 'Rivne');
  assert.equal(canonicalUkraineCity('Станислав'), 'Ivano-Frankivsk');
  assert.equal(canonicalUkraineCity('Проскуров'), 'Khmelnytskyi');
  assert.equal(canonicalUkraineCity('Каменское'), 'Kamianske');
  assert.equal(canonicalUkraineCity('Каменец-Подольский'), 'Kamianets-Podilskyi');
});

test('Odesa metropolitan resolver returns multiple entity types without turning suburbs into districts', () => {
  const result = matchOdesaMetropolitanEntities('Продам квартиру на Котовского возле Ривьеры, Крыжановка');
  const byType = new Map(result.matches.map((item) => [item.type, item.name]));
  assert.equal(byType.get('local_area'), 'Житловий масив Котовського');
  assert.equal(byType.get('poi.shopping_mall'), 'ТРЦ Рів’єра');
  assert.equal(byType.get('suburb'), 'Крижанівка');
  assert.ok(result.searchClusters.some((cluster) => cluster.name === 'Одеса — північно-східна агломерація'));
});

test('Odesa Riviera entities stay disambiguated by context', () => {
  assert.equal(matchOdesaMetropolitanEntities('ЖК Сады Ривьеры, Фонтанка').matches.find((x) => x.type === 'residential_complex')?.name, 'Сади Рів’єри');
  assert.equal(matchOdesaMetropolitanEntities('ТРЦ Ривьера').matches.find((x) => x.type === 'poi.shopping_mall')?.name, 'ТРЦ Рів’єра');
  assert.equal(matchOdesaMetropolitanEntities('район Черноморской Ривьеры').matches.find((x) => x.type === 'development_area')?.name, 'Чорноморська Рів’єра');
  assert.equal(matchOdesaMetropolitanEntities('Таирова, квартира').matches.find((x) => x.type === 'microdistrict')?.name, 'Таїрова');
  assert.equal(matchOdesaMetropolitanEntities('с. Таирово, дом').matches.find((x) => x.type === 'suburb')?.name, 'Таїрове');
});

test('canonicalizes all 12 current Tashkent districts across Uzbek and Russian forms', () => {
  assert.equal(TASHKENT_DISTRICTS.length, 12);
  assert.equal(canonicalTashkentDistrict('Шайхонтоҳур тумани'), 'Shaykhantahur');
  assert.equal(canonicalTashkentDistrict('Чиланзарский район'), 'Chilanzar');
  assert.equal(canonicalTashkentDistrict('Yakkasaroy tumani'), 'Yakkasaray');
  assert.equal(canonicalTashkentDistrict('Янгихаётский район'), 'Yangihayot');
});

test('Tashkent metro keeps all 50 canonical stations and legacy aliases', () => {
  assert.equal(TASHKENT_METRO.length, 50);
  assert.equal(canonicalTashkentMetro('метро Максим Горький'), 'Buyuk Ipak Yoli');
  assert.equal(canonicalTashkentMetro('Бунёдкор'), 'Xalqlar Dostligi');
  assert.equal(canonicalTashkentMetro('Қўйлиқ'), 'Qoyliq');
  assert.equal(canonicalTashkentMetro('Gʻafur Gʻulom'), 'Gafur Gulom');
});

test('Tashkent residential complexes are canonical, deduplicated and alias-aware', () => {
  assert.ok(TASHKENT_RESIDENTIAL_COMPLEXES.length >= 217);
  assert.equal(
    new Set(TASHKENT_RESIDENTIAL_COMPLEXES.map((entry) => normalizeForMatch(entry.name))).size,
    TASHKENT_RESIDENTIAL_COMPLEXES.length,
  );
  assert.equal(canonicalTashkentResidentialComplex('Boulvard'), 'Boulevard');
  assert.equal(canonicalTashkentResidentialComplex('Озмахал'), "O'z Mahal");
  assert.equal(canonicalTashkentResidentialComplex('Саларис'), 'Solaris');
  assert.equal(canonicalTashkentResidentialComplex('Урикзор Резиденс'), 'Urikzor Residence');
  assert.equal(canonicalTashkentResidentialComplex('U-Tower'), 'NRG U-Tower');
  assert.equal(canonicalTashkentResidentialComplex('Xon Saroy Ocean'), 'Ocean Xon Saroy');
  assert.equal(canonicalTashkentResidentialComplex('Eco Residence'), 'Eco Residence');
  assert.equal(canonicalTashkentResidentialComplex('Mavrid mavzesi'), 'Mavrid mavzesi');
  assert.equal(canonicalTashkentResidentialComplex('Yashil Makon'), 'Yashil Makon');
  assert.equal(matchTashkentResidentialComplex('ЖК BASHKENT Mening orzuyim')?.name, 'BASHKENT Mening orzuyim');
});

test('ambiguous Tashkent complex names require local residential context', () => {
  assert.equal(matchTashkentResidentialComplex('м. Pushkin, 5 минут пешком'), null);
  assert.equal(matchTashkentResidentialComplex('ЖК Pushkin, 2-комнатная квартира')?.name, 'Pushkin');
  assert.equal(matchTashkentResidentialComplex('метро Bodomzor рядом'), null);
  assert.equal(matchTashkentResidentialComplex('жилой комплекс Bodomzor')?.name, 'Bodomzor');
});

test('Tashkent POIs are categorized and protect ambiguous metro and mall names', () => {
  assert.ok(TASHKENT_LANDMARKS.length > 70);
  assert.ok(TASHKENT_POI_GROUPS.parks.some((entry) => entry.name === 'Dream Park'));
  assert.equal(matchTashkentPoi('рядом Hazrati Imam')?.name, 'Hazrati Imam');
  assert.equal(matchTashkentPoi('Tashkent TV Tower')?.name, 'Tashkent TV Tower');
  assert.equal(matchTashkentPoi('WIUT')?.name, 'Westminster International University in Tashkent');
  assert.equal(matchTashkentPoi('Северный вокзал')?.name, 'Tashkent Central Railway Station');
  assert.equal(matchTashkentPoi('метро Минор'), null);
  assert.equal(matchTashkentPoi('Мечеть Минор')?.name, 'Minor Mosque');
  assert.equal(matchTashkentPoi('ЖК Riviera'), null);
  assert.equal(matchTashkentPoi('Riviera Mall')?.name, 'Riviera Mall');
});

test('Tashkent POIs parse translated Russian and Uzbek names and titles', () => {
  assert.equal(matchTashkentPoi('рядом ТРЦ Compass')?.name, 'Compass Mall');
  assert.equal(matchTashkentPoi('Mega Planet savdo markazi yonida')?.name, 'Mega Planet');
  assert.equal(matchTashkentPoi('Yunusobod Galereya yaqinida')?.name, 'Yunusabad Gallery');
  assert.equal(matchTashkentPoi('Ташкентский международный университет Кимё')?.name, 'Kimyo International University');
  assert.equal(matchTashkentPoi('Toshkent Kimyo xalqaro universiteti')?.name, 'Kimyo International University');
  assert.equal(matchTashkentPoi('Сингапурский институт развития менеджмента в Ташкенте')?.name, 'MDIS Tashkent');
  assert.equal(matchTashkentPoi('Toshkent shahridagi Adju Universiteti')?.name, 'Ajou University in Tashkent');
  assert.ok(TASHKENT_LANDMARKS.every(({ aliases }) => aliases.some((alias) => /\p{Script=Cyrillic}/u.test(alias))));
});

test('location dictionaries expose street, metro, residential complex and landmark entities once', () => {
  assert.equal(matchDictionaryLocation('Calea Victoriei', 'RO', 'Bucharest')?.type, 'streets');
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
