import test from 'node:test';
import assert from 'node:assert/strict';

import {
  findPhoneLikeSpans,
  findTelegramContacts,
  normalizePhone,
  normalizeTelegramContact,
  parsePhoneNumbers,
  parsePrimaryContact,
} from '../src/contact.js';
import {
  currencyDisplay,
  currencyName,
  currencySymbol,
  moneyCurrencyCandidatesFromText,
  moneyCurrencyFromText,
} from '../src/currency.js';
import { parseHousingPrice } from '../src/housing-money.js';

test('broad phone detector stays tolerant for money masking', () => {
  assert.equal(findPhoneLikeSpans('тел. (095) 082-01-03').length, 1);
  assert.equal(findPhoneLikeSpans('90 123 45 67').length, 0);
});

test('phone parser normalizes national formats with a country hint', () => {
  assert.equal(normalizePhone('Марія 095 082 01 03', { countryHint: 'UA' })?.number, '+380950820103');
  assert.equal(normalizePhone('Admin 90 123 45 67', { countryHint: 'UZ' })?.number, '+998901234567');
  assert.equal(normalizePhone('0722 123 456', { countryHint: 'RO' })?.number, '+40722123456');
});

test('phone parser accepts international format without a country hint', () => {
  const phones = parsePhoneNumbers('WhatsApp +998 (90) 123-45-67, tel +40 722 123 456');
  assert.deepEqual(phones.map((phone) => phone.number), ['+998901234567', '+40722123456']);
  assert.deepEqual(phones.map((phone) => phone.country), ['UZ', 'RO']);
});

test('phone parser keeps extension and explicit validity metadata', () => {
  const phone = normalizePhone('Office +1 202 555 0123 ext. 45');
  assert.equal(phone?.number, '+12025550123');
  assert.equal(phone?.extension, '45');
  assert.equal(phone?.valid, true);
  assert.equal(phone?.possible, true);
  assert.match(phone?.national || '', /202/);
  assert.match(phone?.international || '', /\+1/);
});

test('invalid numeric sequences are not promoted to normalized phones', () => {
  assert.deepEqual(parsePhoneNumbers('ID 123456789012345 and price 10000000'), []);
  assert.deepEqual(parsePhoneNumbers('Updated 29.08.2026 10:15:00', { countryHint: 'UZ' }), []);
});

test('telegram contacts normalize mentions and public links without transport logic', () => {
  const contacts = findTelegramContacts('Контакт @Maria_dev, дубль https://t.me/Maria_dev и tg://resolve?domain=Other_User');
  assert.deepEqual(contacts.map((contact) => contact.username), ['Maria_dev', 'Other_User']);
  assert.equal(contacts[0]?.url, 'https://t.me/Maria_dev');
  assert.equal(normalizeTelegramContact('telegram.me/admin_support')?.handle, '@admin_support');
  assert.deepEqual(findTelegramContacts('mail user@example.com'), []);
});

test('telegram contacts reject reserved link paths, digit-led handles, and app-name mentions', () => {
  assert.deepEqual(findTelegramContacts('вступайте t.me/joinchat/AAAAbbbbCCCC'), []);
  assert.deepEqual(findTelegramContacts('t.me/share/url?url=https://x.com'), []);
  assert.deepEqual(findTelegramContacts('заказ @12345_promo'), []);
  assert.deepEqual(findTelegramContacts('пишите @Telegram'), []);
  assert.equal(findTelegramContacts('пишите t.me/real_landlord')[0]?.username, 'real_landlord');
});

test('parsePrimaryContact recognizes conjugated call-to-action phrasing', () => {
  assert.equal(parsePrimaryContact('Звоните по номеру 87001234567'), '87001234567');
  assert.equal(parsePrimaryContact('Наберите 87001234567'), '87001234567');
  assert.equal(parsePrimaryContact('Позвоните мне +998901234567'), '+998901234567');
  assert.equal(parsePrimaryContact('Дзвоніть 0671234567'), '0671234567');
  // Unrelated words containing the same substrings must not false-positive.
  assert.equal(parsePrimaryContact('хостел рядом, недорого'), null);
});

test('currency aliases cover additional regional and international currencies', () => {
  assert.equal(moneyCurrencyFromText('950 швейцарских франков'), 'CHF');
  assert.equal(moneyCurrencyFromText('1200 юаней'), 'CNY');
  assert.equal(moneyCurrencyFromText('15000 иен'), 'JPY');
  assert.equal(moneyCurrencyFromText('₩ 900000'), 'KRW');
  assert.equal(moneyCurrencyFromText('₹ 50000'), 'INR');
  assert.equal(moneyCurrencyFromText('₼ 1200'), 'AZN');
  assert.equal(moneyCurrencyFromText('֏ 250000'), 'AMD');
});

test('ambiguous symbols use explicit code or fallback currency as context', () => {
  assert.deepEqual(moneyCurrencyCandidatesFromText('$ 900'), ['USD', 'CAD', 'AUD', 'NZD', 'SGD', 'HKD']);
  assert.equal(moneyCurrencyFromText('$ 900', 'CAD'), 'CAD');
  assert.equal(moneyCurrencyFromText('900 CAD $', 'USD'), 'CAD');
  assert.deepEqual(moneyCurrencyCandidatesFromText('¥ 900'), ['JPY', 'CNY']);
  assert.equal(moneyCurrencyFromText('¥ 900', 'CNY'), 'CNY');
  assert.equal(moneyCurrencyFromText('¥ 900', 'JPY'), 'JPY');
});

test('currency display metadata is localized without duplicating the currency catalog', () => {
  assert.equal(currencySymbol('USD', 'ru'), '$');
  assert.equal(currencySymbol('UAH', 'uk'), '₴');
  assert.match(currencyName('EUR', 'ru') || '', /евро/i);
  assert.equal(currencyDisplay('NOPE', 'en'), null);
});

test('housing price parser consumes expanded currency names without a second parser', () => {
  assert.deepEqual(parseHousingPrice('Аренда 950 CHF в месяц', 'EUR'), { amount: 950, currency: 'CHF', approximate: false });
  assert.deepEqual(parseHousingPrice('Rent 1200 CAD monthly', 'USD'), { amount: 1200, currency: 'CAD', approximate: false });
});
