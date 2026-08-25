import { aliasesOf, aliasesToRegex, findCanonical, normalizeUnicode } from './normalization.js';
import { lexiconEntity } from './lexicon-core.js';

const group = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, extra);

export const LANGUAGES = Object.freeze([
  group('en', { ru: ['английский', 'английского', 'английским', 'англ', 'англ.'], en: ['english'], uk: ['англійська', 'англійський', 'англійської'], ro: ['engleză', 'engleza', 'limba engleză'], uzLatn: ['ingliz tili', 'inglizcha'], uzCyrl: ['инглиз тили', 'инглизча'], kk: ['ағылшын тілі', 'ағылшынша'] }, { name: 'English' }),
  group('ru', { ru: ['русский', 'русского', 'русским', 'рус.'], en: ['russian'], uk: ['російська', 'російський'], ro: ['rusă', 'rusa', 'limba rusă'], uzLatn: ['rus tili', 'ruscha'], uzCyrl: ['рус тили', 'русча'], kk: ['орыс тілі', 'орысша'] }, { name: 'Russian' }),
  group('uz', { ru: ['узбекский', 'узбекского'], en: ['uzbek'], uk: ['узбецька', 'узбецький'], ro: ['uzbecă', 'uzbeca'], uzLatn: ["o'zbek tili", 'o‘zbek tili', 'ozbek tili', "o'zbekcha", 'o‘zbekcha'], uzCyrl: ['ўзбек тили', 'ўзбекча'], kk: ['өзбек тілі', 'өзбекше'] }, { name: 'Uzbek' }),
  group('kk', { ru: ['казахский', 'казахского'], en: ['kazakh'], uk: ['казахська', 'казахський'], ro: ['kazahă', 'kazaha'], uzLatn: ['qozoq tili', 'qozoqcha'], uzCyrl: ['қозоқ тили', 'қозоқча'], kk: ['қазақ тілі', 'қазақша'] }, { name: 'Kazakh' }),
  group('uk', { ru: ['украинский', 'украинского'], en: ['ukrainian'], uk: ['українська', 'український', 'українською'], ro: ['ucraineană', 'ucraineana'], uzLatn: ['ukrain tili'], uzCyrl: ['украин тили'], kk: ['украин тілі'] }, { name: 'Ukrainian' }),
  group('tr', { ru: ['турецкий', 'турецкого'], en: ['turkish'], uk: ['турецька', 'турецький'], ro: ['turcă', 'turca'], uzLatn: ['turk tili', 'turkcha'], uzCyrl: ['турк тили'], kk: ['түрік тілі', 'түрікше'] }, { name: 'Turkish' }),
  group('de', { ru: ['немецкий', 'немецкого'], en: ['german', 'deutsch'], uk: ['німецька', 'німецький'], ro: ['germană', 'germana'], uzLatn: ['nemis tili'], uzCyrl: ['немис тили'], kk: ['неміс тілі'] }, { name: 'German' }),
  group('fr', { ru: ['французский', 'французского'], en: ['french', 'français', 'francais'], uk: ['французька', 'французький'], ro: ['franceză', 'franceza'], uzLatn: ['fransuz tili'], uzCyrl: ['француз тили'], kk: ['француз тілі'] }, { name: 'French' }),
  group('es', { ru: ['испанский', 'испанского'], en: ['spanish', 'español', 'espanol'], uk: ['іспанська', 'іспанський'], ro: ['spaniolă', 'spaniola'], uzLatn: ['ispan tili'], uzCyrl: ['испан тили'], kk: ['испан тілі'] }, { name: 'Spanish' }),
  group('zh', { ru: ['китайский', 'китайского', 'мандарин'], en: ['chinese', 'mandarin'], uk: ['китайська', 'китайський'], ro: ['chineză', 'chineza', 'mandarină'], uzLatn: ['xitoy tili', 'xitoycha'], uzCyrl: ['хитой тили'], kk: ['қытай тілі', 'қытайша'] }, { name: 'Chinese' }),
  group('ko', { ru: ['корейский', 'корейского'], en: ['korean'], uk: ['корейська', 'корейський'], ro: ['coreeană', 'coreeana'], uzLatn: ['koreys tili'], uzCyrl: ['корейс тили'], kk: ['корей тілі'] }, { name: 'Korean' }),
  group('ja', { ru: ['японский', 'японского'], en: ['japanese'], uk: ['японська', 'японський'], ro: ['japoneză', 'japoneza'], uzLatn: ['yapon tili'], uzCyrl: ['япон тили'], kk: ['жапон тілі'] }, { name: 'Japanese' }),
  group('ar', { ru: ['арабский', 'арабского'], en: ['arabic'], uk: ['арабська', 'арабський'], ro: ['arabă', 'araba'], uzLatn: ['arab tili'], uzCyrl: ['араб тили'], kk: ['араб тілі'] }, { name: 'Arabic' }),
  group('tg', { ru: ['таджикский', 'таджикского'], en: ['tajik'], uk: ['таджицька'], ro: ['tadjică', 'tadjica'], uzLatn: ['tojik tili', 'tojikcha'], uzCyrl: ['тожик тили'], kk: ['тәжік тілі'] }, { name: 'Tajik' }),
  group('ky', { ru: ['кыргызский', 'киргизский', 'кыргызского'], en: ['kyrgyz', 'kirghiz'], uk: ['киргизька'], ro: ['kârgâză', 'kargaza'], uzLatn: ['qirgiz tili', "qirg'iz tili"], uzCyrl: ['қирғиз тили'], kk: ['қырғыз тілі', 'қырғызша'] }, { name: 'Kyrgyz' }),
  group('ro', { ru: ['румынский', 'румынского'], en: ['romanian'], uk: ['румунська'], ro: ['română', 'romana', 'limba română'], uzLatn: ['rumin tili'], uzCyrl: ['румин тили'], kk: ['румын тілі'] }, { name: 'Romanian' }),
  group('pl', { ru: ['польский', 'польского'], en: ['polish'], uk: ['польська'], ro: ['poloneză', 'poloneza'], uzLatn: ['polyak tili'], uzCyrl: ['поляк тили'], kk: ['поляк тілі'] }, { name: 'Polish' }),
]);

export const LANGUAGE_LEVELS = Object.freeze([
  group('basic', { ru: ['базовый', 'начальный', 'со словарём', 'со словарем'], en: ['basic', 'beginner'], uk: ['базовий', 'початковий'], ro: ['de bază', 'de baza', 'începător', 'incepator'], uzLatn: ['boshlangich', "boshlang'ich", 'asosiy'], uzCyrl: ['бошланғич', 'асосий'], kk: ['бастапқы', 'негізгі'] }),
  group('elementary', { ru: ['элементарный'], en: ['elementary'], uk: ['елементарний'], ro: ['elementar'], uzLatn: ['elementar'], uzCyrl: ['элементар'], kk: ['элементарлық'] }),
  group('preIntermediate', { ru: ['ниже среднего', 'pre-intermediate'], en: ['pre-intermediate', 'pre intermediate'], uk: ['нижче середнього'], ro: ['pre-intermediar'], uzLatn: ['pre-intermediate'], uzCyrl: ['pre-intermediate'], kk: ['pre-intermediate'] }),
  group('intermediate', { ru: ['средний', 'разговорный', 'разговорный уровень'], en: ['intermediate', 'conversational', 'working knowledge'], uk: ['середній', 'розмовний'], ro: ['intermediar', 'conversațional', 'conversational'], uzLatn: ['orta', "o'rta", 'suhbat darajasi'], uzCyrl: ['ўрта', 'суҳбат даражаси'], kk: ['орта', 'сөйлесу деңгейі'] }),
  group('upperIntermediate', { ru: ['выше среднего', 'upper-intermediate'], en: ['upper-intermediate', 'upper intermediate'], uk: ['вище середнього'], ro: ['upper-intermediate'], uzLatn: ['upper-intermediate'], uzCyrl: ['upper-intermediate'], kk: ['upper-intermediate'] }),
  group('advanced', { ru: ['продвинутый', 'уверенный'], en: ['advanced', 'proficient'], uk: ['просунутий', 'впевнений'], ro: ['avansat', 'competent'], uzLatn: ['yuqori daraja', 'ishonchli'], uzCyrl: ['юқори даража'], kk: ['жоғары деңгей', 'сенімді'] }),
  group('fluent', { ru: ['свободный', 'свободное владение', 'в совершенстве'], en: ['fluent', 'fluency', 'full professional proficiency'], uk: ['вільний', 'вільне володіння', 'досконало'], ro: ['fluent', 'fluență', 'fluenta'], uzLatn: ['erkin', 'erkin gaplashish'], uzCyrl: ['эркин', 'эркин гаплашиш'], kk: ['еркін', 'еркін сөйлейді'] }),
  group('native', { ru: ['родной', 'носитель языка'], en: ['native', 'native speaker', 'mother tongue'], uk: ['рідна', 'носій мови'], ro: ['nativ', 'vorbitor nativ', 'limbă maternă'], uzLatn: ['ona tili', 'native speaker'], uzCyrl: ['она тили'], kk: ['ана тілі', 'тіл иесі'] }),
]);

export const LANGUAGE_CONTEXT_TERMS = Object.freeze({
  required: group('required', {
    ru: ['требуется знание языка', 'знание языка обязательно', 'обязательное знание', 'необходимо знание', 'необходим язык', 'требуется владение', 'свободное владение обязательно', 'со знанием английского', 'английский обязателен'],
    en: ['language required', 'english required', 'must speak', 'must know', 'fluency required', 'proficiency required', 'required language'],
    uk: ['знання мови обов’язкове', "знання мови обов'язкове", 'потрібне знання мови', 'необхідне знання'],
    ro: ['limba este obligatorie', 'cunoașterea limbii este obligatorie', 'trebuie să vorbească'],
    uzLatn: ['til bilish talab qilinadi', 'tilni bilish shart', 'ingliz tilini bilish kerak', 'tilni yaxshi bilishi kerak'],
    uzCyrl: ['тил билиш талаб қилинади', 'тилни билиш шарт', 'инглиз тилини билиш керак'],
    kk: ['тіл білу талап етіледі', 'тілді білу міндетті', 'ағылшын тілін білу қажет'],
  }),
  preferred: group('preferred', {
    ru: ['желательно знание', 'знание будет плюсом', 'будет преимуществом', 'приветствуется знание'],
    en: ['preferred', 'nice to have', 'language is a plus', 'would be an advantage'],
    uk: ['бажане знання', 'знання буде плюсом', 'буде перевагою'],
    ro: ['cunoașterea constituie un avantaj', 'de preferat să cunoască'],
    uzLatn: ['til bilsa yaxshi', 'til bilishi afzal', 'til plus boladi'],
    uzCyrl: ['тил билса яхши', 'тил билиши афзал'],
    kk: ['тіл білу артықшылық болады', 'тіл білгені дұрыс'],
  }),
  notRequired: group('notRequired', {
    ru: ['язык не требуется', 'знание языка не обязательно', 'без обязательного знания', 'язык не нужен'],
    en: ['language not required', 'english not required', 'language optional', 'no language requirement'],
    uk: ['мова не потрібна', 'знання мови не обов’язкове'],
    ro: ['limba nu este necesară', 'limba nu este obligatorie'],
    uzLatn: ['til shart emas', 'til bilish talab qilinmaydi'],
    uzCyrl: ['тил шарт эмас', 'тил билиш талаб қилинмайди'],
    kk: ['тіл міндетті емес', 'тіл білу талап етілмейді'],
  }),
  candidateHas: group('candidateHas', {
    ru: ['владею языками', 'знаю английский', 'владею английским', 'свободно говорю', 'разговорный английский', 'английский на уровне'],
    en: ['i speak', 'i know', 'fluent in', 'proficient in', 'native speaker', 'working proficiency'],
    uk: ['володію мовами', 'знаю англійську', 'вільно говорю'],
    ro: ['vorbesc', 'cunosc limba', 'fluent în', 'fluent in'],
    uzLatn: ['tillarni bilaman', 'ingliz tilini bilaman', 'erkin gaplashaman'],
    uzCyrl: ['тилларни биламан', 'инглиз тилини биламан', 'эркин гаплашаман'],
    kk: ['тілдерді білемін', 'ағылшын тілін білемін', 'еркін сөйлеймін'],
  }),
});

const CEFR_RE = /(?:^|[^A-Za-z0-9])(A1|A2|B1|B2|C1|C2)(?![A-Za-z0-9])/i;
const NEGATION_RE = /(?:не\s+(?:требуется|обязател|нужен|нужна)|без\s+обязатель|not\s+required|not\s+mandatory|optional|nu\s+(?:este\s+)?(?:necesar|obligatoriu)|shart\s+emas|talab\s+qilinmaydi|міндетті\s+емес|талап\s+етілмейді)/iu;
const REQUIRED_RE = /(?:обязател|требуется|необходим|required|must\s+(?:speak|know)|mandatory|потріб|необхід|obligatoriu|trebuie|shart|talab\s+qilinadi|міндетті|талап\s+етіледі|қажет)/iu;
const PREFERRED_RE = /(?:желатель|плюс|приветств|preferred|nice\s+to\s+have|advantage|бажан|переваг|avantaj|afzal|bolsa\s+yaxshi|артықшылық)/iu;
const CANDIDATE_RE = /(?:владею|знаю|говорю|мой\s+уровень|i\s+(?:speak|know)|fluent\s+in|proficient\s+in|володію|vorbesc|bilaman|gaplashaman|білемін|сөйлеймін)/iu;

function relationFromWindow(window, mode) {
  if (NEGATION_RE.test(window)) return 'notRequired';
  if (PREFERRED_RE.test(window)) return 'preferred';
  if (REQUIRED_RE.test(window)) return 'required';
  if (CANDIDATE_RE.test(window)) return 'candidateHas';
  return mode === 'candidate' ? 'candidateHas' : mode === 'vacancy' ? 'mentioned' : 'mentioned';
}

function levelFromWindow(window) {
  const cefr = window.match(CEFR_RE)?.[1]?.toUpperCase() || null;
  if (cefr) return { level: null, cefr };
  const qualitative = findCanonical(window, LANGUAGE_LEVELS, { partial: true });
  return { level: qualitative?.canonical || null, cefr: null };
}

export function languageByCode(code) {
  return LANGUAGES.find((entry) => entry.canonical === String(code || '').toLowerCase()) || null;
}

export function parseLanguageMentions(value, { mode = null } = {}) {
  const text = normalizeUnicode(value || '');
  if (!text) return [];
  const results = [];
  for (const language of LANGUAGES) {
    const re = aliasesToRegex([language.canonical, language.name, ...aliasesOf(language)], 'giu');
    for (const match of text.matchAll(re)) {
      const index = match.index ?? 0;
      const raw = match[0].trim();
      const start = Math.max(0, index - 90);
      const end = Math.min(text.length, index + match[0].length + 90);
      const window = text.slice(start, end);
      const levels = levelFromWindow(window);
      results.push(Object.freeze({
        language: language.canonical,
        name: language.name,
        relation: relationFromWindow(window, mode),
        level: levels.level,
        cefr: levels.cefr,
        matched: raw,
        index,
      }));
    }
  }
  results.sort((a, b) => a.index - b.index);
  const deduped = [];
  const seen = new Set();
  for (const result of results) {
    const key = `${result.language}:${result.relation}:${result.cefr || result.level || ''}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push(result);
  }
  return deduped;
}
