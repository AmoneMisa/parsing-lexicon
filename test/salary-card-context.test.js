import test from 'node:test';
import assert from 'node:assert/strict';
import { parseSalary } from '../src/index.js';

const pick = (text, options) => {
  const parsed = parseSalary(text, options);
  return parsed && { min: parsed.min, max: parsed.max, currency: parsed.currency };
};

test('age, tenure and update dates on a candidate card are not the salary', () => {
  assert.deepEqual(pick('Глава\n45 лет • Была вчера • Обновлено 26 августа\n2 000 $\nАктивно ищет работу\n15 лет 4 месяца'), { min: 2000, max: 2000, currency: 'USD' });
  assert.deepEqual(pick('Торговый представитель\n1 год стажа\nг.Астана\n250 000 тг.\nобщее среднее (с 1 по 11/12 классы)\nОпубликовано 07.10.2026'), { min: 250000, max: 250000, currency: 'KZT' });
  assert.deepEqual(pick("Бухгалтер\n51 год • Обновлено 7 сентября\n40 000 000  o'm\n32 года 11 месяцев"), { min: 40000000, max: 40000000, currency: 'UZS' });
});

test('a card with an age and no pay has no salary', () => {
  assert.equal(pick('Бухгалтер\nЖенщина, 24 лет\n3 места работы, начиная с 2025 года\nОбновлено: 3 дня назад'), null);
  assert.equal(pick('Менеджер\n30 лет • Обновлено 26 августа\n$ — не указана'), null);
});

test('an ambiguous "сом" is settled by the fallback currency, an absent currency is not invented', () => {
  assert.equal(parseSalary('120 000 Сом').currency, 'UZS');
  assert.equal(parseSalary('120 000 Сом', { fallbackCurrency: 'KGS' }).currency, 'KGS');
  assert.equal(parseSalary('Зарплата 120 000', { fallbackCurrency: 'KGS' }).currency, null);
});

test('plain vacancy salary text keeps working', () => {
  assert.deepEqual(pick('Salary 3 000 - 4 500 USD per month'), { min: 3000, max: 4500, currency: 'USD' });
  assert.deepEqual(pick('З/п от 15 лет опыта не требуется, 500$'), { min: 500, max: null, currency: 'USD' });
});
