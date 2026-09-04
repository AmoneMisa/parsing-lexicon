import { aliasesToRegex } from './normalization.js';

function entry(canonical, type, aliases = [], labels = null) {
  const all = Object.freeze([...new Set([canonical, ...aliases].filter(Boolean))]);
  return Object.freeze({
    canonical,
    name: canonical,
    type,
    entityType: type,
    country: 'UZ',
    city: 'Samarkand',
    ...(labels ? { labels: Object.freeze(labels) } : {}),
    aliases: all,
    re: aliasesToRegex(all),
  });
}

const residential = (canonical, aliases, labels) => entry(
  canonical,
  'residential_complex',
  aliases,
  labels,
);

const street = (canonical, aliases, labels) => entry(
  canonical,
  'street',
  aliases,
  labels,
);

export const UZ_SAMARKAND_CONTEXT_EXTENSIONS = Object.freeze({
  Samarkand: Object.freeze({
    mahallas: Object.freeze([
      entry('Sattepo', 'mahalla', [
        'Sattepa', 'Sartepa', 'Саттепо', 'Саттепа', 'Сартепа',
        'Sattepo mahallasi', 'Sartepa mahallasi', 'махалля Саттепо', 'махалля Сартепа',
        'микрорайон Сартепа', 'мкр Сартепа',
      ], { en: 'Sattepo', uz: 'Sattepo', ru: 'Саттепо' }),
      entry("Do'stlik", 'mahalla', [
        'Dostlik', 'Do‘stlik', "Do'stlik mahallasi", 'Do‘stlik mahallasi',
        'Дустлик', 'Дўстлик', 'махалля Дустлик', 'махалля Дўстлик',
      ], { en: "Do'stlik", uz: "Do'stlik", ru: 'Дустлик' }),
      entry('Yangi Hayot', 'mahalla', [
        'Yangihayot', 'Yangi Hayot mahallasi', 'Yangihayot mahallasi',
        'Янги Хаёт', 'Янги Ҳаёт', 'Янгихаёт', 'махалля Янги Хаёт', 'махалля Янгихаёт',
      ], { en: 'Yangi Hayot', uz: 'Yangi Hayot', ru: 'Янги Хаёт' }),
      entry("O'rta Xo'jasoat", 'mahalla', [
        'O‘rta Xo‘jasoat', "O'rta Xo'ja Soat", 'Orta Xojasoat', 'Orta Khojasoat',
        "O'rta Xo'jasoat mahallasi", 'Урта Хужасоат', 'Урта Хужасахат',
        'Ўрта Хўжасоат', 'махалля Урта Хужасоат',
      ], { en: "O'rta Xo'jasoat", uz: "O'rta Xo'jasoat", ru: 'Урта Хужасоат' }),
    ]),
    residentialComplexes: Object.freeze([
      residential('Afrosiyob Residence', [
        'Afrosiyob residence', 'ЖК Afrosiyob Residence',
        'Afrosiyob Residence TJM', 'Afrosiyob Residence turar joy majmuasi',
        'Afrosiyob Residence turar-joy majmuasi',
        'Афросиёб Резиденс', 'Афросиаб Резиденс',
        'ЖК Афросиёб Резиденс', 'ЖК Афросиаб Резиденс',
      ], { en: 'Afrosiyob Residence', uz: 'Afrosiyob Residence', ru: 'Афросиёб Резиденс' }),
      residential('Shahriston by TXT Group', [
        'Shahriston by Txt Group', 'SHAHRISTON by TXT Group',
        'ЖК Shahriston by TXT Group', 'Shahriston by TXT Group TJM',
        'Shahriston by TXT Group turar joy majmuasi',
        'Шахристон by TXT Group', 'ЖК Шахристон by TXT Group',
      ], { en: 'Shahriston by TXT Group', uz: 'Shahriston by TXT Group', ru: 'Шахристон by TXT Group' }),
      residential('Bagishamal City', [
        'Bagishamal city', 'Bogishamol City', "Bog'ishamol City",
        'ЖК Bagishamal City', 'Bagishamal City TJM',
        'Bagishamal City turar joy majmuasi', 'Bagishamal City turar-joy majmuasi',
        'Багишамал Сити', 'Боғишамол Сити', 'ЖК Багишамал Сити',
      ], { en: 'Bagishamal City', uz: "Bog'ishamol City", ru: 'Багишамал Сити' }),
      residential('Asia Town', [
        'ЖК Asia Town', 'Asia Town TJM', 'Asia Town turar joy majmuasi',
        'Asia Town turar-joy majmuasi', 'Азия Таун', 'ЖК Азия Таун',
      ], { en: 'Asia Town', uz: 'Asia Town', ru: 'Азия Таун' }),
      residential('Bunyodkor', [
        'ЖК Bunyodkor', 'Bunyodkor TJM', 'Bunyodkor turar joy majmuasi',
        'Bunyodkor turar-joy majmuasi', 'Бунёдкор ЖК', 'ЖК Бунёдкор',
        'Бунёдкор турар жой мажмуаси',
      ], { en: 'Bunyodkor', uz: 'Bunyodkor', ru: 'Бунёдкор' }),
    ]),
    streets: Object.freeze([
      street('Gagarin Street', [
        'Gagarin ko‘chasi', "Gagarin ko'chasi", 'улица Гагарина', 'ул. Гагарина',
      ], { en: 'Gagarin Street', uz: "Gagarin ko'chasi", ru: 'улица Гагарина' }),
      street('Spitamen Avenue', [
        'Spitamen shoh ko‘chasi', "Spitamen shoh ko'chasi", 'проспект Спитамена', 'пр-т Спитамена',
      ], { en: 'Spitamen Avenue', uz: "Spitamen shoh ko'chasi", ru: 'проспект Спитамена' }),
      street('Dahbed Street', [
        'Dahbed ko‘chasi', "Dahbed ko'chasi", 'улица Дахбед', 'Дагбитская улица',
      ], { en: 'Dahbed Street', uz: "Dahbed ko'chasi", ru: 'улица Дахбед' }),
      street('Rudakiy Street', [
        'Rudakiy ko‘chasi', "Rudakiy ko'chasi", 'улица Рудаки', 'улица Рудакий',
      ], { en: 'Rudakiy Street', uz: "Rudakiy ko'chasi", ru: 'улица Рудаки' }),
      street('Mirzo Ulugbek Street', [
        'Mirzo Ulug‘bek ko‘chasi', "Mirzo Ulug'bek ko'chasi", 'улица Мирзо Улугбека', 'улица Мирзо Улугбек',
      ], { en: 'Mirzo Ulugbek Street', uz: "Mirzo Ulug'bek ko'chasi", ru: 'улица Мирзо Улугбека' }),
      street('Buyuk Ipak Yuli Street', [
        'Buyuk Ipak yo‘li ko‘chasi', "Buyuk Ipak yo'li ko'chasi", 'улица Буюк Ипак Йули', 'улица Великий Шёлковый путь',
      ], { en: 'Buyuk Ipak Yuli Street', uz: "Buyuk Ipak yo'li ko'chasi", ru: 'улица Буюк Ипак Йули' }),
    ]),
  }),
});
