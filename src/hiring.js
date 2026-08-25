import { lexiconEntity } from './lexicon-core.js';
const group = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, extra);

export const HIRING_INTENT = Object.freeze({
  candidate: group('candidate', {
    ru: ['ищу работу', 'ищу вакансию', 'резюме', 'рассматриваю работу', 'нужна работа'],
    en: ['looking for a job', 'seeking work', 'resume', 'cv', 'open to work'],
    uk: ['шукаю роботу', 'шукаю вакансію', 'резюме', 'розглядаю роботу', 'потрібна робота'],
    ro: ['caut de lucru', 'caut un loc de muncă', 'caut un loc de munca', 'cv', 'curriculum vitae', 'în căutarea unui loc de muncă', 'in cautarea unui loc de munca'],
    uzLatn: ['ish qidiryapman', 'ish qidiraman', 'menga ish kerak', 'ish joyi kerak', 'rezyume', 'ishga kirmoqchiman'],
    uzCyrl: ['иш қидиряпман', 'иш қидираман', 'менга иш керак', 'иш жойи керак', 'резюме', 'ишга кирмоқчиман'],
    kk: ['жұмыс іздеймін', 'жұмыс керек', 'түйіндеме', 'жұмыс қарастырып жүрмін', 'жұмысқа орналасқым келеді'],
  }),
  employer: group('employer', {
    ru: ['ищем сотрудника', 'требуется сотрудник', 'требуется', 'вакансия', 'набираем', 'ищем специалиста'],
    en: ['hiring', 'vacancy', 'job opening', 'we are looking for', 'seeking a candidate'],
    uk: ['шукаємо працівника', 'потрібен працівник', 'потрібна', 'вакансія', 'набираємо', 'шукаємо спеціаліста'],
    ro: ['angajăm', 'angajam', 'post vacant', 'loc de muncă vacant', 'loc de munca vacant', 'căutăm coleg', 'cautam coleg', 'căutăm candidat'],
    uzLatn: ['xodim kerak', 'ishchi kerak', 'ishga taklif qilamiz', 'vakansiya', 'mutaxassis kerak'],
    uzCyrl: ['ходим керак', 'ишчи керак', 'ишга таклиф қиламиз', 'вакансия', 'мутахассис керак'],
    kk: ['қызметкер керек', 'жұмысшы керек', 'бос жұмыс орны', 'вакансия', 'маман қажет'],
  }),
});

export const CANDIDATE_FIELD_TERMS = Object.freeze({
  name: group('name', { ru: ['имя', 'фио'], en: ['name', 'full name'], uk: ['ім’я', "ім'я", 'піб'], ro: ['nume', 'nume complet'], uzLatn: ['ism', 'ismi', 'fio'], uzCyrl: ['исм', 'исми', 'фио'], kk: ['аты', 'аты-жөні', 'аты жөні'] }),
  surname: group('surname', { ru: ['фамилия'], en: ['surname', 'last name'], uk: ['прізвище'], ro: ['nume de familie', 'prenume și nume'], uzLatn: ['familiya', 'familya'], uzCyrl: ['фамилия'], kk: ['тегі'] }),
  age: group('age', { ru: ['возраст', 'лет'], en: ['age', 'years old'], uk: ['вік', 'років'], ro: ['vârstă', 'varsta', 'ani'], uzLatn: ['yosh', 'yoshi'], uzCyrl: ['ёш', 'ёши'], kk: ['жасы', 'жас'] }),
  birthYear: group('birthYear', { ru: ['год рождения', 'дата рождения'], en: ['birth year', 'date of birth'], uk: ['рік народження', 'дата народження'], ro: ['anul nașterii', 'anul nasterii', 'data nașterii', 'data nasterii'], uzLatn: ["tug'ilgan yili", 'tug‘ilgan yili', 'tugʻilgan yili'], uzCyrl: ['туғилган йили'], kk: ['туған жылы', 'туған күні'] }),
  profession: group('profession', { ru: ['должность', 'профессия', 'желаемая должность'], en: ['position', 'profession', 'desired role'], uk: ['посада', 'професія', 'бажана посада'], ro: ['poziție', 'pozitie', 'profesie', 'post dorit'], uzLatn: ['kasb', 'kasbi', 'qidirayotgan kasb', 'lavozim'], uzCyrl: ['касб', 'касби', 'қидираётган касб', 'лавозим'], kk: ['мамандық', 'лауазым', 'қалаған лауазым'] }),
  experience: group('experience', { ru: ['опыт', 'стаж', 'опыт работы'], en: ['experience', 'work experience'], uk: ['досвід', 'стаж', 'досвід роботи'], ro: ['experiență', 'experienta', 'experiență de muncă', 'vechime'], uzLatn: ['tajriba', 'staj', 'ish tajribasi'], uzCyrl: ['тажриба', 'стаж', 'иш тажрибаси'], kk: ['тәжірибе', 'еңбек өтілі', 'жұмыс тәжірибесі'] }),
  skills: group('skills', { ru: ['навыки', 'умения', 'технологии', 'стек'], en: ['skills', 'competencies', 'technologies', 'tech stack'], uk: ['навички', 'вміння', 'технології', 'стек'], ro: ['competențe', 'competente', 'abilități', 'abilitati', 'tehnologii'], uzLatn: ["ko'nikmalar", 'ko‘nikmalar', 'texnologiyalar'], uzCyrl: ['кўникмалар', 'технологиялар'], kk: ['дағдылар', 'құзыреттер', 'технологиялар'] }),
  education: group('education', { ru: ['образование'], en: ['education'], uk: ['освіта'], ro: ['studii', 'educație', 'educatie'], uzLatn: ["ta'lim", 'ta‘lim', 'taʻlim', "ma'lumoti"], uzCyrl: ['таълим', 'маълумоти'], kk: ['білімі', 'білім'] }),
  languages: group('languages', { ru: ['языки', 'знание языков'], en: ['languages', 'language skills'], uk: ['мови', 'знання мов'], ro: ['limbi', 'limbi cunoscute', 'cunoștințe lingvistice'], uzLatn: ['tillar', 'til bilishi'], uzCyrl: ['тиллар', 'тил билиши'], kk: ['тілдер', 'тіл білуі'] }),
  salary: group('salary', { ru: ['зарплата', 'зп', 'ожидания по зарплате'], en: ['salary', 'compensation', 'expected salary'], uk: ['зарплата', 'зп', 'очікувана зарплата'], ro: ['salariu', 'salariul dorit', 'așteptări salariale', 'asteptari salariale'], uzLatn: ['maosh', 'oylik', 'ish haqi'], uzCyrl: ['маош', 'ойлик', 'иш ҳақи'], kk: ['жалақы', 'айлық', 'еңбекақы'] }),
  address: group('address', { ru: ['адрес', 'место проживания'], en: ['address', 'location'], uk: ['адреса', 'місце проживання'], ro: ['adresă', 'adresa', 'domiciliu', 'locație'], uzLatn: ['manzil', 'yashash manzili'], uzCyrl: ['манзил', 'яшаш манзили'], kk: ['мекенжай', 'тұрғылықты жері'] }),
  city: group('city', { ru: ['город'], en: ['city'], uk: ['місто'], ro: ['oraș', 'oras'], uzLatn: ['shahar', 'shahri'], uzCyrl: ['шаҳар', 'шаҳри'], kk: ['қала'] }),
  district: group('district', { ru: ['район'], en: ['district'], uk: ['район'], ro: ['sector', 'cartier'], uzLatn: ['tuman', 'tumani'], uzCyrl: ['туман', 'тумани'], kk: ['аудан'] }),
  contact: group('contact', { ru: ['контакты', 'телефон', 'связь'], en: ['contact', 'phone', 'contact details'], uk: ['контакти', 'телефон', 'зв’язок'], ro: ['contact', 'telefon', 'date de contact'], uzLatn: ['aloqa', 'telefon', 'boglanish'], uzCyrl: ['алоқа', 'телефон', 'боғланиш'], kk: ['байланыс', 'телефон'] }),
  employmentType: group('employmentType', { ru: ['занятость', 'тип занятости'], en: ['employment type', 'job type'], uk: ['зайнятість', 'тип зайнятості'], ro: ['tip angajare', 'tip de muncă', 'tip de munca'], uzLatn: ['bandlik turi', 'ish turi'], uzCyrl: ['бандлик тури', 'иш тури'], kk: ['жұмыс түрі', 'жұмыспен қамту түрі'] }),
  workMode: group('workMode', { ru: ['формат работы', 'режим работы'], en: ['work mode', 'workplace type'], uk: ['формат роботи', 'режим роботи'], ro: ['mod de lucru', 'format de lucru'], uzLatn: ['ish formati', 'ish rejimi'], uzCyrl: ['иш формати', 'иш режими'], kk: ['жұмыс форматы', 'жұмыс режимі'] }),
  schedule: group('schedule', { ru: ['график', 'график работы'], en: ['schedule', 'work schedule'], uk: ['графік', 'графік роботи'], ro: ['program', 'program de lucru'], uzLatn: ['grafik', 'ish grafigi'], uzCyrl: ['график', 'иш графиги'], kk: ['жұмыс кестесі', 'кесте'] }),
  relocation: group('relocation', { ru: ['релокация', 'готов к переезду', 'переезд'], en: ['relocation', 'willing to relocate'], uk: ['релокація', 'готовий до переїзду', 'переїзд'], ro: ['relocare', 'dispus să se relocheze', 'dispus sa se relocheze'], uzLatn: ['kochib otishga tayyor', "ko'chib o'tishga tayyor"], uzCyrl: ['кўчиб ўтишга тайёр'], kk: ['көшуге дайын', 'релокация'] }),
  citizenship: group('citizenship', { ru: ['гражданство'], en: ['citizenship', 'nationality'], uk: ['громадянство'], ro: ['cetățenie', 'cetatenie', 'naționalitate', 'nationalitate'], uzLatn: ['fuqarolik'], uzCyrl: ['фуқаролик'], kk: ['азаматтық'] }),
  driversLicense: group('driversLicense', { ru: ['водительские права', 'права категории'], en: ["driver's license", 'driving licence', 'driving license'], uk: ['водійські права', 'права категорії'], ro: ['permis de conducere', 'categoria permisului'], uzLatn: ['haydovchilik guvohnomasi', 'prava kategoriya'], uzCyrl: ['ҳайдовчилик гувоҳномаси'], kk: ['жүргізуші куәлігі'] }),
});

export const JOB_FIELD_TERMS = Object.freeze({
  title: group('title', { ru: ['вакансия', 'должность'], en: ['job title', 'position', 'role'], uk: ['вакансія', 'посада'], ro: ['post', 'poziție', 'pozitie', 'funcție', 'functie'], uzLatn: ['vakansiya', 'lavozim'], uzCyrl: ['вакансия', 'лавозим'], kk: ['бос жұмыс орны', 'лауазым'] }),
  responsibilities: group('responsibilities', { ru: ['обязанности', 'задачи'], en: ['responsibilities', 'duties', 'what you will do'], uk: ['обов’язки', "обов'язки", 'завдання'], ro: ['responsabilități', 'responsabilitati', 'atribuții', 'atributii'], uzLatn: ['vazifalar', 'majburiyatlar'], uzCyrl: ['вазифалар', 'мажбуриятлар'], kk: ['міндеттер', 'тапсырмалар'] }),
  requirements: group('requirements', { ru: ['требования', 'кандидат должен'], en: ['requirements', 'qualifications', 'you should have'], uk: ['вимоги', 'кандидат повинен'], ro: ['cerințe', 'cerinte', 'calificări', 'calificari'], uzLatn: ['talablar', 'nomzoddan talab'], uzCyrl: ['талаблар', 'номзоддан талаб'], kk: ['талаптар', 'біліктілік'] }),
  skills: CANDIDATE_FIELD_TERMS.skills,
  salary: CANDIDATE_FIELD_TERMS.salary,
  benefits: group('benefits', { ru: ['условия', 'бонусы', 'льготы', 'бенефиты'], en: ['benefits', 'perks', 'what we offer'], uk: ['умови', 'бонуси', 'переваги'], ro: ['beneficii', 'ce oferim', 'avantaje'], uzLatn: ['sharoitlar', 'imtiyozlar', 'biz taklif qilamiz'], uzCyrl: ['шароитлар', 'имтиёзлар', 'биз таклиф қиламиз'], kk: ['шарттар', 'жеңілдіктер', 'біз ұсынамыз'] }),
  probation: group('probation', { ru: ['испытательный срок'], en: ['probation', 'probation period'], uk: ['випробувальний термін', 'випробувальний строк'], ro: ['perioadă de probă', 'perioada de proba'], uzLatn: ['sinov muddati'], uzCyrl: ['синов муддати'], kk: ['сынақ мерзімі'] }),
  experience: CANDIDATE_FIELD_TERMS.experience,
  employmentType: CANDIDATE_FIELD_TERMS.employmentType,
  workMode: CANDIDATE_FIELD_TERMS.workMode,
  schedule: CANDIDATE_FIELD_TERMS.schedule,
  location: CANDIDATE_FIELD_TERMS.address,
});

export const EMPLOYMENT_TYPES = Object.freeze([
  group('fullTime', {
    ru: ['полная занятость', 'полный день', 'полный рабочий день'], en: ['full time', 'full-time', 'full time employment'], uk: ['повна зайнятість', 'повний день', 'повний робочий день'], ro: ['normă întreagă', 'norma intreaga', 'full-time', 'program complet'],
    uzLatn: ["to'liq bandlik", 'to‘liq bandlik', "to'liq kun", 'toliq ish kuni'], uzCyrl: ['тўлиқ бандлик', 'тўлиқ кун', 'тўлиқ иш куни'], kk: ['толық жұмыс күні', 'толық жұмыспен қамту'],
  }),
  group('partTime', {
    ru: ['частичная занятость', 'неполная занятость', 'неполный день', 'неполный рабочий день', 'подработка'], en: ['part time', 'part-time', 'part time employment'], uk: ['часткова зайнятість', 'неповний день', 'підробіток'], ro: ['part-time', 'jumătate de normă', 'jumatate de norma', 'program parțial', 'program partial'],
    uzLatn: ['yarim stavka', 'qisman bandlik', "qo'shimcha ish"], uzCyrl: ['ярим ставка', 'қисман бандлик', 'қўшимча иш'], kk: ['жартылай жұмыс', 'толық емес жұмыс күні', 'қосымша жұмыс'],
  }),
  group('contract', {
    ru: ['контракт', 'по договору', 'договорная работа'], en: ['contract', 'contractor', 'fixed contract'], uk: ['контракт', 'за договором', 'договірна робота'], ro: ['contract', 'pe contract', 'contract determinat'],
    uzLatn: ['shartnoma', 'shartnoma asosida'], uzCyrl: ['шартнома', 'шартнома асосида'], kk: ['келісімшарт', 'келісімшарт бойынша'],
  }),
  group('project', {
    ru: ['проектная работа', 'на проект', 'проектная занятость'], en: ['project work', 'project-based', 'project based'], uk: ['проєктна робота', 'проектна робота', 'на проєкт'], ro: ['muncă pe proiect', 'munca pe proiect', 'bazat pe proiect'],
    uzLatn: ['loyiha asosida', 'loyiha ishi'], uzCyrl: ['лойиҳа асосида', 'лойиҳа иши'], kk: ['жобалық жұмыс', 'жоба бойынша'],
  }),
  group('freelance', {
    ru: ['фриланс', 'фрилансер'], en: ['freelance', 'freelancer'], uk: ['фриланс', 'фрилансер'], ro: ['freelance', 'freelancer'], uzLatn: ['frilans', 'freelancer'], uzCyrl: ['фриланс'], kk: ['фриланс', 'фрилансер'],
  }),
  group('temporary', {
    ru: ['временная работа', 'временная занятость'], en: ['temporary', 'temporary work', 'temp job'], uk: ['тимчасова робота', 'тимчасова зайнятість'], ro: ['muncă temporară', 'munca temporara', 'temporar'], uzLatn: ['vaqtinchalik ish'], uzCyrl: ['вақтинчалик иш'], kk: ['уақытша жұмыс'],
  }),
  group('internship', {
    ru: ['стажировка', 'интернатура'], en: ['internship', 'intern', 'traineeship'], uk: ['стажування', 'інтернатура'], ro: ['stagiu', 'internship', 'practică', 'practica'], uzLatn: ['stajirovka', 'amaliyot'], uzCyrl: ['стажировка', 'амалиёт'], kk: ['тағылымдама', 'тәжірибеден өту'],
  }),
  group('volunteer', {
    ru: ['волонтёрство', 'волонтерство', 'волонтёр', 'волонтер'], en: ['volunteer', 'volunteering', 'voluntary work'], uk: ['волонтерство', 'волонтер', 'волонтерська робота'], ro: ['voluntariat', 'voluntar', 'muncă voluntară', 'munca voluntara'], uzLatn: ['volontyorlik', 'ko‘ngilli ish', "ko'ngilli ish"], uzCyrl: ['волонтёрлик', 'кўнгилли иш'], kk: ['еріктілік', 'ерікті жұмыс'],
  }),
  group('seasonal', {
    ru: ['сезонная работа'], en: ['seasonal', 'seasonal work'], uk: ['сезонна робота'], ro: ['muncă sezonieră', 'munca sezoniera'], uzLatn: ['mavsumiy ish'], uzCyrl: ['мавсумий иш'], kk: ['маусымдық жұмыс'],
  }),
]);

export const WORK_MODES = Object.freeze([
  group('remote', { ru: ['удалённо', 'удаленно', 'удалённая работа', 'дистанционно'], en: ['remote', 'work from home', 'wfh'], uk: ['віддалено', 'дистанційно', 'віддалена робота'], ro: ['remote', 'de acasă', 'de acasa', 'muncă la distanță', 'munca la distanta'], uzLatn: ['masofadan', 'masofaviy', 'uydan ishlash'], uzCyrl: ['масофадан', 'масофавий', 'уйдан ишлаш'], kk: ['қашықтан', 'қашықтан жұмыс', 'үйден жұмыс'] }),
  group('hybrid', { ru: ['гибрид', 'гибридный формат'], en: ['hybrid', 'hybrid work'], uk: ['гібрид', 'гібридний формат'], ro: ['hibrid', 'mod hibrid'], uzLatn: ['gibrid'], uzCyrl: ['гибрид'], kk: ['гибрид', 'аралас формат'] }),
  group('onsite', { ru: ['офис', 'в офисе', 'на месте', 'очно'], en: ['onsite', 'on-site', 'office', 'in person'], uk: ['офіс', 'в офісі', 'на місці'], ro: ['la birou', 'on-site', 'la sediu', 'fizic'], uzLatn: ['ofisda', 'joyida'], uzCyrl: ['офисда', 'жойида'], kk: ['кеңседе', 'офисте', 'орнында'] }),
]);

export const SCHEDULE_TERMS = Object.freeze([
  group('fiveTwo', { ru: ['5/2', '5 на 2', 'пятидневка'], en: ['5/2', 'five days a week', 'monday to friday'], uk: ['5/2', 'п’ятиденка', "п'ятиденка"], ro: ['5/2', 'luni-vineri', 'luni până vineri'], uzLatn: ['5/2', 'besh kunlik'], uzCyrl: ['5/2', 'беш кунлик'], kk: ['5/2', 'бес күндік'] }),
  group('twoTwo', { ru: ['2/2', 'два через два'], en: ['2/2', 'two on two off'], uk: ['2/2', 'два через два'], ro: ['2/2', 'două zile cu două libere', 'doua zile cu doua libere'], uzLatn: ['2/2', 'ikki kun ikki kun'], uzCyrl: ['2/2', 'икки кун икки кун'], kk: ['2/2', 'екі күн жұмыс екі күн демалыс'] }),
  group('shift', { ru: ['сменный график', 'по сменам', 'смены'], en: ['shift work', 'shifts', 'rotating shifts'], uk: ['змінний графік', 'позмінно', 'зміни'], ro: ['în ture', 'in ture', 'program în schimburi', 'program in schimburi'], uzLatn: ['smenali grafik', 'smena'], uzCyrl: ['сменали график', 'смена'], kk: ['ауысымдық кесте', 'ауысым'] }),
  group('flexible', { ru: ['гибкий график', 'свободный график'], en: ['flexible schedule', 'flexible hours'], uk: ['гнучкий графік', 'вільний графік'], ro: ['program flexibil', 'ore flexibile'], uzLatn: ['moslashuvchan grafik', 'erkin grafik'], uzCyrl: ['мослашувчан график', 'эркин график'], kk: ['икемді кесте', 'еркін кесте'] }),
  group('day', { ru: ['дневная смена', 'дневной график'], en: ['day shift'], uk: ['денна зміна'], ro: ['tură de zi', 'tura de zi'], uzLatn: ['kunduzgi smena'], uzCyrl: ['кундузги смена'], kk: ['күндізгі ауысым'] }),
  group('night', { ru: ['ночная смена', 'ночной график'], en: ['night shift'], uk: ['нічна зміна'], ro: ['tură de noapte', 'tura de noapte'], uzLatn: ['tungi smena'], uzCyrl: ['тунги смена'], kk: ['түнгі ауысым'] }),
  group('rotational', { ru: ['вахта', 'вахтовый метод'], en: ['rotational work', 'rotation', 'fly-in fly-out'], uk: ['вахта', 'вахтовий метод'], ro: ['muncă în rotație', 'munca in rotatie'], uzLatn: ['vaxta', 'vaxta usuli'], uzCyrl: ['вахта', 'вахта усули'], kk: ['вахта', 'вахталық әдіс'] }),
]);

export const PROBATION_TERMS = Object.freeze({
  probation: group('probation', { ru: ['испытательный срок', 'испыталка'], en: ['probation', 'probation period', 'trial period'], uk: ['випробувальний термін', 'випробувальний строк'], ro: ['perioadă de probă', 'perioada de proba'], uzLatn: ['sinov muddati'], uzCyrl: ['синов муддати'], kk: ['сынақ мерзімі'] }),
  noProbation: group('noProbation', { ru: ['без испытательного срока'], en: ['no probation', 'no trial period'], uk: ['без випробувального терміну'], ro: ['fără perioadă de probă', 'fara perioada de proba'], uzLatn: ['sinov muddatizsiz', 'sinov muddati yoq'], uzCyrl: ['синов муддатисиз', 'синов муддати йўқ'], kk: ['сынақ мерзімінсіз'] }),
  paid: group('paidProbation', { ru: ['оплачиваемый испытательный срок', 'испытательный срок оплачивается'], en: ['paid probation', 'paid trial period'], uk: ['оплачуваний випробувальний термін'], ro: ['perioadă de probă plătită', 'perioada de proba platita'], uzLatn: ['sinov muddati tolanadi', "sinov muddati to'lanadi"], uzCyrl: ['синов муддати тўланади'], kk: ['ақылы сынақ мерзімі'] }),
  unpaid: group('unpaidProbation', { ru: ['неоплачиваемый испытательный срок'], en: ['unpaid probation', 'unpaid trial period'], uk: ['неоплачуваний випробувальний термін'], ro: ['perioadă de probă neplătită', 'perioada de proba neplatita'], uzLatn: ['sinov muddati tolanmaydi', "sinov muddati to'lanmaydi"], uzCyrl: ['синов муддати тўланмайди'], kk: ['ақысыз сынақ мерзімі'] }),
});

export const EXPERIENCE_REQUIREMENTS = Object.freeze({
  noExperience: group('noExperience', { ru: ['без опыта', 'опыт не требуется'], en: ['no experience', 'experience not required', 'entry level'], uk: ['без досвіду', 'досвід не потрібен'], ro: ['fără experiență', 'fara experienta', 'experiența nu este necesară', 'experienta nu este necesara'], uzLatn: ['tajribasiz', 'tajriba shart emas'], uzCyrl: ['тажрибасиз', 'тажриба шарт эмас'], kk: ['тәжірибесіз', 'тәжірибе қажет емес'] }),
  required: group('experienceRequired', { ru: ['опыт обязателен', 'требуется опыт'], en: ['experience required', 'must have experience'], uk: ['досвід обов’язковий', "досвід обов'язковий", 'потрібен досвід'], ro: ['experiență necesară', 'experienta necesara', 'experiență obligatorie'], uzLatn: ['tajriba talab qilinadi', 'tajriba kerak'], uzCyrl: ['тажриба талаб қилинади', 'тажриба керак'], kk: ['тәжірибе қажет', 'тәжірибе міндетті'] }),
});

/** Field/requirement vocabulary only. Canonical technology names remain owned by the consumer skill catalog. */
export const SKILL_FIELD_TERMS = Object.freeze({
  technical: group('technicalSkills', { ru: ['технические навыки', 'hard skills'], en: ['technical skills', 'hard skills', 'tech stack'], uk: ['технічні навички', 'hard skills'], ro: ['competențe tehnice', 'competente tehnice', 'hard skills'], uzLatn: ['texnik konikmalar', "texnik ko'nikmalar", 'texnologiyalar'], uzCyrl: ['техник кўникмалар', 'технологиялар'], kk: ['техникалық дағдылар', 'технологиялар'] }),
  soft: group('softSkills', { ru: ['гибкие навыки', 'soft skills', 'личные качества'], en: ['soft skills', 'personal qualities'], uk: ['м’які навички', "м'які навички", 'особисті якості'], ro: ['abilități soft', 'abilitati soft', 'calități personale', 'calitati personale'], uzLatn: ['shaxsiy fazilatlar', 'yumshoq konikmalar'], uzCyrl: ['шахсий фазилатлар', 'юмшоқ кўникмалар'], kk: ['жұмсақ дағдылар', 'жеке қасиеттер'] }),
  language: CANDIDATE_FIELD_TERMS.languages,
  tools: group('tools', { ru: ['инструменты', 'программы'], en: ['tools', 'software'], uk: ['інструменти', 'програми'], ro: ['instrumente', 'programe', 'software'], uzLatn: ['vositalar', 'dasturlar'], uzCyrl: ['воситалар', 'дастурлар'], kk: ['құралдар', 'бағдарламалар'] }),
});

export const BENEFIT_TERMS = Object.freeze({
  meals: group('meals', { ru: ['питание', 'обеды', 'бесплатное питание'], en: ['meals', 'lunch', 'free meals'], uk: ['харчування', 'обіди', 'безкоштовне харчування'], ro: ['masă', 'masa', 'prânz', 'pranz', 'tichete de masă', 'bonuri de masă'], uzLatn: ['ovqat', 'tushlik', 'bepul ovqat'], uzCyrl: ['овқат', 'тушлик', 'бепул овқат'], kk: ['тамақ', 'түскі ас', 'тегін тамақ'] }),
  transportation: group('transportation', { ru: ['развозка', 'служебный транспорт'], en: ['transportation', 'company transport', 'shuttle'], uk: ['розвозка', 'службовий транспорт'], ro: ['transport asigurat', 'transport de serviciu'], uzLatn: ['razvozka', 'xizmat transporti'], uzCyrl: ['развозка', 'хизмат транспорти'], kk: ['қызметтік көлік', 'тасымал'] }),
  accommodation: group('accommodation', { ru: ['проживание', 'жильё предоставляется', 'жилье предоставляется'], en: ['accommodation', 'housing provided'], uk: ['проживання', 'житло надається'], ro: ['cazare', 'cazare asigurată', 'cazare asigurata'], uzLatn: ['yotoq joy', 'turar joy beriladi'], uzCyrl: ['ётоқ жой', 'турар жой берилади'], kk: ['тұратын орын', 'баспана беріледі'] }),
  insurance: group('insurance', { ru: ['медицинская страховка', 'дмс'], en: ['health insurance', 'medical insurance'], uk: ['медичне страхування'], ro: ['asigurare medicală', 'asigurare medicala'], uzLatn: ['tibbiy sugurta', "tibbiy sug'urta"], uzCyrl: ['тиббий суғурта'], kk: ['медициналық сақтандыру'] }),
  training: group('training', { ru: ['обучение за счет компании', 'обучение предоставляется'], en: ['training provided', 'company-paid training'], uk: ['навчання за рахунок компанії'], ro: ['training oferit', 'cursuri plătite de companie', 'cursuri platite de companie'], uzLatn: ['oqitish', "o'qitish", 'kompaniya hisobidan talim'], uzCyrl: ['ўқитиш', 'компания ҳисобидан таълим'], kk: ['оқыту', 'компания есебінен оқу'] }),
  bonus: group('bonus', { ru: ['бонус', 'премия', 'kpi бонус'], en: ['bonus', 'performance bonus'], uk: ['бонус', 'премія'], ro: ['bonus', 'primă', 'prima'], uzLatn: ['bonus', 'mukofot'], uzCyrl: ['бонус', 'мукофот'], kk: ['бонус', 'сыйақы'] }),
  equipment: group('equipment', { ru: ['техника предоставляется', 'ноутбук предоставляется', 'оборудование предоставляется'], en: ['equipment provided', 'laptop provided'], uk: ['техніка надається', 'ноутбук надається'], ro: ['echipament oferit', 'laptop oferit'], uzLatn: ['texnika beriladi', 'noutbuk beriladi'], uzCyrl: ['техника берилади', 'ноутбук берилади'], kk: ['техника беріледі', 'ноутбук беріледі'] }),
});

export const SENIORITY_TERMS = Object.freeze([
  group('intern', { ru: ['стажёр', 'стажер', 'интерн'], en: ['intern', 'trainee'], uk: ['стажер', 'інтерн'], ro: ['intern', 'stagiar'], uzLatn: ['stajyor', 'amaliyotchi'], uzCyrl: ['стажёр', 'амалиётчи'], kk: ['тағылымгер', 'стажер'] }),
  group('junior', { ru: ['джун', 'джуниор', 'младший'], en: ['junior', 'jr'], uk: ['джуніор', 'молодший'], ro: ['junior', 'începător', 'incepator'], uzLatn: ['junior', 'boshlangich'], uzCyrl: ['жуниор', 'бошланғич'], kk: ['junior', 'бастапқы деңгей'] }),
  group('middle', { ru: ['мидл', 'средний'], en: ['middle', 'mid-level', 'mid level'], uk: ['мідл', 'середній рівень'], ro: ['middle', 'mid-level', 'nivel mediu'], uzLatn: ['middle', "o'rta daraja"], uzCyrl: ['мидл', 'ўрта даража'], kk: ['middle', 'орта деңгей'] }),
  group('senior', { ru: ['сеньор', 'синьор', 'старший', 'ведущий'], en: ['senior', 'sr'], uk: ['сеньйор', 'старший', 'провідний'], ro: ['senior'], uzLatn: ['senior', 'katta mutaxassis'], uzCyrl: ['сениор', 'катта мутахассис'], kk: ['senior', 'аға'] }),
  group('lead', { ru: ['лид', 'тимлид', 'руководитель'], en: ['lead', 'team lead', 'tech lead'], uk: ['лід', 'тімлід', 'керівник'], ro: ['lead', 'team lead', 'lider de echipă', 'lider de echipa'], uzLatn: ['lead', 'team lead', 'yetakchi'], uzCyrl: ['лид', 'етакчи'], kk: ['lead', 'жетекші'] }),
]);

export const PROFESSION_TERMS = Object.freeze([
  group('software_developer', { ru: ['разработчик', 'программист'], en: ['software developer', 'software engineer', 'developer', 'programmer'], uk: ['розробник', 'програміст'], ro: ['dezvoltator software', 'programator', 'inginer software'], uzLatn: ['dasturchi', 'programmist'], uzCyrl: ['дастурчи', 'программист'], kk: ['бағдарламашы', 'әзірлеуші'] }),
  group('frontend_developer', { ru: ['фронтенд разработчик', 'frontend разработчик', 'фронтендер'], en: ['frontend developer', 'front-end developer', 'frontend engineer'], uk: ['фронтенд розробник', 'frontend розробник'], ro: ['frontend developer', 'dezvoltator frontend'], uzLatn: ['frontend dasturchi'], uzCyrl: ['фронтенд дастурчи'], kk: ['frontend әзірлеуші', 'frontend бағдарламашы'] }),
  group('backend_developer', { ru: ['бэкенд разработчик', 'backend разработчик'], en: ['backend developer', 'back-end developer', 'backend engineer'], uk: ['бекенд розробник', 'backend розробник'], ro: ['backend developer', 'dezvoltator backend'], uzLatn: ['backend dasturchi'], uzCyrl: ['бэкенд дастурчи'], kk: ['backend әзірлеуші'] }),
  group('fullstack_developer', { ru: ['фулстек разработчик', 'fullstack разработчик'], en: ['fullstack developer', 'full-stack developer'], uk: ['фулстек розробник', 'fullstack розробник'], ro: ['fullstack developer', 'dezvoltator full-stack'], uzLatn: ['fullstack dasturchi'], uzCyrl: ['фулстек дастурчи'], kk: ['fullstack әзірлеуші'] }),
  group('qa_engineer', { ru: ['тестировщик', 'qa инженер', 'qa'], en: ['qa engineer', 'qa tester', 'software tester'], uk: ['тестувальник', 'qa інженер'], ro: ['inginer qa', 'tester software', 'qa tester'], uzLatn: ['testchi', 'qa muhandis'], uzCyrl: ['тестчи', 'qa муҳандис'], kk: ['тестілеуші', 'qa инженері'] }),
  group('designer', { ru: ['дизайнер', 'ui ux дизайнер', 'ux ui дизайнер'], en: ['designer', 'ui designer', 'ux designer', 'product designer'], uk: ['дизайнер', 'ui ux дизайнер'], ro: ['designer', 'designer ui', 'designer ux'], uzLatn: ['dizayner'], uzCyrl: ['дизайнер'], kk: ['дизайнер'] }),
  group('product_manager', { ru: ['продакт менеджер', 'продуктовый менеджер'], en: ['product manager', 'product owner'], uk: ['продакт менеджер', 'продуктовий менеджер'], ro: ['product manager', 'manager de produs'], uzLatn: ['product menejer', 'mahsulot menejeri'], uzCyrl: ['продакт менежер', 'маҳсулот менежери'], kk: ['өнім менеджері', 'product manager'] }),
  group('project_manager', { ru: ['проектный менеджер', 'менеджер проектов'], en: ['project manager', 'pm'], uk: ['проєктний менеджер', 'менеджер проєктів'], ro: ['project manager', 'manager de proiect'], uzLatn: ['loyiha menejeri'], uzCyrl: ['лойиҳа менежери'], kk: ['жоба менеджері'] }),
  group('sales_manager', { ru: ['менеджер по продажам', 'продажник'], en: ['sales manager', 'sales representative'], uk: ['менеджер з продажу', 'менеджер з продажів'], ro: ['manager vânzări', 'manager vanzari', 'reprezentant vânzări'], uzLatn: ['sotuv menejeri', 'savdo menejeri'], uzCyrl: ['сотув менежери', 'савдо менежери'], kk: ['сату менеджері', 'сауда менеджері'] }),
  group('accountant', { ru: ['бухгалтер'], en: ['accountant'], uk: ['бухгалтер'], ro: ['contabil'], uzLatn: ['buxgalter'], uzCyrl: ['бухгалтер'], kk: ['бухгалтер', 'есепші'] }),
  group('cashier', { ru: ['кассир'], en: ['cashier'], uk: ['касир'], ro: ['casier'], uzLatn: ['kassir'], uzCyrl: ['кассир'], kk: ['кассир'] }),
  group('seller', { ru: ['продавец', 'продавец консультант'], en: ['seller', 'sales assistant', 'shop assistant'], uk: ['продавець', 'продавець-консультант'], ro: ['vânzător', 'vanzator', 'consilier vânzări'], uzLatn: ['sotuvchi', 'sotuvchi maslahatchi'], uzCyrl: ['сотувчи', 'сотувчи маслаҳатчи'], kk: ['сатушы', 'сатушы кеңесші'] }),
  group('driver', { ru: ['водитель', 'шофёр', 'шофер'], en: ['driver'], uk: ['водій'], ro: ['șofer', 'sofer', 'conducător auto'], uzLatn: ['haydovchi'], uzCyrl: ['ҳайдовчи'], kk: ['жүргізуші'] }),
  group('courier', { ru: ['курьер'], en: ['courier', 'delivery driver'], uk: ['кур’єр', "кур'єр"], ro: ['curier'], uzLatn: ['kuryer'], uzCyrl: ['курьер'], kk: ['курьер', 'жеткізуші'] }),
  group('cook', { ru: ['повар', 'кулинар'], en: ['cook', 'chef'], uk: ['кухар', 'шеф-кухар'], ro: ['bucătar', 'bucatar', 'chef'], uzLatn: ['oshpaz'], uzCyrl: ['ошпаз'], kk: ['аспаз'] }),
  group('cleaner', { ru: ['уборщик', 'уборщица', 'клинер'], en: ['cleaner'], uk: ['прибиральник', 'прибиральниця', 'клінер'], ro: ['personal curățenie', 'personal curatenie', 'menajeră', 'menajera'], uzLatn: ['farrosh', 'tozalovchi'], uzCyrl: ['фаррош', 'тозаловчи'], kk: ['тазалықшы', 'еден жуушы'] }),
  group('security_guard', { ru: ['охранник', 'сторож'], en: ['security guard', 'guard'], uk: ['охоронець', 'сторож'], ro: ['agent de pază', 'agent de paza', 'paznic'], uzLatn: ['qorovul', 'qo‘riqchi', "qo'riqchi"], uzCyrl: ['қоровул', 'қўриқчи'], kk: ['күзетші'] }),
  group('welder', { ru: ['сварщик'], en: ['welder'], uk: ['зварювальник'], ro: ['sudor'], uzLatn: ['payvandchi'], uzCyrl: ['пайвандчи'], kk: ['дәнекерлеуші'] }),
  group('teacher', { ru: ['учитель', 'преподаватель'], en: ['teacher', 'tutor', 'instructor'], uk: ['вчитель', 'викладач'], ro: ['profesor', 'învățător', 'invatator'], uzLatn: ["o'qituvchi", 'o‘qituvchi'], uzCyrl: ['ўқитувчи'], kk: ['мұғалім', 'оқытушы'] }),
  group('doctor', { ru: ['врач', 'доктор'], en: ['doctor', 'physician'], uk: ['лікар', 'доктор'], ro: ['medic', 'doctor'], uzLatn: ['shifokor'], uzCyrl: ['шифокор'], kk: ['дәрігер'] }),
  group('nurse', { ru: ['медсестра', 'медбрат'], en: ['nurse'], uk: ['медсестра', 'медбрат', 'медична сестра'], ro: ['asistent medical', 'asistentă medicală', 'asistenta medicala'], uzLatn: ['hamshira'], uzCyrl: ['ҳамшира'], kk: ['медбике', 'мейіргер'] }),
  group('administrator', { ru: ['администратор'], en: ['administrator', 'admin'], uk: ['адміністратор'], ro: ['administrator'], uzLatn: ['administrator'], uzCyrl: ['администратор'], kk: ['әкімші', 'администратор'] }),
  group('operator', { ru: ['оператор', 'оператор колл центра'], en: ['operator', 'call center operator'], uk: ['оператор', 'оператор кол-центру'], ro: ['operator', 'operator call center'], uzLatn: ['operator', 'call markaz operatori'], uzCyrl: ['оператор', 'колл марказ оператори'], kk: ['оператор', 'колл-орталық операторы'] }),
]);

export const PERSON_LINEAGE_TERMS = Object.freeze({
  female: ['qizi', 'қизи', 'кизи', 'қызы'],
  male: ["o'g'li", 'o‘g‘li', 'oʻgʻli', 'ўғли', 'угли', 'оғли', 'огли', 'ұлы'],
});
