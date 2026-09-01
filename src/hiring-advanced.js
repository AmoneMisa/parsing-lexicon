import { aliasesToRegex, findCanonical, normalizeUnicode } from './normalization.js';
import { HIRING_INTENT, JOB_FIELD_TERMS } from './hiring.js';
import { lexiconEntity } from './lexicon-core.js';

const group = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, extra);

export const HIRING_INTENT_EXTENSIONS = Object.freeze({
  candidate: group('candidate', {
    ru: ['рассмотрю предложения', 'в поиске работы', 'ищу подработку', 'готов выйти на работу', 'ищу удаленку', 'ищу удалёнку'],
    en: ['looking for opportunities', 'available for work', 'open for opportunities', 'seeking opportunities'],
    uk: ['розгляну пропозиції', 'у пошуку роботи', 'шукаю підробіток', 'готовий вийти на роботу'],
    ro: ['caut oportunități', 'caut oportunitati', 'disponibil pentru muncă', 'disponibil pentru munca'],
    uzLatn: ['ish izlayapman', 'ish takliflarini korib chiqaman', "ish takliflarini ko'rib chiqaman", 'qoshimcha ish qidiraman'],
    uzCyrl: ['иш излаяпман', 'иш таклифларини кўриб чиқаман', 'қўшимча иш қидираман'],
    kk: ['жұмыс ұсыныстарын қараймын', 'жұмыс іздеп жүрмін', 'қосымша жұмыс іздеймін'],
  }),
  employer: group('employer', {
    ru: ['есть работа', 'набор персонала', 'ищем в команду', 'расширяем команду', 'открыта позиция', 'открыта вакансия', 'приглашаем на работу', 'в нашу команду нужен', 'в команду требуется', '#вакансия'],
    en: ['join our team', 'open position', 'open role', 'we are hiring', 'now hiring', 'hiring now', 'join the team'],
    uk: ['є робота', 'набір персоналу', 'шукаємо в команду', 'відкрита позиція', 'відкрита вакансія', 'запрошуємо на роботу'],
    ro: ['angajări', 'angajari', 'recrutăm', 'recrutam', 'poziție deschisă', 'pozitie deschisa', 'alătură-te echipei', 'alatura-te echipei'],
    uzLatn: ['ishga qabul qilamiz', 'jamoaga taklif qilamiz', 'jamoamizga xodim kerak', 'ochiq vakansiya', 'ishga olamiz'],
    uzCyrl: ['ишга қабул қиламиз', 'жамоага таклиф қиламиз', 'жамоамизга ходим керак', 'очиқ вакансия', 'ишга оламиз'],
    kk: ['жұмысқа қабылдаймыз', 'командаға қызметкер іздейміз', 'ашық вакансия', 'жұмысқа шақырамыз'],
  }),
});

export const HIRING_NEGATIVE_INTENT = Object.freeze([
  group('closed', {
    ru: ['вакансия закрыта', 'позиция закрыта', 'набор закрыт', 'уже нашли сотрудника', 'сотрудник найден', 'не актуально', 'вакансия не актуальна'],
    en: ['position closed', 'vacancy closed', 'role filled', 'no longer hiring', 'position filled'],
    uk: ['вакансія закрита', 'позиція закрита', 'набір закрито', 'вже знайшли працівника', 'не актуально'],
    ro: ['post ocupat', 'poziție închisă', 'pozitie inchisa', 'nu mai angajăm', 'nu mai angajam'],
    uzLatn: ['vakansiya yopildi', 'xodim topildi', 'qabul yopildi', 'endi aktual emas'],
    uzCyrl: ['вакансия ёпилди', 'ходим топилди', 'қабул ёпилди', 'энди актуал эмас'],
    kk: ['вакансия жабылды', 'қызметкер табылды', 'қабылдау жабылды'],
  }),
  group('notLooking', {
    ru: ['не ищу работу', 'работу не ищу', 'не рассматриваю вакансии'],
    en: ['not looking for work', 'not looking for a job', 'not open to work'],
    uk: ['не шукаю роботу', 'роботу не шукаю'],
    ro: ['nu caut de lucru', 'nu caut un loc de muncă'],
    uzLatn: ['ish qidirmayapman', 'ish kerak emas'],
    uzCyrl: ['иш қидирмаяпман', 'иш керак эмас'],
    kk: ['жұмыс іздемеймін', 'жұмыс керек емес'],
  }),
  group('course', {
    ru: ['курс профессии', 'обучение профессии', 'стань программистом', 'стань разработчиком', 'курс с трудоустройством', 'обучение с трудоустройством'],
    en: ['become a developer', 'career course', 'job-ready course', 'bootcamp with job placement'],
    uk: ['курс професії', 'навчання професії', 'стань програмістом'],
    ro: ['curs de carieră', 'curs de programare cu angajare'],
    uzLatn: ['kasb kursi', 'dasturchi bolish kursi', "dasturchi bo'lish kursi"],
    uzCyrl: ['касб курси', 'дастурчи бўлиш курси'],
    kk: ['мамандық курсы', 'бағдарламашы болу курсы'],
  }),
  group('advice', {
    ru: ['как найти работу', 'как составить резюме', 'советы по поиску работы'],
    en: ['how to find a job', 'how to write a resume', 'job search tips'],
    uk: ['як знайти роботу', 'як скласти резюме'],
    ro: ['cum să găsești un job', 'cum sa gasesti un job'],
    uzLatn: ['ish qanday topiladi', 'rezyume qanday yoziladi'],
    uzCyrl: ['иш қандай топилади', 'резюме қандай ёзилади'],
    kk: ['жұмысты қалай табуға болады', 'түйіндемені қалай жазу керек'],
  }),
]);

export const VACANCY_FIELD_TERMS = Object.freeze({
  ...JOB_FIELD_TERMS,
  company: group('company', { ru: ['компания', 'работодатель', 'о компании'], en: ['company', 'employer', 'about company'], uk: ['компанія', 'роботодавець'], ro: ['companie', 'angajator'], uzLatn: ['kompaniya', 'ish beruvchi'], uzCyrl: ['компания', 'иш берувчи'], kk: ['компания', 'жұмыс беруші'] }),
  salary: group('salary', { ru: ['зарплата', 'зп', 'оклад', 'доход', 'оплата'], en: ['salary', 'compensation', 'pay', 'rate'], uk: ['зарплата', 'оплата', 'дохід'], ro: ['salariu', 'plată', 'plata', 'remunerație'], uzLatn: ['maosh', 'oylik', 'ish haqi'], uzCyrl: ['маош', 'ойлик', 'иш ҳақи'], kk: ['жалақы', 'айлық', 'еңбекақы'] }),
  schedule: group('schedule', { ru: ['график', 'график работы', 'режим работы'], en: ['schedule', 'work schedule', 'hours'], uk: ['графік', 'графік роботи'], ro: ['program', 'program de lucru'], uzLatn: ['grafik', 'ish grafigi'], uzCyrl: ['график', 'иш графиги'], kk: ['жұмыс кестесі', 'кесте'] }),
  location: group('location', { ru: ['локация', 'место работы', 'адрес работы'], en: ['location', 'work location', 'workplace'], uk: ['локація', 'місце роботи'], ro: ['locație', 'locatie', 'locul de muncă'], uzLatn: ['manzil', 'ish joyi'], uzCyrl: ['манзил', 'иш жойи'], kk: ['мекенжай', 'жұмыс орны'] }),
  contact: group('contact', { ru: ['контакты', 'отклик', 'как откликнуться', 'связь'], en: ['contact', 'apply', 'how to apply'], uk: ['контакти', 'відгукнутися', 'як відгукнутися'], ro: ['contact', 'aplică', 'aplica'], uzLatn: ['aloqa', 'murojaat', 'boglanish'], uzCyrl: ['алоқа', 'мурожаат', 'боғланиш'], kk: ['байланыс', 'өтініш беру'] }),
});

export const WORK_SCHEDULE_EXTENSIONS = Object.freeze([
  group('sixOne', { ru: ['6/1', 'шесть один', '6 на 1'], en: ['6/1', 'six days on one day off'], uk: ['6/1'], ro: ['6/1'], uzLatn: ['6/1'], uzCyrl: ['6/1'], kk: ['6/1'] }),
  group('threeThree', { ru: ['3/3', 'три через три'], en: ['3/3', 'three on three off'], uk: ['3/3'], ro: ['3/3'], uzLatn: ['3/3'], uzCyrl: ['3/3'], kk: ['3/3'] }),
  group('oneThree', { ru: ['1/3', 'сутки через трое'], en: ['1/3', '24 on 72 off'], uk: ['1/3', 'доба через три'], ro: ['1/3'], uzLatn: ['1/3'], uzCyrl: ['1/3'], kk: ['1/3'] }),
  group('twentyFourFortyEight', { ru: ['24/48', 'сутки через двое'], en: ['24/48', '24 on 48 off'], uk: ['24/48', 'доба через дві'], ro: ['24/48'], uzLatn: ['24/48'], uzCyrl: ['24/48'], kk: ['24/48'] }),
]);

export const EXPERIENCE_MODIFIERS = Object.freeze([
  group('none', { ru: ['без опыта', 'опыт не требуется', 'можно без опыта', 'обучаем'], en: ['no experience', 'no experience required', 'training provided'], uk: ['без досвіду', 'досвід не потрібен'], ro: ['fără experiență', 'fara experienta'], uzLatn: ['tajribasiz', 'tajriba shart emas'], uzCyrl: ['тажрибасиз', 'тажриба шарт эмас'], kk: ['тәжірибесіз', 'тәжірибе қажет емес'] }),
  group('preferred', { ru: ['опыт приветствуется', 'желателен опыт', 'опыт будет плюсом'], en: ['experience preferred', 'experience is a plus', 'experience desirable'], uk: ['досвід бажаний', 'досвід буде плюсом'], ro: ['experiența constituie un avantaj', 'experienta constituie un avantaj'], uzLatn: ['tajriba bolsa yaxshi', "tajriba bo'lsa yaxshi"], uzCyrl: ['тажриба бўлса яхши'], kk: ['тәжірибе артықшылық болады'] }),
  group('required', { ru: ['опыт обязателен', 'требуется опыт', 'необходим опыт'], en: ['experience required', 'must have experience'], uk: ['досвід обов’язковий', "досвід обов'язковий"], ro: ['experiență obligatorie', 'experienta obligatorie'], uzLatn: ['tajriba kerak', 'tajriba talab qilinadi'], uzCyrl: ['тажриба керак', 'тажриба талаб қилинади'], kk: ['тәжірибе қажет', 'тәжірибе міндетті'] }),
]);

const YEAR_WORD = '(?:лет|года|год|рок(?:и|ів)?|years?|yrs?|ani|yil|жыл)';
const RANGE_RE = new RegExp(`(?:опыт|experience|досвід|experien[țt]a|tajriba|тәжірибе)?[^\\d]{0,18}(\\d+(?:[.,]\\d+)?)\\s*(?:-|–|—|до|to)\\s*(\\d+(?:[.,]\\d+)?)\\s*${YEAR_WORD}`, 'iu');
const MIN_RE = new RegExp(`(?:от|не\\s+менее|minimum|min\\.?|at\\s+least|від|de\\s+la|kamida|кемінде)?\\s*(\\d+(?:[.,]\\d+)?)\\s*\\+?\\s*${YEAR_WORD}`, 'iu');

function allAliases(entry) {
  return Object.values(entry?.aliases || {}).flatMap((values) => Array.isArray(values) ? values : []);
}

function matcher(entry) {
  return aliasesToRegex([entry.canonical, ...allAliases(entry)]);
}

export function detectHiringNegativeIntent(value) {
  const text = String(value || '');
  for (const entry of HIRING_NEGATIVE_INTENT) {
    const match = text.match(matcher(entry));
    if (match) return Object.freeze({ canonical: entry.canonical, matched: match[0].trim() });
  }
  return null;
}

export function classifyHiringIntent(value) {
  const text = String(value || '');
  const negative = detectHiringNegativeIntent(text);
  if (negative) return Object.freeze({ intent: 'negative', reason: negative.canonical, matched: negative.matched, confidence: 1 });

  for (const intent of ['employer', 'candidate']) {
    const sources = [HIRING_INTENT[intent], HIRING_INTENT_EXTENSIONS[intent]];
    for (const entry of sources) {
      const match = text.match(matcher(entry));
      if (match) return Object.freeze({ intent, reason: null, matched: match[0].trim(), confidence: 1 });
    }
  }
  return Object.freeze({ intent: null, reason: null, matched: null, confidence: 0 });
}

export function parseExperience(value) {
  const text = normalizeUnicode(value || '');
  if (!text) return null;
  const modifier = findCanonical(text, EXPERIENCE_MODIFIERS, { partial: true })?.canonical || null;
  if (modifier === 'none') return Object.freeze({ requirement: 'none', minYears: 0, maxYears: 0 });

  const range = text.match(RANGE_RE);
  if (range) {
    if (/(?:возраст|вік|age|yosh|ёш|vârsta|varsta)/iu.test(range[0]) && !/(?:опыт|experience|досвід|tajriba|тәжірибе)/iu.test(range[0])) return null;
    const minYears = Number(range[1].replace(',', '.'));
    const maxYears = Number(range[2].replace(',', '.'));
    return Object.freeze({ requirement: modifier || 'required', minYears: Math.min(minYears, maxYears), maxYears: Math.max(minYears, maxYears) });
  }

  const single = text.match(MIN_RE);
  if (single) {
    if (/(?:возраст|вік|age|yosh|ёш|vârsta|varsta)/iu.test(single[0]) && !/(?:опыт|experience|досвід|tajriba|тәжірибе)/iu.test(single[0])) return null;
    const years = Number(single[1].replace(',', '.'));
    const isExact = !/(?:от|не\s+менее|minimum|min\.?|at\s+least|від|kamida|кемінде|\+)/iu.test(single[0]);
    return Object.freeze({ requirement: modifier || 'required', minYears: years, maxYears: isExact ? years : null });
  }

  if (modifier) return Object.freeze({ requirement: modifier, minYears: null, maxYears: null });
  return null;
}
