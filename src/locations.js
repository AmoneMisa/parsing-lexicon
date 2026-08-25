import { aliasesToRegex, aliasesOf } from './normalization.js';
import { TASHKENT_DISTRICTS, TASHKENT_METRO } from './geo.js';
import { UA_REGIONS as UA_REGION_LEXICON } from './geography.js';
import { mergeLocationCityDictionaries } from './location-merge.js';
import { UA_MAJOR_LOCATION_EXTENSIONS } from './ua-location-extensions-major.js';
import { UA_REGIONAL_LOCATION_EXTENSIONS } from './ua-location-extensions-regional.js';
import { UA_METRO_LOCATION_EXTENSIONS } from './ua-location-extensions-metro.js';

function entries(rows) {
  return Object.freeze(rows.map(([name, ...aliases]) => {
    const all = [...new Set([name, ...aliases].filter(Boolean))];
    return Object.freeze({ canonical: name, name, aliases: Object.freeze(all), re: aliasesToRegex(all) });
  }));
}

function lexiconEntries(items) {
  return Object.freeze((items || []).map((item) => {
    const all = [...new Set([item.canonical, ...aliasesOf(item)].filter(Boolean))];
    return Object.freeze({ canonical: item.canonical, name: item.canonical, type: item.type, country: item.country, city: item.city, aliases: Object.freeze(all), re: aliasesToRegex(all) });
  }));
}

const tashkentDistricts = lexiconEntries(TASHKENT_DISTRICTS);

export const LOCATION_DICTIONARIES = Object.freeze({
  UZ: Object.freeze({
    Tashkent: Object.freeze({
      districts: tashkentDistricts,
      microdistricts: entries([
        ...[1,2,3,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20].map((n) => [`Chilanzar-${n}`, `Чиланзар ${n}`, `Чилонзор ${n}`, `Chilonzor ${n}`]),
        ...[4,5,6,7,8,9,11,12,13,14,15,16,17,18,19,20,21,22].map((n) => [`Yunusabad-${n}`, `Юнусабад ${n}`, `Юнусобод ${n}`, `Yunusobod ${n}`]),
        ['Karakamysh', 'Каракамыш', 'Қорақамиш', 'Qoraqamish'], ['Sebzar', 'Себзар'],
        ['Tashselmash', 'Ташсельмаш'], ['Aviasozlar', 'Авиасозлар', 'Авиагородок'],
        ['Kuylyuk', 'Куйлюк', 'Қўйлиқ', 'Qo‘yliq', "Qo'yliq", 'Qoʻyliq'], ['Sergeli', 'Сергели массив', 'Sergeli massivi'],
        ['Sputnik', 'Спутник', 'Йўлдош', 'Sputnik massivi'], ['Yangi Choshtepa', 'Янги Чоштепа'],
      ]),
      metro: TASHKENT_METRO,
      residentialComplexes: entries([
        ['Nest One', 'Нест Ван'], ['Gardens Residence', 'Гарденс Резиденс'], ['Boulevard', 'Boulevard Residence', 'Бульвар'],
        ['NRG Oybek', 'NRG Ойбек'], ['NRG U-Tower', 'U Tower', 'Ю Тауэр'], ['Mirabad Avenue', 'Мирабад Авеню'],
        ['Darkhan Residence', 'Дархан Резиденс'], ['Tashkent City', 'Ташкент Сити', 'Toshkent City'], ['Assalom Sohil', 'Ассалом Сохил'],
        ['Assalom Jomiy', 'Ассалом Жомий'], ['Xon Saroy', 'Хон Сарой', 'Khon Saroy'], ['Cambridge Residence', 'Кембридж Резиденс'],
        ['Infinity', 'Инфинити ЖК'], ['Do‘stlar', 'Дустлар ЖК', "Do'stlar", 'Doʻstlar'], ['Olmazor City', 'Алмазар Сити', 'Олмазор Сити'],
      ]),
      streets: entries([
        ['Amir Temur Avenue', 'проспект Амира Темура', 'Amir Temur shoh ko‘chasi', "Amir Temur shoh ko'chasi", 'Амир Темур шоҳ кўчаси'],
        ['Shota Rustaveli Street', 'улица Шота Руставели', 'Shota Rustaveli ko‘chasi', 'Шота Руставели кўчаси'],
        ['Nukus Street', 'улица Нукус', 'Nukus ko‘chasi', 'Нукус кўчаси'],
        ['Buyuk Ipak Yoli Street', 'улица Буюк Ипак Йули', "Buyuk Ipak Yo'li ko'chasi", 'Buyuk Ipak Yo‘li ko‘chasi', 'Буюк Ипак Йўли кўчаси'],
        ['Afrosiyob Street', 'улица Афросиаб', 'Afrosiyob ko‘chasi', 'Афросиёб кўчаси'],
        ['Mirzo Ulugbek Avenue', 'проспект Мирзо Улугбека', "Mirzo Ulug'bek shoh ko'chasi", 'Мирзо Улуғбек шоҳ кўчаси'],
        ['Bunyodkor Avenue', 'проспект Бунёдкор', 'Bunyodkor shoh ko‘chasi', 'Бунёдкор шоҳ кўчаси'],
        ['Muqimiy Street', 'улица Мукими', 'Muqimiy ko‘chasi', 'Муқимий кўчаси'],
        ['Furqat Street', 'улица Фурката', 'Furqat ko‘chasi', 'Фурқат кўчаси'],
        ['Beruniy Avenue', 'проспект Беруни', 'Beruniy shoh ko‘chasi', 'Беруний шоҳ кўчаси'],
        ['Taras Shevchenko Street', 'улица Тараса Шевченко', 'Taras Shevchenko ko‘chasi'],
        ['Islam Karimov Street', 'улица Ислама Каримова', 'Islom Karimov ko‘chasi', 'Ислом Каримов кўчаси'],
      ]),
      landmarks: entries([
        ['Chorsu Bazaar', 'базар Чорсу', 'Чорсу бозори', 'Chorsu bozori'], ['Alay Bazaar', 'Алайский базар', 'Олой бозори', 'Oloy bozori'],
        ['Amir Timur Square', 'Сквер Амира Темура', 'Amir Temur xiyoboni', 'Амир Темур хиёбони'],
        ['Independence Square', 'Площадь Независимости', 'Mustaqillik maydoni', 'Мустақиллик майдони'],
        ['Minor Mosque', 'мечеть Минор', 'Minor masjidi'], ['Bobur Park', 'парк Бобура', 'Bobur bog‘i', "Bobur bog'i"],
        ['Farhod Bazaar', 'Фархадский базар', 'Farhod bozori'], ['Sergeli Car Bazaar', 'Сергелийский авторынок', 'Sergeli mashina bozori'],
        ['Tashkent North Railway Station', 'Ташкент Северный вокзал', 'Toshkent Shimoliy vokzali'],
        ['Tashkent South Railway Station', 'Ташкент Южный вокзал', 'Toshkent Janubiy vokzali'],
        ['Magic City', 'Мэджик Сити'], ['Tashkent City Mall', 'Ташкент Сити Молл'],
      ]),
    }),
    Samarkand: Object.freeze({
      microdistricts: entries([
        ['Sogdiana', 'Согдиана', 'So‘g‘diyona', "So'g'diyona", 'Сўғдиёна'], ['Sartepa', 'Сартепа'], ['Sat-Tepo', 'Саттепо', 'Sat Tepo'],
        ['Kimyogarlar', 'Химиков', 'Кимёгарлар'], ['Vokzal', 'Вокзал район'], ['Universitet', 'Университетский район'],
        ['Registan', 'Регистан'], ['Dagbitskaya', 'Дагбитская'], ['Rudaki', 'Рудаки'],
      ]),
      residentialComplexes: entries([
        ['Samarkand City', 'Самарканд Сити'], ['Bogishamol City', 'Богишамол Сити'], ['Marokand Avenue', 'Мароканд Авеню'],
        ['Silk Road Residence', 'Силк Роуд Резиденс'], ['Registan Residence', 'Регистан Резиденс'],
      ]),
      landmarks: entries([
        ['Registan Square', 'площадь Регистан', 'Registon maydoni', 'Регистон майдони'], ['Gur-e-Amir', 'Гур Эмир', 'Go‘ri Amir', "Go'ri Amir"],
        ['Siab Bazaar', 'Сиабский базар', 'Siyob bozori'], ['Samarkand Railway Station', 'Самаркандский вокзал', 'Samarqand vokzali'],
      ]),
    }),
  }),
  KZ: Object.freeze({
    Almaty: Object.freeze({
      districts: entries([
        ['Almaly', 'Алмалинский район', 'Алмалы ауданы'], ['Bostandyk', 'Бостандыкский район', 'Бостандық ауданы'],
        ['Medeu', 'Медеуский район', 'Медеу ауданы'], ['Auezov', 'Ауэзовский район', 'Әуезов ауданы'],
        ['Turksib', 'Турксибский район', 'Түрксіб ауданы'], ['Nauryzbay', 'Наурызбайский район', 'Наурызбай ауданы'],
        ['Alatau', 'Алатауский район', 'Алатау ауданы'], ['Zhetysu', 'Жетысуский район', 'Жетісу ауданы'],
      ]),
      microdistricts: entries([
        ...[1,2,3].map((n) => [`Samal-${n}`, `Самал ${n}`]), ...[1,2,3,4].map((n) => [`Orbita-${n}`, `Орбита ${n}`]),
        ...[1,2,3,4,5].map((n) => [`Aksai-${n}`, `Аксай ${n}`]), ...[1,2,3,4].map((n) => [`Mamyr-${n}`, `Мамыр ${n}`]),
        ...[1,2,3,4].map((n) => [`Zhetysu-${n}`, `Жетысу ${n}`, `Жетісу ${n}`]),
        ['Taugul', 'Таугуль', 'Таугүл'], ['Kazakhfilm', 'Казахфильм'], ['Koktem', 'Коктем', 'Көктем'], ['Atakent', 'Атакент'],
      ]),
      metro: entries([
        ['Raiymbek Batyr', 'Райымбек батыра', 'Райымбек батыр'], ['Zhibek Zholy', 'Жибек жолы', 'Жібек жолы'], ['Almaly', 'Алмалы'],
        ['Abay', 'Абая', 'Абай'], ['Baikonur', 'Байконур', 'Байқоңыр'], ['Auezov Theatre', 'Театр имени М. Ауэзова', 'Мұхтар Әуезов театры'],
        ['Alatau', 'Алатау'], ['Sairan', 'Сайран'], ['Moskva', 'Москва'], ['Saryarka', 'Сарыарка', 'Сарыарқа'], ['Bauyrzhan Momyshuly', 'Б. Момышулы', 'Бауыржан Момышұлы'],
      ]),
      residentialComplexes: entries([
        ['Esentai City', 'Есентай Сити'], ['Mega Towers', 'Мега Тауэрс'], ['Gagarin Park', 'Гагарин Парк'], ['4YOU', '4 Ю', 'Фор Ю'],
        ['Central Avenue', 'Централ Авеню'], ['Metropole', 'Метрополь'], ['Remizovka', 'Ремизовка ЖК'], ['Al-Farabi 27', 'Аль-Фараби 27'],
        ['Exclusive Time', 'Эксклюзив Тайм'], ['Auezov City', 'Ауэзов Сити'],
      ]),
      streets: entries([
        ['Abai Avenue', 'проспект Абая', 'Абай даңғылы'], ['Al-Farabi Avenue', 'проспект Аль-Фараби', 'Әл-Фараби даңғылы'],
        ['Dostyk Avenue', 'проспект Достык', 'Достық даңғылы'], ['Nazarbayev Avenue', 'проспект Назарбаева', 'Назарбаев даңғылы', 'улица Фурманова'],
        ['Satpayev Street', 'улица Сатпаева', 'Сәтбаев көшесі'], ['Tole Bi Street', 'улица Толе би', 'Төле би көшесі'],
        ['Zheltoksan Street', 'улица Желтоксан', 'Желтоқсан көшесі'], ['Seifullin Avenue', 'проспект Сейфуллина', 'Сейфуллин даңғылы'],
        ['Rozybakiev Street', 'улица Розыбакиева', 'Розыбакиев көшесі'], ['Gagarin Avenue', 'проспект Гагарина', 'Гагарин даңғылы'],
      ]),
      landmarks: entries([
        ['Kok-Tobe', 'Кок-Тобе', 'Көктөбе'], ['Medeu', 'Медеу'], ['Republic Square', 'Площадь Республики', 'Республика алаңы'],
        ['Green Bazaar', 'Зеленый базар', 'Көк базар'], ['Panfilov Park', 'парк Панфилова', '28 гвардияшы-панфиловшылар паркі'],
        ['Atakent', 'Атакент'], ['MEGA Alma-Ata', 'Мега Алматы', 'MEGA Almaty'], ['Esentai Mall', 'Есентай Молл'],
      ]),
    }),
    Astana: Object.freeze({
      districts: entries([
        ['Almaty', 'Алматы район', 'Алматы ауданы'], ['Saryarka', 'Сарыарка район', 'Сарыарқа ауданы'], ['Esil', 'Есиль район', 'Есіл ауданы'],
        ['Baikonur', 'Байконур район', 'Байқоңыр ауданы'], ['Nura', 'Нура район', 'Нұра ауданы'], ['Saraishyk', 'Сарайшык район', 'Сарайшық ауданы'],
      ]),
      microdistricts: entries([
        ['Samal', 'Самал'], ['Chubary', 'Чубары'], ['Koktal', 'Коктал', 'Көктал'], ['Urker', 'Уркер', 'Үркер'], ['Ilyinka', 'Ильинка'],
        ['Komsomolsky', 'Комсомольский'], ['South-East', 'Юго-Восток', 'ЮВ'], ['Tselinny', 'Целинный'],
      ]),
      residentialComplexes: entries([
        ['Highvill', 'Хайвилл', 'Highvill Astana'], ['Grand Alatau', 'Гранд Алатау'], ['Northern Lights', 'Северное Сияние'],
        ['Diplomatic Town', 'Дипломатический городок'], ['Expo Boulevard', 'Экспо Бульвар'], ['Promenade Expo', 'Променад Экспо'],
        ['Green Quarter', 'Зеленый квартал', 'Жасыл квартал'], ['BI City Seoul', 'БИ Сити Сеул'], ['Nova City', 'Нова Сити'], ['Millennium Park', 'Миллениум Парк'],
      ]),
      streets: entries([
        ['Mangilik El Avenue', 'проспект Мангилик Ел', 'Мәңгілік Ел даңғылы'], ['Kabanbay Batyr Avenue', 'проспект Кабанбай батыра', 'Қабанбай батыр даңғылы'],
        ['Turan Avenue', 'проспект Туран', 'Тұран даңғылы'], ['Respublika Avenue', 'проспект Республики', 'Республика даңғылы'],
        ['Saryarka Avenue', 'проспект Сарыарка', 'Сарыарқа даңғылы'], ['Bogenbay Batyr Avenue', 'проспект Богенбай батыра', 'Бөгенбай батыр даңғылы'],
        ['Dostyq Street', 'улица Достык', 'Достық көшесі'], ['Qonayev Street', 'улица Кунаева', 'Қонаев көшесі'],
      ]),
      landmarks: entries([
        ['Baiterek', 'Байтерек', 'Бәйтерек'], ['Khan Shatyr', 'Хан Шатыр'], ['EXPO', 'Экспо', 'Нұр Әлем'],
        ['Abu Dhabi Plaza', 'Абу Даби Плаза'], ['Hazret Sultan Mosque', 'мечеть Хазрет Султан', 'Әзірет Сұлтан мешіті'],
      ]),
    }),
  }),
  RO: Object.freeze({
    Bucharest: Object.freeze({
      districts: entries([
        ...[1,2,3,4,5,6].map((n) => [`Sector ${n}`, `Sectorul ${n}`, `sector ${n}`, `сектор ${n}`]),
      ]),
      microdistricts: entries([
        ['Baneasa', 'Băneasa'], ['Aviatiei', 'Aviației'], ['Dorobanti', 'Dorobanți'], ['Floreasca'], ['Pipera'], ['Herastrau', 'Herăstrău'],
        ['Colentina'], ['Pantelimon'], ['Iancului'], ['Tei'], ['Vitan'], ['Dristor'], ['Titan'], ['Balta Alba', 'Balta Albă'], ['Berceni'],
        ['Tineretului'], ['Giurgiului'], ['Cotroceni'], ['Rahova'], ['Ferentari'], ['Drumul Taberei'], ['Militari'], ['Crangasi', 'Crângași'],
        ['Giulesti', 'Giulești'], ['Grozavesti', 'Grozăvești'], ['Regie'],
      ]),
      metro: entries([
        ['Pipera'], ['Aurel Vlaicu'], ['Aviatorilor'], ['Piata Victoriei', 'Piața Victoriei'], ['Gara de Nord'], ['Piata Romana', 'Piața Romană'],
        ['Universitate'], ['Piata Unirii', 'Piața Unirii'], ['Tineretului'], ['Eroii Revolutiei', 'Eroii Revoluției'], ['Dristor'], ['Titan'],
        ['Nicolae Grigorescu'], ['Anghel Saligny'], ['Politehnica'], ['Grozavesti', 'Grozăvești'], ['Eroilor'], ['Izvor'], ['Piata Iancului', 'Piața Iancului'],
        ['Obor'], ['Stefan cel Mare', 'Ștefan cel Mare'], ['Crangasi', 'Crângași'], ['Basarab'], ['Lujerului'], ['Gorjului'], ['Pacii', 'Păcii'],
        ['Preciziei'], ['Valea Ialomitei', 'Valea Ialomiței'], ['Romancierilor'], ['Parc Drumul Taberei'], ['Favorit'], ['Orizont'], ['Academia Militara', 'Academia Militară'],
      ]),
      residentialComplexes: entries([
        ['One Herastrau Park', 'One Herăstrău Park'], ['One Floreasca City'], ['One Verdi Park'], ['Up-site Bucharest', 'Up Site Bucharest'],
        ['Aviatiei Park', 'Aviației Park'], ['Cortina North'], ['Cortina Academy'], ['Cloud9 Residence'], ['Luxuria Residence'],
        ['Exigent Plaza Residence'], ['Plaza Residence'], ['21 Residence'], ['Novum Residence'], ['Belvedere Residences'], ['Global Residence Monolitului'],
      ]),
      streets: entries([
        ['Calea Victoriei'], ['Bulevardul Unirii', 'Bd. Unirii', 'Bulevardul Unirii București'], ['Bulevardul Iuliu Maniu', 'Bd. Iuliu Maniu'],
        ['Bulevardul Timișoara', 'Bulevardul Timisoara', 'Bd. Timișoara'], ['Splaiul Independenței', 'Splaiul Independentei'],
        ['Calea Moșilor', 'Calea Mosilor'], ['Calea Dorobanților', 'Calea Dorobantilor'], ['Șoseaua Colentina', 'Soseaua Colentina'],
        ['Șoseaua Ștefan cel Mare', 'Soseaua Stefan cel Mare'], ['Bulevardul General Gheorghe Magheru', 'Bd. Magheru'],
      ]),
      landmarks: entries([
        ['Palace of Parliament', 'Palatul Parlamentului', 'Casa Poporului', 'Дворец Парламента'], ['Old Town', 'Centrul Vechi', 'Lipscani', 'Старый город'],
        ['King Michael I Park', 'Parcul Regele Mihai I', 'Parcul Herăstrău', 'Herastrau Park'], ['AFI Cotroceni', 'AFI Palace Cotroceni'],
        ['Gara de Nord', 'București Nord', 'Северный вокзал Бухареста'], ['Piața Romană', 'Piata Romana'], ['Piața Victoriei', 'Piata Victoriei'],
      ]),
    }),
    Brasov: Object.freeze({
      microdistricts: entries([
        ['Tractorul'], ['Coresi'], ['Astra'], ['Racadau', 'Răcădău'], ['Bartolomeu'], ['Noua'], ['Darste', 'Dârste'], ['Schei', 'Șchei'],
        ['Centrul Civic'], ['Centrul Vechi'], ['Florilor'], ['Scriitorilor'], ['Craiter'], ['Stupini'],
      ]),
      residentialComplexes: entries([
        ['Coresi Avantgarden', 'Avantgarden Coresi'], ['Avantgarden3', 'Avantgarden 3'], ['Urban Plaza'], ['Qualis', 'Qualis Residence'],
        ['Isaran Residence'], ['Maurer Residence Brasov', 'Maurer Residence Brașov'], ['Grandis Residence', 'Grandis'], ['Cosmopolit Residence'],
        ['Alphaville Arena'], ['Mountain View Residence'],
      ]),
      streets: entries([['Calea București', 'Calea Bucuresti'], ['Strada Republicii'], ['Bulevardul Griviței', 'Bulevardul Grivitei'], ['Strada Lungă', 'Strada Lunga']]),
      landmarks: entries([['Piața Sfatului', 'Piata Sfatului'], ['Coresi Shopping Resort', 'Coresi Mall'], ['Brașov Railway Station', 'Gara Brașov', 'Gara Brasov']]),
    }),
  }),
  UA: Object.freeze({
    Kyiv: Object.freeze({
      districts: entries([
        ['Podilskyi', 'Подільський район', 'Подольский район'], ['Pecherskyi', 'Печерський район', 'Печерский район'],
        ['Obolonskyi', 'Оболонський район', 'Оболонский район'], ['Shevchenkivskyi', 'Шевченківський район', 'Шевченковский район'],
        ['Solomianskyi', 'Солом’янський район', 'Соломенский район'], ['Darnytskyi', 'Дарницький район', 'Дарницкий район'],
        ['Holosiivskyi', 'Голосіївський район', 'Голосеевский район'], ['Dniprovskyi', 'Дніпровський район', 'Днепровский район'],
        ['Sviatoshynskyi', 'Святошинський район', 'Святошинский район'], ['Desnianskyi', 'Деснянський район', 'Деснянский район'],
      ]),
      microdistricts: entries([
        ['Pozniaky', 'Позняки'], ['Osokorky', 'Осокорки'], ['Kharkivskyi', 'Харківський масив', 'Харьковский массив'],
        ['Troyeshchyna', 'Троєщина', 'Троещина'], ['Vynohradar', 'Виноградар'], ['Obolon', 'Оболонь'], ['Teremky', 'Теремки'],
        ['Holosiiv', 'Голосіїв', 'Голосеево'], ['Solomianka', 'Солом’янка', 'Соломенка'], ['Lukianivka', 'Лук’янівка', 'Лукьяновка'],
        ['Nyvky', 'Нивки'], ['Sviatoshyn', 'Святошин'], ['Borshchahivka', 'Борщагівка', 'Борщаговка'], ['Pechersk', 'Печерськ', 'Печерск'], ['Podil', 'Поділ', 'Подол'],
      ]),
      metro: entries([
        ['Khreshchatyk', 'Хрещатик', 'Крещатик'], ['Maidan Nezalezhnosti', 'Майдан Незалежності', 'Площадь Независимости'],
        ['Zoloti Vorota', 'Золоті ворота', 'Золотые ворота'], ['Universytet', 'Університет', 'Университет'], ['Vokzalna', 'Вокзальна', 'Вокзальная'],
        ['Osokorky', 'Осокорки'], ['Pozniaky', 'Позняки'], ['Livoberezhna', 'Лівобережна', 'Левобережная'], ['Lukianivska', 'Лук’янівська', 'Лукьяновская'],
        ['Palats Ukraina', 'Палац Україна', 'Дворец Украина'], ['Olimpiiska', 'Олімпійська', 'Олимпийская'], ['Pecherska', 'Печерська', 'Печерская'],
      ]),
      residentialComplexes: entries([
        ['Respublika', 'Республіка ЖК', 'Республика ЖК'], ['Fayna Town', 'Файна Таун'], ['UNIT.Home', 'Юнит Хоум'], ['Rybalsky', 'Рибальський', 'Рыбальский'],
        ['Tetris Hall', 'Тетрис Холл'], ['French Quarter 2', 'Французький квартал 2', 'Французский квартал 2'],
        ['Novopecherski Lypky', 'Новопечерські Липки', 'Новопечерские Липки'], ['Great', 'ЖК Great'], ['Seven', 'ЖК Seven'],
        ['Comfort Town', 'Комфорт Таун'], ['Warszawski Plus', 'Варшавський Плюс', 'Варшавский Плюс'], ['Creator City', 'Креатор Сіті'],
      ]),
      streets: entries([
        ['Khreshchatyk Street', 'вулиця Хрещатик', 'улица Крещатик'], ['Velyka Vasylkivska Street', 'Велика Васильківська', 'Большая Васильковская', 'Червоноармійська'],
        ['Beresteiskyi Avenue', 'Берестейський проспект', 'проспект Берестейский', 'проспект Перемоги', 'проспект Победы'],
        ['Lesi Ukrainky Boulevard', 'бульвар Лесі Українки', 'бульвар Леси Украинки'], ['Saksahanskoho Street', 'вулиця Саксаганського', 'улица Саксаганского'],
        ['Antonovycha Street', 'вулиця Антоновича', 'улица Антоновича', 'Горького'], ['Dniprovska Naberezhna', 'Дніпровська набережна', 'Днепровская набережная'],
        ['Mykoly Bazhana Avenue', 'проспект Миколи Бажана', 'проспект Николая Бажана'], ['Hlybochytska Street', 'вулиця Глибочицька', 'улица Глубочицкая'],
      ]),
      landmarks: entries([
        ['Maidan Nezalezhnosti', 'Майдан Незалежності', 'Площадь Независимости'], ['Kyiv-Pechersk Lavra', 'Києво-Печерська лавра', 'Киево-Печерская лавра'],
        ['Golden Gate', 'Золоті ворота', 'Золотые ворота'], ['Olimpiyskiy Stadium', 'НСК Олімпійський', 'НСК Олимпийский'],
        ['Andriyivskyy Descent', 'Андріївський узвіз', 'Андреевский спуск'], ['Kyiv Central Railway Station', 'Центральний вокзал Київ', 'Киевский вокзал'],
      ]),
    }),
    Kharkiv: Object.freeze({
      districts: entries([
        ['Shevchenkivskyi', 'Шевченківський район', 'Шевченковский район'], ['Kyivskyi', 'Київський район', 'Киевский район'],
        ['Saltivskyi', 'Салтівський район', 'Салтовский район'], ['Nemyshlianskyi', 'Немишлянський район', 'Немышлянский район'],
        ['Industrialnyi', 'Індустріальний район', 'Индустриальный район'], ['Slobidskyi', 'Слобідський район', 'Слободской район'],
        ['Osnovianskyi', 'Основ’янський район', 'Основянский район'], ['Novobavarskyi', 'Новобаварський район', 'Новобаварский район'],
        ['Kholodnohirskyi', 'Холодногірський район', 'Холодногорский район'],
      ]),
      microdistricts: entries([
        ['Saltivka', 'Салтівка', 'Салтовка'], ['Oleksiivka', 'Олексіївка', 'Алексеевка'], ['Pavlove Pole', 'Павлове Поле', 'Павлово Поле'],
        ['Kholodna Hora', 'Холодна Гора', 'Холодная Гора'], ['HTZ', 'ХТЗ'], ['Nova Bavariia', 'Нова Баварія', 'Новая Бавария'],
        ['Zhykhar', 'Жихор'], ['Odeska', 'Одеська', 'Одесская'], ['Rohan', 'Рогань'], ['Horizont', 'Горизонт'],
      ]),
      metro: entries([
        ['Kholodna Hora', 'Холодна гора', 'Холодная гора'], ['Vokzalna', 'Вокзальна', 'Південний вокзал', 'Южный вокзал'],
        ['Tsentralnyi Rynok', 'Центральний ринок', 'Центральный рынок'], ['Maidan Konstytutsii', 'Майдан Конституції', 'Площадь Конституции'],
        ['Sportyvna', 'Спортивна'], ['Zavod imeni Malysheva', 'Завод імені Малишева', 'Завод имени Малышева'], ['Turboatom', 'Турбоатом'],
        ['Palats Sportu', 'Палац Спорту', 'Дворец Спорта'], ['Studentska', 'Студентська', 'Студенческая'], ['Heroiv Pratsi', 'Героїв Праці', 'Героев Труда'],
        ['Peremoha', 'Перемога', 'Победа'], ['Oleksiivska', 'Олексіївська', 'Алексеевская'], ['Naukova', 'Наукова', 'Научная'],
        ['Derzhprom', 'Держпром'], ['Arkhitektora Beketova', 'Архітектора Бекетова', 'Архитектора Бекетова'],
      ]),
      residentialComplexes: entries([
        ['Manhattan', 'ЖК Манхеттен'], ['River Town', 'Ривер Таун'], ['Hydropark', 'ЖК Гідропарк', 'ЖК Гидропарк'],
        ['Sokolnyky', 'ЖК Сокільники', 'ЖК Сокольники'], ['Pavlovsky Kvartal', 'Павлівський квартал', 'Павловский квартал'],
        ['Levada', 'ЖК Левада'], ['Mira', 'ЖК Миру', 'ЖК Мира'], ['Nimeckyi Proekt', 'Німецький проект', 'Немецкий проект'],
      ]),
      streets: entries([
        ['Sumska Street', 'вулиця Сумська', 'улица Сумская'], ['Nauky Avenue', 'проспект Науки'],
        ['Heroiv Kharkova Avenue', 'проспект Героїв Харкова', 'проспект Героев Харькова', 'Московський проспект', 'Московский проспект'],
        ['Saltivske Highway', 'Салтівське шосе', 'Салтовское шоссе'], ['Poltavskyi Shliakh Street', 'Полтавський Шлях', 'Полтавский Шлях'],
        ['Klochkivska Street', 'вулиця Клочківська', 'улица Клочковская'],
      ]),
      landmarks: entries([
        ['Freedom Square', 'майдан Свободи', 'площадь Свободы'], ['Derzhprom', 'Держпром', 'Госпром'], ['Barabashovo Market', 'Барабашово', 'ринок Барабашово'],
        ['Kharkiv-Pasazhyrskyi Station', 'Харків-Пасажирський', 'Харьков-Пассажирский', 'Південний вокзал', 'Южный вокзал'],
      ]),
    }),
    Odesa: Object.freeze({
      microdistricts: entries([
        ['Arkadia', 'Аркадія', 'Аркадия'], ['Moldavanka', 'Молдаванка'], ['Tairova', 'Таїрова', 'Таирова'], ['Cheryomushky', 'Черемушки'],
        ['Fontan', 'Фонтан'], ['Luzanivka', 'Лузанівка', 'Лузановка'], ['Peresyp', 'Пересип', 'Пересыпь'], ['Slobidka', 'Слобідка', 'Слободка'],
        ['Kotivskoho', 'селище Котовського', 'поселок Котовского'],
      ]),
      residentialComplexes: entries([
        ['Kadorr City', 'Кадорр Сіті', 'Кадорр Сити'], ['44 Pearl', '44 Жемчужина', '44 Перлина'], ['51 Pearl', '51 Жемчужина', '51 Перлина'],
        ['Elegia Park', 'Елегія Парк', 'Элегия Парк'], ['Sea View', 'Сі Вью', 'Си Вью'], ['Unity Towers', 'Юніті Тауерс', 'Юнити Тауэрс'],
        ['Gagarin Plaza', 'Гагарін Плаза', 'Гагарин Плаза'], ['Otrada Sky', 'Отрада Скай'],
      ]),
      streets: entries([
        ['Derybasivska Street', 'вулиця Дерибасівська', 'улица Дерибасовская'], ['Hretska Street', 'вулиця Грецька', 'улица Греческая'],
        ['Kanatna Street', 'вулиця Канатна', 'улица Канатная'], ['Frantsuzky Boulevard', 'Французький бульвар', 'Французский бульвар'],
        ['Velyka Arnautska Street', 'Велика Арнаутська', 'Большая Арнаутская'], ['Panteleimonivska Street', 'Пантелеймонівська', 'Пантелеймоновская'],
        ['Fontanska Road', 'Фонтанська дорога', 'Фонтанская дорога'], ['Liustdorfska Road', 'Люстдорфська дорога', 'Люстдорфская дорога'],
      ]),
      landmarks: entries([
        ['Arcadia', 'Аркадія', 'Аркадия'], ['Prymorskyi Boulevard', 'Приморський бульвар', 'Приморский бульвар'],
        ['Pryvoz Market', 'ринок Привоз', 'рынок Привоз'], ['Odesa Railway Station', 'Одеський вокзал', 'Одесский вокзал'],
      ]),
    }),
    Dnipro: Object.freeze({
      microdistricts: entries([
        ['Peremoha', 'Перемога', 'Победа'], ['Topolia', 'Тополя'], ['Sokil', 'Сокіл', 'Сокол'], ['Parus', 'Парус'],
        ['Pokrovskyi', 'Покровський', 'Комунар', 'Коммунар'], ['Livoberezhnyi', 'Лівобережний', 'Левобережный'],
        ['Soniachnyi', 'Сонячний', 'Солнечный'], ['Kalinovskyi', 'Калиновський', 'Калиновский'], ['Pivnichnyi', 'Північний', 'Северный'],
      ]),
      residentialComplexes: entries([
        ['Bartolomeo Resort Town', 'Бартоломео'], ['River Park', 'Рівер Парк', 'Ривер Парк'], ['Felicita', 'Феліціта', 'Феличита'],
        ['Geneva', 'Женева ЖК'], ['Mayak', 'ЖК Маяк'], ['Manhattan', 'Манхеттен Дніпро', 'Манхеттен Днепр'], ['Salyut', 'ЖК Салют'],
      ]),
      streets: entries([
        ['Dmytra Yavornytskoho Avenue', 'проспект Дмитра Яворницького', 'проспект Дмитрия Яворницкого', 'проспект Карла Маркса'],
        ['Naberezhna Peremohy', 'Набережна Перемоги', 'Набережная Победы'], ['Oleksandra Polia Avenue', 'проспект Олександра Поля', 'проспект Александра Поля'],
        ['Slobozhanskyi Avenue', 'Слобожанський проспект', 'Слобожанский проспект', 'Правди проспект'],
      ]),
      landmarks: entries([['Most City', 'Мост-Сіті', 'Мост-Сити'], ['Dnipro Railway Station', 'Дніпро-Головний', 'Днепр-Главный'], ['Menorah Center', 'Менора']]),
    }),
    Lviv: Object.freeze({
      microdistricts: entries([
        ['Sykhiv', 'Сихів', 'Сихов'], ['Levandivka', 'Левандівка', 'Левандовка'], ['Riasne', 'Рясне'], ['Pidzamche', 'Підзамче', 'Подзамче'],
        ['Holosko', 'Голоско'], ['Pasichna', 'Пасічна', 'Пасечная'], ['Pohulianka', 'Погулянка'], ['Znesinnia', 'Знесіння', 'Знесенье'], ['Klepariv', 'Клепарів', 'Клепаров'],
      ]),
      residentialComplexes: entries([
        ['Great Britain', 'ЖК Велика Британія', 'Велика Британія'], ['Avalon Yard', 'Авалон Ярд'], ['Avalon Flex', 'Авалон Флекс'],
        ['Semitsvit', 'Семицвіт', 'Семицвет'], ['Parus City', 'Парус Сіті', 'Парус Сити'], ['Viking Park', 'Вікінг Парк', 'Викинг Парк'],
        ['Misto Trav', 'Місто Трав', 'Город Трав'], ['Washington City', 'Вашингтон Сіті'],
      ]),
      streets: entries([
        ['Svobody Avenue', 'проспект Свободи', 'проспект Свободы'], ['Horodotska Street', 'вулиця Городоцька', 'улица Городоцкая'],
        ['Shevchenka Street', 'вулиця Шевченка', 'улица Шевченко'], ['Stryiska Street', 'вулиця Стрийська', 'улица Стрыйская'],
        ['Lychakivska Street', 'вулиця Личаківська', 'улица Лычаковская'], ['Zelena Street', 'вулиця Зелена', 'улица Зеленая'],
        ['Kulparkivska Street', 'вулиця Кульпарківська', 'улица Кульпарковская'],
      ]),
      landmarks: entries([
        ['Rynok Square', 'площа Ринок', 'площадь Рынок'], ['Lviv Opera', 'Львівська опера', 'Львовская опера'], ['Lviv Railway Station', 'Головний залізничний вокзал Львів', 'Львовский вокзал'],
      ]),
    }),
  }),
});

// Ukraine-wide extension retained as a separate export for compatibility while
// sharing the same entry constructor and regex behavior.
export const UA_EXTRA_LOCATION_DICTIONARIES = Object.freeze({
  Zaporizhzhia: Object.freeze({
    districts: entries([
      ['Oleksandrivskyi','Олександрівський район','Александровский район'],['Zavodskyi','Заводський район','Заводской район'],
      ['Komunarskyi','Комунарський район','Коммунарский район'],['Dniprovskyi','Дніпровський район','Днепровский район'],
      ['Voznesenivskyi','Вознесенівський район','Вознесеновский район'],['Khortytskyi','Хортицький район','Хортицкий район'],['Shevchenkivskyi','Шевченківський район','Шевченковский район'],
    ]),
    microdistricts: entries([
      ['Khortytsia','Хортиця','Хортица'],['Baburka','Бабурка'],['Borodynskyi','Бородинський','Бородинский'],['Osypenkivskyi','Осипенківський','Осипенковский'],
      ['Pivdennyi','Південний','Южный'],['Kosmichnyi','Космічний','Космический'],['Shevchenkivskyi','Шевченківський','Шевченковский'],
    ]),
    residentialComplexes: entries([['River Hall','Рівер Холл','Ривер Холл'],['Aleksandrovsky 1','Олександрівський 1','Александровский 1'],['Comfort City','Комфорт Сіті','Комфорт Сити'],['Borodino','ЖК Бородіно','ЖК Бородино']]),
  }),
  Vinnytsia: Object.freeze({
    microdistricts: entries([['Vyshenka','Вишенька'],['Podillia','Поділля','Подолье'],['Slovianska','Слов’янка','Славянка'],['Zamostia','Замостя'],['Tyazhyliv','Тяжилів','Тяжилов'],['Stare Misto','Старе місто','Старый город'],['Akademichnyi','Академічний','Академический'],['Piatnychany','П’ятничани','Пятничаны']]),
    residentialComplexes: entries([['Turkish City','Турецьке містечко','Турецкий городок'],['Premier Tower','Прем’єр Тауер','Премьер Тауэр'],['Family House','Фемілі Хаус','Family House Vinnytsia'],['Podillia City','Поділля Сіті','Подолье Сити'],['Andorra','ЖК Андорра']]),
  }),
  'Ivano-Frankivsk': Object.freeze({
    microdistricts: entries([['Pasichna','Пасічна','Пасечная'],['BAM','БАМ'],['Kaskad','Каскад'],['Pozitron','Позитрон'],['Knyahynyn','Княгинин'],['Vovchynets','Вовчинець','Вовчинец'],['Hirka','Гірка','Горка'],['Tsentr','Центр']]),
    residentialComplexes: entries([['Manhattan UP','Манхеттен UP'],['Main House','Мейн Хаус'],['Parus','ЖК Парус'],['Family Plaza','Фемілі Плаза'],['Central Park','Централ Парк'],['Millennium','Міленіум','Миллениум'],['Knyahynyn','ЖК Княгинин']]),
  }),
  Chernivtsi: Object.freeze({
    microdistricts: entries([['Prospekt','Проспект'],['Komarova','Комарова'],['Hraviton','Гравітон','Гравитон'],['Sadgora','Садгора'],['Roscha','Роша'],['Kalynivskyi Rynok','Калинівський ринок','Калиновский рынок'],['Tsentr','Центр']]),
    residentialComplexes: entries([['Vodohrai','Водограй'],['Comfort Hall','Комфорт Холл'],['Family House','Фемілі Хаус Чернівці','Family House Chernivtsi'],['City Park','Сіті Парк','Сити Парк'],['Compass','Компас']]),
  }),
  Uzhhorod: Object.freeze({
    microdistricts: entries([['Bozdosh','Боздош'],['Novyi Raion','Новий район','Новый район'],['Shakhta','Шахта'],['Radanka','Радванка'],['Domanyntsi','Доманиці','Доманицы'],['Tsentr','Центр']]),
    residentialComplexes: entries([['Park Land','Парк Ленд'],['Crystal','Крістал','Кристал'],['Sherwood','Шервуд'],['Green Land','Грін Ленд','Грин Ленд'],['Resident','Резидент'],['Bavaria','Баварія','Бавария']]),
  }),
  Mukachevo: Object.freeze({ microdistricts: entries([['Rosvyhovo','Росвигово'],['Pidhoriany','Підгоряни','Подгоряны'],['Palanka','Паланок'],['Tsentr','Центр']]), residentialComplexes: entries([['Central Park Mukachevo','Централ Парк Мукачево'],['Dream City','Дрім Сіті','Дрим Сити'],['Green Yard','Грін Ярд','Грин Ярд']]) }),
  Lutsk: Object.freeze({ microdistricts: entries([['33rd District','33 мікрорайон','33 микрорайон'],['40th District','40 мікрорайон','40 микрорайон'],['55th District','55 мікрорайон','55 микрорайон'],['Teremnivskyi','Теремнівський','Теремновский'],['Hnidava','Гнідава','Гнидава'],['Kichkarivka','Кічкарівка','Кичкаревка'],['Vyshkiv','Вишків','Вышков']]), residentialComplexes: entries([['Caramel Residence','Карамель Резиденс'],['Dream Town','Дрім Таун','Дрим Таун'],['Style Up','Стайл Ап'],['Oselya Park','Оселя Парк'],['Supernova','Супернова']]) }),
  Rivne: Object.freeze({ microdistricts: entries([['Pivnichnyi','Північний','Северный'],['Yuvileinyi','Ювілейний','Юбилейный'],['Boyarka','Боярка'],['Basiv Kut','Басів Кут','Басов Кут'],['Shchaslyve','Щасливе','Счастливое'],['Tsentr','Центр']]), residentialComplexes: entries([['Shchaslyve','ЖК Щасливе','ЖК Счастливое'],['Spectrum','Спектрум'],['Pokrovskyi','Покровський','Покровский'],['Riverside','Ріверсайд','Риверсайд'],['Family City','Фемілі Сіті','Фемили Сити']]) }),
  Ternopil: Object.freeze({ microdistricts: entries([['BAM','БАМ'],['Druzhba','Дружба'],['Skhidnyi','Східний','Восточный'],['Kanada','Канада'],['Alaska','Аляска'],['Novyi Svit','Новий Світ','Новый Свет'],['Kutkivtsi','Кутківці','Кутковцы'],['Tsentr','Центр']]), residentialComplexes: entries([['Manhattan','Манхеттен Тернопіль','Манхеттен Тернополь'],['Varshavskyi','Варшавський','Варшавский'],['Panorama','Панорама'],['Beverly Hills','Беверлі Хіллз','Беверли Хиллз'],['Krona Park','Крона Парк']]) }),
  Khmelnytskyi: Object.freeze({ microdistricts: entries([['Ozerna','Озерна'],['Vystavka','Виставка'],['Pivdennyi-Zakhid','Південно-Західний','Юго-Западный'],['Rakove','Ракове'],['Hrechany','Гречани'],['Dubove','Дубове'],['Lezneve','Лезневе'],['Tsentr','Центр']]), residentialComplexes: entries([['Urban House','Урбан Хаус'],['Dream Park','Дрім Парк','Дрим Парк'],['Avila','Авіла','Авила'],['Harmony Garden','Гармоні Гарден'],['Spring Town','Спрінг Таун','Спринг Таун']]) }),
  Zhytomyr: Object.freeze({ microdistricts: entries([['Korbutivka','Корбутівка','Корбутовка'],['Polova','Польова','Полевая'],['Kroshnia','Крошня'],['Bohuniia','Богунія','Богуния'],['Malovanka','Мальованка','Малеванка'],['Smolianka','Смолянка'],['Tsentr','Центр']]), residentialComplexes: entries([['Grand City Dombrovskyi','Гранд Сіті Домбровський','Гранд Сити Домбровский'],['Domashnii 2','Домашній 2','Домашний 2'],['River City','Рівер Сіті','Ривер Сити'],['Premiere Hall','Прем’єр Холл','Премьер Холл']]) }),
  Cherkasy: Object.freeze({ microdistricts: entries([['Mytnytsia','Митниця'],['Pivdenno-Zakhidnyi','Південно-Західний','Юго-Западный'],['Kazbet','Казбет'],['Khimpaselyshche','Хімселище','Химпоселок'],['D','Мікрорайон Д','Микрорайон Д'],['Tsentr','Центр']]), residentialComplexes: entries([['Andorra','Андорра Черкаси','Андорра Черкассы'],['Symfonia','Симфонія','Симфония'],['City Park Cherkasy','Сіті Парк Черкаси','Сити Парк Черкассы'],['Pershyi Parkovyi','Перший Парковий','Первый Парковый']]) }),
  Poltava: Object.freeze({ microdistricts: entries([['Almaznyi','Алмазний','Алмазный'],['Levada','Левада'],['Polovky','Половки'],['Brailky','Браїлки','Браилки'],['Ohnivka','Огнівка','Огневка'],['Podil','Поділ','Подол'],['Dublianshchyna','Дублянщина'],['Tsentr','Центр']]), residentialComplexes: entries([['City Park Poltava','Сіті Парк Полтава','Сити Парк Полтава'],['Petrivskyi Kvartal','Петрівський квартал','Петровский квартал'],['Standard','Стандарт ЖК'],['European','Європейський','Европейский'],['Family Park','Фемілі Парк','Фемили Парк']]) }),
  Chernihiv: Object.freeze({ microdistricts: entries([['Masany','Масани'],['Rokossovskoho','Рокоссовського','Рокоссовского'],['Sherstianka','Шерстянка'],['Bobrovytsia','Бобровиця'],['Podusivka','Подусівка','Подусовка'],['ZAZ','ЗАЗ'],['Tsentr','Центр']]), residentialComplexes: entries([['Forest','Форест Чернігів','Форест Чернигов'],['Art House','Арт Хаус'],['Kyevske','Київське','Киевское'],['Rich Town','Річ Таун','Рич Таун'],['Parus','Парус Чернігів','Парус Чернигов']]) }),
  Sumy: Object.freeze({ microdistricts: entries([['Kharkivska','Харківська','Харьковская'],['Prokofieve','Прокоф’єва','Прокофьева'],['Zarichnyi','Зарічний','Заречный'],['Kurskyi','Курський','Курский'],['Romenska','Роменська','Роменская'],['Khimhorodok','Хіммістечко','Химгородок'],['Tsentr','Центр']]), residentialComplexes: entries([['Premier','Прем’єр Суми','Премьер Сумы'],['Eurodom','Євродім','Евродом'],['Panorama','Панорама Суми','Панорама Сумы']]) }),
  Mykolaiv: Object.freeze({ districts: entries([['Tsentralnyi','Центральний район','Центральный район'],['Zavodskyi','Заводський район','Заводской район'],['Inhulskyi','Інгульський район','Ингульский район'],['Korabelnyi','Корабельний район','Корабельный район']]), microdistricts: entries([['Namiv','Намив','Намыв'],['Pivnichnyi','Північний','Северный'],['Soliani','Соляні','Соляные'],['Raketne Urochyshche','Ракетне Урочище','Ракетное Урочище'],['Tsentr','Центр']]) }),
  Kropyvnytskyi: Object.freeze({ microdistricts: entries([['Kovalivka','Ковалівка','Ковалевка'],['Balashivka','Балашівка','Балашовка'],['Nova Balashivka','Нова Балашівка','Новая Балашовка'],['Cheremushky','Черемушки'],['Hirnychyi','Гірничий','Горняцкий'],['Ozernyi','Озерний','Озерный'],['Tsentr','Центр']]) }),
});

export const UA_REGION_ENTRIES = lexiconEntries(UA_REGION_LEXICON);

export const UA_SECONDARY_CITIES = Object.freeze({
  Irpin: { aliases: ['Ірпінь','Ирпень','Irpin'], microdistricts: entries([['Central','Центр'],['Rich Town area','Річ Таун','Рич Таун'],['Synergia area','Синергія','Синергия']]) },
  Bucha: { aliases: ['Буча','Bucha'], microdistricts: entries([['Central','Центр'],['Lisova Bucha','Лісова Буча','Лесная Буча']]) },
  Brovary: { aliases: ['Бровари','Бровары','Brovary'], microdistricts: entries([['Massyv','Масив','Массив'],['Torhmash','Торгмаш']]) },
  Vyshhorod: { aliases: ['Вишгород','Вышгород','Vyshhorod'] },
  'Bila Tserkva': { aliases: ['Біла Церква','Белая Церковь','Bila Tserkva'] },
  Boryspil: { aliases: ['Бориспіль','Борисполь','Boryspil'] },
  Izmail: { aliases: ['Ізмаїл','Измаил','Izmail'] },
  Chornomorsk: { aliases: ['Чорноморськ','Черноморск','Chornomorsk','Іллічівськ','Ильичевск','Illichivsk'] },
  Mukachevo: { aliases: ['Мукачево','Мукачеве','Mukachevo','Mukacheve'] },
  Truskavets: { aliases: ['Трускавець','Трускавец','Truskavets'] },
  Drohobych: { aliases: ['Дрогобич','Дрогобыч','Drohobych'] },
  KryvyiRih: { aliases: ['Кривий Ріг','Кривой Рог','Kryvyi Rih','Krivoy Rog'] },
  Kremenchuk: { aliases: ['Кременчук','Кременчуг','Kremenchuk'] },
  Uman: { aliases: ['Умань','Uman'] },
});

for (const data of Object.values(UA_SECONDARY_CITIES)) {
  data.re = aliasesToRegex(data.aliases || []);
}

export function matchUkraineRegion(text) {
  return UA_REGION_ENTRIES.find((entry) => entry.re.test(String(text || ''))) || null;
}

export function matchUkraineSecondaryCity(text) {
  for (const [city, data] of Object.entries(UA_SECONDARY_CITIES)) {
    if (data.re.test(String(text || ''))) return { city, ...data };
  }
  return null;
}

export function dictionaryFor(countryCode, city) {
  if (countryCode === 'UA' && UA_EXTRA_LOCATION_DICTIONARIES[city]) {
    return { ...UA_EXTRA_LOCATION_DICTIONARIES[city], ...(LOCATION_DICTIONARIES.UA?.[city] || {}) };
  }
  return LOCATION_DICTIONARIES[countryCode]?.[city] || null;
}

export function locationCities(countryCode) {
  if (countryCode !== 'UA') return LOCATION_DICTIONARIES[countryCode] || {};
  const legacy = { ...UA_EXTRA_LOCATION_DICTIONARIES, ...(LOCATION_DICTIONARIES.UA || {}) };
  const names = [...new Set([
    ...Object.keys(legacy),
    ...Object.keys(UA_MAJOR_LOCATION_EXTENSIONS),
    ...Object.keys(UA_REGIONAL_LOCATION_EXTENSIONS),
    ...Object.keys(UA_METRO_LOCATION_EXTENSIONS),
  ])];
  return Object.freeze(Object.fromEntries(names.map((city) => [
    city,
    mergeLocationCityDictionaries(
      legacy[city],
      UA_MAJOR_LOCATION_EXTENSIONS[city],
      UA_REGIONAL_LOCATION_EXTENSIONS[city],
      UA_METRO_LOCATION_EXTENSIONS[city],
    ),
  ])));
}

export function matchDictionaryLocation(text, countryCode, city = null) {
  const country = locationCities(countryCode);
  const cities = city && country[city] ? [[city, country[city]]] : Object.entries(country);
  for (const [cityName, data] of cities) {
    for (const type of ['districts', 'microdistricts', 'metro', 'residentialComplexes', 'streets', 'landmarks']) {
      const match = (data[type] || []).find((entry) => entry.re.test(String(text || '')));
      if (match) return { city: cityName, type, name: match.name, aliases: match.aliases };
    }
  }
  return null;
}
