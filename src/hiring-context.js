import { deepFreeze, lexiconEntity } from './lexicon-core.js';
import { aliasesOf, escapeRegex, findAllCanonical, findCanonical } from './normalization.js';
import { HIRING_INTENT, BENEFIT_TERMS } from './hiring.js';
import { HIRING_NEGATIVE_INTENT } from './hiring-advanced.js';
import { LANGUAGES, LANGUAGE_LEVELS, LANGUAGE_CONTEXT_TERMS } from './hiring-languages.js';
import { matchProfessions } from './hiring-professions.js';

const group = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, extra);
const matchCanonicals = (text, entries) => [...new Set(findAllCanonical(text, entries).map(({ canonical }) => canonical).filter(Boolean))];
const has = (text, entries) => findCanonical(text, entries, { partial: true })?.canonical || null;

/** Generic requirement relation. Entity-specific parsers attach it by distance. */
export const REQUIREMENT_TERMS = Object.freeze([
  group('notRequired', {
    ru: ['не требуется', 'не обязательно', 'не нужен', 'не нужна', 'без необходимости'],
    en: ['not required', 'not mandatory', 'optional', 'no requirement'],
    uk: ['не потрібно', 'не обов’язково', "не обов'язково"],
    ro: ['nu este necesar', 'nu este obligatoriu', 'opțional', 'optional'],
    uzLatn: ['talab qilinmaydi', 'shart emas', 'kerak emas'],
    uzCyrl: ['талаб қилинмайди', 'шарт эмас', 'керак эмас'],
    kk: ['талап етілмейді', 'міндетті емес', 'қажет емес'],
  }),
  group('required', {
    ru: ['обязательно', 'требуется', 'необходимо', 'нужно', 'должен знать', 'должна знать'],
    en: ['required', 'must have', 'must know', 'must speak', 'mandatory', 'essential'],
    uk: ['обов’язково', "обов'язково", 'потрібно', 'необхідно', 'вимагається'],
    ro: ['obligatoriu', 'necesar', 'este necesar', 'se cere'],
    uzLatn: ['talab qilinadi', 'shart', 'kerak', 'zarur'],
    uzCyrl: ['талаб қилинади', 'шарт', 'керак', 'зарур'],
    kk: ['талап етіледі', 'міндетті', 'қажет'],
  }),
  group('preferred', {
    ru: ['желательно', 'будет плюсом', 'будет преимуществом', 'приветствуется'],
    en: ['preferred', 'nice to have', 'a plus', 'an advantage', 'desirable'],
    uk: ['бажано', 'буде плюсом', 'буде перевагою', 'вітається'],
    ro: ['de preferat', 'constituie un avantaj', 'este un plus'],
    uzLatn: ['afzal', 'plus boladi', "plus bo'ladi", 'yaxshi boladi'],
    uzCyrl: ['афзал', 'плюс бўлади', 'яхши бўлади'],
    kk: ['артықшылық', 'болғаны дұрыс', 'қалаулы'],
  }),
]);

export const RESPONSIBILITY_TERMS = Object.freeze([
  group('responsibilities', {
    ru: ['обязанности', 'задачи', 'чем предстоит заниматься', 'что нужно делать', 'функционал'],
    en: ['responsibilities', 'duties', 'what you will do', 'what you’ll do', 'role responsibilities'],
    uk: ['обов’язки', "обов'язки", 'задачі', 'чим будете займатися'],
    ro: ['responsabilități', 'responsabilitati', 'sarcini'],
    uzLatn: ['vazifalar', 'majburiyatlar', 'nima qilasiz'],
    uzCyrl: ['вазифалар', 'мажбуриятлар'],
    kk: ['міндеттер', 'тапсырмалар'],
  }),
]);

export const OFFER_TERMS = Object.freeze([
  group('offer', {
    ru: ['мы предлагаем', 'предлагаем', 'условия', 'что предлагаем', 'соцпакет'],
    en: ['we offer', 'what we offer', 'benefits', 'perks', 'compensation and benefits'],
    uk: ['ми пропонуємо', 'пропонуємо', 'умови', 'що пропонуємо'],
    ro: ['oferim', 'ce oferim', 'beneficii'],
    uzLatn: ['biz taklif qilamiz', 'taklif qilamiz', 'sharoitlar'],
    uzCyrl: ['биз таклиф қиламиз', 'таклиф қиламиз', 'шароитлар'],
    kk: ['біз ұсынамыз', 'ұсынамыз', 'жағдайлар'],
  }),
]);

export const CONTACT_TERMS = Object.freeze([
  group('telegram', { ru: ['писать в telegram', 'пишите в телеграм', 'телеграм для связи'], en: ['contact on telegram', 'message on telegram'], uk: ['пишіть у telegram'], ro: ['scrieți pe telegram'], uzLatn: ['telegramga yozing'], uzCyrl: ['телеграмга ёзинг'], kk: ['telegram-ға жазыңыз'] }),
  group('whatsapp', { ru: ['писать в whatsapp', 'ватсап для связи'], en: ['contact on whatsapp', 'message on whatsapp'], uk: ['пишіть у whatsapp'], ro: ['scrieți pe whatsapp'], uzLatn: ['whatsappga yozing'], uzCyrl: ['whatsappга ёзинг'], kk: ['whatsapp-қа жазыңыз'] }),
  group('phone', { ru: ['звонить', 'позвонить', 'по телефону'], en: ['call', 'phone us', 'by phone'], uk: ['дзвонити', 'телефонуйте'], ro: ['sunați', 'telefon'], uzLatn: ['qongiroq qiling', "qo'ng'iroq qiling"], uzCyrl: ['қўнғироқ қилинг'], kk: ['қоңырау шалыңыз'] }),
  group('recruiter', { ru: ['contact hr', 'связаться с hr', 'связаться с рекрутером'], en: ['contact hr', 'contact recruiter'], uk: ['зв’язатися з рекрутером'], ro: ['contactați recruiterul'], uzLatn: ['hr bilan boglaning'], uzCyrl: ['hr билан боғланинг'], kk: ['рекрутермен байланысыңыз'] }),
]);

export const APPLICATION_TERMS = Object.freeze([
  group('resumeRequired', { ru: ['отправить резюме', 'прислать резюме', 'резюме обязательно'], en: ['send resume', 'submit resume', 'resume required', 'send cv', 'submit cv'], uk: ['надіслати резюме', 'резюме обов’язкове'], ro: ['trimite cv', 'cv obligatoriu'], uzLatn: ['rezyume yuboring'], uzCyrl: ['резюме юборинг'], kk: ['түйіндеме жіберіңіз'] }),
  group('portfolioRequired', { ru: ['портфолио обязательно', 'прислать портфолио'], en: ['portfolio required', 'submit portfolio', 'send portfolio'], uk: ['портфоліо обов’язкове'], ro: ['portofoliu obligatoriu'], uzLatn: ['portfolio yuboring'], uzCyrl: ['портфолио юборинг'], kk: ['портфолио жіберіңіз'] }),
  group('coverLetter', { ru: ['сопроводительное письмо'], en: ['cover letter'], uk: ['супровідний лист'], ro: ['scrisoare de intenție'], uzLatn: ['motivatsion xat'], uzCyrl: ['мотивацион хат'], kk: ['ілеспе хат'] }),
  group('testTask', { ru: ['тестовое задание', 'тестовая задача'], en: ['test task', 'take-home assignment', 'coding assignment'], uk: ['тестове завдання'], ro: ['test tehnic', 'temă de test'], uzLatn: ['test topshirigi'], uzCyrl: ['тест топшириғи'], kk: ['тест тапсырмасы'] }),
  group('interview', { ru: ['собеседование', 'интервью с hr'], en: ['interview', 'screening call'], uk: ['співбесіда'], ro: ['interviu'], uzLatn: ['suhbat'], uzCyrl: ['суҳбат'], kk: ['сұхбат'] }),
]);

export const COMPANY_TERMS = Object.freeze([
  group('company', { ru: ['компания', 'работодатель', 'бренд', 'сеть компаний'], en: ['company', 'employer', 'brand'], uk: ['компанія', 'роботодавець', 'бренд'], ro: ['companie', 'angajator', 'brand'], uzLatn: ['kompaniya', 'ish beruvchi'], uzCyrl: ['компания', 'иш берувчи'], kk: ['компания', 'жұмыс беруші'] }),
  group('startup', { ru: ['стартап'], en: ['startup', 'start-up'], uk: ['стартап'], ro: ['startup'], uzLatn: ['startap'], uzCyrl: ['стартап'], kk: ['стартап'] }),
  group('agency', { ru: ['агентство', 'кадровое агентство'], en: ['agency', 'recruitment agency'], uk: ['агенція', 'рекрутингова агенція'], ro: ['agenție', 'agenție de recrutare'], uzLatn: ['agentlik'], uzCyrl: ['агентлик'], kk: ['агенттік'] }),
]);

export const LOCATION_CONTEXT_TERMS = Object.freeze([
  group('workplace', { ru: ['место работы', 'офис находится', 'адрес офиса', 'работа в'], en: ['work location', 'office located', 'office address', 'based in'], uk: ['місце роботи', 'офіс знаходиться'], ro: ['locul de muncă', 'adresa biroului'], uzLatn: ['ish joyi', 'ofis manzili'], uzCyrl: ['иш жойи', 'офис манзили'], kk: ['жұмыс орны', 'кеңсе мекенжайы'] }),
  group('commute', { ru: ['трансфер до офиса', 'развозка сотрудников'], en: ['office shuttle', 'employee shuttle', 'commute support'], uk: ['трансфер до офісу'], ro: ['transport la birou'], uzLatn: ['xodimlar transporti'], uzCyrl: ['ходимлар транспорти'], kk: ['қызметкерлер тасымалы'] }),
]);

export const WORK_AUTHORIZATION_TERMS = Object.freeze([
  group('sponsorshipOffered', { ru: ['визовая поддержка', 'спонсируем рабочую визу', 'оформляем рабочую визу'], en: ['visa sponsorship available', 'visa sponsorship provided', 'we sponsor visas', 'sponsorship available'], uk: ['візова підтримка', 'спонсоруємо робочу візу'], ro: ['sponsorizare viză', 'sponsorizare pentru viză'], uzLatn: ['viza yordami'], uzCyrl: ['виза ёрдами'], kk: ['визаға демеушілік'] }),
  group('noSponsorship', { ru: ['без визовой поддержки', 'визу не спонсируем', 'спонсорства визы нет'], en: ['no visa sponsorship', 'visa sponsorship is not available', 'we do not sponsor', 'unable to sponsor', 'cannot sponsor', 'no sponsorship'], uk: ['без візової підтримки', 'візу не спонсоруємо'], ro: ['fără sponsorizare pentru viză'], uzLatn: ['viza homiyligi yoq'], uzCyrl: ['виза ҳомийлиги йўқ'], kk: ['виза демеушілігі жоқ'] }),
  group('workPermitRequired', { ru: ['разрешение на работу обязательно', 'нужно разрешение на работу'], en: ['work permit required', 'must have work authorization', 'must be authorized to work', 'right to work required'], uk: ['дозвіл на роботу обов’язковий'], ro: ['permis de muncă obligatoriu'], uzLatn: ['ishlash ruxsati kerak'], uzCyrl: ['ишлаш рухсати керак'], kk: ['жұмыс істеуге рұқсат қажет'] }),
  group('citizenshipRequired', { ru: ['только граждане', 'гражданство обязательно'], en: ['citizenship required', 'citizens only'], uk: ['лише громадяни', 'громадянство обов’язкове'], ro: ['cetățenie obligatorie'], uzLatn: ['faqat fuqarolar'], uzCyrl: ['фақат фуқаролар'], kk: ['тек азаматтар'] }),
  group('residencePermit', { ru: ['внж', 'вид на жительство'], en: ['residence permit', 'residency permit'], uk: ['посвідка на проживання'], ro: ['permis de ședere'], uzLatn: ['yashash ruxsati'], uzCyrl: ['яшаш рухсати'], kk: ['тұруға ықтиярхат'] }),
]);

export const HIRING_AVAILABILITY_TERMS = Object.freeze([
  group('urgent', { ru: ['срочно нужен', 'срочно требуется', 'срочный набор'], en: ['urgent hire', 'hiring urgently', 'urgent opening'], uk: ['терміново потрібен'], ro: ['angajare urgentă'], uzLatn: ['zudlik bilan xodim kerak'], uzCyrl: ['зудлик билан ходим керак'], kk: ['шұғыл қызметкер керек'] }),
  group('immediateStart', { ru: ['выход завтра', 'приступить сразу', 'выход сразу'], en: ['immediate start', 'start immediately', 'asap start'], uk: ['вийти одразу', 'почати одразу'], ro: ['începere imediată'], uzLatn: ['darhol ish boshlash'], uzCyrl: ['дарҳол иш бошлаш'], kk: ['бірден бастау'] }),
]);

export const TRAVEL_TERMS = Object.freeze([
  group('required', { ru: ['готовность к командировкам', 'командировки обязательны', 'разъездной характер работы'], en: ['travel required', 'business travel required', 'willingness to travel'], uk: ['готовність до відряджень'], ro: ['disponibilitate pentru deplasări'], uzLatn: ['xizmat safariga tayyor'], uzCyrl: ['хизмат сафарига тайёр'], kk: ['іссапарға дайын'] }),
  group('none', { ru: ['без командировок', 'командировок нет'], en: ['no travel', 'no business travel'], uk: ['без відряджень'], ro: ['fără deplasări'], uzLatn: ['xizmat safari yoq'], uzCyrl: ['хизмат сафари йўқ'], kk: ['іссапар жоқ'] }),
]);

export const RELOCATION_CONTEXT_TERMS = Object.freeze([
  group('offered', { ru: ['релокация предоставляется', 'помощь с переездом', 'релокационный пакет'], en: ['relocation provided', 'relocation assistance', 'relocation package'], uk: ['релокація надається', 'допомога з переїздом'], ro: ['pachet de relocare', 'asistență la relocare'], uzLatn: ['kochishga yordam', "ko'chishga yordam"], uzCyrl: ['кўчишга ёрдам'], kk: ['көшуге көмек'] }),
  group('required', { ru: ['требуется релокация', 'необходим переезд'], en: ['relocation required', 'must relocate'], uk: ['потрібна релокація'], ro: ['relocare obligatorie'], uzLatn: ['kochish talab qilinadi'], uzCyrl: ['кўчиш талаб қилинади'], kk: ['көшу қажет'] }),
  group('notOffered', { ru: ['релокация не предоставляется', 'без релокации'], en: ['no relocation', 'relocation not provided'], uk: ['релокація не надається'], ro: ['fără relocare'], uzLatn: ['kochish yordami yoq'], uzCyrl: ['кўчиш ёрдами йўқ'], kk: ['көшу көмегі жоқ'] }),
]);

export const BONUS_TERMS = Object.freeze([
  group('kpi', { ru: ['kpi', 'бонус по kpi'], en: ['kpi bonus', 'performance bonus'], uk: ['бонус за kpi'], ro: ['bonus kpi'], uzLatn: ['kpi bonus'], uzCyrl: ['kpi бонус'], kk: ['kpi бонус'] }),
  group('salesCommission', { ru: ['процент от продаж', 'процент с продаж'], en: ['sales commission', 'commission on sales'], uk: ['відсоток від продажів'], ro: ['comision din vânzări'], uzLatn: ['sotuvdan foiz'], uzCyrl: ['сотувдан фоиз'], kk: ['сатудан пайыз'] }),
  group('bonus', { ru: ['бонус', 'премия'], en: ['bonus', 'incentive'], uk: ['бонус', 'премія'], ro: ['bonus', 'primă'], uzLatn: ['bonus', 'mukofot'], uzCyrl: ['бонус', 'мукофот'], kk: ['бонус', 'сыйақы'] }),
  group('tips', { ru: ['чаевые'], en: ['tips', 'gratuities'], uk: ['чайові'], ro: ['bacșiș'], uzLatn: ['choychaqa'], uzCyrl: ['чойчақа'], kk: ['шайпұл'] }),
]);

export const CONTRACT_CONTEXT_TERMS = Object.freeze([
  group('officialEmployment', { ru: ['официальное оформление', 'оформление по тк', 'по трудовой книжке'], en: ['official employment', 'formal employment'], uk: ['офіційне працевлаштування'], ro: ['angajare oficială'], uzLatn: ['rasmiy ishga olish'], uzCyrl: ['расмий ишга олиш'], kk: ['ресми жұмысқа орналастыру'] }),
  group('employmentContract', { ru: ['трудовой договор'], en: ['employment contract'], uk: ['трудовий договір'], ro: ['contract de muncă'], uzLatn: ['mehnat shartnomasi'], uzCyrl: ['меҳнат шартномаси'], kk: ['еңбек шарты'] }),
  group('civilContract', { ru: ['гпх', 'гражданско-правовой договор'], en: ['civil contract'], uk: ['цивільно-правовий договір'], ro: ['contract civil'], uzLatn: ['fuqarolik shartnomasi'], uzCyrl: ['фуқаролик шартномаси'], kk: ['азаматтық шарт'] }),
  group('contractor', { ru: ['самозанятость', 'ип', 'контрактор'], en: ['contractor', 'independent contractor', 'b2b'], uk: ['фоп', 'контрактор'], ro: ['contractor', 'pfa', 'b2b'], uzLatn: ['yakka tartibdagi tadbirkor'], uzCyrl: ['якка тартибдаги тадбиркор'], kk: ['жеке кәсіпкер'] }),
]);

export const VACANCY_STATUS_TERMS = Object.freeze([
  group('closed', { ru: ['вакансия закрыта', 'позиция закрыта', 'набор завершён', 'набор завершен'], en: ['vacancy closed', 'position closed', 'role closed'], uk: ['вакансія закрита', 'позиція закрита'], ro: ['poziție închisă'], uzLatn: ['vakansiya yopildi'], uzCyrl: ['вакансия ёпилди'], kk: ['вакансия жабылды'] }),
  group('filled', { ru: ['сотрудник найден', 'уже нашли сотрудника'], en: ['position filled', 'role filled', 'candidate hired'], uk: ['працівника знайдено'], ro: ['post ocupat'], uzLatn: ['xodim topildi'], uzCyrl: ['ходим топилди'], kk: ['қызметкер табылды'] }),
  group('frozen', { ru: ['позиция заморожена', 'вакансия заморожена'], en: ['position frozen', 'hiring paused', 'role on hold'], uk: ['позиція заморожена'], ro: ['poziție înghețată'], uzLatn: ['vakansiya vaqtincha toxtatilgan'], uzCyrl: ['вакансия вақтинча тўхтатилган'], kk: ['вакансия уақытша тоқтатылды'] }),
  group('open', { ru: ['вакансия открыта', 'позиция открыта', 'набор открыт'], en: ['open position', 'open role', 'now hiring'], uk: ['вакансія відкрита'], ro: ['poziție deschisă'], uzLatn: ['ochiq vakansiya'], uzCyrl: ['очиқ вакансия'], kk: ['ашық вакансия'] }),
]);

export const CANDIDATE_STATUS_TERMS = Object.freeze([
  group('activelyLooking', { ru: ['активно ищу работу', 'в активном поиске'], en: ['actively looking', 'actively seeking work'], uk: ['активно шукаю роботу'], ro: ['caut activ un job'], uzLatn: ['faol ish qidiryapman'], uzCyrl: ['фаол иш қидиряпман'], kk: ['белсенді жұмыс іздеп жүрмін'] }),
  group('openToOffers', { ru: ['открыт к предложениям', 'открыта к предложениям', 'рассматриваю предложения'], en: ['open to offers', 'open to opportunities'], uk: ['відкритий до пропозицій', 'розглядаю пропозиції'], ro: ['deschis la oferte'], uzLatn: ['takliflarga ochiqman'], uzCyrl: ['таклифларга очиқман'], kk: ['ұсыныстарға ашықпын'] }),
  group('notLooking', { ru: ['пока не ищу', 'не ищу работу'], en: ['not looking', 'not seeking work'], uk: ['не шукаю роботу'], ro: ['nu caut de lucru'], uzLatn: ['ish qidirmayapman'], uzCyrl: ['иш қидирмаяпман'], kk: ['жұмыс іздемеймін'] }),
  group('employed', { ru: ['сейчас работаю', 'работаю, но рассматриваю', 'трудоустроен', 'трудоустроена'], en: ['currently employed', 'employed but open'], uk: ['зараз працюю'], ro: ['angajat în prezent'], uzLatn: ['hozir ishlayman'], uzCyrl: ['ҳозир ишлайман'], kk: ['қазір жұмыс істеймін'] }),
  group('availableImmediately', { ru: ['готов приступить сразу', 'готова приступить сразу', 'могу выйти сразу', 'могу выйти завтра'], en: ['available immediately', 'can start immediately'], uk: ['можу вийти одразу'], ro: ['disponibil imediat'], uzLatn: ['darhol ish boshlay olaman'], uzCyrl: ['дарҳол иш бошлай оламан'], kk: ['бірден бастай аламын'] }),
]);

export const CANDIDATE_PREFERENCE_TERMS = Object.freeze([
  group('remoteOnly', { ru: ['только удалённая работа', 'только удаленка', 'только удалёнка'], en: ['remote only', 'only remote work'], uk: ['тільки віддалена робота'], ro: ['doar remote'], uzLatn: ['faqat masofadan'], uzCyrl: ['фақат масофадан'], kk: ['тек қашықтан'] }),
  group('fullTimeOnly', { ru: ['только полный день', 'только полная занятость'], en: ['full time only', 'full-time only'], uk: ['тільки повна зайнятість'], ro: ['doar normă întreagă'], uzLatn: ['faqat toliq stavka'], uzCyrl: ['фақат тўлиқ ставка'], kk: ['тек толық жұмыс күні'] }),
  group('noNightShift', { ru: ['не готов к ночным сменам', 'не готова к ночным сменам', 'без ночных смен'], en: ['no night shifts', 'not available for night shifts'], uk: ['без нічних змін'], ro: ['fără ture de noapte'], uzLatn: ['tungi smenasiz'], uzCyrl: ['тунги сменасиз'], kk: ['түнгі ауысымсыз'] }),
  group('noTravel', { ru: ['без командировок', 'командировки не рассматриваю'], en: ['no travel', 'not open to travel'], uk: ['без відряджень'], ro: ['fără deplasări'], uzLatn: ['xizmat safarisiz'], uzCyrl: ['хизмат сафарисиз'], kk: ['іссапарсыз'] }),
  group('noRelocation', { ru: ['релокацию не рассматриваю', 'не готов к релокации', 'не готова к релокации'], en: ['no relocation', 'not open to relocation'], uk: ['релокацію не розглядаю'], ro: ['nu doresc relocare'], uzLatn: ['kochishni korib chiqmayman'], uzCyrl: ['кўчишни кўриб чиқмайман'], kk: ['көшуге дайын емеспін'] }),
  group('noSales', { ru: ['не рассматриваю продажи', 'продажи не рассматриваю'], en: ['not interested in sales', 'no sales roles'], uk: ['не розглядаю продажі'], ro: ['nu doresc vânzări'], uzLatn: ['sotuv ishini xohlamayman'], uzCyrl: ['сотув ишини хоҳламайман'], kk: ['сату жұмысын қарастырмаймын'] }),
]);

export const EMPLOYMENT_HISTORY_TERMS = Object.freeze([
  group('current', { ru: ['работаю в', 'текущее место работы', 'текущая компания', 'сейчас работаю'], en: ['currently work at', 'current company', 'current role'], uk: ['працюю в', 'поточна компанія'], ro: ['lucrez în prezent la', 'compania actuală'], uzLatn: ['hozir ishlayman', 'hozirgi kompaniya'], uzCyrl: ['ҳозир ишлайман', 'ҳозирги компания'], kk: ['қазір жұмыс істеймін', 'қазіргі компания'] }),
  group('previous', { ru: ['работал в', 'работала в', 'последнее место работы', 'занимал должность', 'занимала должность', 'ушёл из', 'ушла из'], en: ['worked at', 'previous company', 'previous role', 'formerly worked'], uk: ['працював у', 'працювала у', 'попереднє місце роботи'], ro: ['am lucrat la', 'compania anterioară'], uzLatn: ['ilgari ishlaganman', 'oldingi ish joyi'], uzCyrl: ['илгари ишлаганман', 'олдинги иш жойи'], kk: ['бұрын жұмыс істедім', 'алдыңғы жұмыс орны'] }),
  group('desired', { ru: ['ищу работу', 'хочу работать', 'интересует позиция', 'рассматриваю позицию'], en: ['looking for a role', 'seeking a role', 'interested in a role'], uk: ['шукаю роботу', 'цікавить позиція'], ro: ['caut un rol', 'mă interesează poziția'], uzLatn: ['ish qidiryapman', 'lavozim qidiryapman'], uzCyrl: ['иш қидиряпман', 'лавозим қидиряпман'], kk: ['жұмыс іздеймін', 'лауазым іздеймін'] }),
]);

export const EDUCATION_CONTEXT_TERMS = Object.freeze([
  group('required', { ru: ['высшее образование обязательно', 'образование обязательно'], en: ['degree required', 'education required'], uk: ['вища освіта обов’язкова'], ro: ['studii obligatorii'], uzLatn: ['oliy malumot shart'], uzCyrl: ['олий маълумот шарт'], kk: ['жоғары білім міндетті'] }),
  group('preferred', { ru: ['желательно техническое образование', 'образование будет плюсом'], en: ['degree preferred', 'education preferred'], uk: ['освіта бажана'], ro: ['studii de preferat'], uzLatn: ['malumot afzal'], uzCyrl: ['маълумот афзал'], kk: ['білім болғаны дұрыс'] }),
  group('notRequired', { ru: ['образование не имеет значения', 'диплом не требуется'], en: ['degree not required', 'education not required'], uk: ['диплом не потрібен'], ro: ['diploma nu este necesară'], uzLatn: ['diplom shart emas'], uzCyrl: ['диплом шарт эмас'], kk: ['диплом қажет емес'] }),
  group('candidateHas', { ru: ['имею высшее образование', 'окончил университет', 'окончила университет'], en: ['i have a degree', 'graduated from university'], uk: ['маю вищу освіту', 'закінчив університет'], ro: ['am studii superioare', 'am absolvit universitatea'], uzLatn: ['oliy malumotim bor', 'universitetni bitirganman'], uzCyrl: ['олий маълумотим бор', 'университетни битирганман'], kk: ['жоғары білімім бар', 'университет бітірдім'] }),
]);

export const DRIVER_CONTEXT_TERMS = Object.freeze([
  group('licenseRequired', { ru: ['требуются права категории', 'водительское удостоверение обязательно'], en: ['driving licence required', 'driver license required'], uk: ['водійське посвідчення обов’язкове'], ro: ['permis de conducere obligatoriu'], uzLatn: ['haydovchilik guvohnomasi kerak'], uzCyrl: ['ҳайдовчилик гувоҳномаси керак'], kk: ['жүргізуші куәлігі қажет'] }),
  group('carRequired', { ru: ['наличие автомобиля обязательно', 'с личным авто обязательно'], en: ['own car required', 'personal vehicle required'], uk: ['власне авто обов’язкове'], ro: ['mașină proprie obligatorie'], uzLatn: ['shaxsiy avtomobil kerak'], uzCyrl: ['шахсий автомобил керак'], kk: ['жеке көлік қажет'] }),
  group('candidateHasLicense', { ru: ['есть права категории', 'имею водительские права'], en: ['i have a driving licence', 'drivers license category'], uk: ['маю водійські права'], ro: ['am permis de conducere'], uzLatn: ['haydovchilik guvohnomam bor'], uzCyrl: ['ҳайдовчилик гувоҳномам бор'], kk: ['жүргізуші куәлігім бар'] }),
  group('candidateHasCar', { ru: ['есть личный автомобиль', 'личный автомобиль имеется'], en: ['i have my own car', 'own vehicle'], uk: ['маю власне авто'], ro: ['am mașină proprie'], uzLatn: ['shaxsiy avtomobilim bor'], uzCyrl: ['шахсий автомобилм бор'], kk: ['жеке көлігім бар'] }),
]);

export const HIRING_SECTION_MARKERS = Object.freeze({
  vacancy: group('vacancy', { ru: ['вакансия', 'должность', 'позиция'], en: ['vacancy', 'position', 'role'], uk: ['вакансія', 'посада', 'позиція'], ro: ['vacanță', 'poziție', 'rol'], uzLatn: ['vakansiya', 'lavozim'], uzCyrl: ['вакансия', 'лавозим'], kk: ['вакансия', 'лауазым'] }),
  company: group('company', { ru: ['компания', 'работодатель'], en: ['company', 'employer'], uk: ['компанія', 'роботодавець'], ro: ['companie', 'angajator'], uzLatn: ['kompaniya', 'ish beruvchi'], uzCyrl: ['компания', 'иш берувчи'], kk: ['компания', 'жұмыс беруші'] }),
  salary: group('salary', { ru: ['зарплата', 'зп', 'оплата'], en: ['salary', 'compensation', 'pay'], uk: ['зарплата', 'оплата'], ro: ['salariu', 'plată'], uzLatn: ['maosh', 'oylik'], uzCyrl: ['маош', 'ойлик'], kk: ['жалақы', 'айлық'] }),
  location: group('location', { ru: ['локация', 'место работы', 'адрес'], en: ['location', 'work location'], uk: ['локація', 'місце роботи'], ro: ['locație', 'locul de muncă'], uzLatn: ['manzil', 'ish joyi'], uzCyrl: ['манзил', 'иш жойи'], kk: ['мекенжай', 'жұмыс орны'] }),
  schedule: group('schedule', { ru: ['график', 'график работы'], en: ['schedule', 'work schedule'], uk: ['графік'], ro: ['program'], uzLatn: ['grafik'], uzCyrl: ['график'], kk: ['кесте'] }),
  requirements: group('requirements', { ru: ['требования', 'кого ищем'], en: ['requirements', 'what we expect', 'who we are looking for'], uk: ['вимоги', 'кого шукаємо'], ro: ['cerințe', 'cerinte'], uzLatn: ['talablar'], uzCyrl: ['талаблар'], kk: ['талаптар'] }),
  responsibilities: group('responsibilities', { ru: ['обязанности', 'задачи'], en: ['responsibilities', 'duties'], uk: ['обов’язки', 'задачі'], ro: ['responsabilități', 'sarcini'], uzLatn: ['vazifalar'], uzCyrl: ['вазифалар'], kk: ['міндеттер'] }),
  offer: group('offer', { ru: ['условия', 'мы предлагаем', 'что предлагаем'], en: ['we offer', 'benefits', 'perks'], uk: ['умови', 'ми пропонуємо'], ro: ['oferim', 'beneficii'], uzLatn: ['sharoitlar', 'taklif qilamiz'], uzCyrl: ['шароитлар', 'таклиф қиламиз'], kk: ['жағдайлар', 'ұсынамыз'] }),
  contacts: group('contacts', { ru: ['контакты', 'связь'], en: ['contacts', 'contact'], uk: ['контакти'], ro: ['contact'], uzLatn: ['aloqa'], uzCyrl: ['алоқа'], kk: ['байланыс'] }),
  application: group('application', { ru: ['как откликнуться', 'отклик'], en: ['how to apply', 'application'], uk: ['як відгукнутися', 'відгук'], ro: ['cum aplici', 'aplicare'], uzLatn: ['murojaat'], uzCyrl: ['мурожаат'], kk: ['өтініш беру'] }),
  languages: group('languages', { ru: ['языки', 'знание языков'], en: ['languages', 'language skills'], uk: ['мови'], ro: ['limbi'], uzLatn: ['tillar'], uzCyrl: ['тиллар'], kk: ['тілдер'] }),
  skills: group('skills', { ru: ['навыки', 'стек'], en: ['skills', 'tech stack'], uk: ['навички'], ro: ['competențe'], uzLatn: ['konikmalar', "ko'nikmalar", 'texnologiyalar'], uzCyrl: ['кўникмалар'], kk: ['дағдылар'] }),
  experience: group('experience', { ru: ['опыт', 'опыт работы'], en: ['experience', 'work experience'], uk: ['досвід', 'досвід роботи'], ro: ['experiență'], uzLatn: ['tajriba', 'ish tajribasi'], uzCyrl: ['тажриба', 'иш тажрибаси'], kk: ['тәжірибе'] }),
  education: group('education', { ru: ['образование'], en: ['education'], uk: ['освіта'], ro: ['educație', 'studii'], uzLatn: ['malumot', "ma'lumot"], uzCyrl: ['маълумот'], kk: ['білім'] }),
  expectations: group('expectations', { ru: ['ожидания', 'что ищу', 'желаемая должность'], en: ['expectations', 'looking for', 'desired role'], uk: ['очікування', 'бажана посада'], ro: ['așteptări', 'rol dorit'], uzLatn: ['kutilmalar', 'istalgan lavozim'], uzCyrl: ['кутилмалар'], kk: ['күтілімдер', 'қалаған лауазым'] }),
  history: group('history', { ru: ['опыт работы', 'места работы', 'карьера'], en: ['work experience', 'employment history', 'career history'], uk: ['досвід роботи', 'місця роботи'], ro: ['experiență profesională'], uzLatn: ['ish tajribasi'], uzCyrl: ['иш тажрибаси'], kk: ['еңбек тәжірибесі'] }),
});

export const HIRING_NON_CONTENT_TERMS = Object.freeze([
  group('vacancyDigest', { ru: ['дайджест вакансий', 'подборка вакансий', 'вакансии недели'], en: ['job digest', 'vacancy digest', 'jobs roundup'], uk: ['добірка вакансій'], ro: ['selecție de joburi'], uzLatn: ['vakansiyalar toplami'], uzCyrl: ['вакансиялар тўплами'], kk: ['вакансиялар топтамасы'] }),
  group('recruitmentAd', { ru: ['поможем подобрать сотрудника', 'услуги рекрутера', 'закроем вакансию'], en: ['recruitment services', 'we find candidates', 'staffing services'], uk: ['послуги рекрутера'], ro: ['servicii de recrutare'], uzLatn: ['rekruting xizmati'], uzCyrl: ['рекрутинг хизмати'], kk: ['рекрутинг қызметтері'] }),
  group('jobService', { ru: ['помогу найти работу', 'подбор вакансий', 'сервис поиска работы'], en: ['job search service', 'we help you find a job'], uk: ['допоможемо знайти роботу'], ro: ['serviciu de căutare job'], uzLatn: ['ish topishga yordam'], uzCyrl: ['иш топишга ёрдам'], kk: ['жұмыс табуға көмектесеміз'] }),
  group('spam', { ru: ['подпишись на канал', 'заработок без вложений', 'доход без вложений', 'легкий заработок'], en: ['subscribe to our channel', 'earn money without investment', 'easy money'], uk: ['підпишись на канал', 'заробіток без вкладень'], ro: ['abonează-te la canal', 'câștig fără investiții'], uzLatn: ['kanalga obuna boling', 'sarmoyasiz daromad'], uzCyrl: ['каналга обуна бўлинг'], kk: ['арнаға жазылыңыз', 'инвестициясыз табыс'] }),
]);

function sectionPattern(entry) {
  const values = aliasesOf(entry).sort((a, b) => b.length - a.length).map((value) => escapeRegex(value).replace(/\s+/g, '\\s+'));
  return values.length ? new RegExp(`^[^\\p{L}\\p{N}]{0,8}(?:${values.join('|')})\\s*[:—-]\\s*(.*)$`, 'iu') : null;
}

const SECTION_PATTERNS = Object.freeze(Object.fromEntries(
  Object.entries(HIRING_SECTION_MARKERS).map(([key, entry]) => [key, sectionPattern(entry)]),
));

export function splitHiringSections(value) {
  const text = String(value || '').replace(/\r/g, '');
  const out = {};
  let current = null;
  for (const rawLine of text.split('\n')) {
    const line = rawLine.trim();
    if (!line) continue;
    let marker = null;
    let firstLine = '';
    for (const [key, re] of Object.entries(SECTION_PATTERNS)) {
      const match = re?.exec(line);
      if (!match) continue;
      marker = key;
      firstLine = match[1]?.trim() || '';
      break;
    }
    if (marker) {
      current = marker;
      if (!out[current]) out[current] = [];
      if (firstLine) out[current].push(firstLine);
      continue;
    }
    if (current) out[current].push(line);
  }
  return deepFreeze(Object.fromEntries(Object.entries(out).map(([key, lines]) => [key, lines.join('\n')])));
}

function nearbyRelation(text, entityMatch, relationMatches, fallback = null) {
  let best = null;
  let bestDistance = Infinity;
  for (const relation of relationMatches) {
    const before = relation.end <= entityMatch.start ? entityMatch.start - relation.end : Infinity;
    const after = relation.start >= entityMatch.end ? relation.start - entityMatch.end : Infinity;
    const overlap = relation.start <= entityMatch.end && relation.end >= entityMatch.start ? 0 : Infinity;
    const distance = Math.min(before, after, overlap);
    if (distance > 80 || distance >= bestDistance) continue;
    best = relation.canonical;
    bestDistance = distance;
  }
  return best || fallback;
}

function languageLevelNear(text, match) {
  const start = Math.max(0, match.start - 34);
  const end = Math.min(text.length, match.end + 34);
  const window = text.slice(start, end);
  const cefr = window.match(/(?<![\p{L}\p{N}])([ABC][12])(?![\p{L}\p{N}])/iu)?.[1]?.toUpperCase() || null;
  if (cefr) return { level: null, cefr };
  const qualitative = findCanonical(window, LANGUAGE_LEVELS, { partial: true })?.canonical || null;
  return { level: qualitative, cefr: null };
}

export function parseLanguageContext(value, { mode = null } = {}) {
  const text = String(value || '');
  if (!text.trim()) return [];
  const languages = findAllCanonical(text, LANGUAGES);
  const genericRelations = findAllCanonical(text, REQUIREMENT_TERMS);
  const languageSpecificRelations = findAllCanonical(text, Object.values(LANGUAGE_CONTEXT_TERMS));
  const relations = [...genericRelations, ...languageSpecificRelations].sort((a, b) => a.start - b.start);

  const seen = new Set();
  const out = [];
  for (const language of languages) {
    if (!language.canonical || seen.has(language.canonical)) continue;
    seen.add(language.canonical);
    const { level, cefr } = languageLevelNear(text, language);
    const fallback = mode === 'candidate' ? 'candidateHas' : null;
    out.push(deepFreeze({
      language: language.canonical,
      name: language.entry?.name || language.canonical,
      relation: nearbyRelation(text, language, relations, fallback),
      level,
      cefr,
      start: language.start,
      end: language.end,
    }));
  }
  return Object.freeze(out);
}

function firstProfession(text) {
  return matchProfessions(text, { limit: 1, allowWeak: true })[0] || null;
}

function uniqueProfessionMatches(matches) {
  const seen = new Set();
  return matches.filter((item) => {
    const key = item?.id || item?.canonical;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function contextSentences(text, regex) {
  return text.split(/\n|(?<=[.!?])\s+/u).filter((sentence) => regex.test(sentence));
}

export function resolveProfessionContext(value, { mode = null, title = '' } = {}) {
  const text = String(value || '');
  const sections = splitHiringSections(text);
  const resolvedMode = mode || (has(text, [HIRING_INTENT.candidate]) ? 'candidate' : 'vacancy');
  const allMatches = matchProfessions(text, { limit: 20, allowWeak: true });

  if (resolvedMode === 'candidate') {
    const desiredText = [sections.expectations, ...contextSentences(text, /ищу|шукаю|looking for|seeking|desired|желаем|цікавить|qidir|іздей/iu)].filter(Boolean).join('\n');
    const currentText = contextSentences(text, /сейчас\s+работ|работаю\s+в|currently\s+(?:work|employed)|current\s+(?:role|company)|hozir\s+ish|қазір\s+жұмыс/iu).join('\n');
    const previousText = [sections.history, ...contextSentences(text, /работал[аи]?(?:\s+(?:в|как))?|працюва|worked\s+(?:at|as)|previous\s+(?:role|company)|ilgari\s+ish|бұрын\s+жұмыс/iu)].filter(Boolean).join('\n');
    const desired = firstProfession(desiredText);
    const current = firstProfession(currentText);
    const previous = matchProfessions(previousText, { limit: 10, allowWeak: true });
    const reserved = new Set([desired?.id, current?.id].filter(Boolean));
    return deepFreeze({
      desiredProfession: desired,
      currentProfession: current,
      previousProfessions: uniqueProfessionMatches(previous).filter((item) => !reserved.has(item.id)),
      mentionedProfessions: uniqueProfessionMatches(allMatches).filter((item) => !reserved.has(item.id) && !previous.some((prev) => prev.id === item.id)),
    });
  }

  const primaryText = [sections.vacancy, title].filter(Boolean).join('\n') || text.slice(0, 500);
  const primary = firstProfession(primaryText) || firstProfession(text.slice(0, 800));
  const mentioned = uniqueProfessionMatches(allMatches).filter((item) => item.id !== primary?.id);
  return deepFreeze({
    vacancyProfession: primary,
    mentionedProfessions: mentioned,
  });
}

function parseOpeningCount(text) {
  const match = text.match(/(?:требуется|требуются|нужно|набор|ищем|hiring|need|kerak|қажет)[^\d\n]{0,20}(\d{1,3})\s*(?:человек|сотрудник|специалист|people|employees?|xodim|адам)/iu)
    || text.match(/(\d{1,3})\s*(?:вакансий|позиций|positions?|openings?)/iu);
  return match?.[1] ? Number(match[1]) : null;
}

function parseNoticePeriod(text) {
  const match = text.match(/(?:notice\s+period|срок\s+уведомления|могу\s+выйти\s+через)\s*[:—-]?\s*(\d+)\s*(days?|weeks?|дн(?:я|ей)?|недел[яьи])/iu);
  if (!match?.[1]) return null;
  return deepFreeze({ value: Number(match[1]), unit: /week|недел/i.test(match[2]) ? 'week' : 'day' });
}

export function classifyHiringMessage(value) {
  const text = String(value || '');
  if (!text.trim()) return 'unknown';
  const nonContent = has(text, HIRING_NON_CONTENT_TERMS);
  if (nonContent === 'vacancyDigest') return 'vacancy_digest';
  if (nonContent === 'recruitmentAd') return 'recruitment_ad';
  if (nonContent === 'jobService') return 'job_service';
  if (nonContent === 'spam') return 'spam';

  const negative = has(text, HIRING_NEGATIVE_INTENT);
  if (negative === 'course') return 'course';
  if (negative === 'closed') return 'closed_vacancy';

  const candidate = findCanonical(text, [HIRING_INTENT.candidate], { partial: true });
  const employer = findCanonical(text, [HIRING_INTENT.employer], { partial: true });
  if (employer && !candidate) return 'vacancy';
  if (candidate && !employer) return 'candidate';
  if (employer && candidate) {
    const employerMatch = findAllCanonical(text, [HIRING_INTENT.employer])[0];
    const candidateMatch = findAllCanonical(text, [HIRING_INTENT.candidate])[0];
    if (employerMatch && candidateMatch) return employerMatch.start <= candidateMatch.start ? 'vacancy' : 'candidate';
  }
  return 'unknown';
}

export function parseHiringContext(value, { title = '', mode = null } = {}) {
  const text = String(value || '');
  const kind = mode || classifyHiringMessage(text);
  const parserMode = kind === 'candidate' ? 'candidate' : 'vacancy';
  const vacancyStatuses = matchCanonicals(text, VACANCY_STATUS_TERMS);
  const vacancyStatus = ['closed', 'filled', 'frozen', 'open'].find((item) => vacancyStatuses.includes(item)) || null;
  const candidateStatuses = matchCanonicals(text, CANDIDATE_STATUS_TERMS);

  return deepFreeze({
    kind,
    sections: splitHiringSections(text),
    profession: resolveProfessionContext(text, { mode: parserMode, title }),
    languages: parseLanguageContext(text, { mode: parserMode }),
    requirementRelations: matchCanonicals(text, REQUIREMENT_TERMS),
    hasResponsibilities: Boolean(has(text, RESPONSIBILITY_TERMS)),
    hasOfferSection: Boolean(has(text, OFFER_TERMS)),
    contacts: matchCanonicals(text, CONTACT_TERMS),
    application: matchCanonicals(text, APPLICATION_TERMS),
    companyContext: matchCanonicals(text, COMPANY_TERMS),
    locationContext: matchCanonicals(text, LOCATION_CONTEXT_TERMS),
    workAuthorization: matchCanonicals(text, WORK_AUTHORIZATION_TERMS),
    availability: matchCanonicals(text, HIRING_AVAILABILITY_TERMS),
    travel: has(text, TRAVEL_TERMS),
    relocation: has(text, RELOCATION_CONTEXT_TERMS),
    bonuses: matchCanonicals(text, BONUS_TERMS),
    benefits: matchCanonicals(text, Object.values(BENEFIT_TERMS)),
    contracts: matchCanonicals(text, CONTRACT_CONTEXT_TERMS),
    openingCount: parseOpeningCount(text),
    vacancyStatus,
    candidateStatus: ['notLooking', 'availableImmediately', 'activelyLooking', 'openToOffers', 'employed'].find((item) => candidateStatuses.includes(item)) || null,
    candidatePreferences: matchCanonicals(text, CANDIDATE_PREFERENCE_TERMS),
    employmentHistoryContext: matchCanonicals(text, EMPLOYMENT_HISTORY_TERMS),
    educationContext: has(text, EDUCATION_CONTEXT_TERMS),
    driverContext: matchCanonicals(text, DRIVER_CONTEXT_TERMS),
    noticePeriod: parseNoticePeriod(text),
  });
}
