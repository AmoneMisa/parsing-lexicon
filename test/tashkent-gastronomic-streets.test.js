import test from 'node:test';
import assert from 'node:assert/strict';

import {
  TASHKENT_GASTRONOMIC_STREETS,
  resolveTashkentGastronomicStreet,
} from '../src/tashkent-gastronomic-streets.js';

const EXPECTED = Object.freeze([
  ['Taras Shevchenko Gastronomic Street', 'Taras Shevchenko Street'],
  ['Гастрономическая улица «Мехргиё»', 'Mehrgiyo Street'],
  ['Al-Xorazmiy gastronomik ko‘chasi', 'Al-Khwarizmi Street'],
  ['Гастрономическая улица «Дильсарой»', 'Dilsaroy Street'],
  ['Rihsiliy gastronomik ko‘chasi', 'Rihsili Street'],
  ['Гастрономическая улица Шота Руставели', 'Shota Rustaveli Street'],
  ['Chig‘atoy–Darvoza gastronomik ko‘chasi', 'Chigatoy-Darvoza Street'],
  ['Gulxaniy gastronomik ko‘chasi', 'Gulkhaniy Street'],
  ['Фархадская гастрономическая улица', 'Farhod Street'],
  ['So‘g‘diyona gastronomik ko‘chasi', 'Sogdiyona Street'],
]);

test('all ten supplied gastronomic corridors are present', () => {
  assert.equal(TASHKENT_GASTRONOMIC_STREETS.length, 10);
  assert.equal(new Set(TASHKENT_GASTRONOMIC_STREETS.map(({ canonical }) => canonical)).size, 10);
});

test('multilingual Visit Tashkent labels resolve to physical street canonicals', () => {
  for (const [input, canonical] of EXPECTED) {
    const match = resolveTashkentGastronomicStreet(input);
    assert.ok(match, input);
    assert.equal(match.canonical, canonical, input);
    assert.equal(match.entityType, 'street', input);
  }
});

test('Taras Shevchenko and Shota Rustaveli reuse their physical street identities', () => {
  assert.equal(resolveTashkentGastronomicStreet('улица Тараса Шевченко')?.canonical, 'Taras Shevchenko Street');
  assert.equal(resolveTashkentGastronomicStreet('улица Шота Руставели')?.canonical, 'Shota Rustaveli Street');
});
