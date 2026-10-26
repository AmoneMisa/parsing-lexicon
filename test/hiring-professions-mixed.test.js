import assert from 'node:assert/strict';
import test from 'node:test';
import { matchProfessions } from '../src/hiring-professions.js';

const canonicalsOf = (value) => matchProfessions(value, { allowWeak: false, limit: 5 }).map((match) => match.canonical);

test('mixed Latin/Cyrillic developer titles resolve to their profession', () => {
  assert.deepEqual(canonicalsOf('Frontend-разработчик Vue'), ['frontend_developer']);
  assert.deepEqual(canonicalsOf('Фронтенд-разработчик'), ['frontend_developer']);
  assert.deepEqual(canonicalsOf('Backend-разработчик Python'), ['backend_developer']);
});

test('Go backend titles resolve to backend, not generic software', () => {
  assert.deepEqual(canonicalsOf('Golang backend'), ['backend_developer']);
  assert.deepEqual(canonicalsOf('Golang разработчик'), ['backend_developer']);
});

test('team lead frontend resolves to frontend', () => {
  assert.deepEqual(canonicalsOf('Team lead frontend'), ['frontend_developer']);
});

test('mobile frontend phrasing matches the mobile profession', () => {
  assert.ok(canonicalsOf('мобильный фронтенд разработчик').includes('mobile_developer'));
  assert.ok(canonicalsOf('Frontend-разработчик мобильных приложений').includes('mobile_developer'));
});

test('specialist doctors and cleaners are recognised', () => {
  assert.deepEqual(canonicalsOf('Кардиолог'), ['cardiologist']);
  assert.deepEqual(canonicalsOf('Cardiologist'), ['cardiologist']);
  assert.deepEqual(canonicalsOf('Врач-невролог'), ['neurologist', 'doctor']);
  assert.deepEqual(canonicalsOf('Уборщица'), ['cleaner']);
  assert.deepEqual(canonicalsOf('Клинер'), ['cleaner']);
});
