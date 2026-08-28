import { locationEntries } from './location-merge.js';

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
    ]),
  }),
});
