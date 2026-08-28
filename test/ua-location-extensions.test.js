import test from 'node:test';
import assert from 'node:assert/strict';

import {
  LOCATION_DICTIONARIES,
  dictionaryFor,
  locationCities,
} from '../src/index.js';

const ua = locationCities('UA');

function match(city, type, text) {
  return (ua[city]?.[type] || []).find((entry) => entry.re.test(text))?.name || null;
}

test('locationCities exposes the canonical country registry directly', () => {
  assert.equal(locationCities('UA'), LOCATION_DICTIONARIES.UA);
  assert.equal(locationCities('KZ'), LOCATION_DICTIONARIES.KZ);
  assert.equal(locationCities('UZ'), LOCATION_DICTIONARIES.UZ);
  assert.equal(locationCities('RO'), LOCATION_DICTIONARIES.RO);
  assert.equal(dictionaryFor('UA', 'Kremenchuk'), ua.Kremenchuk);
  assert.ok(locationCities('KZ').Shymkent);
  assert.ok(locationCities('UZ').Namangan);
});

test('major Ukraine city data belongs to the canonical registry', () => {
  assert.equal(match('Kyiv', 'microdistricts', 'Троещина'), 'Troyeshchyna');
  assert.equal(match('Kharkiv', 'residentialComplexes', 'ЖК Воробьёвы Горы'), 'Vorobiovi Hory');
  assert.equal(match('Odesa', 'districts', 'Малиновский район'), 'Khadzhybeiskyi');
  assert.equal(match('Dnipro', 'districts', 'Бабушкинский район'), 'Shevchenkivskyi');
  assert.equal(match('Lviv', 'residentialComplexes', 'Avalon Yard'), 'Avalon Yard');
  assert.equal(match('Zaporizhzhia', 'microdistricts', 'Бабурка'), 'Baburka');
  assert.equal(match('Kryvyi Rih', 'microdistricts', '95-й квартал'), '95 Kvartal');
});

test('Kyiv legacy non-metro coverage belongs to the canonical major owner', () => {
  assert.equal(match('Kyiv', 'districts', 'Подольский район'), 'Podilskyi');
  assert.equal(match('Kyiv', 'residentialComplexes', 'Тетрис Холл'), 'Tetris Hall');
  assert.equal(match('Kyiv', 'residentialComplexes', 'Юнит Хоум'), 'UNIT.Home');
  assert.equal(match('Kyiv', 'residentialComplexes', 'Креатор Сіті'), 'Creator City');
  assert.equal(match('Kyiv', 'streets', 'улица Крещатик'), 'Khreshchatyk Street');
  assert.equal(match('Kyiv', 'streets', 'проспект Победы'), 'Beresteiskyi Avenue');
  assert.equal(match('Kyiv', 'streets', 'улица Глубочицкая'), 'Hlybochytska Street');
  assert.equal(match('Kyiv', 'landmarks', 'Киевский вокзал'), 'Kyiv Central Railway Station');
});

test('regional Ukraine data belongs to the canonical registry', () => {
  assert.equal(match('Rivne', 'microdistricts', 'Льнокомбинат'), 'Lonokombinat');
  assert.equal(match('Kherson', 'districts', 'Суворовский район'), 'Tsentralnyi');
  assert.equal(match('Vinnytsia', 'residentialComplexes', 'ЖК Набережный квартал'), 'Naberezhnyi Kvartal');
  assert.equal(match('Mykolaiv', 'districts', 'Ленинский'), 'Inhulskyi');
  assert.equal(match('Cherkasy', 'microdistricts', 'ЮЗР'), 'Pivdenno-Zakhidnyi');
  assert.equal(match('Poltava', 'districts', 'Октябрьский'), 'Shevchenkivskyi');
  assert.equal(match('Chernihiv', 'microdistricts', 'Пять углов'), 'Piat Kutiv');
  assert.equal(match('Zhytomyr', 'residentialComplexes', 'ЖК Мечта'), 'Mriia');
  assert.equal(match('Ivano-Frankivsk', 'landmarks', 'Стометровка'), 'Stometrivka');
  assert.equal(match('Ternopil', 'residentialComplexes', 'ЖК Beverly Hills'), 'Beverly Hills');
  assert.equal(match('Lutsk', 'landmarks', 'Луцкий замок'), 'Lubart Castle');
  assert.equal(match('Uzhhorod', 'microdistricts', 'Червеница'), 'Chervenytsia');
  assert.equal(match('Chernivtsi', 'landmarks', 'ЧНУ'), 'Chernivtsi University');
  assert.equal(match('Khmelnytskyi', 'microdistricts', 'ПЗР'), 'Pivdennyi-Zakhid');
  assert.equal(match('Sumy', 'districts', 'Ковпаковский'), 'Kovpakivskyi');
  assert.equal(match('Kropyvnytskyi', 'microdistricts', 'Ковалёвка'), 'Kovalivka');
  assert.equal(match('Kremenchuk', 'microdistricts', 'Крюков'), 'Kriukiv');
  assert.equal(match('Bila Tserkva', 'landmarks', 'дендропарк Олександрія'), 'Oleksandriia Arboretum');
});

test('secondary Ukraine cities keep Dubno Tsukrovyi aliases in the canonical registry', () => {
  assert.equal(match('Dubno', 'microdistricts', 'район Цукровий'), 'Tsukrovyi');
  assert.equal(match('Dubno', 'microdistricts', 'Сахарный район'), 'Tsukrovyi');
});

test('historical district aliases resolve to one current canonical district', () => {
  assert.equal(match('Zaporizhzhia', 'districts', 'Комунарський район'), 'Kosmichnyi');
  assert.deepEqual(
    ua.Zaporizhzhia.districts
      .filter((entry) => entry.re.test('Комунарський район'))
      .map(({ name }) => name),
    ['Kosmichnyi'],
  );
});

test('Kyiv legacy metro coverage belongs to the canonical metro owner', () => {
  assert.equal(match('Kyiv', 'metro', 'Крещатик'), 'Khreshchatyk');
  assert.equal(match('Kyiv', 'metro', 'Площадь Независимости'), 'Maidan Nezalezhnosti');
  assert.equal(match('Kyiv', 'metro', 'Золотые ворота'), 'Zoloti Vorota');
  assert.equal(match('Kyiv', 'metro', 'Левобережная'), 'Livoberezhna');
  assert.equal(match('Kyiv', 'metro', 'Лукьяновская'), 'Lukianivska');
});

test('Kharkiv metro uses current canonicals and keeps historical aliases', () => {
  assert.equal(match('Kharkiv', 'metro', 'Ак. Павлова'), 'Akademika Pavlova');
  assert.equal(match('Kharkiv', 'metro', 'Завод имени Малышева'), 'Zavodska');
  assert.equal(match('Kharkiv', 'metro', 'Zavod imeni Malysheva'), 'Zavodska');
  assert.equal(match('Kharkiv', 'metro', 'Заводська'), 'Zavodska');
  assert.equal(match('Kharkiv', 'metro', 'Героев Труда'), 'Saltivska');
  assert.equal(match('Kharkiv', 'metro', 'Heroiv Pratsi'), 'Saltivska');
  assert.equal(match('Kharkiv', 'metro', 'Салтівська'), 'Saltivska');
  assert.ok(!ua.Kharkiv.metro.some(({ name }) => name === 'Zavod imeni Malysheva'));
  assert.ok(!ua.Kharkiv.metro.some(({ name }) => name === 'Heroiv Pratsi'));
});
