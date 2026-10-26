import assert from 'node:assert/strict';
import test from 'node:test';
import { PROFESSION_CATALOG, matchProfessions } from '../src/hiring-professions.js';
import { PROFESSION_TERMS } from '../src/hiring-profession-terms.js';

const canonicalsOf = (value) => matchProfessions(value, { limit: 3 }).map((match) => match.canonical);

test('every canonical profession is defined once', () => {
  const canonicals = PROFESSION_CATALOG.map((entry) => entry.canonical);
  assert.deepEqual(canonicals.filter((value, index) => canonicals.indexOf(value) !== index), []);
});

test('every translated head word resolves to a catalog profession', () => {
  for (const russian of new Set(Object.values(PROFESSION_TERMS))) {
    assert.ok(canonicalsOf(russian).length > 0, `"${russian}" has no profession`);
  }
});

test('Ukrainian, Romanian, Uzbek, Kazakh and Kyrgyz titles resolve through the shared catalog', () => {
  const cases = [
    ['Водій', 'driver'], ['Кухар', 'cook'], ['Лікар', 'doctor'], ['Вчитель', 'teacher'],
    ['Будівельник', 'builder'], ['Прибиральниця', 'cleaner'], ['Охоронець', 'security_guard'],
    ['Перекладач', 'translator'], ['Кур’єр', 'courier'], ['Перукар', 'hairdresser'],
    ['Șofer', 'driver'], ['Bucătar', 'cook'], ['Ospătar', 'waiter'], ['Casier', 'cashier'],
    ['Vânzător', 'seller'], ['Contabil', 'accountant'], ['Medic', 'doctor'], ['Profesor', 'teacher'],
    ['Oshpaz', 'cook'], ['Ofitsiant', 'waiter'], ['Sotuvchi', 'seller'], ['Hisobchi', 'accountant'],
    ['Shifokor', 'doctor'], ['Hamshira', 'nurse'], ['O‘qituvchi', 'teacher'], ['Dasturchi', 'software_developer'],
    ['Haydovchi', 'driver'], ['Qo‘riqchi', 'security_guard'], ['Tozalovchi', 'cleaner'],
    ['Жүргізуші', 'driver'], ['Аспазшы', 'cook'], ['Даяшы', 'waiter'], ['Сатушы', 'seller'],
    ['Дәрігер', 'doctor'], ['Мейірбике', 'nurse'], ['Мұғалім', 'teacher'], ['Бағдарламашы', 'software_developer'],
    ['Айдоочу', 'driver'], ['Ашпозчу', 'cook'], ['Сатуучу', 'seller'], ['Дарыгер', 'doctor'],
    ['Медайым', 'nurse'], ['Мугалим', 'teacher'], ['Курулушчу', 'builder'], ['Коргоочу', 'security_guard'],
  ];
  for (const [title, canonical] of cases) {
    assert.ok(canonicalsOf(title).includes(canonical), `${title} -> ${canonicalsOf(title)} (expected ${canonical})`);
  }
});

test('a translation adds matches but keeps the original title matching', () => {
  assert.ok(canonicalsOf('frontend dasturchi').includes('frontend_developer'));
  assert.ok(canonicalsOf('șofer camion categoria CE').includes('truck_driver'));
});

test('specialist doctors, repair and emergency roles are recognised', () => {
  assert.equal(canonicalsOf('Кардиолог')[0], 'cardiologist');
  assert.equal(canonicalsOf('Психиатр')[0], 'psychiatrist');
  assert.equal(canonicalsOf('Ремонт телефонов')[0], 'phone_repair_technician');
  assert.equal(canonicalsOf('Спасатель')[0], 'rescuer');
  assert.equal(canonicalsOf('Полицейский')[0], 'police_officer');
});
