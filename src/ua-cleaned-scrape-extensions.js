import { aliasesToRegex } from './normalization.js';

function residential(name, aliases = []) {
  const all = Object.freeze([...new Set([name, ...aliases].filter(Boolean))]);
  return Object.freeze({
    canonical: name,
    name,
    type: 'residential_complex',
    entityType: 'residential_complex',
    country: 'UA',
    aliases: all,
    re: aliasesToRegex(all),
  });
}

const residentialEntries = (rows = []) => Object.freeze(rows.map(([name, ...aliases]) => residential(name, aliases)));

/**
 * Multilingual aliases for entities promoted from the cleaned page-scrape
 * pipeline. Keep source/provider wording as aliases while using stable Latin
 * canonicals compatible with the rest of the Ukraine location dictionaries.
 */
export const UA_CLEANED_SCRAPE_EXTENSIONS = Object.freeze({
  Dnipro: Object.freeze({
    residentialComplexes: residentialEntries([
      [
        'Pikhtovyi',
        'Pikhtovy', 'Pikhtovyy',
        'Пихтовый', 'ЖК Пихтовый', 'жилой комплекс Пихтовый',
        'Піхтовий', 'ЖК Піхтовий', 'житловий комплекс Піхтовий',
        'Ялицевий', 'ЖК Ялицевий', 'житловий комплекс Ялицевий',
      ],
      [
        'Dom na Tytova',
        'Dom na Titova',
        'Дом на Титова', 'ЖК Дом на Титова', 'жилой комплекс Дом на Титова',
        'Будинок на Титова', 'ЖК Будинок на Титова', 'житловий комплекс Будинок на Титова',
      ],
      [
        'Atlant',
        'Атлант', 'ЖК Атлант', 'жилой комплекс Атлант', 'житловий комплекс Атлант',
        'Atlant Dnipro', 'ЖК Atlant',
      ],
      [
        'Krasnopolskyi',
        'Krasnopolskiy',
        'Краснопольский', 'ЖК Краснопольский', 'жилой комплекс Краснопольский',
        'Краснопільський', 'ЖК Краснопільський', 'житловий комплекс Краснопільський',
      ],
      [
        'Lighthouse',
        'Lighthouse Dnipro', 'ЖК Lighthouse', 'Lighthouse residential complex',
        'Лайтхаус', 'ЖК Лайтхаус', 'жилой комплекс Лайтхаус', 'житловий комплекс Лайтхаус',
      ],
      [
        'Palermo',
        'Палермо', 'ЖК Палермо', 'жилой комплекс Палермо', 'житловий комплекс Палермо', 'ЖК Palermo',
      ],
      [
        'Salyut',
        'Saliut', 'Салют', 'ЖК Салют', 'жилой комплекс Салют', 'житловий комплекс Салют',
      ],
      [
        'Ptakhy',
        'Птахи', 'ЖК Птахи', 'жилой комплекс Птахи', 'житловий комплекс Птахи', 'ЖК Ptakhy',
      ],
    ]),
  }),

  Odesa: Object.freeze({
    residentialComplexes: residentialEntries([
      [
        'Arc Palace',
        'Ark Palace', 'Арк Палас', 'Арк-Палас', 'ЖК Арк Палас', 'ЖК Arc Palace',
      ],
      [
        'Synia Ptakh',
        'Synia Ptytsia', 'Blue Bird',
        'Синяя птица', 'ЖК Синяя птица', 'жилой комплекс Синяя птица',
        'Синій птах', 'ЖК Синій птах', 'житловий комплекс Синій птах',
      ],
      [
        'Favorit',
        'Фаворит', 'ЖК Фаворит', 'жилой комплекс Фаворит',
        'Фаворіт', 'ЖК Фаворіт', 'житловий комплекс Фаворіт',
      ],
      [
        'Club Marine',
        'Club Marine Odesa', 'ЖК Club Marine',
        'Комплекс апартаментов Club Marine', 'апартаменты Club Marine',
        'Комплекс апартаментів Club Marine', 'апартаменти Club Marine',
        'Клаб Марин', 'Клаб Марін',
      ],
      [
        '7 Pearl',
        '7th Pearl', 'Седьмая Жемчужина', '7-я Жемчужина', '7 Жемчужина', 'ЖК 7 Жемчужина',
        'Сьома Перлина', '7-ма Перлина', '7 Перлина', 'ЖК 7 Перлина',
      ],
      [
        '8 Pearl',
        '8th Pearl', 'Восьмая Жемчужина', '8-я Жемчужина', '8 Жемчужина', 'ЖК 8 Жемчужина',
        'Восьма Перлина', '8-ма Перлина', '8 Перлина', 'ЖК 8 Перлина',
      ],
    ]),
  }),
});
