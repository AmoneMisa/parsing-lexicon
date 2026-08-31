import { locationEntries } from './location-merge.js';

const microdistricts = (rows) => Object.freeze({ microdistricts: locationEntries(rows) });

// Listing-facing aliases that enrich the major Ukraine dictionaries without
// changing their established parser canonicals. Keep physical coordinates and
// source ownership in geo-catalog.
export const UA_CITY_LOCATION_EXPANSIONS = Object.freeze({
  Kharkiv: microdistricts([
    ['Zhukovskoho', 'Селище ім. Жуковського', 'селище Жуковського', 'Жуковського', 'посёлок Жуковского', 'поселок Жуковского', 'Жуковского', 'Zhukovskoho settlement'],
    ['Kulynychi', 'Кулиничі', 'Кулиничи', 'селище Кулиничі', 'посёлок Кулиничи', 'поселок Кулиничи', 'Kulynichi'],
  ]),

  Odesa: microdistricts([
    ['Vuzivskyi', 'Вузівський', 'Вузовський', 'Вузовский', 'Vuzovskyi', 'Вузівський район', 'Вузовский район'],
    ['Chubaivka', 'Чубаївка', 'Чубаевка', 'Chubayevka'],
    ['Arkadia', 'район Аркадії', 'район Аркадии', 'Аркадія район', 'Аркадия район'],
    ['Tairova', 'район Таїрова', 'район Таирова', 'ж/м Таїрова', 'ж/м Таирова', 'жилмассив Таирова'],
    ['Cheryomushky', 'Черемушки Одеса', 'Черёмушки Одесса', 'Черемушки Одесса', 'Черемушки район', 'Черёмушки район'],
    ['Kotivskoho', 'Котовка', 'Поскот', 'ПосКот', 'ж/м Котовського', 'ж/м Котовского', 'жилмассив Котовского'],
    ['Luzanivka', 'Лузановский район', 'Лузанівський район', 'район Лузановки', 'район Лузанівки'],
    ['Malyi Fontan', 'Малого Фонтана', 'Малого Фонтану', 'на Малом Фонтане', 'на Малому Фонтані'],
    ['Moldavanka', 'район Молдаванки', 'на Молдаванке', 'на Молдаванці'],
    ['Peresyp', 'район Пересыпи', 'район Пересипу', 'на Пересыпи', 'на Пересипі'],
    ['Chornomorka', 'Черноморка район', 'Чорноморка район', 'Люстдорф', 'Lustdorf'],
    ['Dacha Kovalevskoho', 'Дача Ковалевского район', 'район Дачи Ковалевского', 'район Дачі Ковалевського'],
    ['Zastava', 'Первая Застава', 'Перша Застава', 'Вторая Застава', 'Друга Застава', 'Застава I', 'Застава II'],
  ]),

  Kyiv: microdistricts([
    ['Troyeshchyna', 'Troieshchyna', 'Троєщина масив', 'жилмассив Троещина', 'ж/м Троєщина', 'ж/м Троещина'],
    ['Lipky', 'Lypky'],
    ['Lukianivka', 'Lukyanivka'],
    ['Holosiiv', 'Holosiyiv', 'Goloseevo'],
    ['Demiivka', 'Demiyivka', 'Demeevka'],
    ['Shuliavka', 'Shulyavka'],
    ['Solomianka', 'Solomyanka', 'Solomenka'],
    ['Chokolivka', 'Chokolovka'],
    ['Karavaievi Dachi', 'Karavayevi Dachi', 'Karavaevy Dachi'],
    ['Kurenivka', 'Kurenevka'],
    ['Rusanivka', 'Rusanovka'],
    ['Berezniaky', 'Bereznyaky'],
    ['Pozniaky', 'Poznyaki'],
    ['Kharkivskyi', 'Kharkivskyi Masyv', 'Kharkivskyi massif', 'Харківський житловий масив', 'Харьковский жилмассив'],
    ['Borshchahivka', 'Borshchagivka', 'Borshchagovka'],
    ['Sviatoshyn', 'Svyatoshyn'],
    ['Akademmistechko', 'Akademhorodok', 'Akademgorodok'],
    ['Pushcha-Vodytsia', 'Pushcha Vodytsia', 'Pushcha-Voditsa'],
    ['Vynohradar', 'Vinogradar'],
    ['Nyvky', 'Nivki'],
  ]),
});
