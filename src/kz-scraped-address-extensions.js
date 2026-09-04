import { aliasesToRegex } from './normalization.js';

function entry(name, aliases, entityType) {
  const all = Object.freeze([...new Set([name, ...aliases].filter(Boolean))]);
  return Object.freeze({
    canonical: name,
    name,
    type: entityType,
    entityType,
    country: 'KZ',
    aliases: all,
    re: aliasesToRegex(all),
  });
}

const microdistrict = (name, aliases = []) => entry(name, aliases, 'microdistrict');
const street = (name, aliases = []) => entry(name, aliases, 'street');
const numberedMicrodistrict = (number) => microdistrict(`${number} microdistrict`, [
  `${number}-й микрорайон`, `${number} микрорайон`, `${number} мкр`, `${number} мкр.`, `${number}-й мкр`,
  `${number}-ші шағын аудан`, `${number} шағын аудан`, `${number} ықшамаудан`, `${number}th microdistrict`,
]);

export const KZ_SCRAPED_ADDRESS_EXTENSIONS = Object.freeze({
  Aktobe: Object.freeze({
    microdistricts: Object.freeze([
      numberedMicrodistrict(4),
      numberedMicrodistrict(5),
      numberedMicrodistrict(11),
      numberedMicrodistrict(12),
    ]),
    streets: Object.freeze([
      street('Проспект Алаш', [
        'проспект Алаш', 'пр-т Алаш', 'Алаш даңғылы', 'Alash Avenue', 'Alash Prospekt',
      ]),
      street('Улица Байганина', [
        'улица Байганина', 'ул. Байганина', 'Байганина', 'Нұрпейіс Байғанин көшесі',
        'Байғанин көшесі', 'N. Baiganin Street', 'Nurpeis Baiganin Street',
      ]),
      street('Улица Бокенбай Батыра', [
        'улица Бокенбай Батыра', 'ул. Бокенбай Батыра', 'Бокенбай Батыра',
        'Бөкенбай Батыр көшесі', 'Бөкенбай батыр көшесі', 'Bokenbay Batyr Street',
      ]),
      street('Улица Джамбула', [
        'улица Джамбула', 'ул. Джамбула', 'Джамбула', 'улица Жамбыла',
        'Жамбыл көшесі', 'Jambyl Street', 'Dzhambul Street',
      ]),
      street('Улица Жанкожа Батыра', [
        'улица Жанкожа Батыра', 'ул. Жанкожа Батыра', 'Жанкожа Батыра',
        'Жанқожа Батыр көшесі', 'Жанқожа батыр көшесі', 'Zhankozha Batyr Street',
      ]),
      street('Улица Ибатова', [
        'улица Ибатова', 'ул. Ибатова', 'Ибатова', 'Ибатов көшесі', 'Ibatov Street',
      ]),
      street('Улица Мангилик Ел', [
        'улица Мангилик Ел', 'ул. Мангилик Ел', 'Мангилик Ел', 'Мәңгілік Ел көшесі',
        'Mangilik El Street', 'Mangilik Yel Street',
      ]),
      street('улица Ораза Татеулы', [
        'Улица Ораза Татеулы', 'ул. Ораза Татеулы', 'Ораза Татеулы',
        'Ораз Тәтеұлы көшесі', 'Ораза Тәтеұлы көшесі', 'Oraz Tateuly Street',
      ]),
      street('Улица Пожарского', [
        'улица Пожарского', 'ул. Пожарского', 'Пожарского', 'Pozharskogo Street',
      ]),
      street('Улица Сатпаева', [
        'улица Сатпаева', 'ул. Сатпаева', 'Сатпаева', 'Қаныш Сәтбаев көшесі',
        'Сәтбаев көшесі', 'Kanysh Satpayev Street', 'Satpayev Street',
      ]),
      street('Улица Узакбая Кулымбетова', [
        'улица Узакбая Кулымбетова', 'ул. Узакбая Кулымбетова', 'Узакбая Кулымбетова',
        'Ұзақбай Құлымбетов көшесі', 'Uzakbay Kulymbetov Street', 'Uzaqbay Qulymbetov Street',
      ]),
    ]),
  }),

  Shymkent: Object.freeze({
    microdistricts: Object.freeze([
      numberedMicrodistrict(18),
      microdistrict('Akzhaiyk', ['Акжайык', 'Ақжайық', 'Акжайық', 'Aqzhaiyq', 'Akzhayik']),
      microdistrict('Sairam', ['Сайрам', 'Сайрам микрорайон', 'Сайрам шағын ауданы', 'Sairam microdistrict']),
      microdistrict('North', ['Север', 'Северный', 'Север микрорайон', 'Солтүстік шағын ауданы', 'North microdistrict']),
      microdistrict('Sportivnyi', ['Спортивный', 'Спортивный микрорайон', 'Спорт шағын ауданы', 'Sportivny', 'Sportivnyi microdistrict']),
      microdistrict('Shymcity', ['Шымсити', 'Шым Сити', 'Shym City', 'Shymkent City', 'Шымсити микрорайон']),
    ]),
    streets: Object.freeze([
      street('Дулати көшесі', [
        'улица Дулати', 'ул. Дулати', 'Дулати', 'М. Х. Дулати көшесі', 'M. H. Dulati Street', 'Dulati Street',
      ]),
      street('Проспект Байдибек би', [
        'проспект Байдибек би', 'пр-т Байдибек би', 'Байдибек би', 'Бәйдібек би даңғылы',
        'Бәйдібек би', 'Baidibek Bi Avenue', 'Baidibek Bi Prospekt',
      ]),
      street('Улица Акбота', [
        'улица Акбота', 'ул. Акбота', 'Акбота', 'Ақбота көшесі', 'Aqbota Street', 'Akbota Street',
      ]),
      street('Улица Алатау батыра', [
        'улица Алатау батыра', 'ул. Алатау батыра', 'Алатау батыра', 'Алатау батыр көшесі', 'Alatau Batyr Street',
      ]),
      street('Улица Алии Молдагуловой', [
        'улица Алии Молдагуловой', 'ул. Алии Молдагуловой', 'Алии Молдагуловой',
        'Әлия Молдағұлова көшесі', 'Aliya Moldagulova Street',
      ]),
      street('Улица Аргынбекова', [
        'улица Аргынбекова', 'ул. Аргынбекова', 'Аргынбекова', 'Арғынбеков көшесі', 'Argynbekov Street',
      ]),
      street('Улица Ахмета Байтурсынова', [
        'улица Ахмета Байтурсынова', 'ул. Ахмета Байтурсынова', 'Ахмета Байтурсынова',
        'Ахмет Байтұрсынұлы көшесі', 'Байтұрсынов көшесі', 'Akhmet Baitursynuly Street', 'Baitursynov Street',
      ]),
      street('Улица Бокейханова', [
        'улица Бокейханова', 'ул. Бокейханова', 'Бокейханова', 'Бөкейхан көшесі', 'Bokeikhan Street',
      ]),
      street('Улица Жолан батыра', [
        'улица Жолан батыра', 'ул. Жолан батыра', 'Жолан батыра', 'Жолан батыр көшесі', 'Zholan Batyr Street',
      ]),
      street('Улица Калдаякова', [
        'улица Калдаякова', 'ул. Калдаякова', 'Калдаякова', 'Қалдаяқов көшесі', 'Kaldaiakov Street', 'Qaldayaqov Street',
      ]),
      street('Улица Капал Батыра', [
        'улица Капал Батыра', 'ул. Капал Батыра', 'Капал Батыра', 'Қапал батыр көшесі', 'Kapal Batyr Street', 'Qapal Batyr Street',
      ]),
      street('Улица Кокшетау', [
        'улица Кокшетау', 'ул. Кокшетау', 'Кокшетау', 'Көкшетау көшесі', 'Kokshetau Street',
      ]),
      street('Улица Куаныша Тулеметова', [
        'улица Куаныша Тулеметова', 'ул. Куаныша Тулеметова', 'Куаныша Тулеметова',
        'Қуаныш Төлеметов көшесі', 'Kuanysh Tulemetov Street', 'Quanysh Tolemetov Street',
      ]),
      street('Улица Курылтай', [
        'улица Курылтай', 'ул. Курылтай', 'Курылтай', 'Құрылтай көшесі', 'Kuryltai Street', 'Quryltai Street',
      ]),
      street('Улица Мадели кожа', [
        'улица Мадели кожа', 'ул. Мадели кожа', 'Мадели кожа', 'Мәделі қожа көшесі', 'Madeli Kozha Street',
      ]),
    ]),
  }),

  Karaganda: Object.freeze({
    microdistricts: Object.freeze([
      numberedMicrodistrict(12),
      numberedMicrodistrict(14),
      numberedMicrodistrict(28),
      numberedMicrodistrict(30),
      microdistrict('Gulder-2', ['Гульдер-2', 'Гүлдер-2', 'Гулдер-2', 'Gulder 2']),
      microdistrict('имени Мамраева', ['микрорайон имени Мамраева', 'мкр имени Мамраева', 'мкр. имени Мамраева', 'Мамраев микрорайон', 'Mamraev microdistrict']),
      microdistrict('Kungei', ['Кунгей', 'Күнгей', 'Күнгей микрорайон', 'Kungei microdistrict']),
      microdistrict('Orbita-1', ['Орбита-1', 'Орбита 1', 'Orbita 1']),
      microdistrict('Orbita-2', ['Орбита-2', 'Орбита 2', 'Orbita 2']),
      microdistrict('Stepnoy-1', ['Степной-1', 'Степной 1', 'Stepnoi-1', 'Stepnoy 1']),
      microdistrict('Stepnoy-2', ['Степной-2', 'Степной 2', 'Stepnoi-2', 'Stepnoy 2']),
      microdistrict('Stepnoy-3', ['Степной-3', 'Степной 3', 'Stepnoi-3', 'Stepnoy 3']),
    ]),
    streets: Object.freeze([
      street('Охотская улица', [
        'улица Охотская', 'ул. Охотская', 'Охотская', 'Охотская көшесі', 'Okhotskaya Street',
      ]),
      street('Проспект Нуркена Абдирова', [
        'проспект Нуркена Абдирова', 'пр-т Нуркена Абдирова', 'Нуркена Абдирова',
        'Нұркен Әбдіров даңғылы', 'Нұркен Әбдіров', 'Nurken Abdirov Avenue', 'Nurken Abdirov Prospekt',
      ]),
      street('Улица Муканова', [
        'улица Муканова', 'ул. Муканова', 'Муканова', 'Мұқанов көшесі', 'Mukanov Street', 'Muqanov Street',
      ]),
      street('Улица Назиры Турекуловой', [
        'улица Назиры Турекуловой', 'ул. Назиры Турекуловой', 'Назиры Турекуловой', 'Nazira Turekulova Street',
      ]),
      street('Улица Рыскулова', [
        'улица Рыскулова', 'ул. Рыскулова', 'Рыскулова', 'Рысқұлов көшесі', 'Ryskulov Street', 'Rysqulov Street',
      ]),
      street('Улица Таттимбета', [
        'улица Таттимбета', 'ул. Таттимбета', 'Таттимбета', 'Тәттімбет көшесі', 'Tattimbet Street'],
      ),
      street('Улица Чкалова', [
        'улица Чкалова', 'ул. Чкалова', 'Чкалова', 'Чкалов көшесі', 'Chkalov Street',
      ]),
    ]),
  }),
});
