import test from 'node:test';
import assert from 'node:assert/strict';

import {
  UA_MAJOR_LOCATION_EXTENSIONS,
  UA_METRO_LOCATION_EXTENSIONS,
  UA_REGIONAL_LOCATION_EXTENSIONS,
  locationCities,
  mergeLocationCountries,
} from '../src/index.js';

const ua = mergeLocationCountries(
  locationCities('UA'),
  UA_MAJOR_LOCATION_EXTENSIONS,
  UA_REGIONAL_LOCATION_EXTENSIONS,
  UA_METRO_LOCATION_EXTENSIONS,
);

function match(city, type, text) {
  return (ua[city]?.[type] || []).find((entry) => entry.re.test(text))?.name || null;
}

test('major Ukraine city extensions merge into the shared dictionary', () => {
  assert.equal(match('Kyiv', 'microdistricts', 'Троещина'), 'Troyeshchyna');
  assert.equal(match('Kharkiv', 'residentialComplexes', 'ЖК Воробьёвы Горы'), 'Vorobiovi Hory');
  assert.equal(match('Odesa', 'districts', 'Малиновский район'), 'Khadzhybeiskyi');
  assert.equal(match('Dnipro', 'districts', 'Бабушкинский район'), 'Shevchenkivskyi');
  assert.equal(match('Lviv', 'residentialComplexes', 'Avalon Yard'), 'Avalon');
  assert.equal(match('Zaporizhzhia', 'microdistricts', 'Бабурка'), 'Baburka');
  assert.equal(match('Kryvyi Rih', 'microdistricts', '95-й квартал'), '95 Kvartal');
});

test('regional Ukraine extensions expose districts microdistricts complexes and POIs', () => {
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

test('Kharkiv metro extension keeps station aliases separate from neighborhood context', () => {
  assert.equal(match('Kharkiv', 'metro', 'Ак. Павлова'), 'Akademika Pavlova');
});
