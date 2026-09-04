import { aliasesToRegex } from './normalization.js';

function residential(name, aliases = []) {
  const all = Object.freeze([...new Set([name, ...aliases].filter(Boolean))]);
  return Object.freeze({
    canonical: name,
    name,
    type: 'residential_complex',
    entityType: 'residential_complex',
    country: 'KZ',
    aliases: all,
    re: aliasesToRegex(all),
  });
}

const row = (name, ...aliases) => residential(name, [
  `ЖК ${name}`,
  `жилой комплекс ${name}`,
  ...aliases,
]);

/**
 * Remaining Almaty residential labels promoted from the cleaned geo-catalog
 * scrape. Existing owners such as Alma City, Braun, Dostyk Residence,
 * Element, Esentai City, Hyde Park, Rams City, Mega Towers and Symphony are
 * intentionally not duplicated here.
 */
export const KZ_ALMATY_CLEANED_RESIDENTIAL_EXTENSIONS = Object.freeze({
  Almaty: Object.freeze({
    residentialComplexes: Object.freeze([
      row('Alma City 4', 'Alma City IV', 'Алма Сити 4', 'ЖК Алма Сити 4'),
      row('Centrium', 'Центриум', 'ЖК Центриум'),
      row('Dragon City', 'Дрэгон Сити', 'ЖК Dragon City'),
      row('Galileo Terrace', 'Галилео Террас', 'ЖК Galileo Terrace'),
      row('Geneva elite apartments', 'Geneva Elite Apartments', 'Женева Элит Апартментс'),
      row('Hayat Park', 'Хаят Парк', 'ЖК Хаят Парк'),
      row('Jazz-квартал', 'Jazz квартал', 'Джаз-квартал', 'Джаз квартал'),
      row('Latifa Residence', 'Латифа Резиденс', 'ЖК Латифа Резиденс'),
      row('Miracle', 'Миракл', 'ЖК Miracle'),
      row('Miras park', 'Miras Park', 'Мирас Парк', 'ЖК Мирас Парк'),
      row('Nurlitau Hills', 'Nurlytau Hills', 'Нурлытау Хиллс', 'Нұрлытау Хиллс'),
      row('Sakura', 'Сакура', 'ЖК Сакура'),
      row('Sulu Tan', 'Сұлу Таң', 'Сулу Тан', 'ЖК Сұлу Таң'),
      row('А-Элита', 'A-Elita', 'A Elita'),
      row('Айгерим', 'Айгерім', 'Aigerim', 'ЖК Айгерім'),
      row('Акниет', 'Ақниет', 'Akniet', 'ЖК Ақниет'),
      row('Аль-Фараби', 'Әл-Фараби', 'Al-Farabi', 'ЖК Әл-Фараби'),
      row('Арлан', 'Arlan'),
      row('Аспан сити', 'Аспан Сити', 'Aspan City', 'ЖК Aspan City'),
      row('Байсал', 'Baisal', 'Baysal'),
      row('Басенова', 'Basenova'),
      row('Береке', 'Bereke'),
      row('Жайлы', 'Zhaily', 'Jaily'),
      row('Жайсан', 'Zhaisan', 'Zhaysan'),
      row('Керемет', 'Keremet'),
      row('Кокжиек', 'Көкжиек', 'Kokzhiek', 'ЖК Көкжиек'),
      row('Комфорт', 'Komfort', 'Comfort'),
      row('Ланкашир', 'Lancashire', 'Lankashir'),
      row('Манхэттен', 'Manhattan', 'ЖК Manhattan'),
      row('Медеу Парк', 'Medeu Park', 'ЖК Medeu Park'),
      row('Молодежный', 'Молодёжный', 'Molodezhnyi', 'Molodezhny'),
      row('Парк Горького', 'Gorky Park', 'Park Gorkogo'),
      row('столичный центр', 'Столичный центр', 'Stolichnyi Tsentr', 'Stolichny Center'),
      row('Сункар', 'Сұңқар', 'Sunkar', 'Sunqar', 'ЖК Сұңқар'),
      row('Талисман', 'Talisman'),
      row('Тау Шатыр', 'Tau Shatyr'),
      row('Хан-Тенгри', 'Хан Тенгри', 'Хан Тәңірі', 'Khan Tengri', 'ЖК Хан Тәңірі'),
      row('Хуторок', 'Khutorok'),
      row('Шахристан', 'Shakhristan', 'Shahristan'),
      row('Шугыла', 'Шұғыла', 'Shugyla', 'Shughyla', 'ЖК Шұғыла'),
      row('Юбилейный', 'Yubileinyi', 'Yubileynyi'),
      row('Премьера', 'Premiera', 'Премьера ЖК', 'ЖК Премьера'),
    ]),
  }),
});
