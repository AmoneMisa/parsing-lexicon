import test from 'node:test';
import assert from 'node:assert/strict';

import { dictionaryFor, matchDictionaryLocation } from '../src/locations-runtime.js';

const names = Object.freeze([
  'вулиця Генерала Безручка',
  'Свято-Вознесенська вулиця',
  'вулиця Пелагеї Литвинової',
  'Низова вулиця',
  'Андижанська вулиця',
  'вулиця 80-ї Десантно-Штурмової Бригади',
  'вулиця Віри Нікітіної',
  'улица Андрея Дробиленко',
  'Софии Русовой улица',
  'Панаса Мирного улица',
  'Почтовый проспект',
  'Победы проспект',
  'Центральный проспект',
  'проспект Ивана Нечуя-Левицкого',
  'проспект Мира',
  'провулок Тельмана',
  'Рудничний провулок',
  'Гімназичний провулок',
  '3-й Сальський провулок',
  'Варшавский переулок',
  'Бугский переулок',
  'переулок Сергея Байдака',
  'переулок Ампера',
  'Артековский переулок',
  'Козацька вулиця',
  'Чехословацька вулиця',
  'вулиця Нестора Махна',
  'вулиця Волонтерів',
  'Карагандинська вулиця',
  'Каменедробильна вулиця',
  'вулиця Гойї',
  'Репина улица',
  'Костя Гордиенко улица',
  'Южный проспект',
  'Университетский проспект',
  '200-летия Кривого Рога проспект',
  'Економічний провулок',
  'Азовський провулок',
  'Рубіновий провулок',
  'провулок Слави',
  'Грушевского переулок',
  'переулок Казака Рога',
  'Новолозоватский переулок',
]);

const assertStreetMatch = (text, name) => {
  const match = matchDictionaryLocation(text, 'UA', 'Kryvyi Rih');
  assert.ok(match, text);
  assert.equal(match.type, 'streets', text);
  assert.equal(match.name, name, text);
};

test('reviewed Kryvyi Rih street owners are exposed once in the city dictionary', () => {
  const city = dictionaryFor('UA', 'Kryvyi Rih');
  for (const name of names) {
    const matches = (city.streets || []).filter((entry) => entry.name === name);
    assert.equal(matches.length, 1, name);
  }
});

test('reviewed Kryvyi Rih aliases resolve only through street-qualified forms', () => {
  assertStreetMatch('вул. Генерала Безручка', 'вулиця Генерала Безручка');
  assertStreetMatch('вулиця Свято-Вознесенська', 'Свято-Вознесенська вулиця');
  assertStreetMatch('ул. Андрея Дробиленко', 'улица Андрея Дробиленко');
  assertStreetMatch('улица Софии Русовой', 'Софии Русовой улица');
  assertStreetMatch('просп. Почтовый', 'Почтовый проспект');
  assertStreetMatch('пр-т Центральный', 'Центральный проспект');
  assertStreetMatch('пров. Гімназичний', 'Гімназичний провулок');
  assertStreetMatch('переулок Варшавский', 'Варшавский переулок');
  assertStreetMatch('пер. Сергея Байдака', 'переулок Сергея Байдака');
  assertStreetMatch('вул. Нестора Махна', 'вулиця Нестора Махна');
  assertStreetMatch('проспект Университетский', 'Университетский проспект');
  assertStreetMatch('пров. Слави', 'провулок Слави');
});
