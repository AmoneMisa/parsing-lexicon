import { lexiconEntity, deepFreeze } from './lexicon-core.js';
import { findAllCanonical, findCanonical } from './normalization.js';

const group = (canonical, aliases, extra = {}) => lexiconEntity(canonical, aliases, extra);
const first = (text, entries) => findCanonical(text, entries, { partial: true })?.canonical || null;
const all = (text, entries) => [...new Set(findAllCanonical(text, entries).map(({ canonical }) => canonical).filter(Boolean))];

export const PROPERTY_CONDITION_TERMS = Object.freeze([
  group('newRenovation', { ru: ['новый ремонт', 'свежий ремонт', 'после ремонта'], en: ['new renovation', 'freshly renovated', 'recently renovated'], uk: ['новий ремонт', 'свіжий ремонт', 'після ремонту'], ro: ['renovare nouă', 'proaspăt renovat'], uzLatn: ['yangi remont', 'yangi ta’mir'], uzCyrl: ['янги ремонт', 'янги таъмир'], kk: ['жаңа жөндеу'] }),
  group('cosmeticRenovation', { ru: ['косметический ремонт'], en: ['cosmetic renovation'], uk: ['косметичний ремонт'], ro: ['renovare cosmetică'], uzLatn: ['kosmetik remont'], uzCyrl: ['косметик ремонт'], kk: ['косметикалық жөндеу'] }),
  group('euroRenovation', { ru: ['евроремонт'], en: ['euro renovation', 'euro-renovated'], uk: ['євроремонт'], ro: ['renovare euro'], uzLatn: ['evroremont'], uzCyrl: ['евроремонт'], kk: ['евроремонт'] }),
  group('designerRenovation', { ru: ['дизайнерский ремонт'], en: ['designer renovation', 'designer interior'], uk: ['дизайнерський ремонт'], ro: ['renovare de designer'], uzLatn: ['dizaynerlik remont'], uzCyrl: ['дизайнерлик ремонт'], kk: ['дизайнерлік жөндеу'] }),
  group('good', { ru: ['хорошее состояние', 'отличное состояние'], en: ['good condition', 'excellent condition'], uk: ['хороший стан', 'відмінний стан'], ro: ['stare bună', 'stare excelentă'], uzLatn: ['yaxshi holat', 'yaxshi xolat', 'juda yaxshi xolatda'], uzCyrl: ['яхши ҳолат'], kk: ['жақсы жағдай'] }),
  group('livable', { ru: ['жилое состояние'], en: ['livable condition', 'habitable'], uk: ['житловий стан'], ro: ['locuibil'], uzLatn: ['yashashga tayyor'], uzCyrl: ['яшашга тайёр'], kk: ['тұруға жарамды'] }),
  group('needsRenovation', { ru: ['требует ремонта', 'под ремонт', 'нужен ремонт'], en: ['needs renovation', 'requires renovation'], uk: ['потребує ремонту', 'під ремонт'], ro: ['necesită renovare'], uzLatn: ['remont kerak'], uzCyrl: ['ремонт керак'], kk: ['жөндеу қажет'] }),
  group('shell', { ru: ['черновая отделка', 'черновая', 'без отделки'], en: ['shell condition', 'shell and core', 'unfinished shell'], uk: ['чорнова обробка', 'без оздоблення'], ro: ['la roșu', 'fără finisaje'], uzLatn: ['qora suvoq', 'qora suvoq holati'], uzCyrl: ['қора сувоқ'], kk: ['қара әрлеу'] }),
  group('whiteBox', { ru: ['предчистовая', 'предчистовая отделка'], en: ['white box', 'white-box'], uk: ['передчистове оздоблення'], ro: ['semifinisat'], uzLatn: ['white box'], uzCyrl: ['white box'], kk: ['white box'] }),
]);

export const LAYOUT_TERMS = Object.freeze([
  group('separateRooms', { ru: ['раздельные комнаты', 'изолированные комнаты'], en: ['separate rooms', 'isolated rooms'], uk: ['роздільні кімнати', 'ізольовані кімнати'], ro: ['camere separate'], uzLatn: ['alohida xonalar'], uzCyrl: ['алоҳида хоналар'], kk: ['бөлек бөлмелер'] }),
  group('adjacentRooms', { ru: ['смежные комнаты', 'проходные комнаты', 'проходная комната'], en: ['adjacent rooms', 'walk-through room'], uk: ['суміжні кімнати', 'прохідна кімната'], ro: ['camere decomandate parțial', 'cameră de trecere'], uzLatn: ['o‘tish xonasi'], uzCyrl: ['ўтиш хонаси'], kk: ['өтпелі бөлме'] }),
  group('kitchenStudio', { ru: ['кухня-студия', 'кухня студия'], en: ['kitchen studio', 'open kitchen living room'], uk: ['кухня-студія'], ro: ['bucătărie open space'], uzLatn: ['oshxona studiya'], uzCyrl: ['ошхона студия'], kk: ['асүй-студия'] }),
  group('euroTwoRoom', { ru: ['евродвушка', 'евро двушка'], en: ['euro two-room', 'euro one bedroom'], uk: ['євродвушка'], ro: ['apartament euro două camere'], uzLatn: ['evro ikki xonali'], uzCyrl: ['евро икки хонали'], kk: ['еуро екі бөлмелі'] }),
  group('euroThreeRoom', { ru: ['евротрёшка', 'евротрешка', 'евро трешка'], en: ['euro three-room', 'euro two bedroom'], uk: ['євротрійка'], ro: ['apartament euro trei camere'], uzLatn: ['evro uch xonali'], uzCyrl: ['евро уч хонали'], kk: ['еуро үш бөлмелі'] }),
  group('openPlan', { ru: ['свободная планировка'], en: ['open plan', 'free layout'], uk: ['вільне планування'], ro: ['plan deschis'], uzLatn: ['erkin reja'], uzCyrl: ['эркин режа'], kk: ['еркін жоспарлау'] }),
  group('masterBedroom', { ru: ['мастер-спальня', 'мастер спальня'], en: ['master bedroom'], uk: ['майстер-спальня'], ro: ['dormitor matrimonial'], uzLatn: ['master yotoqxona'], uzCyrl: ['мастер ётоқхона'], kk: ['master bedroom'] }),
  group('walkInCloset', { ru: ['гардеробная'], en: ['walk-in closet', 'dressing room'], uk: ['гардеробна'], ro: ['dressing'], uzLatn: ['garderob xona'], uzCyrl: ['гардероб хона'], kk: ['киім бөлмесі'] }),
]);

export const BUILDING_TYPE_TERMS = Object.freeze([
  group('brick', { ru: ['кирпичный дом', 'кирпич'], en: ['brick building', 'brick house'], uk: ['цегляний будинок'], ro: ['clădire din cărămidă'], uzLatn: ['g‘ishtli uy', "g'ishtli uy"], uzCyrl: ['ғиштли уй'], kk: ['кірпіш үй'] }),
  group('panel', { ru: ['панельный дом', 'панелька'], en: ['panel building', 'prefab panel'], uk: ['панельний будинок'], ro: ['bloc din panouri'], uzLatn: ['panelli uy'], uzCyrl: ['панелли уй'], kk: ['панельді үй'] }),
  group('monolithic', { ru: ['монолитный дом', 'монолит'], en: ['monolithic building', 'monolith'], uk: ['монолітний будинок'], ro: ['clădire monolit'], uzLatn: ['monolit uy'], uzCyrl: ['монолит уй'], kk: ['монолитті үй'] }),
  group('monolithicBrick', { ru: ['монолитно-кирпичный', 'монолит кирпич'], en: ['monolithic brick'], uk: ['монолітно-цегляний'], ro: ['monolit-cărămidă'], uzLatn: ['monolit g‘isht'], uzCyrl: ['монолит ғишт'], kk: ['монолит кірпіш'] }),
  group('block', { ru: ['блочный дом'], en: ['block building'], uk: ['блочний будинок'], ro: ['clădire din blocuri'], uzLatn: ['blokli uy'], uzCyrl: ['блокли уй'], kk: ['блокты үй'] }),
  group('frame', { ru: ['каркасный дом'], en: ['frame building'], uk: ['каркасний будинок'], ro: ['clădire pe cadre'], uzLatn: ['karkasli uy'], uzCyrl: ['каркасли уй'], kk: ['қаңқалы үй'] }),
]);

export const BUILDING_STATUS_TERMS = Object.freeze([
  group('newBuilding', { ru: ['новостройка', 'новый дом'], en: ['new build', 'new building'], uk: ['новобудова', 'новий будинок'], ro: ['construcție nouă'], uzLatn: ['yangi qurilish'], uzCyrl: ['янги қурилиш'], kk: ['жаңа құрылыс'] }),
  group('secondary', { ru: ['вторичка', 'вторичный рынок'], en: ['secondary market', 'resale property'], uk: ['вторинний ринок'], ro: ['piața secundară'], uzLatn: ['ikkilamchi bozor'], uzCyrl: ['иккиламчи бозор'], kk: ['қайталама нарық'] }),
  group('underConstruction', { ru: ['строящийся дом', 'строится', 'на этапе строительства'], en: ['under construction'], uk: ['будується', 'на етапі будівництва'], ro: ['în construcție'], uzLatn: ['qurilmoqda'], uzCyrl: ['қурилмоқда'], kk: ['салынып жатыр'] }),
  group('commissioned', { ru: ['дом сдан', 'сдан в эксплуатацию', 'готовый дом'], en: ['commissioned', 'completed building', 'ready building'], uk: ['будинок зданий', 'введено в експлуатацію'], ro: ['dat în folosință', 'finalizat'], uzLatn: ['uy topshirilgan'], uzCyrl: ['уй топширилган'], kk: ['үй пайдалануға берілді'] }),
]);

export const PROPERTY_PRICE_CONTEXT = Object.freeze([
  group('totalPrice', { ru: ['за квартиру', 'за весь объект', 'общая цена'], en: ['total price', 'for the apartment', 'for the whole property'], uk: ['за квартиру', 'за весь об’єкт'], ro: ['preț total'], uzLatn: ['butun uy uchun'], uzCyrl: ['бутун уй учун'], kk: ['пәтердің толық бағасы'] }),
  group('pricePerSqm', { ru: ['за квадрат', 'за м²', 'за м2', 'цена за метр'], en: ['per sqm', 'per m2', 'per square meter'], uk: ['за м²', 'за квадрат'], ro: ['pe mp', 'pe m²'], uzLatn: ['m2 uchun', 'kvadrat metr uchun'], uzCyrl: ['м2 учун'], kk: ['м² үшін'] }),
  group('pricePerMonth', { ru: ['в месяц', 'за месяц', 'ежемесячно'], en: ['per month', 'monthly'], uk: ['на місяць', 'щомісяця'], ro: ['pe lună', 'lunar'], uzLatn: ['oyiga'], uzCyrl: ['ойига'], kk: ['айына'] }),
  group('pricePerDay', { ru: ['в сутки', 'за сутки', 'за ночь'], en: ['per day', 'daily', 'per night'], uk: ['за добу', 'за ніч'], ro: ['pe zi', 'pe noapte'], uzLatn: ['kuniga', 'sutkaga'], uzCyrl: ['кунига', 'суткага'], kk: ['тәулігіне', 'күніне'] }),
  group('pricePerHour', { ru: ['за час', 'почасово'], en: ['per hour', 'hourly'], uk: ['за годину', 'погодинно'], ro: ['pe oră'], uzLatn: ['soatiga'], uzCyrl: ['соатига'], kk: ['сағатына'] }),
]);

export const PRICE_MODIFIERS = Object.freeze([
  group('negotiable', { ru: ['торг', 'торг уместен', 'торг возможен', 'разумный торг'], en: ['negotiable', 'offers considered'], uk: ['торг', 'можливий торг'], ro: ['negociabil'], uzLatn: ['kelishamiz', 'narxi kelishiladi'], uzCyrl: ['келишамиз', 'нархи келишилади'], kk: ['сауда бар', 'келісуге болады'] }),
  group('fixed', { ru: ['без торга', 'цена окончательная', 'цена фиксированная'], en: ['fixed price', 'non-negotiable'], uk: ['без торгу', 'ціна остаточна'], ro: ['preț fix', 'nenegociabil'], uzLatn: ['narx qat’iy'], uzCyrl: ['нарх қатъий'], kk: ['баға тұрақты'] }),
  group('reduced', { ru: ['цена снижена', 'ниже рынка'], en: ['reduced price', 'below market'], uk: ['ціну знижено', 'нижче ринку'], ro: ['preț redus', 'sub prețul pieței'], uzLatn: ['narx tushirildi'], uzCyrl: ['нарх туширилди'], kk: ['баға төмендетілді'] }),
  group('urgent', { ru: ['срочно', 'срочная продажа', 'горящая цена'], en: ['urgent sale', 'urgent'], uk: ['терміново', 'терміновий продаж'], ro: ['urgent', 'vânzare urgentă'], uzLatn: ['shoshilinch', 'tez sotiladi'], uzCyrl: ['шошилинч'], kk: ['шұғыл'] }),
]);

export const RENT_DURATION_TERMS = Object.freeze([
  group('hourly', { ru: ['почасово', 'на час'], en: ['hourly', 'per hour'], uk: ['погодинно'], ro: ['pe oră'], uzLatn: ['soatlik'], uzCyrl: ['соатлик'], kk: ['сағаттық'] }),
  group('daily', { ru: ['посуточно', 'на сутки'], en: ['daily', 'per day'], uk: ['подобово', 'на добу'], ro: ['pe zi'], uzLatn: ['kunlik', 'sutkalik'], uzCyrl: ['кунлик', 'суткалик'], kk: ['тәуліктік', 'күндік'] }),
  group('monthly', { ru: ['помесячно'], en: ['monthly'], uk: ['помісячно'], ro: ['lunar'], uzLatn: ['oylik'], uzCyrl: ['ойлик'], kk: ['ай сайын'] }),
  group('shortTerm', { ru: ['краткосрочно', 'на несколько месяцев'], en: ['short term'], uk: ['короткостроково'], ro: ['pe termen scurt'], uzLatn: ['qisqa muddatga'], uzCyrl: ['қисқа муддатга'], kk: ['қысқа мерзімге'] }),
  group('longTerm', { ru: ['долгосрочно', 'на длительный срок', 'минимум на год'], en: ['long term', 'long-term'], uk: ['довгостроково'], ro: ['pe termen lung'], uzLatn: ['uzoq muddatga'], uzCyrl: ['узоқ муддатга'], kk: ['ұзақ мерзімге'] }),
  group('fixedTerm', { ru: ['до конца года', 'до сентября'], en: ['until the end of the year', 'until september'], uk: ['до кінця року'], ro: ['până la sfârșitul anului'], uzLatn: ['yil oxirigacha', 'yilning oxirigacha', 'yilning oxiri dekabrgacha'], uzCyrl: ['йил охиригача'], kk: ['жыл соңына дейін'] }),
]);

export const FLOOR_CONSTRAINT_TERMS = Object.freeze([
  group('notFirst', { ru: ['не первый этаж', 'не 1 этаж'], en: ['not first floor'], uk: ['не перший поверх'], ro: ['nu primul etaj'], uzLatn: ['birinchi qavat emas'], uzCyrl: ['биринчи қават эмас'], kk: ['бірінші қабат емес'] }),
  group('notLast', { ru: ['не последний этаж'], en: ['not top floor', 'not last floor'], uk: ['не останній поверх'], ro: ['nu ultimul etaj'], uzLatn: ['oxirgi qavat emas'], uzCyrl: ['охирги қават эмас'], kk: ['соңғы қабат емес'] }),
  group('first', { ru: ['первый этаж', '1 этаж'], en: ['first floor'], uk: ['перший поверх'], ro: ['primul etaj'], uzLatn: ['birinchi qavat'], uzCyrl: ['биринчи қават'], kk: ['бірінші қабат'] }),
  group('last', { ru: ['последний этаж'], en: ['top floor', 'last floor'], uk: ['останній поверх'], ro: ['ultimul etaj'], uzLatn: ['oxirgi qavat'], uzCyrl: ['охирги қават'], kk: ['соңғы қабат'] }),
  group('basement', { ru: ['цоколь', 'подвал'], en: ['basement'], uk: ['цоколь', 'підвал'], ro: ['demisol', 'subsol'], uzLatn: ['podval'], uzCyrl: ['подвал'], kk: ['жертөле'] }),
  group('attic', { ru: ['мансарда'], en: ['attic', 'mansard'], uk: ['мансарда'], ro: ['mansardă'], uzLatn: ['mansarda'], uzCyrl: ['мансарда'], kk: ['мансарда'] }),
]);

export const FURNITURE_STATE_TERMS = Object.freeze([
  group('full', { ru: ['полностью меблирована', 'вся мебель', 'с мебелью'], en: ['fully furnished', 'furnished'], uk: ['повністю мебльована', 'з меблями'], ro: ['complet mobilat', 'mobilat'], uzLatn: ['to‘liq mebelli', "to'liq mebelli"], uzCyrl: ['тўлиқ мебелли'], kk: ['толық жиһаздалған'] }),
  group('partial', { ru: ['частично меблирована', 'частично с мебелью'], en: ['partly furnished', 'partially furnished'], uk: ['частково мебльована'], ro: ['parțial mobilat'], uzLatn: ['qisman mebelli'], uzCyrl: ['қисман мебелли'], kk: ['ішінара жиһаздалған'] }),
  group('none', { ru: ['без мебели', 'пустая квартира'], en: ['unfurnished', 'without furniture'], uk: ['без меблів'], ro: ['nemobilat'], uzLatn: ['mebelsiz'], uzCyrl: ['мебелсиз'], kk: ['жиһазсыз'] }),
]);

export const PET_POLICY_TERMS = Object.freeze([
  group('notAllowed', { ru: ['без животных', 'с животными нельзя', 'животных нельзя'], en: ['no pets', 'pets not allowed'], uk: ['без тварин', 'з тваринами не можна'], ro: ['fără animale', 'animalele nu sunt permise'], uzLatn: ['hayvonsiz', 'uy hayvonlari mumkin emas'], uzCyrl: ['ҳайвонсиз'], kk: ['жануарларсыз', 'үй жануарларына болмайды'] }),
  group('conditional', { ru: ['животные по согласованию', 'с животными по договоренности'], en: ['pets negotiable', 'pets by agreement'], uk: ['тварини за домовленістю'], ro: ['animale cu acord'], uzLatn: ['hayvonlar kelishuv asosida'], uzCyrl: ['ҳайвонлар келишув асосида'], kk: ['жануарлар келісім бойынша'] }),
  group('allowed', { ru: ['с животными можно', 'можно с котом', 'можно с собакой'], en: ['pets allowed', 'pet friendly'], uk: ['з тваринами можна'], ro: ['animale permise'], uzLatn: ['hayvon bilan mumkin'], uzCyrl: ['ҳайвон билан мумкин'], kk: ['үй жануарларымен болады'] }),
]);

export const CHILD_POLICY_TERMS = Object.freeze([
  group('notAllowed', { ru: ['без детей', 'с детьми нельзя'], en: ['no children', 'children not allowed'], uk: ['без дітей', 'з дітьми не можна'], ro: ['fără copii'], uzLatn: ['bolalarsiz'], uzCyrl: ['болаларсиз'], kk: ['баласыз'] }),
  group('allowed', { ru: ['с детьми можно', 'можно с детьми'], en: ['children allowed', 'families with children welcome'], uk: ['з дітьми можна'], ro: ['copii acceptați'], uzLatn: ['bolalar bilan mumkin'], uzCyrl: ['болалар билан мумкин'], kk: ['балалармен болады'] }),
]);

export const SMOKING_POLICY_TERMS = Object.freeze([
  group('notAllowed', { ru: ['курить нельзя', 'не курить', 'некурящим'], en: ['no smoking', 'smoking not allowed'], uk: ['палити не можна'], ro: ['fumatul interzis'], uzLatn: ['chekish mumkin emas'], uzCyrl: ['чекиш мумкин эмас'], kk: ['темекі шегуге болмайды'] }),
  group('allowed', { ru: ['курить можно'], en: ['smoking allowed'], uk: ['палити можна'], ro: ['fumat permis'], uzLatn: ['chekish mumkin'], uzCyrl: ['чекиш мумкин'], kk: ['темекі шегуге болады'] }),
]);

export const DOCUMENT_STATUS_TERMS = Object.freeze([
  group('cadastralReady', { ru: ['кадастр есть', 'кадастр готов', 'кадастровые документы готовы'], en: ['cadastral documents ready', 'cadastre ready'], uk: ['кадастр готовий'], ro: ['cadastru gata'], uzLatn: ['kadastr bor', 'kadastr tayyor'], uzCyrl: ['кадастр бор', 'кадастр тайёр'], kk: ['кадастр дайын'] }),
  group('ownership', { ru: ['право собственности', 'документы на руках'], en: ['ownership title', 'title deed'], uk: ['право власності'], ro: ['drept de proprietate'], uzLatn: ['mulk huquqi'], uzCyrl: ['мулк ҳуқуқи'], kk: ['меншік құқығы'] }),
  group('documentsReady', { ru: ['документы в порядке', 'документы готовы'], en: ['documents ready', 'documents in order'], uk: ['документи готові', 'документи в порядку'], ro: ['documente în regulă'], uzLatn: ['hujjatlari joyida', 'hujjatlar joyida', 'hujjatlar tayyor'], uzCyrl: ['ҳужжатлари жойида', 'ҳужжатлар жойида', 'ҳужжатлар тайёр'], kk: ['құжаттар дайын'] }),
  group('contractAvailable', { ru: ['договор оформим', 'договор составим', 'договор оформляется'], en: ['contract available', 'contract can be arranged'], uk: ['договір оформимо'], ro: ['contract disponibil'], uzLatn: ['shartnoma ham qilib beriladi', 'shartnoma qilib beriladi'], uzCyrl: ['шартнома ҳам қилиб берилади', 'шартнома қилиб берилади'], kk: ['келісімшарт жасалады'] }),
  group('noEncumbrance', { ru: ['без обременений', 'обременений нет'], en: ['no encumbrances', 'free of encumbrances'], uk: ['без обтяжень'], ro: ['fără sarcini'], uzLatn: ['taqiqsiz'], uzCyrl: ['тақиқсиз'], kk: ['ауыртпалықсыз'] }),
  group('encumbered', { ru: ['в залоге', 'под арестом', 'есть обременение'], en: ['encumbered', 'under lien'], uk: ['в заставі', 'є обтяження'], ro: ['cu sarcini'], uzLatn: ['garovda'], uzCyrl: ['гаровда'], kk: ['кепілде'] }),
  group('nobodyRegistered', { ru: ['никто не прописан'], en: ['nobody registered'], uk: ['ніхто не зареєстрований'], ro: ['nimeni înregistrat'], uzLatn: ['hech kim ro‘yxatda emas'], uzCyrl: ['ҳеч ким рўйхатда эмас'], kk: ['ешкім тіркелмеген'] }),
]);

export const FINANCING_TERMS = Object.freeze([
  group('mortgageAllowed', { ru: ['ипотека возможна', 'подходит под ипотеку'], en: ['mortgage available', 'mortgage eligible'], uk: ['іпотека можлива'], ro: ['credit ipotecar posibil'], uzLatn: ['ipoteka mumkin'], uzCyrl: ['ипотека мумкин'], kk: ['ипотека болады'] }),
  group('mortgageNotAllowed', { ru: ['не ипотека', 'ипотека невозможна', 'только наличные'], en: ['no mortgage', 'cash only'], uk: ['іпотека неможлива', 'лише готівка'], ro: ['fără ipotecă', 'doar numerar'], uzLatn: ['ipoteka yo‘q', 'faqat naqd'], uzCyrl: ['ипотека йўқ', 'фақат нақд'], kk: ['ипотека жоқ', 'тек қолма-қол'] }),
  group('installment', { ru: ['рассрочка', 'беспроцентная рассрочка'], en: ['installment', 'payment plan'], uk: ['розстрочка'], ro: ['rate', 'plată în rate'], uzLatn: ['bo‘lib to‘lash'], uzCyrl: ['бўлиб тўлаш'], kk: ['бөліп төлеу'] }),
]);

export const LOCATION_RELATIONS = Object.freeze([
  group('near', { ru: ['рядом с', 'возле', 'около'], en: ['near', 'next to', 'close to'], uk: ['поруч', 'біля'], ro: ['lângă', 'aproape de'], uzLatn: ['yaqinida', 'yonida', 'yaqin'], uzCyrl: ['яқинида', 'ёнида', 'яқин'], kk: ['жанында', 'маңында'] }),
  group('opposite', { ru: ['напротив', 'через дорогу'], en: ['opposite', 'across the road'], uk: ['навпроти', 'через дорогу'], ro: ['vizavi', 'peste drum'], uzLatn: ['ro‘parasida'], uzCyrl: ['рўпарасида'], kk: ['қарсысында'] }),
  group('behind', { ru: ['за парком', 'за рынком', 'за базаром'], en: ['behind'], uk: ['за парком'], ro: ['în spatele'], uzLatn: ['orqasida'], uzCyrl: ['орқасида'], kk: ['артында'] }),
  group('intersection', { ru: ['на пересечении', 'на перекрёстке', 'перекрёсток'], en: ['at the intersection', 'crossroads'], uk: ['на перехресті'], ro: ['la intersecție'], uzLatn: ['chorrahada'], uzCyrl: ['чорраҳада'], kk: ['қиылыста'] }),
  group('walkingDistance', { ru: ['минут пешком', 'пешая доступность'], en: ['minutes walk', 'walking distance'], uk: ['хвилин пішки'], ro: ['minute pe jos'], uzLatn: ['daqiqa piyoda'], uzCyrl: ['дақиқа пиёда'], kk: ['минут жаяу'] }),
  group('drivingDistance', { ru: ['минут на машине', 'минут на авто'], en: ['minutes by car', 'minutes drive'], uk: ['хвилин машиною'], ro: ['minute cu mașina'], uzLatn: ['daqiqa mashinada'], uzCyrl: ['дақиқа машинада'], kk: ['минут көлікпен'] }),
]);

export const AVAILABILITY_TERMS = Object.freeze([
  group('availableNow', { ru: ['свободна', 'свободно', 'можно заезжать', 'готова к заселению'], en: ['available now', 'ready to move in', 'move in now'], uk: ['вільна', 'можна заселятися'], ro: ['disponibil acum'], uzLatn: ['hozir bo‘sh', 'ko‘chib kirish mumkin'], uzCyrl: ['ҳозир бўш'], kk: ['қазір бос', 'кіруге болады'] }),
  group('availableFrom', { ru: ['с 1 сентября', 'будет свободна с', 'освободится'], en: ['available from', 'move-in from'], uk: ['вільна з'], ro: ['disponibil din'], uzLatn: ['dan boshlab bo‘sh'], uzCyrl: ['дан бошлаб бўш'], kk: ['бастап бос'] }),
]);

export const LISTING_STATUS_TERMS = Object.freeze([
  group('sold', { ru: ['продано', 'уже продали'], en: ['sold'], uk: ['продано'], ro: ['vândut'], uzLatn: ['sotildi'], uzCyrl: ['сотилди'], kk: ['сатылды'] }),
  group('rented', { ru: ['сдано', 'уже сдали', 'уже сдана'], en: ['rented', 'already rented'], uk: ['здано', 'вже здали'], ro: ['închiriat'], uzLatn: ['ijaraga berildi'], uzCyrl: ['ижарага берилди'], kk: ['жалға берілді'] }),
  group('reserved', { ru: ['бронь', 'забронировано', 'в резерве'], en: ['reserved', 'booked'], uk: ['бронь', 'заброньовано'], ro: ['rezervat'], uzLatn: ['bron qilingan'], uzCyrl: ['брон қилинган'], kk: ['броньдалған'] }),
  group('closed', { ru: ['не актуально', 'неактуально', 'снято с продажи', 'объявление закрыто'], en: ['not available', 'listing closed', 'withdrawn'], uk: ['не актуально', 'знято з продажу'], ro: ['nu mai este disponibil'], uzLatn: ['aktual emas'], uzCyrl: ['актуал эмас'], kk: ['өзекті емес'] }),
  group('outdated', { ru: ['архив', 'архивное объявление'], en: ['archive', 'archived listing'], uk: ['архів'], ro: ['arhivă'], uzLatn: ['arxiv'], uzCyrl: ['архив'], kk: ['мұрағат'] }),
  group('active', { ru: ['актуально', 'ещё актуально', 'еще актуально'], en: ['available', 'still available', 'active'], uk: ['актуально', 'ще актуально'], ro: ['disponibil'], uzLatn: ['aktual'], uzCyrl: ['актуал'], kk: ['өзекті'] }),
]);

const statusPriority = Object.freeze(['sold', 'rented', 'reserved', 'closed', 'outdated', 'active']);

function resolveFloorConstraints(text) {
  const values = all(text, FLOOR_CONSTRAINT_TERMS);
  const out = new Set(values);
  if (/(?:не\s+(?:первый|1)|not\s+first|не\s+перший|nu\s+primul|birinchi\s+qavat\s+emas|бірінші\s+қабат\s+емес)[^.!?\n]{0,32}(?:этаж|floor|поверх|etaj|qavat|қабат)/iu.test(text)) out.add('notFirst');
  if (out.has('notFirst')) out.delete('first');
  if (out.has('notLast')) out.delete('last');
  return [...out];
}

export function parseHousingContext(value) {
  const text = String(value || '');
  if (!text.trim()) return deepFreeze({
    condition: null, layouts: [], buildingType: null, buildingStatus: null,
    priceContext: null, priceModifiers: [], rentDuration: null, floorConstraints: [],
    furniture: null, tenantPolicies: { pets: null, children: null, smoking: null },
    documents: [], financing: [], locationRelations: [], availability: null, listingStatus: null,
  });

  const statuses = all(text, LISTING_STATUS_TERMS);
  const listingStatus = statusPriority.find((status) => statuses.includes(status)) || null;

  return deepFreeze({
    condition: first(text, PROPERTY_CONDITION_TERMS),
    layouts: all(text, LAYOUT_TERMS),
    buildingType: first(text, BUILDING_TYPE_TERMS),
    buildingStatus: first(text, BUILDING_STATUS_TERMS),
    priceContext: first(text, PROPERTY_PRICE_CONTEXT),
    priceModifiers: all(text, PRICE_MODIFIERS),
    rentDuration: first(text, RENT_DURATION_TERMS),
    floorConstraints: resolveFloorConstraints(text),
    furniture: first(text, FURNITURE_STATE_TERMS),
    tenantPolicies: {
      pets: first(text, PET_POLICY_TERMS),
      children: first(text, CHILD_POLICY_TERMS),
      smoking: first(text, SMOKING_POLICY_TERMS),
    },
    documents: all(text, DOCUMENT_STATUS_TERMS),
    financing: all(text, FINANCING_TERMS),
    locationRelations: all(text, LOCATION_RELATIONS),
    availability: first(text, AVAILABILITY_TERMS),
    listingStatus,
  });
}
