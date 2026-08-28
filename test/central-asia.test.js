import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CENTRAL_ASIA_LOCATION_DICTIONARIES,
  KZ_EXPANDED_LOCATION_DICTIONARIES,
  LOCATION_DICTIONARIES,
  UZ_EXPANDED_LOCATION_DICTIONARIES,
  UZ_LOCATION_EXTENSIONS,
  canonicalKazakhstanCity,
  canonicalUzbekistanCity,
  centralAsiaLocationCities,
  matchCentralAsiaLocationEntities,
  normalizedAliasKeys,
} from '../src/index.js';

const names = (result, type) => result.matches.filter((item) => item.type === type).map((item) => item.name);

test('Central Asia matchers consume the canonical country location registry', () => {
  assert.equal(KZ_EXPANDED_LOCATION_DICTIONARIES, LOCATION_DICTIONARIES.KZ);
  assert.equal(UZ_EXPANDED_LOCATION_DICTIONARIES, LOCATION_DICTIONARIES.UZ);
  assert.equal(CENTRAL_ASIA_LOCATION_DICTIONARIES.KZ, LOCATION_DICTIONARIES.KZ);
  assert.equal(CENTRAL_ASIA_LOCATION_DICTIONARIES.UZ, LOCATION_DICTIONARIES.UZ);
  assert.equal(centralAsiaLocationCities('KZ'), LOCATION_DICTIONARIES.KZ);
  assert.equal(centralAsiaLocationCities('UZ'), LOCATION_DICTIONARIES.UZ);
});

test('Kazakhstan city catalog keeps current, common and historical aliases', () => {
  assert.equal(canonicalKazakhstanCity('Алма-Ата'), 'Almaty');
  assert.equal(canonicalKazakhstanCity('Целиноград'), 'Astana');
  assert.equal(canonicalKazakhstanCity('Чимкент'), 'Shymkent');
  assert.equal(canonicalKazakhstanCity('Гурьев'), 'Atyrau');
  assert.equal(canonicalKazakhstanCity('Шевченко'), 'Aktau');
  assert.equal(canonicalKazakhstanCity('Семипалатинск'), 'Semey');
  assert.equal(canonicalKazakhstanCity('Капчагай'), 'Konaev');
  assert.equal(canonicalKazakhstanCity('Зыряновск'), 'Altai');
  assert.equal(canonicalKazakhstanCity('Қарағанды'), 'Karaganda');
  assert.equal(canonicalKazakhstanCity('Qaragandy'), 'Karaganda');
});

test('Uzbekistan city catalog handles Uzbek, Russian, Karakalpak and apostrophe-less forms', () => {
  assert.equal(canonicalUzbekistanCity("Qo'qon"), 'Kokand');
  assert.equal(canonicalUzbekistanCity('Qo‘qon'), 'Kokand');
  assert.equal(canonicalUzbekistanCity('Qoqon'), 'Kokand');
  assert.equal(canonicalUzbekistanCity("Marg'ilon"), 'Margilan');
  assert.equal(canonicalUzbekistanCity('Margilon'), 'Margilan');
  assert.equal(canonicalUzbekistanCity('Нөкис'), 'Nukus');
  assert.equal(canonicalUzbekistanCity('Nókis'), 'Nukus');
  assert.equal(canonicalUzbekistanCity('Коканд'), 'Kokand');
});

test('apostrophe omission is a search equivalence without changing canonical spelling', () => {
  assert.ok(normalizedAliasKeys("G'azalkent").some((key) => normalizedAliasKeys('Gazalkent').includes(key)));
  assert.ok(normalizedAliasKeys("Qo'ng'irot").some((key) => normalizedAliasKeys('Qongirot').includes(key)));
});

test('Aktau numeric microdistricts are city-scoped and not global entities', () => {
  const aktau = matchCentralAsiaLocationEntities('12 мкр Актау', 'KZ', 'Aktau');
  assert.equal(aktau.city, 'Aktau');
  assert.ok(names(aktau, 'microdistrict').includes('12 microdistrict'));

  const aktobe = matchCentralAsiaLocationEntities('12 мкр Актобе', 'KZ', 'Aktobe');
  assert.equal(aktobe.city, 'Aktobe');
  assert.ok(names(aktobe, 'microdistrict').includes('12 microdistrict'));

  const ambiguous = matchCentralAsiaLocationEntities('12 мкр', 'KZ');
  assert.equal(ambiguous.city, null);
  assert.ok(ambiguous.candidates.length > 1);
});

test('duplicate Kazakhstan local names require their parent city', () => {
  const bare = matchCentralAsiaLocationEntities('Самал', 'KZ');
  assert.equal(bare.city, null);
  assert.ok(bare.candidates.length > 1);

  const almaty = matchCentralAsiaLocationEntities('Самал-2, Алматы', 'KZ', 'Almaty');
  assert.equal(almaty.city, 'Almaty');
  assert.ok(names(almaty, 'microdistrict').includes('Samal-2'));

  const atyrau = matchCentralAsiaLocationEntities('Самал, Атырау', 'KZ', 'Atyrau');
  assert.equal(atyrau.city, 'Atyrau');
  assert.ok(names(atyrau, 'microdistrict').includes('Samal'));
});

test('Almaty and Astana suburbs resolve as metropolitan search clusters, not city districts', () => {
  const almaty = matchCentralAsiaLocationEntities('Бесагаш, Алматы', 'KZ', 'Almaty');
  assert.ok(names(almaty, 'suburb').includes('Besagash'));
  assert.ok(almaty.searchClusters.some((cluster) => cluster.name === 'Almaty metropolitan area'));
  assert.equal(names(almaty, 'district').includes('Besagash'), false);

  const astana = matchCentralAsiaLocationEntities('Косшы, пригород Астаны', 'KZ', 'Astana');
  assert.ok(names(astana, 'suburb').includes('Kosshy'));
  assert.ok(astana.searchClusters.some((cluster) => cluster.name === 'Astana metropolitan area'));
  assert.equal(names(astana, 'district').includes('Kosshy'), false);
});

test('Nukus keeps all 71 official MFY entries in the Karakalpak-aware layer', () => {
  assert.equal(UZ_LOCATION_EXTENSIONS.Nukus.mahallas.length, 71);
  assert.ok(UZ_LOCATION_EXTENSIONS.Nukus.mahallas.some((entry) => entry.name === 'Jipek jolı'));
  assert.ok(UZ_LOCATION_EXTENSIONS.Nukus.mahallas.some((entry) => entry.name === 'Garezsizlik'));
  assert.ok(UZ_LOCATION_EXTENSIONS.Nukus.mahallas.every((entry) => entry.language === 'kaa_lat'));
});

test('Uzbek mahallas are parent-aware across repeated names', () => {
  const urganch = matchCentralAsiaLocationEntities('Navbahor MFY, Urganch', 'UZ', 'Urgench');
  assert.equal(urganch.city, 'Urgench');
  assert.ok(names(urganch, 'mahalla').includes('Navbahor'));

  const bare = matchCentralAsiaLocationEntities('Navbahor MFY', 'UZ');
  assert.equal(bare.city, null);
  assert.ok(bare.candidates.length >= 2);
});

test('Tashkent extensions cover geo-catalog mahalla and local-area gaps', () => {
  const mahallas = new Map(UZ_LOCATION_EXTENSIONS.Tashkent.mahallas.map((entry) => [entry.name, entry]));
  const localAreas = new Map(UZ_LOCATION_EXTENSIONS.Tashkent.localAreas.map((entry) => [entry.name, entry]));

  for (const [name, parent] of [
    ['Khastimam', 'Almazar'], ['Yangi Tashkent', 'Almazar'], ['Umid', 'Almazar'],
    ['Kashgar', 'Yunusabad'], ['Buyuk Turan', 'Yunusabad'], ['Minor', 'Yunusabad'],
    ['Labzak', 'Shaykhantahur'], ['Rakat', 'Yakkasaray'], ['Belaryk', 'Yakkasaray'],
    ['Shahjahan', 'Yakkasaray'], ['Mukimiy', 'Yakkasaray'], ['Birlashgan', 'Yashnobod'],
    ['Nadyra', 'Yashnobod'], ['Makhmur', 'Yashnobod'], ['Munavvarqori', 'Mirzo Ulugbek'],
    ['Beshkapa', 'Mirzo Ulugbek'], ['Chashtepa', 'Yangihayot'], ['Yangi Darhan', 'Yangihayot'],
  ]) {
    assert.equal(mahallas.get(name)?.parent, parent, `missing/scoped Tashkent mahalla: ${name}`);
  }

  for (const [name, parent] of [
    ['Sergeli-3A', 'Sergeli'], ['Sergeli-5A', 'Sergeli'], ['Sergeli-7A', 'Sergeli'],
    ['Yangidarhan-1', 'Yangihayot'], ['Yangidarhan-2', 'Yangihayot'],
  ]) {
    assert.equal(localAreas.get(name)?.parent, parent, `missing/scoped Tashkent local area: ${name}`);
  }
});

test('Tashkent gap aliases resolve without hiding the Minor metro type', () => {
  const mahalla = matchCentralAsiaLocationEntities('Янги Дархон MFY, Ташкент', 'UZ', 'Tashkent');
  assert.ok(names(mahalla, 'mahalla').includes('Yangi Darhan'));

  const sergeli = matchCentralAsiaLocationEntities('Сергели 5А массив, Ташкент', 'UZ', 'Tashkent');
  assert.ok(names(sergeli, 'local_area').includes('Sergeli-5A'));

  const minorMahalla = matchCentralAsiaLocationEntities('Минор махалла, Ташкент', 'UZ', 'Tashkent');
  assert.ok(names(minorMahalla, 'mahalla').includes('Minor'));

  const minorMetro = matchCentralAsiaLocationEntities('метро Минор, Ташкент', 'UZ', 'Tashkent');
  assert.ok(names(minorMetro, 'metro').includes('Minor'));
});

test('Xonobod remains ambiguous without city/region context', () => {
  const bare = matchCentralAsiaLocationEntities('Xonobod', 'UZ');
  assert.equal(bare.city, null);

  const city = canonicalUzbekistanCity('Xonobod shahri');
  assert.equal(city, 'Xonobod');

  const qarshi = matchCentralAsiaLocationEntities('Qarshi, Xonobod', 'UZ', 'Qarshi');
  assert.equal(qarshi.city, 'Qarshi');
  assert.ok(names(qarshi, 'local_area').includes('Xonobod'));
});
