import { locationEntries } from './location-merge.js';

const districts = (rows) => Object.freeze({ districts: locationEntries(rows) });
const microdistricts = (rows) => Object.freeze({ microdistricts: locationEntries(rows) });

// Listing-facing aliases that enrich the major Ukraine dictionaries without
// changing their established parser canonicals. Keep physical coordinates and
// source ownership in geo-catalog.
export const UA_CITY_LOCATION_EXPANSIONS = Object.freeze({
  Mykolaiv: districts([
    ['Tsentralnyi', 'Центральний', 'Центральный', 'Центральний район', 'Центральный район'],
    ['Zavodskyi', 'Заводський', 'Заводской', 'Заводський район', 'Заводской район'],
    ['Inhulskyi', 'Інгульський', 'Ингульский', 'Інгульський район', 'Ингульский район', 'Ленінський', 'Ленинский', 'Ленінський район', 'Ленинский район', 'Слобідський', 'Слободской'],
    ['Korabelnyi', 'Корабельний', 'Корабельный', 'Корабельний район', 'Корабельный район'],
  ]),

  Kherson: districts([
    ['Tsentralnyi', 'Центральний', 'Центральный', 'Центральний район', 'Центральный район', 'Суворовський', 'Суворовский', 'Суворовський район', 'Суворовский район'],
    ['Dniprovskyi', 'Дніпровський', 'Днепровский', 'Дніпровський район', 'Днепровский район'],
    ['Korabelnyi', 'Корабельний', 'Корабельный', 'Корабельний район', 'Корабельный район', 'Комсомольський', 'Комсомольский', 'Комсомольський район', 'Комсомольский район'],
  ]),

  Cherkasy: districts([
    ['Prydniprovskyi', 'Придніпровський', 'Приднепровский', 'Придніпровський район', 'Приднепровский район'],
    ['Sosnivskyi', 'Соснівський', 'Сосновский', 'Соснівський район', 'Сосновский район'],
  ]),

  Poltava: districts([
    ['Kyivskyi', 'Київський', 'Киевский', 'Київський район', 'Киевский район'],
    ['Podilskyi', 'Подільський', 'Подольский', 'Подільський район', 'Подольский район', 'Ленінський', 'Ленинский', 'Ленінський район', 'Ленинский район'],
    ['Shevchenkivskyi', 'Шевченківський', 'Шевченковский', 'Шевченківський район', 'Шевченковский район', 'Октябрський', 'Октябрьский', 'Октябрський район', 'Октябрьский район'],
  ]),

  Chernihiv: districts([
    ['Desnianskyi', 'Деснянський', 'Деснянский', 'Деснянський район', 'Деснянский район'],
    ['Novozavodskyi', 'Новозаводський', 'Новозаводской', 'Новозаводський район', 'Новозаводской район'],
  ]),

  Zhytomyr: districts([
    ['Bohunskyi', 'Богунський', 'Богунский', 'Богунський район', 'Богунский район'],
    ['Korolovskyi', 'Корольовський', 'Королёвский', 'Королевский', 'Корольовський район', 'Королёвский район', 'Королевский район'],
  ]),

  Kropyvnytskyi: districts([
    ['Podilskyi', 'Подільський', 'Подольский', 'Подільський район', 'Подольский район', 'Ленінський', 'Ленинский', 'Ленінський район', 'Ленинский район'],
    ['Fortechnyi', 'Фортечний', 'Фортечный', 'Фортечний район', 'Фортечный район', 'Кіровський', 'Кировский', 'Кіровський район', 'Кировский район'],
  ]),

  Sumy: districts([
    ['Zarichnyi', 'Зарічний', 'Заречный', 'Зарічний район', 'Заречный район'],
    ['Kovpakivskyi', 'Ковпаківський', 'Ковпаковский', 'Ковпаківський район', 'Ковпаковский район'],
  ]),

  Kharkiv: microdistricts([
    ['Zhukovskoho', 'Селище ім. Жуковського', 'селище Жуковського', 'Жуковського', 'посёлок Жуковского', 'поселок Жуковского', 'Жуковского', 'Zhukovskoho settlement'],
    ['Kulynychi', 'Кулиничі', 'Кулиничи', 'селище Кулиничі', 'посёлок Кулиничи', 'поселок Кулиничи', 'Kulynichi'],
    ['Saltivka', 'Saltovka', 'Салтовка'],
    ['Pavlove Pole', 'Pavlovo Pole', 'Pavlovo Polye'],
    ['Oleksiivka', 'Alekseevka', 'Alekseyevka'],
    ['Kholodna Hora', 'Kholodnaya Gora', 'Holodnaya Gora'],
    ['Novi Budynky', 'Novye Doma', 'Novyye Doma'],
    ['Piatykhatky', 'Pyatikhatki', 'Pyatihatki'],
    ['Zaliutyne', 'Zalyutino', 'Zalutino'],
    ['Rohan', 'Rogan'],
    ['Zhuravlivka', 'Zhuravlevka'],
    ['Velyka Danylivka', 'Bolshaya Danilovka', 'Velika Danylivka'],
    ['Sokolnyky', 'Sokolniki'],
  ]),

  Odesa: microdistricts([
    ['Vuzivskyi', 'Вузівський', 'Вузовський', 'Вузовский', 'Vuzovskyi', 'Вузівський район', 'Вузовский район'],
    ['Chubaivka', 'Чубаївка', 'Чубаевка', 'Chubayevka'],
    ['Arkadia', 'Arcadia', 'район Аркадії', 'район Аркадии', 'Аркадія район', 'Аркадия район'],
    ['Tairova', 'Tairovo', 'район Таїрова', 'район Таирова', 'ж/м Таїрова', 'ж/м Таирова', 'жилмассив Таирова'],
    ['Cheryomushky', 'Cheremushki', 'Cheryomushki', 'Черемушки Одеса', 'Черёмушки Одесса', 'Черемушки Одесса', 'Черемушки район', 'Черёмушки район'],
    ['Kotivskoho', 'Котовка', 'Поскот', 'ПосКот', 'ж/м Котовського', 'ж/м Котовского', 'жилмассив Котовского'],
    ['Luzanivka', 'Luzanovka', 'Лузановский район', 'Лузанівський район', 'район Лузановки', 'район Лузанівки'],
    ['Malyi Fontan', 'Maly Fontan', 'Малого Фонтана', 'Малого Фонтану', 'на Малом Фонтане', 'на Малому Фонтані'],
    ['Moldavanka', 'Moldovanka', 'район Молдаванки', 'на Молдаванке', 'на Молдаванці'],
    ['Peresyp', 'Peresip', 'район Пересыпи', 'район Пересипу', 'на Пересыпи', 'на Пересипі'],
    ['Chornomorka', 'Chernomorka', 'Черноморка район', 'Чорноморка район', 'Люстдорф', 'Lustdorf'],
    ['Dacha Kovalevskoho', 'Dacha Kovalevskogo', 'Дача Ковалевского район', 'район Дачи Ковалевского', 'район Дачі Ковалевського'],
    ['Zastava-1', 'Zastava 1', 'Первая Застава', 'Перша Застава', 'Застава I'],
    ['Zastava-2', 'Zastava 2', 'Вторая Застава', 'Друга Застава', 'Застава II'],
  ]),

  Kyiv: microdistricts([
    ['Troyeshchyna', 'Troieshchyna', 'Троєщина масив', 'жилмассив Троещина', 'ж/м Троєщина', 'ж/м Троещина'],
    ['Lipky', 'Lypky'],
    ['Lukianivka', 'Lukyanivka'],
    ['Zvirynets', 'Zverinets'],
    ['Holosiiv', 'Holosiyiv', 'Goloseevo'],
    ['Demiivka', 'Demiyivka', 'Demeevka'],
    ['Shuliavka', 'Shulyavka'],
    ['Solomianka', 'Solomyanka', 'Solomenka'],
    ['Chokolivka', 'Chokolovka'],
    ['Vidradnyi', 'Otradnyi', 'Otradny'],
    ['Karavaievi Dachi', 'Karavayevi Dachi', 'Karavaevy Dachi'],
    ['Kurenivka', 'Kurenevka'],
    ['Rusanivka', 'Rusanovka'],
    ['Berezniaky', 'Bereznyaky'],
    ['Darnytsia', 'Darnitsa'],
    ['Nova Darnytsia', 'Novaya Darnitsa'],
    ['Stara Darnytsia', 'Staraya Darnitsa'],
    ['Pozniaky', 'Poznyaki'],
    ['Bortnychi', 'Bortnichi'],
    ['Feofaniia', 'Feofaniya'],
    ['Vydubychi', 'Vydubichi'],
    ['Lisovyi Masyv', 'Lisovyi Massif', 'Lesnoy Massiv'],
    ['Minskyi Masyv', 'Minskyi Massif', 'Minskiy Massiv'],
    ['Kharkivskyi', 'Kharkivskyi Masyv', 'Kharkivskyi massif', 'Харківський житловий масив', 'Харьковский жилмассив'],
    ['Borshchahivka', 'Borshchagivka', 'Borshchagovka'],
    ['Pivdenna Borshchahivka', 'Yuzhnaya Borshchagovka'],
    ['Mykilska Borshchahivka', 'Nikolskaya Borshchagovka'],
    ['Sviatoshyn', 'Svyatoshyn'],
    ['Akademmistechko', 'Akademhorodok', 'Akademgorodok'],
    ['Pushcha-Vodytsia', 'Pushcha Vodytsia', 'Pushcha-Voditsa'],
    ['Vynohradar', 'Vinogradar'],
    ['Nyvky', 'Nivki'],
  ]),
});
