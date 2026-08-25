const group = (canonical, aliases) => Object.freeze({ canonical, aliases: Object.freeze(aliases) });

export const HIRING_INTENT = Object.freeze({
  candidate: group('candidate', {
    ru: ['ищу работу', 'ищу вакансию', 'резюме', 'рассматриваю работу', 'нужна работа'],
    en: ['looking for a job', 'seeking work', 'resume', 'cv', 'open to work'],
    uzLatn: ['ish qidiryapman', 'ish qidiraman', 'menga ish kerak', 'ish joyi kerak', 'rezyume', 'ishga kirmoqchiman'],
    uzCyrl: ['иш қидиряпман', 'иш қидираман', 'менга иш керак', 'иш жойи керак', 'резюме', 'ишга кирмоқчиман'],
    kk: ['жұмыс іздеймін', 'жұмыс керек', 'түйіндеме', 'жұмыс қарастырып жүрмін', 'жұмысқа орналасқым келеді'],
  }),
  employer: group('employer', {
    ru: ['ищем сотрудника', 'требуется сотрудник', 'требуется', 'вакансия', 'набираем', 'ищем специалиста'],
    en: ['hiring', 'vacancy', 'job opening', 'we are looking for', 'seeking a candidate'],
    uzLatn: ['xodim kerak', 'ishchi kerak', 'ishga taklif qilamiz', 'vakansiya', 'mutaxassis kerak'],
    uzCyrl: ['ходим керак', 'ишчи керак', 'ишга таклиф қиламиз', 'вакансия', 'мутахассис керак'],
    kk: ['қызметкер керек', 'жұмысшы керек', 'бос жұмыс орны', 'вакансия', 'маман қажет'],
  }),
});

export const CANDIDATE_FIELD_TERMS = Object.freeze({
  name: group('name', { ru: ['имя', 'фио'], en: ['name', 'full name'], uzLatn: ['ism', 'ismi', 'fio'], uzCyrl: ['исм', 'исми', 'фио'], kk: ['аты', 'аты-жөні', 'аты жөні'] }),
  surname: group('surname', { ru: ['фамилия'], en: ['surname', 'last name'], uzLatn: ['familiya', 'familya'], uzCyrl: ['фамилия'], kk: ['тегі'] }),
  age: group('age', { ru: ['возраст', 'лет'], en: ['age', 'years old'], uzLatn: ['yosh', 'yoshi'], uzCyrl: ['ёш', 'ёши'], kk: ['жасы', 'жас'] }),
  birthYear: group('birthYear', { ru: ['год рождения', 'дата рождения'], en: ['birth year', 'date of birth'], uzLatn: ["tug'ilgan yili", 'tug‘ilgan yili', 'tugʻilgan yili'], uzCyrl: ['туғилган йили'], kk: ['туған жылы', 'туған күні'] }),
  profession: group('profession', { ru: ['должность', 'профессия', 'желаемая должность'], en: ['position', 'profession', 'desired role'], uzLatn: ['kasb', 'kasbi', 'qidirayotgan kasb', 'lavozim'], uzCyrl: ['касб', 'касби', 'қидираётган касб', 'лавозим'], kk: ['мамандық', 'лауазым', 'қалаған лауазым'] }),
  experience: group('experience', { ru: ['опыт', 'стаж', 'опыт работы'], en: ['experience', 'work experience'], uzLatn: ['tajriba', 'staj', 'ish tajribasi'], uzCyrl: ['тажриба', 'стаж', 'иш тажрибаси'], kk: ['тәжірибе', 'еңбек өтілі', 'жұмыс тәжірибесі'] }),
  skills: group('skills', { ru: ['навыки', 'технологии', 'стек'], en: ['skills', 'technologies', 'tech stack'], uzLatn: ["ko'nikmalar", 'ko‘nikmalar', 'texnologiyalar'], uzCyrl: ['кўникмалар', 'технологиялар'], kk: ['дағдылар', 'технологиялар'] }),
  education: group('education', { ru: ['образование'], en: ['education'], uzLatn: ["ta'lim", 'ta‘lim', 'taʻlim', "ma'lumoti"], uzCyrl: ['таълим', 'маълумоти'], kk: ['білімі', 'білім'] }),
  languages: group('languages', { ru: ['языки', 'знание языков'], en: ['languages'], uzLatn: ['tillar', 'til bilishi'], uzCyrl: ['тиллар', 'тил билиши'], kk: ['тілдер', 'тіл білуі'] }),
  salary: group('salary', { ru: ['зарплата', 'зп', 'ожидания по зарплате'], en: ['salary', 'compensation', 'expected salary'], uzLatn: ['maosh', 'oylik', 'ish haqi'], uzCyrl: ['маош', 'ойлик', 'иш ҳақи'], kk: ['жалақы', 'айлық', 'еңбекақы'] }),
  address: group('address', { ru: ['адрес', 'место проживания'], en: ['address', 'location'], uzLatn: ['manzil', 'yashash manzili'], uzCyrl: ['манзил', 'яшаш манзили'], kk: ['мекенжай', 'тұрғылықты жері'] }),
});

export const EMPLOYMENT_TYPES = Object.freeze([
  group('fullTime', { ru: ['полная занятость', 'полный день'], en: ['full time', 'full-time'], uzLatn: ["to'liq bandlik", 'to‘liq bandlik', "to'liq kun"], uzCyrl: ['тўлиқ бандлик', 'тўлиқ кун'], kk: ['толық жұмыс күні', 'толық жұмыспен қамту'] }),
  group('partTime', { ru: ['частичная занятость', 'неполный день', 'подработка'], en: ['part time', 'part-time'], uzLatn: ['yarim stavka', 'qisman bandlik', "qo'shimcha ish"], uzCyrl: ['ярим ставка', 'қисман бандлик', 'қўшимча иш'], kk: ['жартылай жұмыс', 'толық емес жұмыс күні', 'қосымша жұмыс'] }),
  group('contract', { ru: ['контракт', 'проектная работа'], en: ['contract', 'contractor', 'project work'], uzLatn: ['shartnoma', 'loyiha asosida'], uzCyrl: ['шартнома', 'лойиҳа асосида'], kk: ['келісімшарт', 'жобалық жұмыс'] }),
  group('internship', { ru: ['стажировка', 'интернатура'], en: ['internship', 'intern'], uzLatn: ['stajirovka', 'amaliyot'], uzCyrl: ['стажировка', 'амалиёт'], kk: ['тағылымдама', 'тәжірибеден өту'] }),
]);

export const WORK_MODES = Object.freeze([
  group('remote', { ru: ['удалённо', 'удаленно', 'удалённая работа', 'дистанционно'], en: ['remote', 'work from home', 'wfh'], uzLatn: ['masofadan', 'masofaviy', 'uydan ishlash'], uzCyrl: ['масофадан', 'масофавий', 'уйдан ишлаш'], kk: ['қашықтан', 'қашықтан жұмыс', 'үйден жұмыс'] }),
  group('hybrid', { ru: ['гибрид', 'гибридный формат'], en: ['hybrid'], uzLatn: ['gibrid'], uzCyrl: ['гибрид'], kk: ['гибрид', 'аралас формат'] }),
  group('onsite', { ru: ['офис', 'в офисе', 'на месте'], en: ['onsite', 'on-site', 'office'], uzLatn: ['ofisda', 'joyida'], uzCyrl: ['офисда', 'жойида'], kk: ['кеңседе', 'офисте', 'орнында'] }),
]);

export const SENIORITY_TERMS = Object.freeze([
  group('intern', { ru: ['стажёр', 'стажер', 'интерн'], en: ['intern', 'trainee'], uzLatn: ['stajyor', 'amaliyotchi'], uzCyrl: ['стажёр', 'амалиётчи'], kk: ['тағылымгер', 'стажер'] }),
  group('junior', { ru: ['джун', 'младший'], en: ['junior', 'jr'], uzLatn: ['junior', 'boshlangich'], uzCyrl: ['жуниор', 'бошланғич'], kk: ['junior', 'бастапқы деңгей'] }),
  group('middle', { ru: ['мидл', 'средний'], en: ['middle', 'mid-level', 'mid level'], uzLatn: ['middle', "o'rta daraja"], uzCyrl: ['мидл', 'ўрта даража'], kk: ['middle', 'орта деңгей'] }),
  group('senior', { ru: ['сеньор', 'старший', 'ведущий'], en: ['senior', 'sr', 'lead'], uzLatn: ['senior', 'yetakchi'], uzCyrl: ['сениор', 'етакчи'], kk: ['senior', 'аға', 'жетекші'] }),
]);

export const PROFESSION_TERMS = Object.freeze([
  group('software_developer', { ru: ['разработчик', 'программист', 'software developer'], en: ['software developer', 'software engineer', 'developer', 'programmer'], uzLatn: ['dasturchi', 'programmist'], uzCyrl: ['дастурчи', 'программист'], kk: ['бағдарламашы', 'әзірлеуші'] }),
  group('frontend_developer', { ru: ['фронтенд разработчик', 'frontend разработчик', 'фронтендер'], en: ['frontend developer', 'front-end developer', 'frontend engineer'], uzLatn: ['frontend dasturchi'], uzCyrl: ['фронтенд дастурчи'], kk: ['frontend әзірлеуші', 'frontend бағдарламашы'] }),
  group('backend_developer', { ru: ['бэкенд разработчик', 'backend разработчик'], en: ['backend developer', 'back-end developer', 'backend engineer'], uzLatn: ['backend dasturchi'], uzCyrl: ['бэкенд дастурчи'], kk: ['backend әзірлеуші'] }),
  group('fullstack_developer', { ru: ['фулстек разработчик', 'fullstack разработчик'], en: ['fullstack developer', 'full-stack developer'], uzLatn: ['fullstack dasturchi'], uzCyrl: ['фулстек дастурчи'], kk: ['fullstack әзірлеуші'] }),
  group('qa_engineer', { ru: ['тестировщик', 'qa инженер', 'qa'], en: ['qa engineer', 'qa tester', 'software tester'], uzLatn: ['testchi', 'qa muhandis'], uzCyrl: ['тестчи', 'qa муҳандис'], kk: ['тестілеуші', 'qa инженері'] }),
  group('designer', { ru: ['дизайнер', 'ui ux дизайнер', 'ux ui дизайнер'], en: ['designer', 'ui designer', 'ux designer', 'product designer'], uzLatn: ['dizayner'], uzCyrl: ['дизайнер'], kk: ['дизайнер'] }),
  group('product_manager', { ru: ['продакт менеджер', 'продуктовый менеджер'], en: ['product manager', 'product owner'], uzLatn: ['product menejer', 'mahsulot menejeri'], uzCyrl: ['продакт менежер', 'маҳсулот менежери'], kk: ['өнім менеджері', 'product manager'] }),
  group('project_manager', { ru: ['проектный менеджер', 'менеджер проектов'], en: ['project manager', 'pm'], uzLatn: ['loyiha menejeri'], uzCyrl: ['лойиҳа менежери'], kk: ['жоба менеджері'] }),
  group('sales_manager', { ru: ['менеджер по продажам', 'продажник'], en: ['sales manager', 'sales representative'], uzLatn: ['sotuv menejeri', 'savdo menejeri'], uzCyrl: ['сотув менежери', 'савдо менежери'], kk: ['сату менеджері', 'сауда менеджері'] }),
  group('accountant', { ru: ['бухгалтер'], en: ['accountant'], uzLatn: ['buxgalter'], uzCyrl: ['бухгалтер'], kk: ['бухгалтер', 'есепші'] }),
  group('cashier', { ru: ['кассир'], en: ['cashier'], uzLatn: ['kassir'], uzCyrl: ['кассир'], kk: ['кассир'] }),
  group('seller', { ru: ['продавец', 'продавец консультант'], en: ['seller', 'sales assistant', 'shop assistant'], uzLatn: ['sotuvchi', 'sotuvchi maslahatchi'], uzCyrl: ['сотувчи', 'сотувчи маслаҳатчи'], kk: ['сатушы', 'сатушы кеңесші'] }),
  group('driver', { ru: ['водитель', 'шофёр', 'шофер'], en: ['driver'], uzLatn: ['haydovchi'], uzCyrl: ['ҳайдовчи'], kk: ['жүргізуші'] }),
  group('courier', { ru: ['курьер'], en: ['courier', 'delivery driver'], uzLatn: ['kuryer'], uzCyrl: ['курьер'], kk: ['курьер', 'жеткізуші'] }),
  group('cook', { ru: ['повар', 'кулинар'], en: ['cook', 'chef'], uzLatn: ['oshpaz'], uzCyrl: ['ошпаз'], kk: ['аспаз'] }),
  group('cleaner', { ru: ['уборщик', 'уборщица', 'клинер'], en: ['cleaner'], uzLatn: ['farrosh', 'tozalovchi'], uzCyrl: ['фаррош', 'тозаловчи'], kk: ['тазалықшы', 'еден жуушы'] }),
  group('security_guard', { ru: ['охранник', 'сторож'], en: ['security guard', 'guard'], uzLatn: ['qorovul', 'qo‘riqchi', "qo'riqchi"], uzCyrl: ['қоровул', 'қўриқчи'], kk: ['күзетші'] }),
  group('welder', { ru: ['сварщик'], en: ['welder'], uzLatn: ['payvandchi'], uzCyrl: ['пайвандчи'], kk: ['дәнекерлеуші'] }),
  group('teacher', { ru: ['учитель', 'преподаватель'], en: ['teacher', 'tutor', 'instructor'], uzLatn: ["o'qituvchi", 'o‘qituvchi'], uzCyrl: ['ўқитувчи'], kk: ['мұғалім', 'оқытушы'] }),
  group('doctor', { ru: ['врач', 'доктор'], en: ['doctor', 'physician'], uzLatn: ['shifokor'], uzCyrl: ['шифокор'], kk: ['дәрігер'] }),
  group('nurse', { ru: ['медсестра', 'медбрат'], en: ['nurse'], uzLatn: ['hamshira'], uzCyrl: ['ҳамшира'], kk: ['медбике', 'мейіргер'] }),
  group('administrator', { ru: ['администратор'], en: ['administrator', 'admin'], uzLatn: ['administrator'], uzCyrl: ['администратор'], kk: ['әкімші', 'администратор'] }),
  group('operator', { ru: ['оператор', 'оператор колл центра'], en: ['operator', 'call center operator'], uzLatn: ['operator', 'call markaz operatori'], uzCyrl: ['оператор', 'колл марказ оператори'], kk: ['оператор', 'колл-орталық операторы'] }),
]);

export const PERSON_LINEAGE_TERMS = Object.freeze({
  female: ['qizi', 'қизи', 'кизи', 'қызы'],
  male: ["o'g'li", 'o‘g‘li', 'oʻgʻli', 'ўғли', 'угли', 'оғли', 'огли', 'ұлы'],
});
