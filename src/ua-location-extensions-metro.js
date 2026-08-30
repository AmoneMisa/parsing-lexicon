import { locationEntries } from './location-merge.js';
import { UA_KHARKIV_LOCATION_TRANSLATIONS } from './ua-kharkiv-location-translations.js';

export const UA_METRO_LOCATION_EXTENSIONS = Object.freeze({
  Kyiv: Object.freeze({
    metro: locationEntries([
      ['Khreshchatyk', 'Хрещатик', 'Крещатик'],
      ['Maidan Nezalezhnosti', 'Майдан Незалежності', 'Площадь Независимости'],
      ['Zoloti Vorota', 'Золоті ворота', 'Золотые ворота'],
      ['Universytet', 'Університет', 'Университет'],
      ['Vokzalna', 'Вокзальна', 'Вокзальная'],
      ['Osokorky', 'Осокорки'],
      ['Pozniaky', 'Позняки'],
      ['Livoberezhna', 'Лівобережна', 'Левобережная'],
      ['Lukianivska', 'Лук’янівська', 'Лукьяновская'],
      ['Palats Ukraina', 'Палац Україна', 'Дворец Украина'],
      ['Olimpiiska', 'Олімпійська', 'Олимпийская'],
      ['Pecherska', 'Печерська', 'Печерская'],
    ]),
  }),
  Kharkiv: Object.freeze({
    ...UA_KHARKIV_LOCATION_TRANSLATIONS,
    // This extension is merged after the legacy UA seeds. Keep late verified
    // Kharkiv quarter canonicals here so they cannot be shadowed by old seed
    // vocabulary while the broader Kharkiv location layer is being expanded.
    microdistricts: locationEntries([
      ...['455','519','601','614','615','624'].map((n) => [
        `${n} microdistrict`,
        `${n}-й мікрорайон`, `${n} мікрорайон`, `Мікрорайон ${n}`,
        `${n}-й микрорайон`, `${n} микрорайон`, `Микрорайон ${n}`,
      ]),
      ['606A',
        '606А', '606а', '606A microdistrict',
        '606А мікрорайон', '606а мікрорайон', 'Мікрорайон 606А', 'Мікрорайон 606а',
        '606А микрорайон', '606а микрорайон', 'Микрорайон 606А', 'Микрорайон 606а',
      ],
    ]),
    metro: locationEntries([
      ['Kholodna Hora', 'Холодна гора', 'Холодная гора'],
      ['Vokzalna', 'Вокзальна', 'Вокзальная', 'Південний вокзал', 'Южный вокзал'],
      ['Tsentralnyi Rynok', 'Центральний ринок', 'Центральный рынок'],
      ['Maidan Konstytutsii', 'Майдан Конституції', 'Площадь Конституции'],
      ['Sportyvna', 'Спортивна', 'Спортивная'],
      ['Zavodska', 'Zavod imeni Malysheva', 'Заводська', 'Завод імені Малишева', 'Завод ім. Малишева', 'Завод имени Малышева'],
      ['Turboatom', 'Турбоатом'],
      ['Palats Sportu', 'Палац Спорту', 'Дворец Спорта'],
      ['Akademika Pavlova', 'Академіка Павлова', 'Академика Павлова', 'Ак. Павлова', 'Ак Павлова'],
      ['Studentska', 'Студентська', 'Студенческая'],
      ['Saltivska', 'Heroiv Pratsi', 'Салтівська', 'Героїв Праці', 'Героев Труда'],
      ['Peremoha', 'Перемога', 'Победа'],
      ['Oleksiivska', 'Олексіївська', 'Алексеевская'],
      ['Naukova', 'Наукова', 'Научная'],
      ['Derzhprom', 'Держпром', 'Госпром'],
      ['Arkhitektora Beketova', 'Архітектора Бекетова', 'Архитектора Бекетова'],
      ['Istorychnyi Muzei', 'Історичний музей', 'Исторический музей'],
      ['Yaroslava Mudroho', 'Ярослава Мудрого', 'Ярослава Мудрого'],
      ['Kyivska', 'Київська', 'Киевская'],
      ['Akademika Barabashova', 'Академіка Барабашова', 'Академика Барабашова'],
      ['Zakhysnykiv Ukrainy', 'Захисників України', 'Защитников Украины'],
      ['Armiiska', 'Армійська', 'Армейская'],
      ['Maselskoho', 'Масельського', 'Масельского'],
      ['Industrialna', 'Індустріальна', 'Индустриальная'],
      ['Metrobudivnykiv', 'Метробудівників', 'Метростроителей'],
    ]),
  }),
});
