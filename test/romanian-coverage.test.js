import test from 'node:test';
import assert from 'node:assert/strict';

import { canonicalAnyCity, canonicalRegion } from '../src/geography.js';
import { matchProfession, matchProfessionGroup, matchSeniority } from '../src/hiring-professions.js';
import { classifyHiringMessage } from '../src/hiring-context.js';
import { PROPERTY_TYPES } from '../src/housing.js';
import { parseHousingFloor } from '../src/housing-structured.js';

const cityCases = [
  ['Pitești', 'Pitesti'],
  ['Bacău', 'Bacau'],
  ['Bistrița', 'Bistrita'],
  ['Brăila', 'Braila'],
  ['Reșița', 'Resita'],
  ['Târgoviște', 'Targoviste'],
  ['Târgu Mureș', 'Targu Mures'],
  ['Piatra Neamț', 'Piatra Neamt'],
  ['Râmnicu Vâlcea', 'Ramnicu Valcea'],
  ['Focșani', 'Focsani'],
  ['Popești-Leordeni', 'Popesti-Leordeni'],
];

test('Romanian county seats and Bucharest metro localities canonicalize', () => {
  for (const [input, expected] of cityCases) {
    assert.equal(canonicalAnyCity(input, 'RO'), expected, input);
  }
});

test('Romanian counties stay canonical and diacritic-aware', () => {
  assert.equal(canonicalRegion('județul Bistrița-Năsăud', 'RO'), 'Bistrita-Nasaud County');
  assert.equal(canonicalRegion('județul Timiș', 'RO'), 'Timis County');
  assert.equal(canonicalRegion('Municipiul București', 'RO'), 'Bucharest Municipality');
});

test('Romanian profession aliases cover engineering, office, retail and trades', () => {
  assert.equal(matchProfession('dezvoltator frontend Vue').canonical, 'frontend_developer');
  assert.equal(matchProfession('analist de date').canonical, 'data_analyst');
  assert.equal(matchProfession('manager de proiect').canonical, 'project_manager');
  assert.equal(matchProfession('specialist suport clienți').canonical, 'customer_support_specialist');
  assert.equal(matchProfession('casieră supermarket').canonical, 'cashier');
  assert.equal(matchProfession('șofer camion categoria CE').canonical, 'truck_driver');
  assert.equal(matchProfession('agent de securitate').canonical, 'security_guard');
  assert.equal(matchProfession('asistent medical').canonical, 'nurse');
});

test('Romanian profession groups and seniority are recognized', () => {
  assert.equal(matchProfessionGroup('post în securitate cibernetică').canonical, 'information_security');
  assert.equal(matchProfessionGroup('rol în resurse umane').canonical, 'human_resources');
  assert.equal(matchSeniority('specialist senior').canonical, 'senior');
  assert.equal(matchSeniority('lider tehnic frontend').canonical, 'lead');
});

test('Romanian hiring intent and profession language parse together', () => {
  const text = 'Angajăm dezvoltator frontend senior. Program de lucru flexibil. Experiență obligatorie. Salariu 9000 RON.';
  assert.equal(classifyHiringMessage(text), 'vacancy');
  assert.equal(matchProfession(text).canonical, 'frontend_developer');
});

test('Romanian housing vocabulary remains covered', () => {
  const studio = PROPERTY_TYPES.find(({ canonical }) => canonical === 'studio');
  assert.ok(studio.aliases.ro.includes('garsonieră'));
  assert.deepEqual(parseHousingFloor('etaj 3'), { floor: 3, totalFloors: null });
});
