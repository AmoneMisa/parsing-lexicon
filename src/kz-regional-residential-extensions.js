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

const residentialEntries = (rows = []) => Object.freeze(rows.map(([name, ...aliases]) => residential(name, aliases)));

export const KZ_SCRAPED_SECONDARY_LOCATION_EXTENSIONS = Object.freeze({
  Shymkent: Object.freeze({
    residentialComplexes: residentialEntries([
      ['Asar House III', 'Asar House 3', 'Асар Хаус III', 'Асар Хаус 3', 'ЖК Asar House III'],
      ['Asar house plus', 'Asar House Plus', 'Асар Хаус Плюс', 'ЖК Asar House Plus'],
      ['Asar-City', 'Asar City', 'Асар-Сити', 'Асар Сити', 'ЖК Asar-City'],
      ['Capital Residence', 'Капитал Резиденс', 'ЖК Capital Residence'],
      ['Gagarin park', 'Gagarin Park', 'Гагарин Парк', 'ЖК Gagarin Park'],
      ['Grand Park', 'Гранд Парк', 'ЖК Grand Park', 'ЖК Гранд Парк'],
      ['Sauran', 'Сауран', 'ЖК Sauran', 'ЖК Сауран'],
      ['Smart', 'Смарт', 'ЖК Smart', 'ЖК Смарт'],
      ['Standard City', 'Стандарт Сити', 'ЖК Standard City'],
      ['Sultan', 'Султан', 'ЖК Sultan', 'ЖК Султан'],
      ['Tamerlan Residence', 'Тамерлан Резиденс', 'ЖК Tamerlan Residence'],
      ['Абат', 'Abat', 'ЖК Абат'],
      ['Атамекен', 'Atameken', 'Atameken Residence', 'ЖК Атамекен'],
      ['Capital City', 'Капитал сити', 'Капитал Сити', 'ЖК Capital City', 'ЖК Капитал Сити'],
      ['Каусар', 'Kausar', 'Qausar', 'ЖК Каусар'],
      ['Кок-Жайлау', 'Көк-Жайлау', 'Kok-Zhailau', 'Kok Zhaylau', 'ЖК Кок-Жайлау', 'ЖК Көк-Жайлау'],
      ['Таң-шуақ', 'Таң шуақ', 'Tan-Shuaq', 'Tang-Shuaq', 'Тан-шуак', 'ЖК Таң-шуақ'],
      ['Ұлы Шаңырақ', 'Улы Шанырак', 'Uly Shanyraq', 'Uly Shanyrak', 'ЖК Ұлы Шаңырақ'],
    ]),
  }),

  Karaganda: Object.freeze({
    residentialComplexes: residentialEntries([
      ['Central City', 'Централ Сити', 'ЖК Central City', 'ЖК Централ Сити'],
      ['Central Park', 'Централ Парк', 'ЖК Central Park', 'ЖК Централ Парк'],
      ['Dream House', 'Дрим Хаус', 'ЖК Dream House', 'ЖК Дрим Хаус'],
      ['Keruen Блок А', 'Keruen Block A', 'Керуен Блок А', 'ЖК Keruen Блок А', 'ЖК Керуен Блок А'],
      ['Otbasy Village', 'Отбасы Вилладж', 'Отбасы Village', 'ЖК Otbasy Village'],
      ['Pride Residence', 'Прайд Резиденс', 'ЖК Pride Residence'],
      ['Tulpar Residence', 'Тулпар Резиденс', 'ЖК Tulpar Residence'],
      ['Tumar', 'Тумар', 'ЖК Tumar', 'ЖК Тумар'],
      ['Zaman 2', 'Заман 2', 'Zaman-2', 'ЖК Zaman 2'],
      ['Алтын Блок А', 'Altyn Block A', 'Алтын Block A', 'ЖК Алтын Блок А'],
      ['Гулдер', 'Гүлдер', 'Gulder', 'Gulder Residence', 'ЖК Гулдер', 'ЖК Гүлдер'],
      ['Дом на Таттимбета', 'Dom na Tattimbeta', 'Tattimbeta House', 'ЖК Дом на Таттимбета'],
      ['Комиссарова', 'Komissarova', 'ЖК Комиссарова'],
      ['Крылова', 'Krylova', 'ЖК Крылова'],
      ['Новый Степной', 'Novyi Stepnoi', 'Novy Stepnoy', 'ЖК Новый Степной'],
      ['Эталон', 'Etalon', 'ЖК Эталон'],
    ]),
  }),

  Aktobe: Object.freeze({
    residentialComplexes: residentialEntries([
      ['Garden Residence', 'Гарден Резиденс', 'ЖК Garden Residence', 'ЖК Гарден Резиденс'],
      ['Gold Square', 'Голд Сквер', 'ЖК Gold Square', 'ЖК Голд Сквер'],
      ['Grand Nomad', 'Гранд Номад', 'ЖК Grand Nomad', 'ЖК Гранд Номад'],
      ['Арайлы', 'Araily', 'ЖК Арайлы'],
      ['Астана Премиум', 'Astana Premium', 'ЖК Астана Премиум'],
      ['Даулет', 'Дәулет', 'Daulet', 'ЖК Даулет', 'ЖК Дәулет'],
      ['Домино', 'Domino', 'ЖК Домино'],
      ['Жети казына', 'Жеті қазына', 'Zheti Qazyna', 'Zheti Kazyna', 'ЖК Жети казына', 'ЖК Жеті қазына'],
      ['Коктем', 'Көктем', 'Koktem', 'ЖК Коктем', 'ЖК Көктем'],
      ['Куандык', 'Қуандық', 'Kuandyk', 'Quandyq', 'ЖК Куандык', 'ЖК Қуандық'],
      ['Полина', 'Polina', 'ЖК Полина'],
      ['Сконур', 'Skonur', 'ЖК Сконур'],
      ['Сункар', 'Сұңқар', 'Sunkar', 'Sunqar', 'ЖК Сункар', 'ЖК Сұңқар'],
    ]),
  }),
});
