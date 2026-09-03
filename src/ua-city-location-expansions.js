import { locationEntries } from './location-merge.js';

const microdistricts = (rows) => Object.freeze({ microdistricts: locationEntries(rows) });
const landmarks = (rows) => Object.freeze({ landmarks: locationEntries(rows) });

// Listing-facing aliases that enrich the major Ukraine dictionaries without
// changing their established parser canonicals. Keep physical coordinates and
// source ownership in geo-catalog.
export const UA_CITY_LOCATION_EXPANSIONS = Object.freeze({
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

  'Kamianets-Podilskyi': landmarks([
    ['Old Castle', 'Кам’янець-Подільський замок', "Кам'янець-Подільський замок", 'Старий замок', 'Kamianets-Podilskyi Castle'],
    ['Polskyi Rynok Square', 'площа Польський Ринок', 'Польський Ринок', 'Polski Rynok', 'Polish Market Square'],
    ['Armenian Market Square', 'площа Вірменський Ринок', 'Вірменський Ринок', 'Armenian Market'],
    ['Kamianets-Podilskyi Railway Station', 'залізничний вокзал Кам’янець-Подільський', "залізничний вокзал Кам'янець-Подільський", 'вокзал Кам’янець-Подільський', "вокзал Кам'янець-Подільський"],
  ]),

  Drohobych: landmarks([
    ["St. George's Church", 'Церква Святого Юра', 'церква Святого Юра', 'Храм Святого Юра', "St George's Church", "Saint George's Church"],
    ['Drohobych Saltworks', 'Дрогобицька солеварня', 'Дрогобицький солевиварювальний завод', 'Drohobych Salt Plant'],
    ['Drohobych Railway Station', 'станція Дрогобич', 'Stantsiia Drohobych'],
  ]),

  Kolomyia: landmarks([
    ['Pysanka Museum', 'Музей писанкового розпису', 'Музей писанки', 'Музей Писанка'],
    ['National Museum of Hutsulshchyna and Pokuttia Folk Art', 'Національний музей народного мистецтва Гуцульщини та Покуття імені Й. Кобринського', 'Музей Гуцульщини та Покуття'],
    ['Kolomyia Railway Station', 'Залізнична станція Коломия', 'залізничний вокзал Коломия'],
  ]),

  Kovel: landmarks([
    ['Kovel Railway Station', 'Вокзал станції Ковель', 'Залізничний вокзал Ковель', 'вокзал Ковель'],
    ['Lesya Ukrainka Park', 'парк імені Лесі Українки', 'парк Лесі Українки'],
  ]),

  Novovolynsk: landmarks([
    ['Нововолинський історичний музей', 'Нововолинський міський історичний музей', 'Novovolynsk Historical Museum'],
  ]),

  Nizhyn: landmarks([
    ['Nizhyn Railway Station', 'Залізничний вокзал Ніжина', 'станція Ніжин', 'вокзал Ніжин'],
    ['Ніжинський краєзнавчий музей імені Івана Спаського', 'Ніжинський краєзнавчий музей ім. І. Спаського', 'краєзнавчий музей імені Івана Спаського'],
    ['Ніжинська поштова станція', 'Музей «Ніжинська поштова станція»', 'музей Поштова станція'],
  ]),

  Volodymyr: landmarks([
    ['Володимирський історичний музей імені Омеляна Дверницького', 'Володимир-Волинський історичний музей'],
    ['Volodymyr dytynets', 'Володимирський дитинець'],
    ['Костел святих Йоакима та Анни', 'Костел Йоакима і Анни', 'Парафіяльний костел святих Йоакима та Анни'],
    ['Свято-Успенський кафедральний собор', 'Свято-Успенський собор', 'Успенський собор'],
    ['Свято-Василівська церква-ротонда', 'Василівська церква-ротонда', 'Василівська ротонда', 'церква Святого Василя'],
  ]),
});
