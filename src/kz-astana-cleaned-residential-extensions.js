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
 * Remaining Astana residential labels promoted from the cleaned geo-catalog
 * scrape. Names already owned by another canonical (for example Aq-Didar,
 * Jagalau, Inju Promenade, Lazurny Kvartal, Nova City and Triumph) stay in
 * their existing entries and are intentionally not duplicated here.
 */
export const KZ_ASTANA_CLEANED_RESIDENTIAL_EXTENSIONS = Object.freeze({
  Astana: Object.freeze({
    residentialComplexes: Object.freeze([
      row('Central Park', 'Сентрал Парк', 'ЖК Сентрал Парк'),
      row('Авангард'),
      row('Богенбай батыр', 'Бөгенбай батыр', 'ЖК Бөгенбай батыр'),
      row('Бухар Жырау', 'Бұқар Жырау', 'Бұқар жырау', 'ЖК Бұқар Жырау'),
      row('Визит'),
      row('Восток'),
      row('Времена года Весна'),
      row('Гранд Астана Элит'),
      row('Гранитный'),
      row('Дастур', 'Дәстүр', 'ЖК Дәстүр'),
      row('Евразия'),
      row('Европейский'),
      row('Жагалау-3', 'Жағалау-3', 'ЖК Жағалау-3'),
      row('Жансая'),
      row('Жануя', 'Жанұя', 'ЖК Жанұя'),
      row('Жетису Аксу', 'Жетісу Ақсу', 'ЖК Жетісу Ақсу'),
      row('Жетіген'),
      row('Жибек Жол', 'Жібек Жол', 'Жібек жол', 'ЖК Жібек Жол'),
      row('Жубанова 4'),
      row('Запад'),
      row('Изет', 'Ізет', 'ЖК Ізет'),
      row('Ишим', 'Есіл', 'ЖК Есіл'),
      row('Казахстан', 'Қазақстан', 'ЖК Қазақстан'),
      row('Казына', 'Қазына', 'ЖК Қазына'),
      row('Кайнар', 'Қайнар', 'ЖК Қайнар'),
      row('Камал-3'),
      row('Керемет'),
      row('Кукуруза'),
      row('Махаббат-2'),
      row('Миланский Квартал', 'Миланский квартал'),
      row('Научный'),
      row('Независимость'),
      row('Омир Озен', 'Өмір Өзен', 'Өмір өзен', 'ЖК Өмір Өзен'),
      row('Отандастар'),
      row('Отырар'),
      row('Памир'),
      row('Парижский квартал'),
      row('Рахат'),
      row('Сapital Park Flowers', 'Capital Park Flowers', 'ЖК Capital Park Flowers'),
      row('Самрук', 'Самұрық', 'ЖК Самұрық'),
      row('Сапа 2007'),
      row('Сатурн-2'),
      row('Саулет', 'Сәулет', 'ЖК Сәулет'),
      row('Свечки'),
      row('Сыганак', 'Сығанақ', 'ЖК Сығанақ'),
      row('Тулпар', 'Тұлпар', 'ЖК Тұлпар'),
      row('Тумар', 'Тұмар', 'ЖК Тұмар'),
      row('Успех'),
      row('Формула успеха'),
      row('Французский квартал'),
      row('Целиноград'),
      row('Шеркала'),
      row('Эмират'),
    ]),
  }),
});
