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

export const KZ_PRIMARY_ADDRESS_EXTENSIONS = Object.freeze({
  Astana: Object.freeze({
    microdistricts: Object.freeze([
      microdistrict('Alatau', [
        'Алатау', 'микрорайон Алатау', 'мкр Алатау', 'Алатау шағын ауданы', 'Alatau microdistrict',
      ]),
    ]),
    streets: Object.freeze([
      street('Проспект Аль-Фараби', [
        'проспект Аль-Фараби', 'пр-т Аль-Фараби', 'Аль-Фараби', 'Әл-Фараби даңғылы',
        'Al-Farabi Avenue', 'Al Farabi Avenue', 'Al-Farabi Prospekt',
      ]),
      street('Улица Айтеке Би', [
        'улица Айтеке Би', 'ул. Айтеке Би', 'Айтеке Би', 'Әйтеке би көшесі',
        'Aiteke Bi Street', 'Ayteke Bi Street',
      ]),
      street('Улица Алихана Бокейхана', [
        'улица Алихана Бокейхана', 'ул. Алихана Бокейхана', 'Алихана Бокейхана',
        'Әлихан Бөкейхан көшесі', 'Alikhan Bokeikhan Street',
      ]),
      street('Улица Анет Баба', [
        'улица Анет Баба', 'ул. Анет Баба', 'Анет Баба', 'Әнет баба көшесі', 'Anet Baba Street',
      ]),
      street('Улица Аныракай', [
        'улица Аныракай', 'ул. Аныракай', 'Аныракай', 'Аңырақай көшесі',
        'Anyrakai Street', 'Anyraqai Street',
      ]),
      street('Улица Домалак Ана', [
        'улица Домалак Ана', 'ул. Домалак Ана', 'Домалак Ана', 'Домалақ ана көшесі', 'Domalak Ana Street',
      ]),
      street('Улица Елубая Тайбекова', [
        'улица Елубая Тайбекова', 'ул. Елубая Тайбекова', 'Елубая Тайбекова',
        'Елубай Тайбеков көшесі', 'Yelubay Taibekov Street', 'Elubay Taibekov Street',
      ]),
      street('Улица Каракат', [
        'улица Каракат', 'ул. Каракат', 'Каракат', 'Қарақат көшесі', 'Karakat Street', 'Qaraqat Street',
      ]),
      street('Улица Каршыга Ахмедиярова', [
        'улица Каршыга Ахмедиярова', 'ул. Каршыга Ахмедиярова', 'Каршыга Ахмедиярова',
        'Қаршыға Ахмедияров көшесі', 'Karshyga Akhmediyarov Street', 'Qarshyga Akhmediyarov Street',
      ]),
      street('Улица Кенесары', [
        'улица Кенесары', 'ул. Кенесары', 'Кенесары', 'Кенесары көшесі', 'Kenesary Street',
      ]),
      street('Улица Конституции', [
        'улица Конституции', 'ул. Конституции', 'Конституции', 'Конституция көшесі', 'Constitution Street',
      ]),
      street('Улица Оралхан Бокей', [
        'улица Оралхан Бокей', 'ул. Оралхан Бокей', 'Оралхан Бокей', 'Оралхан Бөкей көшесі',
        'Oralkhan Bokei Street', 'Oralhan Bokei Street',
      ]),
      street('Улица Сембинова', [
        'улица Сембинова', 'ул. Сембинова', 'Сембинова', 'Sembinov Street',
      ]),
      street('Улица Сырдария', [
        'улица Сырдария', 'ул. Сырдария', 'Сырдария', 'Сырдария көшесі', 'Syrdariya Street', 'Syr Darya Street',
      ]),
      street('Улица Толе Би', [
        'улица Толе Би', 'ул. Толе Би', 'Толе Би', 'Төле би көшесі', 'Tole Bi Street', 'Töle Bi Street',
      ]),
      street('Улица Туркестан', [
        'улица Туркестан', 'ул. Туркестан', 'Туркестан', 'Түркістан көшесі', 'Turkistan Street', 'Turkestan Street',
      ]),
    ]),
  }),

  Almaty: Object.freeze({
    microdistricts: Object.freeze([
      microdistrict('Samal-1', ['Самал-1', 'Самал 1', 'Самал-1 шағын ауданы', 'Samal 1']),
      microdistrict('Samal-2', ['Самал-2', 'Самал 2', 'Самал-2 шағын ауданы', 'Samal 2']),
      microdistrict('Samal-3', ['Самал-3', 'Самал 3', 'Самал-3 шағын ауданы', 'Samal 3']),
      microdistrict('Aksai-1', ['Аксай-1', 'Ақсай-1', 'Аксай 1', 'Ақсай-1 шағын ауданы', 'Aksai 1', 'Aqsai-1']),
      microdistrict('Aksai-3A', ['Аксай-3А', 'Ақсай-3А', 'Аксай 3А', 'Ақсай-3А шағын ауданы', 'Aksai 3A', 'Aqsai-3A']),
      microdistrict('Koktem-1', ['Коктем-1', 'Көктем-1', 'Коктем 1', 'Көктем-1 шағын ауданы', 'Koktem 1']),
      microdistrict('Koktem-2', ['Коктем-2', 'Көктем-2', 'Коктем 2', 'Көктем-2 шағын ауданы', 'Koktem 2']),
      microdistrict('Koktem-3', ['Коктем-3', 'Көктем-3', 'Коктем 3', 'Көктем-3 шағын ауданы', 'Koktem 3']),
      microdistrict('Zhetysu-1', ['Жетысу-1', 'Жетісу-1', 'Жетысу 1', 'Жетісу-1 шағын ауданы', 'Zhetysu 1', 'Jetisu-1']),
      microdistrict('Zhetysu-3', ['Жетысу-3', 'Жетісу-3', 'Жетысу 3', 'Жетісу-3 шағын ауданы', 'Zhetysu 3', 'Jetisu-3']),
      microdistrict('Orbita-2', ['Орбита-2', 'Орбита 2', 'Орбита-2 шағын ауданы', 'Orbita 2']),
      microdistrict('Orbita-4', ['Орбита-4', 'Орбита 4', 'Орбита-4 шағын ауданы', 'Orbita 4']),
      microdistrict('Mamyr-1', ['Мамыр-1', 'Мамыр 1', 'Мамыр-1 шағын ауданы', 'Mamyr 1']),
      microdistrict('3 microdistrict', [
        '3-й микрорайон', '3 микрорайон', '3 мкр', '3 мкр.', '3-ші шағын аудан', '3 шағын аудан', '3rd microdistrict',
      ]),
      microdistrict('Sayaly', ['Саялы', 'Саялы микрорайон', 'Саялы шағын ауданы', 'Sayaly microdistrict']),
      microdistrict('Nur Alatau', ['Нур Алатау', 'Нұр Алатау', 'Нұр Алатау шағын ауданы', 'Nur Alatau microdistrict']),
    ]),
    streets: Object.freeze([
      street('проспект Аль-Фараби', [
        'Проспект Аль-Фараби', 'пр-т Аль-Фараби', 'Аль-Фараби', 'Әл-Фараби даңғылы',
        'Al-Farabi Avenue', 'Al Farabi Avenue', 'Al-Farabi Prospekt',
      ]),
      street('проспект Достык', [
        'Проспект Достык', 'пр-т Достык', 'Достык', 'Достық даңғылы', 'Dostyk Avenue', 'Dostyq Avenue',
      ]),
      street('Проспект Рыскулова', [
        'проспект Рыскулова', 'пр-т Рыскулова', 'Рыскулова', 'Рысқұлов даңғылы',
        'Ryskulov Avenue', 'Rysqulov Avenue',
      ]),
      street('Улица Абдуллы Розыбакиева', [
        'улица Абдуллы Розыбакиева', 'ул. Розыбакиева', 'Розыбакиева', 'Розыбакиев көшесі',
        'Abdulla Rozybakiev Street', 'Rozybakiev Street',
      ]),
      street('Улица Басенова', [
        'улица Басенова', 'ул. Басенова', 'Басенова', 'Басенов көшесі', 'Basenov Street',
      ]),
      street('Улица Богенбай батыра', [
        'улица Богенбай батыра', 'ул. Богенбай батыра', 'Богенбай батыра', 'Бөгенбай батыр көшесі',
        'Bogenbay Batyr Street', 'Bögenbai Batyr Street',
      ]),
      street('Улица Газизы Жубановой', [
        'улица Газизы Жубановой', 'ул. Газизы Жубановой', 'Газизы Жубановой', 'Ғазиза Жұбанова көшесі',
        'Gaziza Zhubanova Street', 'Ghaziza Zhubanova Street',
      ]),
      street('Улица Гаухартас', [
        'улица Гаухартас', 'ул. Гаухартас', 'Гаухартас', 'Гауһартас көшесі', 'Gaukhartas Street', 'Gauhartas Street',
      ]),
      street('Улица Егизбаева', [
        'улица Егизбаева', 'ул. Егизбаева', 'Егизбаева', 'Егізбаев көшесі', 'Egizbaev Street',
      ]),
      street('Улица Кайырбекова', [
        'улица Кайырбекова', 'ул. Кайырбекова', 'Кайырбекова', 'Қайырбеков көшесі', 'Kaiyrbekov Street', 'Qaiyrbekov Street',
      ]),
      street('Улица Калдаякова', [
        'улица Калдаякова', 'ул. Калдаякова', 'Калдаякова', 'Қалдаяқов көшесі', 'Kaldaiakov Street', 'Qaldayaqov Street',
      ]),
      street('Улица Маркова', [
        'улица Маркова', 'ул. Маркова', 'Маркова', 'Марков көшесі', 'Markov Street',
      ]),
      street('Улица Мынбаева', [
        'улица Мынбаева', 'ул. Мынбаева', 'Мынбаева', 'Мыңбаев көшесі', 'Mynbaev Street', 'Myngbaev Street',
      ]),
      street('Улица Нурмакова', [
        'улица Нурмакова', 'ул. Нурмакова', 'Нурмакова', 'Нұрмақов көшесі', 'Nurmakov Street',
      ]),
      street('Улица Нуртаса Ондасынова', [
        'улица Нуртаса Ондасынова', 'ул. Нуртаса Ондасынова', 'Нуртаса Ондасынова',
        'Нұртас Оңдасынов көшесі', 'Nurtas Ondasynov Street',
      ]),
      street('Улица Рыскулбекова', [
        'улица Рыскулбекова', 'ул. Рыскулбекова', 'Рыскулбекова', 'Рысқұлбеков көшесі',
        'Ryskulbekov Street', 'Rysqulbekov Street',
      ]),
      street('Улица Сатпаева', [
        'улица Сатпаева', 'ул. Сатпаева', 'Сатпаева', 'Қаныш Сәтбаев көшесі', 'Сәтбаев көшесі',
        'Kanysh Satpayev Street', 'Satpayev Street',
      ]),
      street('Улица Токсына Кулыбекова', [
        'улица Токсына Кулыбекова', 'ул. Токсына Кулыбекова', 'Токсына Кулыбекова',
        'Тоқсын Құлыбеков көшесі', 'Toksyn Kulybekov Street', 'Toqsyn Qulybekov Street',
      ]),
      street('Улица Толе Би', [
        'улица Толе Би', 'ул. Толе Би', 'Толе Би', 'Төле би көшесі', 'Tole Bi Street', 'Töle Bi Street',
      ]),
      street('Улица Шакарима', [
        'улица Шакарима', 'ул. Шакарима', 'Шакарима', 'Шәкәрім көшесі', 'Shakarim Street', 'Shakarim Street',
      ]),
    ]),
  }),
});
