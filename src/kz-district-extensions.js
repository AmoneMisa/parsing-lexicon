import { locationEntry } from './location-merge.js';

const districts = (rows) => Object.freeze(rows.map(([name, ...aliases]) => Object.freeze({
  ...locationEntry(name, aliases),
  type: 'district',
  entityType: 'district',
  country: 'KZ',
})));

const city = (rows) => Object.freeze({ districts: districts(rows) });

/**
 * Current Kazakhstan intra-city administrative district corrections/additions.
 * This is merged into the main KZ registry; it is not a parallel location catalog.
 */
export const KZ_DISTRICT_EXTENSIONS = Object.freeze({
  Shymkent: city([
    ['Abai', 'Абай', 'Абай ауданы', 'Абайский район', 'район Абай'],
    ['Al-Farabi', 'Әл-Фараби', 'Әл-Фараби ауданы', 'Аль-Фарабийский район', 'Аль-Фараби район'],
    ['Enbekshi', 'Еңбекші', 'Еңбекші ауданы', 'Енбекшинский район', 'район Енбекши'],
    ['Karatau', 'Қаратау', 'Қаратау ауданы', 'Каратауский район', 'район Каратау'],
    ['Turan', 'Тұран', 'Тұран ауданы', 'Туранский район', 'район Туран'],
  ]),
  Karaganda: city([
    ['Kazybek Bi', 'Қазыбек би', 'Қазыбек би ауданы', 'Қазыбек би атындағы ауданы', 'район имени Казыбек би', 'район Казыбек би'],
    ['Alikhan Bokeikhan', 'Әлихан Бөкейхан', 'Әлихан Бөкейхан ауданы', 'район Алихана Бокейхана', 'район Алихан Бокейхан', 'Октябрьский район', 'Октябрьский'],
  ]),
  Aktobe: city([
    ['Astana', 'Астана', 'Астана ауданы', 'район Астана', 'Астанинский район'],
    ['Almaty', 'Алматы', 'Алматы ауданы', 'район Алматы', 'Алматинский район'],
  ]),
  Taraz: city([
    ['Aulieata', 'Әулиеата', 'Әулиеата ауданы', 'Аулиеата', 'район Әулиеата', 'район Аулиеата', 'Aulieata audany'],
    ['Zhibek Zholy', 'Жібек жолы', 'Жібек жолы ауданы', 'Жибек жолы', 'район Жібек жолы', 'район Жибек жолы', 'Zhibek Zholy audany'],
  ]),
});
