import { aliasesToRegex } from './normalization.js';

function entry(name, aliases, entityType) {
  const all = Object.freeze([...new Set([name, ...aliases].filter(Boolean))]);
  return Object.freeze({
    canonical: name,
    name,
    type: entityType,
    entityType,
    country: 'KZ',
    aliases: all,
    re: aliasesToRegex(all),
  });
}

const microdistrict = (name, aliases = []) => entry(name, aliases, 'microdistrict');
const street = (name, aliases = []) => entry(name, aliases, 'street');

export const KZ_SCRAPED_ADDRESS_EXTENSIONS = Object.freeze({
  Aktobe: Object.freeze({
    microdistricts: Object.freeze([
      microdistrict('4 microdistrict', [
        '4-й микрорайон', '4 микрорайон', '4 мкр', '4 мкр.', '4-й мкр',
        '4-ші шағын аудан', '4 шағын аудан', '4 ықшамаудан', '4th microdistrict',
      ]),
      microdistrict('5 microdistrict', [
        '5-й микрорайон', '5 микрорайон', '5 мкр', '5 мкр.', '5-й мкр',
        '5-ші шағын аудан', '5 шағын аудан', '5 ықшамаудан', '5th microdistrict',
      ]),
      microdistrict('11 microdistrict', [
        '11-й микрорайон', '11 микрорайон', '11 мкр', '11 мкр.', '11-й мкр',
        '11-ші шағын аудан', '11 шағын аудан', '11 ықшамаудан', '11th microdistrict',
      ]),
      microdistrict('12 microdistrict', [
        '12-й микрорайон', '12 микрорайон', '12 мкр', '12 мкр.', '12-й мкр',
        '12-ші шағын аудан', '12 шағын аудан', '12 ықшамаудан', '12th microdistrict',
      ]),
    ]),
    streets: Object.freeze([
      street('Проспект Алаш', [
        'проспект Алаш', 'пр-т Алаш', 'Алаш даңғылы', 'Alash Avenue', 'Alash Prospekt',
      ]),
      street('Улица Байганина', [
        'улица Байганина', 'ул. Байганина', 'Байганина', 'Нұрпейіс Байғанин көшесі',
        'Байғанин көшесі', 'N. Baiganin Street', 'Nurpeis Baiganin Street',
      ]),
      street('Улица Бокенбай Батыра', [
        'улица Бокенбай Батыра', 'ул. Бокенбай Батыра', 'Бокенбай Батыра',
        'Бөкенбай Батыр көшесі', 'Бөкенбай батыр көшесі', 'Bokenbay Batyr Street',
      ]),
      street('Улица Джамбула', [
        'улица Джамбула', 'ул. Джамбула', 'Джамбула', 'улица Жамбыла',
        'Жамбыл көшесі', 'Jambyl Street', 'Dzhambul Street',
      ]),
      street('Улица Жанкожа Батыра', [
        'улица Жанкожа Батыра', 'ул. Жанкожа Батыра', 'Жанкожа Батыра',
        'Жанқожа Батыр көшесі', 'Жанқожа батыр көшесі', 'Zhankozha Batyr Street',
      ]),
      street('Улица Ибатова', [
        'улица Ибатова', 'ул. Ибатова', 'Ибатова', 'Ибатов көшесі', 'Ibatov Street',
      ]),
      street('Улица Мангилик Ел', [
        'улица Мангилик Ел', 'ул. Мангилик Ел', 'Мангилик Ел', 'Мәңгілік Ел көшесі',
        'Mangilik El Street', 'Mangilik Yel Street',
      ]),
      street('улица Ораза Татеулы', [
        'Улица Ораза Татеулы', 'ул. Ораза Татеулы', 'Ораза Татеулы',
        'Ораз Тәтеұлы көшесі', 'Ораза Тәтеұлы көшесі', 'Oraz Tateuly Street',
      ]),
      street('Улица Пожарского', [
        'улица Пожарского', 'ул. Пожарского', 'Пожарского', 'Pozharskogo Street',
      ]),
      street('Улица Сатпаева', [
        'улица Сатпаева', 'ул. Сатпаева', 'Сатпаева', 'Қаныш Сәтбаев көшесі',
        'Сәтбаев көшесі', 'Kanysh Satpayev Street', 'Satpayev Street',
      ]),
      street('Улица Узакбая Кулымбетова', [
        'улица Узакбая Кулымбетова', 'ул. Узакбая Кулымбетова', 'Узакбая Кулымбетова',
        'Ұзақбай Құлымбетов көшесі', 'Uzakbay Kulymbetov Street', 'Uzaqbay Qulymbetov Street',
      ]),
    ]),
  }),
});
