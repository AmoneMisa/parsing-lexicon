import { lexiconEntity } from './lexicon-core.js';

const entity = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, { type: 'city', ...extra });

export const UZ_CITIES = Object.freeze([
  entity('Tashkent', { uzLatn: ['Toshkent'], uzCyrl: ['Тошкент'], ru: ['Ташкент'], en: ['Tashkent'] }, { country: 'UZ' }),
  entity('Samarkand', { uzLatn: ['Samarqand'], uzCyrl: ['Самарқанд'], ru: ['Самарканд'], en: ['Samarkand'] }, { country: 'UZ' }),
  entity('Bukhara', { uzLatn: ['Buxoro'], uzCyrl: ['Бухоро'], ru: ['Бухара'], en: ['Bukhara'] }, { country: 'UZ' }),
  entity('Namangan', { uzLatn: ['Namangan'], uzCyrl: ['Наманган'], ru: ['Наманган'], en: ['Namangan'] }, { country: 'UZ' }),
  entity('Andijan', { uzLatn: ['Andijon', 'Andijan', 'Anjon', 'Anjan'], uzCyrl: ['Андижон'], ru: ['Андижан'], en: ['Andijan'] }, { country: 'UZ' }),
  entity('Fergana', { uzLatn: ["Farg'ona", 'Farg‘ona', 'Fargʻona', 'Fargona'], uzCyrl: ['Фарғона'], ru: ['Фергана', 'Фаргана'], en: ['Fergana'] }, { country: 'UZ' }),
  entity('Nukus', { uzLatn: ['Nukus'], uzCyrl: ['Нукус'], ru: ['Нукус'], en: ['Nukus'] }, { country: 'UZ' }),
  entity('Qarshi', { uzLatn: ['Qarshi', 'Karshi'], uzCyrl: ['Қарши'], ru: ['Карши'], en: ['Qarshi', 'Karshi'] }, { country: 'UZ' }),
  entity('Urgench', { uzLatn: ['Urganch', 'Urgench'], uzCyrl: ['Урганч'], ru: ['Ургенч'], en: ['Urgench'] }, { country: 'UZ' }),
  entity('Khiva', { uzLatn: ['Xiva', 'Khiva'], uzCyrl: ['Хива'], ru: ['Хива'], en: ['Khiva'] }, { country: 'UZ' }),
  entity('Navoiy', { uzLatn: ['Navoiy', 'Navoi'], uzCyrl: ['Навоий'], ru: ['Навои'], en: ['Navoiy', 'Navoi'] }, { country: 'UZ' }),
  entity('Jizzakh', { uzLatn: ['Jizzax', 'Jizzakh'], uzCyrl: ['Жиззах'], ru: ['Джизак'], en: ['Jizzakh'] }, { country: 'UZ' }),
  entity('Termez', { uzLatn: ['Termiz', 'Termez'], uzCyrl: ['Термиз'], ru: ['Термез'], en: ['Termez'] }, { country: 'UZ' }),
  entity('Gulistan', { uzLatn: ['Guliston', 'Gulistan'], uzCyrl: ['Гулистон'], ru: ['Гулистан'], en: ['Gulistan'] }, { country: 'UZ' }),
  entity('Chirchiq', { uzLatn: ['Chirchiq', 'Chirchik'], uzCyrl: ['Чирчиқ'], ru: ['Чирчик'], en: ['Chirchiq'] }, { country: 'UZ' }),
]);

export const KZ_CITIES = Object.freeze([
  entity('Almaty', { kk: ['Алматы'], ru: ['Алматы', 'Алма-Ата', 'Алма Ата'], en: ['Almaty', 'Alma-Ata', 'Alma Ata'] }, { country: 'KZ' }),
  entity('Astana', { kk: ['Астана', 'Нұр-Сұлтан', 'Нұр Сұлтан'], ru: ['Астана', 'Нур-Султан', 'Нур Султан'], en: ['Astana', 'Nur-Sultan', 'Nur Sultan'] }, { country: 'KZ' }),
  entity('Shymkent', { kk: ['Шымкент'], ru: ['Шымкент', 'Чимкент'], en: ['Shymkent', 'Chimkent'] }, { country: 'KZ' }),
  entity('Karaganda', { kk: ['Қарағанды'], ru: ['Караганда'], en: ['Karaganda', 'Qaragandy'] }, { country: 'KZ' }),
  entity('Aktobe', { kk: ['Ақтөбе'], ru: ['Актобе'], en: ['Aktobe', 'Aqtobe'] }, { country: 'KZ' }),
  entity('Atyrau', { kk: ['Атырау'], ru: ['Атырау'], en: ['Atyrau'] }, { country: 'KZ' }),
  entity('Oral', { kk: ['Орал'], ru: ['Уральск', 'Орал'], en: ['Oral', 'Uralsk'] }, { country: 'KZ' }),
  entity('Taraz', { kk: ['Тараз'], ru: ['Тараз', 'Джамбул'], en: ['Taraz'] }, { country: 'KZ' }),
  entity('Pavlodar', { kk: ['Павлодар'], ru: ['Павлодар'], en: ['Pavlodar'] }, { country: 'KZ' }),
  entity('Semey', { kk: ['Семей'], ru: ['Семей', 'Семипалатинск'], en: ['Semey', 'Semipalatinsk'] }, { country: 'KZ' }),
  entity('Kostanay', { kk: ['Қостанай'], ru: ['Костанай'], en: ['Kostanay', 'Qostanay'] }, { country: 'KZ' }),
  entity('Kyzylorda', { kk: ['Қызылорда'], ru: ['Кызылорда'], en: ['Kyzylorda', 'Qyzylorda'] }, { country: 'KZ' }),
  entity('Aktau', { kk: ['Ақтау'], ru: ['Актау'], en: ['Aktau', 'Aqtau'] }, { country: 'KZ' }),
  entity('Oskemen', { kk: ['Өскемен'], ru: ['Усть-Каменогорск'], en: ['Oskemen', 'Ust-Kamenogorsk'] }, { country: 'KZ' }),
  entity('Petropavl', { kk: ['Петропавл'], ru: ['Петропавловск'], en: ['Petropavl', 'Petropavlovsk'] }, { country: 'KZ' }),
  entity('Turkistan', { kk: ['Түркістан'], ru: ['Туркестан'], en: ['Turkistan', 'Turkestan'] }, { country: 'KZ' }),
  entity('Taldykorgan', { kk: ['Талдықорған'], ru: ['Талдыкорган'], en: ['Taldykorgan', 'Taldyqorgan'] }, { country: 'KZ' }),
  entity('Kokshetau', { kk: ['Көкшетау'], ru: ['Кокшетау'], en: ['Kokshetau'] }, { country: 'KZ' }),
]);
