import { aliasesToRegex } from './normalization.js';

function gastronomicStreet(canonical, aliases = [], district = null) {
  const all = Object.freeze([...new Set([canonical, ...aliases].filter(Boolean))]);
  return Object.freeze({
    canonical,
    name: canonical,
    category: 'gastronomic_street',
    entityType: 'street',
    country: 'UZ',
    city: 'Tashkent',
    district,
    aliases: all,
    re: aliasesToRegex(all),
  });
}

export const TASHKENT_GASTRONOMIC_STREETS = Object.freeze([
  gastronomicStreet('Taras Shevchenko Street', [
    'Taras Shevchenko Gastronomic Street',
    'Taras Shevchenko nomidagi gastronomik ko‘cha',
    "Taras Shevchenko nomidagi gastronomik ko'cha",
    'Гастрономическая улица имени Тараса Шевченко',
    'улица Тараса Шевченко',
    'Taras Shevchenko ko‘chasi',
  ], 'Mirobod'),
  gastronomicStreet('Mehrgiyo Street', [
    '"Mehrgiyo" Gastronomic Street',
    'Mehrgiyo Gastronomic Street',
    '"Mehrgiyo" gastronomik ko‘chasi',
    "Mehrgiyo gastronomik ko'chasi",
    'Гастрономическая улица «Мехргиё»',
    'Улица Мехригийо',
    'Mehrgiyo ko‘chasi',
  ], 'Yangihayot'),
  gastronomicStreet('Al-Khwarizmi Street', [
    'Al-Khwarizmi Gastronomic Street',
    'Al-Xorazmiy gastronomik ko‘chasi',
    "Al-Xorazmiy gastronomik ko'chasi",
    'Гастрономическая улица Аль-Хоразмий',
    'Гастрономическая улица Аль-Хорезми',
    'улица Ал-Хоразмий',
    'Al-Xorazmiy ko‘chasi',
  ], 'Chilanzar'),
  gastronomicStreet('Dilsaroy Street', [
    '“Dilsaroy” Gastronomic Street',
    'Dilsaroy Gastronomic Street',
    '“Dilsaroy” gastronomik ko‘chasi',
    "Dilsaroy gastronomik ko'chasi",
    'Гастрономическая улица «Дильсарой»',
    'улица Дильсарой',
    'Dilsaroy ko‘chasi',
  ], 'Almazar'),
  gastronomicStreet('Rihsili Street', [
    'Rihsili Gastronomic Street',
    'Rihsiliy gastronomik ko‘chasi',
    'Rixsiliy gastronomik ko‘chasi',
    'Гастрономическая улица Рихсили',
    'Улица Рихсили',
    'Rihsili Street',
    'Rixsiliy ko‘chasi',
  ], 'Yunusabad'),
  gastronomicStreet('Shota Rustaveli Street', [
    'Shota Rustaveli Gastronomic Street',
    'Shota Rustaveli gastronomik ko‘chasi',
    'Гастрономическая улица Шота Руставели',
    'улица Шота Руставели',
    'Shota Rustaveli ko‘chasi',
  ], 'Yakkasaray'),
  gastronomicStreet('Chigatoy-Darvoza Street', [
    'Chigatoy–Darvoza gastronomic street',
    'Chig‘atoy–Darvoza gastronomik ko‘chasi',
    'Chigatay–Darvoza Street',
    'Chigatoy–Darvoza Street',
    'Гастрономическая улица Чигатой–Дарвоза',
    'Улица Чигатой-Дарвоза',
  ], 'Almazar'),
  gastronomicStreet('Gulkhaniy Street', [
    'Gulkhani Gastronomic Street',
    'Gulxaniy gastronomik ko‘chasi',
    'Гастрономическая улица Гулханий',
    'Улица Гулханий',
    'Gulkhaniy Street',
    'Gulxaniy ko‘chasi',
  ], 'Shaykhantahur'),
  gastronomicStreet('Farhod Street', [
    'Farhod Gastronomic Street',
    'Farhod gastronomik ko‘chasi',
    "Farhod gastronomik ko'chasi",
    'Фархадская гастрономическая улица',
    'Улица Фарход',
    'Farhod ko‘chasi',
  ], 'Uchtepa'),
  gastronomicStreet('Sogdiyona Street', [
    'Sogdiyona Gastronomic Street',
    'So‘g‘diyona gastronomik ko‘chasi',
    "So'g'diyona gastronomik ko'chasi",
    'Гастрономическая улица Согдиёна',
    'Улица Согдиёна',
    'So‘g‘diyona ko‘chasi',
  ], 'Sergeli'),
]);

export function resolveTashkentGastronomicStreet(value) {
  const text = String(value || '').trim();
  if (!text) return null;
  return TASHKENT_GASTRONOMIC_STREETS.find((entry) => entry.re.test(text)) || null;
}
