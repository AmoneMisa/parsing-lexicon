import { locationEntries } from './location-merge.js';

function city({ districts = [], microdistricts = [], residentialComplexes = [], landmarks = [] }) {
  return Object.freeze({
    ...(districts.length ? { districts: locationEntries(districts) } : {}),
    ...(microdistricts.length ? { microdistricts: locationEntries(microdistricts) } : {}),
    ...(residentialComplexes.length ? { residentialComplexes: locationEntries(residentialComplexes) } : {}),
    ...(landmarks.length ? { landmarks: locationEntries(landmarks) } : {}),
  });
}

export const UA_REGIONAL_LOCATION_EXTENSIONS = Object.freeze({
  Rivne: city({
    districts: [
      ['Pivnichnyi','Північний район','Северный район'],['Skhidnyi','Східний район','Восточный район'],['Zakhidnyi','Західний район','Западный район'],['Pivdennyi','Південний район','Южный район'],['Tsentralnyi','Центральний район','Центральный район'],
    ],
    microdistricts: [
      ['Tsentr','Центр'],['Pivnichnyi','Північний','Северный'],['Yuvileinyi','Ювілейний','Юбилейный'],['Lonokombinat','Льонокомбінат','Льнокомбинат'],['Avtovokzal','Автовокзал'],['Hrabnyk','Грабник'],['Boyarka','Боярка'],['Tynne','Тинне'],['Basiv Kut','Басів Кут','Басов Кут'],['Shchaslyve','Щасливе','Счастливое'],['Mototrek','Мототрек'],['Chervoni Hory','Червоні Гори','Красные Горы'],['Novyi Dvir','Новий Двір','Новый Двор'],['Zoopark','Зоопарк'],['Pyvzavod','Пивзавод'],['Radiozavod','Радіозавод','Радиозавод'],
    ],
    residentialComplexes: [
      ['Shchaslyve','ЖК Щасливе','ЖК Счастливое','ЖК На Щасливому'],['Spectrum','ЖК Spectrum','ЖК Спектрум'],['Bridge Tower','ЖК Bridge Tower'],['Teatralnyi','ЖК Театральний','ЖК Театральный'],['Prestige','ЖК Prestige','ЖК Престиж'],['Shokolad','ЖК Шоколад'],['Amber Park','ЖК Amber Park','ЖК Амбер Парк'],['Panorama de Luxe','ЖК Panorama de Luxe'],['Panorama','ЖК Panorama'],['Family City','ЖК Family City','ЖК Фемілі Сіті'],['Pokrovskyi','ЖК Pokrovsky','ЖК Покровський'],['Riverside','ЖК Ріверсайд','ЖК Riverside'],
    ],
    landmarks: [
      ['Shevchenko Park','парк Шевченка','парк Шевченко'],['Molodi Park','Парк молоді','Молодёжный парк','Лебединка','парк Молоді Лебединка'],['Hydropark','Гідропарк','Гидропарк'],['Prosvity Park','парк Просвіти','парк Просвещения'],['Rivne Zoo','Рівненський зоопарк','Ровенский зоопарк'],['Maidan Nezalezhnosti','Майдан Незалежності','Майдан Независимости'],['Teatralna Square','Театральна площа','Театральная площадь'],['Pokrovskyi Cathedral','Покровський собор','Покровский собор'],['Organ Hall','Органний зал','Органный зал'],['Rivne Drama Theatre','Рівненський драмтеатр','драмтеатр'],['Rivne Railway Station','залізничний вокзал','железнодорожный вокзал'],
    ],
  }),

  Kherson: city({
    districts: [
      ['Tsentralnyi','Центральний район','Центральный район','Суворовський район','Суворовский район'],['Dniprovskyi','Дніпровський район','Днепровский район'],['Korabelnyi','Корабельний район','Корабельный район'],
    ],
    microdistricts: [
      ['Tsentr','Центр'],['Tavriiskyi','Таврійський','Таврический'],...['1','2','3','4'].map((n)=>[`Tavriiskyi-${n}`,`Таврійський-${n}`,`Таврический-${n}`]),['Pivnichnyi','Північний','Северный'],['Shumenskyi','Шуменський','Шуменский'],['KhBK','ХБК'],['Zhytloselyshche','Житлоселище','Жилпосёлок','Жилпоселок'],['Ostriv','Острів','Остров'],['Korabel','Корабел','Корабельный'],['Voienka','Воєнка','Военка'],['Mlyny','Млини','Мельницы'],['Sukharne','Сухарне','Сухарное'],['Stepanivka','Степанівка','Степановка'],['Antonivka','Антонівка','Антоновка'],['Zelenivka','Зеленівка','Зеленовка'],['Komyshany','Комишани','Камышаны'],['Naftohavan','Нафтогавань','Нефтегавань'],['Sklotara','Склотара','Стеклотара'],
    ],
    residentialComplexes: [
      ['Admiral','ЖК Адмірал','ЖК Адмирал'],['Parus','ЖК Парус'],['Dniprovskyi','ЖК Дніпровський','ЖК Днепровский'],['Tavriiskyi','ЖК Таврійський','ЖК Таврический'],['Suvorovskyi','ЖК Суворовський','ЖК Суворовский'],['Raiduzhnyi','ЖК Райдужний','ЖК Радужный'],['European','ЖК Європейський','ЖК Европейский'],
    ],
    landmarks: [
      ['Kherson Fortress Park','парк Херсонська фортеця','парк Херсонская крепость'],['Slavy Park','парк Слави','парк Славы'],['Shevchenko Park','Шевченківський парк','парк Шевченко'],['Potemkin Square','Потьомкінський сквер','Потёмкинский сквер'],['Dnipro Embankment','набережна','набережная','Набережна Дніпра'],['Kherson Sea Port','Херсонський морський порт','морпорт'],['Kherson River Port','Херсонський річковий порт','речпорт'],['St Catherine Cathedral','Катерининський собор','Екатерининский собор'],['Kherson Railway Station','залізничний вокзал','железнодорожный вокзал'],
    ],
  }),

  Vinnytsia: city({
    microdistricts: [
      ['Tsentr','Центр'],['Stare Misto','Старе місто','Старый город'],['Zamostia','Замостя','Замостье'],['Vyshenka','Вишенька'],['Podillia','Поділля','Подолье'],['Slovianska',"Слов'янка",'Славянка'],['Urozhai','Урожай'],['Piatnychany',"П'ятничани",'Пятничаны'],['Koreia','Корея'],['Tyazhyliv','Тяжилів','Тяжилов'],['Khutir Shevchenka','Хутір Шевченка','Хутор Шевченко'],['Akademichnyi','Академічний','Академический'],['Barske Shose','Барське шосе','Барское шоссе'],['Sabariv','Сабарів','Сабаров'],['Pyrohovo','Пирогово','Пирогове'],['Vinnytski Khutory','Вінницькі Хутори','Винницкие Хутора'],
    ],
    residentialComplexes: [
      ['Avalon','ЖК Авалон'],['Premier Tower','ЖК Premier Tower',"ЖК Прем'єр Тауер"],['Naberezhnyi Kvartal','ЖК Набережний квартал','ЖК Набережный квартал'],['Turkish City','ЖК Turkish City','ЖК Туркіш Сіті'],['Forest Home','ЖК Forest Home','ЖК Forest'],['Simeinyi','ЖК Сімейний','ЖК Семейный'],['Akademichnyi','ЖК Академічний','ЖК Академический'],['Podillia','ЖК Поділля','ЖК Подолье'],['Park Tower','ЖК Park Tower'],['River City','ЖК River City'],['Dream Lake','ЖК Dream Lake'],['European Quarter','ЖК Європейський квартал','ЖК Европейский квартал'],['Barcelona','ЖК Barcelona'],
    ],
    landmarks: [
      ['Central Park','Центральний парк','Центральный парк','парк Леонтовича','парк Горького'],['Vyshenske Lake','Вишенське озеро','Вишенское озеро'],['Friendship Park','парк Дружби народів','Парк Дружбы народов'],['Roshen Embankment','набережна Roshen','набережная Roshen'],['Roshen Fountain','фонтан Roshen'],['Vinnytsia Tower','Вінницька вежа','Винницкая башня','Водонапірна вежа'],['Pyrohov Museum','музей Пирогова','садиба Пирогова'],['European Square','Європейська площа','Европейская площадь'],
    ],
  }),

  Mykolaiv: city({
    districts: [
      ['Tsentralnyi','Центральний','Центральный'],['Zavodskyi','Заводський','Заводской'],['Inhulskyi','Інгульський','Ингульский','Ленінський','Ленинский','Слобідський','Слободской'],['Korabelnyi','Корабельний','Корабельный'],
    ],
    microdistricts: [
      ['Tsentr','Центр'],['Namiv','Намив','Намыв'],['Sukhyi Fontan','Сухий Фонтан','Сухой Фонтан'],['Lisky','Ліски','Лески'],['Varvarivka','Варварівка','Варваровка'],['Velyka Korenykha','Велика Корениха','Большая Корениха'],['Mala Korenykha','Мала Корениха'],['Matviivka','Матвіївка','Матвеевка'],['Ternivka','Тернівка','Терновка'],['Soliani','Соляні','Соляные'],['Pivnichnyi','Північний','Северный'],['Temvod','Темвод'],['Raketne Urochyshche','Ракетне Урочище','Ракетное Урочище'],['Viiskova Slobidka','Військова Слобідка','Военная Слободка'],['Inhulskyi','Інгульський','Ингульский'],['PTZ','ПТЗ'],['Novyi Vodopii','Новий Водопій','Новый Водопой'],['Staryi Vodopii','Старий Водопій','Старый Водопой'],['YuTZ','ЮТЗ'],['Shyroka Balka','Широка Балка','Широкая Балка'],['Kulbakyne','Кульбакине','Кульбакино'],['Korabelnyi','Корабельний'],['Zhovtneve','Жовтневе','Октябрьское'],
    ],
    residentialComplexes: [
      ['Riviera','ЖК Рів\'єра','ЖК Ривьера'],['Levanevtsiv','ЖК Леваневців','ЖК Леваневцев'],['Grand DeLuxe','ЖК Grand DeLuxe','ЖК Гранд Делюкс'],['Premier House',"ЖК Прем'єр Хаус",'ЖК Premier House'],['Pivnichna Zirka','ЖК Північна Зірка','ЖК Северная Звезда'],['Admiral','ЖК Адмірал','ЖК Адмирал'],['Soniachnyi','ЖК Сонячний','ЖК Солнечный'],
    ],
    landmarks: [
      ['Soborna Square','Соборна площа','Соборная площадь','Соборна'],['Flotskyi Boulevard','Флотський бульвар','Флотский бульвар'],['Embankment','Набережна','Набережная'],['Mykolaiv Zoo','Миколаївський зоопарк','Николаевский зоопарк'],['Shipbuilding Museum','музей суднобудування','музей судостроения'],['Inhulskyi Bridge','Інгульський міст','Ингульский мост'],['Varvarivskyi Bridge','Варварівський міст','Варваровский мост'],
    ],
  }),

  Cherkasy: city({
    districts: [
      ['Prydniprovskyi','Придніпровський','Приднепровский'],['Sosnivskyi','Соснівський','Сосновский'],
    ],
    microdistricts: [
      ['Tsentr','Центр'],['Mytnytsia','Митниця','Мытница'],['Kazbet','Казбет'],['Sosnivka','Соснівка','Сосновка'],['Pivdenno-Zakhidnyi','Південно-Західний','Юго-Западный','ПЗР','ЮЗР'],['Dakhnivka','Дахнівка','Дахновка'],['Khimpaselyshche','Хімселище','Химпосёлок','Химпоселок'],['Zelenyi','Зелений','Зелёный'],['Lunacharskyi','Луначарський','Лесной'],['D','Район Д'],['700-richchia','700-річчя','700-летия'],
    ],
    residentialComplexes: [
      ['Symfonia','ЖК Симфонія','ЖК Симфония'],['Hrafskyi','ЖК Графський','ЖК Графский'],['Ridnyi Dim','ЖК Рідний Дім','ЖК Родной Дом'],['City Park','ЖК City Park','ЖК Сіті Парк'],['Perlyna Dnipra','ЖК Перлина Дніпра','ЖК Жемчужина Днепра'],['Andorra','ЖК Андорра'],['Parkovyi Kvartal','ЖК Парковий квартал','ЖК Парковый квартал'],['European','ЖК Європейський','ЖК Европейский'],
    ],
    landmarks: [
      ['Valley of Roses','Долина троянд','Долина роз'],['Victory Park','Парк Перемоги','Парк Победы'],['Sosnovyi Bir','Сосновий бір','Сосновый бор'],['Chemists Park','парк Хіміків','парк Химиков'],['Dnipro Embankment','набережна Дніпра','набережная Днепра'],['Hill of Glory','Пагорб Слави','Холм Славы'],['Wedding Palace','Палац одружень'],['House with Chimeras','Будинок з химерами'],['Cherkasy Zoo','Черкаський зоопарк'],
    ],
  }),

  Poltava: city({
    districts: [
      ['Kyivskyi','Київський','Киевский'],['Podilskyi','Подільський','Подольский','Ленінський','Ленинский'],['Shevchenkivskyi','Шевченківський','Шевченковский','Октябрський','Октябрьский'],
    ],
    microdistricts: [
      ['Tsentr','Центр'],['Almaznyi','Алмазний','Алмазный'],['Sady','Сади','Сады'],['Sady-1','Сади-1'],['Sady-2','Сади-2'],['Sady-3','Сади-3'],['Ohnivka','Огнівка','Огновка'],['Polovky','Половки'],['Brailky','Браїлки','Браилки'],['Bozhenka','Боженка'],['Levada','Левада'],['Podil','Поділ','Подол'],['Dublianshchyna','Дублянщина'],['Rozsoshentsi','Розсошенці','Россошенцы'],['Motel','Мотель'],['Pavlenky','Павленки'],['Zyhina','Зигіна','Зыгина'],['5 Shkola','5 школа'],['Yurivka','Юрівка'],['Yar','Яр'],
    ],
    residentialComplexes: [
      ['European','ЖК Європейський','ЖК Европейский'],['Standard','ЖК Стандарт'],['Family Park','ЖК Family Park'],['Simeinyi','ЖК Сімейний'],['Peliustkovyi','ЖК Пелюстковий'],['Levada','ЖК Левада'],['Dynastiia','ЖК Династія','ЖК Династия'],['Petrivskyi Kvartal','ЖК Петровський квартал','ЖК Петровский квартал'],['City Park','ЖК City Park'],['Victory Club House','ЖК Victory Club House'],
    ],
    landmarks: [
      ['Korpusnyi Garden','Корпусний сад','Корпусный сад'],['Round Square','Кругла площа','Круглая площадь'],['White Arbor','Біла альтанка','Белая беседка'],['Ivanova Hora','Іванова гора'],['Peremoha Park','парк Перемога','парк Победы'],['Poltava Dendropark','Полтавський дендропарк'],['Poltava Battle Museum','музей Полтавської битви'],['Poltava Battle Field','Поле Полтавської битви'],
    ],
  }),

  Chernihiv: city({
    districts: [
      ['Desnianskyi','Деснянський','Деснянский'],['Novozavodskyi','Новозаводський','Новозаводской'],
    ],
    microdistricts: [
      ['Tsentr','Центр'],['Masany','Масани'],['Bobrovytsia','Бобровиця','Бобровица'],['Rokossovskoho','Рокосовського','Рокоссовского'],['Sherstianka','Шерстянка'],['Podusivka','Подусівка','Подусовка'],['Stara Podusivka','Стара Подусівка','Старая Подусовка'],['Liskovytsia','Лісковиця','Лесковица'],['Koty','Коти','Коты'],['Piat Kutiv',"П'ять кутів",'Пять углов'],['Oleksandrivka','Олександрівка','Александровка'],['ZAZ','ЗАЗ'],['Podil','Поділ','Подол'],
    ],
    residentialComplexes: [
      ['Masany','ЖК Масани'],['Oleksandrivskyi','ЖК Олександрівський','ЖК Александровский'],['Lisovyi','ЖК Лісовий','ЖК Лесной'],['Kyivskyi','ЖК Київський','ЖК Киевский'],['Yeletskyi','ЖК Єлецький','ЖК Елецкий'],['Panorama','ЖК Панорама'],['Riverside','ЖК RiverSide','ЖК Ріверсайд'],
    ],
    landmarks: [
      ['Chernihiv Val','Чернігівський Вал','Вал','Дитинець','Детинець'],['Boldyni Hory','Болдині гори','Болдины горы'],['Krasna Square','Красна площа','Красная площадь'],['Bohdan Khmelnytskyi Park','парк Богдана Хмельницького','парк Хмельницкого'],['Central Park','Центральний парк'],['Yalivshchyna','Ялівщина','Яловщина'],['Transfiguration Cathedral','Спасо-Преображенський собор'],['Anthony Caves','Антонієві печери','Антониевы пещеры'],['Yeletskyi Monastery','Єлецький монастир'],
    ],
  }),

  Zhytomyr: city({
    districts: [
      ['Bohunskyi','Богунський','Богунский'],['Korolovskyi','Корольовський','Королёвский','Королевский'],
    ],
    microdistricts: [
      ['Tsentr','Центр'],['Bohuniia','Богунія','Богуния'],['Polova','Польова','Полевая'],['Polova-1','Польова-1'],['Polova-2','Польова-2'],['Polova-3','Польова-3'],['Kroshnia','Крошня'],['Malikova','Малікова','Маликова'],['Khmilnyky','Хмільники','Хмельники'],['Korbutivka','Корбутівка','Корбутовка'],['Marianivka',"Мар'янівка",'Марьяновка'],['Smolianka','Смолянка'],['Sokolova Hora','Соколова гора'],['Skhidnyi','Східний','Восточный'],['Putiatynka','Путятинка'],['Muzykalka','Музикалка','Музыкала'],['Promavtomatyka','Промавтоматика'],
    ],
    residentialComplexes: [
      ['Domashnii','ЖК Домашній','ЖК Домашний'],['Mriia','ЖК Мрія','ЖК Мечта'],['Grand City Dombrovskyi','ЖК Grand City Dombrovskyi'],['Polissia','ЖК Полісся','ЖК Полесье'],['Perlyny Korbutivky','ЖК Перлини Корбутівки','ЖК Жемчужины Корбутовки'],['River City','ЖК River City'],['Mystetski Vorota','ЖК Мистецькі ворота'],['Smart City','ЖК Смарт Сіті'],
    ],
    landmarks: [
      ['Haharin Park','парк Гагаріна','парк Гагарина','Шодуарівський парк','Шодуаровский парк'],['Hydropark','Гідропарк','Гидропарк'],['Castle Hill','Замкова гора'],['Soborna Square','Соборна площа'],['Korolovskyi Square','Корольовський сквер'],['Cosmonautics Museum','музей космонавтики'],['Korolov Museum','музей Корольова','Сергій Корольов'],['Chatsky Rock','скеля Чацького','Скала Чацкого'],
    ],
  }),

  'Ivano-Frankivsk': city({
    microdistricts: [
      ['Tsentr','Центр'],['Pasichna','Пасічна','Пасечная'],['Kaskad','Каскад'],['Pozitron','Позитрон'],['BAM','БАМ'],['Braty','Брати'],['Maizli','Майзлі','Майзли'],['Sofiivka','Софіївка','Софиевка'],['Knyahynyn','Княгинин'],['Opryshivtsi','Опришівці','Опришовцы'],['Naberezhna','Набережна','Набережная'],['Hirka','Гірка','Горка'],['Dolyna','Долина'],['Kalynova Sloboda','Калинова Слобода'],['Vovchynets','Вовчинець','Волчинец'],['Uhornyky','Угорники'],
    ],
    residentialComplexes: [
      ['Manhattan','ЖК Manhattan'],['Manhattan UP','ЖК Manhattan Up'],['Parkova Aleia','ЖК Паркова Алея','ЖК Парковая Аллея'],['Mistechko Tsentralne','ЖК Містечко Центральне','ЖК Городок Центральный'],['Knyahynyn','ЖК Княгинин'],['Family Plaza','ЖК Family Plaza'],['Family Park','ЖК Family Park'],['Lypky','ЖК Липки'],['HydroPark DeLuxe','ЖК HydroPark DeLuxe'],['River Park','ЖК River Park'],['Union','ЖК Union'],['Kvartal Videnskyi','ЖК Квартал Віденський'],['Kalynova Sloboda','ЖК Калинова Слобода'],['Millennium','ЖК Millennium'],
    ],
    landmarks: [
      ['Ratusha','Ратуша'],['Rynok Square','площа Ринок','Площадь Рынок'],['Vichevyi Maidan','Вічевий майдан','Вечевой майдан'],['Stometrivka','Стометрівка','Стометровка'],['City Lake','міське озеро','городское озеро'],['Shevchenko Park','парк Шевченка','парк Шевченко'],['Bastion','Бастіон','Бастион'],['Potocki Palace','Палац Потоцьких','дворец Потоцких'],
    ],
  }),

  Ternopil: city({
    microdistricts: [
      ['Tsentr','Центр'],['Druzhba','Дружба'],['Skhidnyi','Східний','Восточный'],['Soniachnyi','Сонячний','Солнечный'],['BAM','БАМ'],['Kanada','Канада'],['Aliaska','Аляска'],['Novyi Svit','Новий Світ','Новый Свет'],['Kutkivtsi','Кутківці','Кутковцы'],['Proniatyn','Пронятин'],['Berezovytsia','Березовиця'],['Obolonia','Оболоня'],
    ],
    residentialComplexes: [
      ['Varshavskyi','ЖК Варшавський','ЖК Варшавский'],['Kyivskyi','ЖК Київський','ЖК Киевский'],['Panorama','ЖК Панорама'],['Parkovyi Kompleks','ЖК Парковий комплекс'],['Naberezhnyi Kvartal','ЖК Набережний квартал'],['Beverly Hills','ЖК Beverly Hills'],['Manhattan','ЖК Manhattan'],['Atlanta Tower','ЖК Atlanta Tower'],['Shchastia','ЖК Щастя','ЖК Счастье'],['Kanada','ЖК Канада'],
    ],
    landmarks: [
      ['Ternopil Pond','Тернопільський став','Тернопольский пруд'],['Embankment','Набережна'],['Shevchenko Park','парк Шевченка'],['Topilche Park','парк Топільче'],['National Revival Park','парк Національного відродження'],['Ternopil Castle','Старий замок','Тернопільський замок'],['Teatralnyi Maidan','Театральний майдан','Театральная площадь'],['Lovers Island','острів Закоханих','Остров влюблённых'],
    ],
  }),

  Lutsk: city({
    microdistricts: [
      ['Tsentr','Центр','Старе місто','Старый город'],['33rd District','33 квартал'],['40th District','40 квартал'],['55th District','55 квартал'],['40A','40А'],['Zavokzalnyi','Завокзальний','Завокзальный'],['HPZ','ГПЗ','ДПЗ'],['Balka','Балка'],['Vyshkiv','Вишків','Вышков'],['Krasne','Красне','Красное'],['Teremno','Теремно'],['Veresneve','Вересневе','Вересневое'],['Dubnivskyi','Дубнівський','Дубновский'],['LPZ','ЛПЗ'],
    ],
    residentialComplexes: [
      ['Yarovytsia','ЖК Яровиця','ЖК Яровица'],['Caramel Residence','ЖК Caramel Residence','ЖК Карамель'],['Dream Town','ЖК Dream Town'],['Atlant','ЖК Атлант'],['Supernova','ЖК Супернова'],['Panorama','ЖК Panorama'],['StyleUP','ЖК StyleUP'],['Lutska Riviera','ЖК Луцька Рів\'єра','ЖК Луцкая Ривьера'],['Oselya Park','ЖК Оселя Парк'],['Amsterdam','ЖК Амстердам'],
    ],
    landmarks: [
      ['Lubart Castle','замок Любарта','Луцький замок','Луцкий замок',"Lubart's Castle"],['Old Town','Старе місто'],['Teatralnyi Maidan','Театральний майдан'],['Lesia Ukrainka Park','парк Лесі Українки','Центральний парк'],['Styr Embankment','набережна Стиру'],['House with Chimeras','Будинок з химерами','Дом с химерами'],['Cathedral','кафедральний костел'],
    ],
  }),

  Uzhhorod: city({
    microdistricts: [
      ['Tsentr','Центр'],['Bozdosh','Боздош'],['Novyi Raion','Новий район','Новый район'],['Shakhta','Шахта'],['Radanka','Радванка'],['Domanyntsi','Доманинці','Доманицы'],['Horiany','Горяни'],['Minai','Минай'],['Kompotnyi','Компотний','Компотный'],['BAM','БАМ'],['Chervenytsia','Червениця','Червеница'],
    ],
    residentialComplexes: [
      ['Park Land','ЖК Park Land'],['Budapest','ЖК Будапешт','ЖК Budapest'],['River Land','ЖК River Land'],['River City','ЖК River City'],['West Towers','ЖК West Towers'],['Crystal','ЖК Crystal'],['Crystal Residence','ЖК Crystal Residence'],['Panorama','ЖК Panorama'],['European','ЖК Європейський','ЖК Европейский'],['Sherwood','ЖК Sherwood'],['Bavaria','ЖК Bavaria'],
    ],
    landmarks: [
      ['Uzhhorod Castle','Ужгородський замок','Ужгородский замок'],['Nezalezhnosti Embankment','набережна Незалежності','набережная Независимости'],['Linden Alley','Липова алея','Липовая аллея'],['Bozdosh Park','Боздоський парк','парк Боздош'],['Teatralna Square','площа Театральна','Театральная площадь'],['Pedestrian Bridge','пішохідний міст','пешеходный мост'],['Holy Cross Cathedral','Хрестовоздвиженський собор'],['Horiany Rotunda','Горянська ротонда'],
    ],
  }),

  Chernivtsi: city({
    microdistricts: [
      ['Tsentr','Центр'],['Prospekt','Проспект'],['Komarova','Комарова'],['Pivdenno-Kiltseva','Південно-Кільцева','Южно-Кольцевая'],['Hraviton','Гравітон','Гравитон'],['Kalichanka','Калічанка','Каличанка'],['Sadgora','Садгора','Садгірський','Садгірський район'],['Roscha','Роша'],['Klokuchka','Клокучка'],['Roscha-Stynka','Роша-Стинка'],['Tsetsyno','Цецино'],['Lenkivtsi','Ленківці','Ленковцы'],['Fastivska','Фастівська'],
    ],
    residentialComplexes: [
      ['Vodohrai','ЖК Водограй'],['Compass','ЖК Compass','ЖК Компас'],['Comfort Hall','ЖК Comfort Hall'],['Kyivskyi','ЖК Київський','ЖК Киевский'],['Rodynnyi','ЖК Родинний','ЖК Родинный'],['Panorama','ЖК Panorama'],['Park Avenue','ЖК Park Avenue'],['Central','ЖК Central'],
    ],
    landmarks: [
      ['Metropolitan Residence','Резиденція митрополитів','Резиденция митрополитов'],['Chernivtsi University','ЧНУ','університет Федьковича'],['Teatralna Square','Театральна площа'],['Central Square','Центральна площа'],['Turkish Square','Турецька площа','Турецька криниця'],['Kobylianska Street','Ольги Кобилянської','вулиця Кобилянської'],['Shevchenko Park','парк Шевченка'],['Botanical Garden','Ботанічний сад'],['City Hall','Ратуша'],
    ],
  }),

  Khmelnytskyi: city({
    microdistricts: [
      ['Tsentr','Центр'],['Vystavka','Виставка','Выставка'],['Ozerna','Озерна','Озёрная','Озерная'],['Pivdennyi-Zakhid','Південно-Західний','Юго-Западный','ПЗР'],['Hrechany','Гречани'],['Dalni Hrechany','Дальні Гречани'],['Blyzhni Hrechany','Ближні Гречани'],['Rakove','Ракове'],['Dubove','Дубове'],['Lezneve','Лезневе'],['Knyzhkivtsi','Книжківці','Книжковцы'],['Ruzhychna','Ружична','Ружичная'],['Zarichchia','Заріччя','Заречье'],['Kation','Катіон'],['Stare Misto','Старе місто'],
    ],
    residentialComplexes: [
      ['Spring Town','ЖК Spring Town'],['Ozernyi','ЖК Озерний','ЖК Озёрный'],['Paradise','ЖК Paradise'],['Dim na Ozernii','ЖК Дім на Озерній','ЖК Дом на Озёрной'],['Avila','ЖК Авіла','ЖК Avila'],['Grand Royal','ЖК Grand Royal'],['European','ЖК Європейський','ЖК Европейский'],['Perlyna Proskurova','ЖК Перлина Проскурова','ЖК Жемчужина Проскурова'],['Design Park','ЖК Дизайн Парк'],['Urban','ЖК Urban'],['Harmony Garden','ЖК Harmony Garden'],
    ],
    landmarks: [
      ['Proskurivska','Проскурівська','Проскуровская'],['Maidan Nezalezhnosti','Майдан Незалежності'],['Chekman Park','парк Чекмана'],['Franko Park','парк Франка'],['Podillia Dendropark','дендропарк Поділля','Дендропарк Подолье'],['Southern Bug Embankment','набережна Південного Бугу'],['Love Island','Острів кохання','остров Любви'],['Philharmonic','філармонія'],
    ],
  }),

  Sumy: city({
    districts: [
      ['Zarichnyi','Зарічний','Заречный'],['Kovpakivskyi','Ковпаківський','Ковпаковский'],
    ],
    microdistricts: [
      ['Tsentr','Центр'],['Khimhorodok','Хіммістечко','Химгородок'],['9 microdistrict','9 мікрорайон','9 микрорайон'],['10 microdistrict','10 мікрорайон','10 микрорайон'],['11 microdistrict','11 мікрорайон','11 микрорайон'],['12 microdistrict','12 мікрорайон'],['Kurskyi','Курський','Курский'],['Prokofieve',"Прокоф'єва",'Прокофьева'],['Kharkivska','Харківська','Харьковская'],['Romenskyi','Роменський','Роменский'],['Baranivka','Баранівка','Барановка'],['Veretenivka','Веретенівка','Веретеновка'],['Dobrovilna','Добровільна','Добровольная'],['Basivka','Басівка','Басовка'],['Luka','Лука'],['Teplychnyi','Тепличний'],['Kosivshchyna','Косівщина'],
    ],
    residentialComplexes: [
      ['Esplanada','ЖК Еспланада','ЖК Эспланада'],['Nottingham','ЖК Ноттінгем','ЖК Ноттингем'],['Zarichnyi','ЖК Зарічний','ЖК Заречный'],['Kyivskyi','ЖК Київський','ЖК Киевский'],['Kharkivskyi','ЖК Харківський','ЖК Харьковский'],['Teatralnyi','ЖК Театральний','ЖК Театральный'],['Panorama','ЖК Панорама'],['European','ЖК Європейський','ЖК Европейский'],
    ],
    landmarks: [
      ['Altanka','Альтанка','Сумська альтанка'],['Pokrovska Square','Покровська площа','Покровская площадь'],['Teatralna Square','Театральна площа'],['Kozhedub Park','парк Кожедуба','парк ім. Кожедуба'],['Chekha Lake','озеро Чеха','Чеха'],['Blue Lakes','Блакитні озера','Голубые озёра'],['Psel Embankment','Набережна Псла'],['Transfiguration Cathedral','Спасо-Преображенський собор'],['Trinity Cathedral','Троїцький собор'],
    ],
  }),

  Kropyvnytskyi: city({
    districts: [
      ['Podilskyi','Подільський','Подольский','Ленінський','Ленинский'],['Fortechnyi','Фортечний','Фортечный','Кіровський','Кировский'],
    ],
    microdistricts: [
      ['Tsentr','Центр'],['Kovalivka','Ковалівка','Ковалёвка'],['Novomykolaivka','Новомиколаївка','Новониколаевка'],['Katranivka','Катранівка','Катрановка'],['Balashivka','Балашівка','Балашовка'],['Maslianykivka','Масляниківка','Маслениковка'],['Velyka Balka','Велика Балка','Большая Балка'],['Lelekivka','Лелеківка','Лелековка'],['Ozerna Balka','Озерна Балка'],['Cheremushky','Черемушки'],['Popova','Попова'],['Zhadova','Жадова'],['Patsaieva','Пацаєва','Пацая'],['Shkilnyi','Шкільний','Школьный'],['Arnautovo','Арнаутово'],['101 microdistrict','101 мікрорайон'],
    ],
    residentialComplexes: [
      ['Kovalivskyi','ЖК Ковалівський','ЖК Ковалевский'],['A+Ya','ЖК А+Я'],['Manhattan','ЖК Manhattan'],['Perlyna','ЖК Перлина','ЖК Жемчужина'],['European','ЖК Європейський','ЖК Европейский'],['Kvartal','ЖК Квартал'],['Central','ЖК Central'],
    ],
    landmarks: [
      ['Heroes of Maidan Square','площа Героїв Майдану','площадь Героев Майдана'],['Kovalivskyi Park','Ковалівський парк','парк Ковалёвский'],['Dendropark','Дендропарк'],['St Elizabeth Fortress','Фортеця Святої Єлисавети','Крепость Святой Елисаветы'],['Kropyvnytskyi Theatre','Театр Кропивницького'],['Velyka Perspektyvna','Велика Перспективна'],
    ],
  }),

  Kremenchuk: city({
    districts: [
      ['Avtozavodskyi','Автозаводський','Автозаводской'],['Kriukivskyi','Крюківський','Крюковский'],
    ],
    microdistricts: [
      ['Tsentr','Центр'],['Molodizhnyi','Молодіжний','Молодёжный'],['Rakivka','Раківка','Раковка'],['Kriukiv','Крюків','Крюков'],['Velyka Kokhnivka','Велика Кохнівка','Большая Кохновка'],['Nahirna Chastyna','Нагірна частина','Нагорная часть'],['Pershyi Zanasyp','Перший Занасип','Первый Занасып'],['Druhyi Zanasyp','Другий Занасип'],['Tretii Zanasyp','Третій Занасип'],['Pyvzavod','Пивзавод'],['Vodokanal','Водоканал'],['Avtokrazivskyi','Автокразівський','Автокразовский'],
    ],
    residentialComplexes: [
      ['Dniprovska Riviera','ЖК Дніпровська Рів\'єра','ЖК Днепровская Ривьера'],['Tsentralnyi','ЖК Центральний','ЖК Центральный'],
    ],
    landmarks: [
      ['Prydniprovskyi Park','парк Придніпровський','парк Приднепровский'],['Peace Park','парк Миру'],['Dnipro Embankment','набережна Дніпра'],['Kriukivskyi Bridge','Крюківський міст','Крюковский мост'],['Victory Square','площа Перемоги','площадь Победы'],
    ],
  }),

  'Bila Tserkva': city({
    microdistricts: [
      ['Tsentr','Центр'],['Vokzalna','Вокзальна','Вокзальная'],['Levanevskoho','Леваневського','Леваневского'],['Pishchanyi','Піщаний','Песчаный'],['Tarashchanskyi','Таращанський','Таращанский'],['Haiok','Гайок'],['Zarichchia','Заріччя','Заречье'],['DNS','ДНС'],['Pionerska','Піонерська','Пионерская'],['4 microdistrict','4 мікрорайон'],['5 microdistrict','5 мікрорайон'],['6 microdistrict','6 мікрорайон'],
    ],
    landmarks: [
      ['Oleksandriia Arboretum','Олександрія','Александрия','дендропарк Олександрія','Arboretum Oleksandriya'],['Castle Hill','Замкова гора'],['Torhova Square','Торгова площа'],['Shevchenko Park','парк Шевченка'],['Soborna Square','Соборна площа'],['Ros River','річка Рось','Рось'],
    ],
  }),
});
