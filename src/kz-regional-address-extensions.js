import { aliasesToRegex } from './normalization.js';

function street(name, aliases = []) {
  const all = Object.freeze([...new Set([name, ...aliases].filter(Boolean))]);
  return Object.freeze({
    canonical: name,
    name,
    type: 'street',
    entityType: 'street',
    country: 'KZ',
    aliases: all,
    re: aliasesToRegex(all),
  });
}

export const KZ_SCRAPED_TAIL_ADDRESS_EXTENSIONS = Object.freeze({
  Taraz: Object.freeze({
    streets: Object.freeze([
      street('Проспект Жамбыла', [
        'проспект Жамбыла', 'пр-т Жамбыла', 'Жамбыла', 'Жамбыл даңғылы',
        'Zhambyl Avenue', 'Jambyl Avenue', 'Zhambyl Prospekt',
      ]),
      street('Улица Барбюса', [
        'улица Барбюса', 'ул. Барбюса', 'Барбюса', 'Барбюс көшесі', 'Barbusse Street', 'Barbyus Street',
      ]),
      street('Улица Жусипа Баласагуна', [
        'улица Жусипа Баласагуна', 'ул. Жусипа Баласагуна', 'Жусипа Баласагуна',
        'Жүсіп Баласағұн көшесі', 'Жүсіп Баласағұн', 'Zhusip Balasagun Street', 'Zhusup Balasagyn Street',
      ]),
      street('Улица Пушкина', [
        'улица Пушкина', 'ул. Пушкина', 'Пушкина', 'Пушкин көшесі', 'Pushkin Street',
      ]),
    ]),
  }),
});
