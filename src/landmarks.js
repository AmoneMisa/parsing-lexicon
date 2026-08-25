import { lexiconEntity } from './lexicon-core.js';
const group = (canonical, aliases) => lexiconEntity(canonical, aliases);

export const GENERIC_LANDMARK_TERMS = Object.freeze([
  group('Park', { ru: ['парк'], en: ['park'], uk: ['парк'], ro: ['parc'], uzLatn: ["bog'", 'bog‘', 'bogʻ', 'park'], uzCyrl: ['боғ', 'парк'], kk: ['саябақ', 'парк'] }),
  group('Metro', { ru: ['метро', 'станция метро'], en: ['metro', 'subway station'], uk: ['метро', 'станція метро'], ro: ['metrou', 'stație de metrou'], uzLatn: ['metro', 'metro bekati'], uzCyrl: ['метро', 'метро бекати'], kk: ['метро', 'метро станциясы'] }),
  group('Bus stop', { ru: ['автобусная остановка', 'остановка автобуса', 'конечная автобуса'], en: ['bus stop', 'bus station'], uk: ['автобусна зупинка', 'зупинка автобуса'], ro: ['stație de autobuz', 'statie de autobuz'], uzLatn: ['avtobus bekati', 'avtobus kanichka', 'avtobus kanichkasi', 'avtobus konichka', 'avtobus konichkasi'], uzCyrl: ['автобус бекати'], kk: ['автобус аялдамасы'] }),
  group('Clinic', { ru: ['поликлиника', 'клиника'], en: ['clinic', 'polyclinic'], uk: ['поліклініка', 'клініка'], ro: ['clinică', 'clinica', 'policlinică', 'policlinica'], uzLatn: ['poliklinika', 'poleklinika', 'klinika'], uzCyrl: ['поликлиника', 'клиника'], kk: ['емхана', 'клиника'] }),
  group('Hospital', { ru: ['больница', 'госпиталь'], en: ['hospital'], uk: ['лікарня', 'госпіталь'], ro: ['spital'], uzLatn: ['shifoxona', 'kasalxona'], uzCyrl: ['шифохона', 'касалхона'], kk: ['аурухана'] }),
  group('School', { ru: ['школа', 'школы', 'школу', 'школе'], en: ['school'], uk: ['школа', 'школи', 'школу'], ro: ['școală', 'scoala'], uzLatn: ['maktab'], uzCyrl: ['мактаб'], kk: ['мектеп'] }),
  group('Kindergarten', { ru: ['детский сад', 'садик'], en: ['kindergarten', 'nursery'], uk: ['дитячий садок', 'садочок'], ro: ['grădiniță', 'gradinita'], uzLatn: ["bolalar bog'chasi", 'bolalar bog‘chasi', 'bogcha'], uzCyrl: ['болалар боғчаси', 'боғча'], kk: ['балабақша'] }),
  group('University', { ru: ['университет', 'институт'], en: ['university', 'institute'], uk: ['університет', 'інститут'], ro: ['universitate', 'institut'], uzLatn: ['universitet', 'institut'], uzCyrl: ['университет', 'институт'], kk: ['университет', 'институт'] }),
  group('Shopping center', { ru: ['тц', 'трц', 'торговый центр'], en: ['shopping center', 'shopping centre', 'mall'], uk: ['тц', 'трц', 'торговий центр'], ro: ['centru comercial', 'mall'], uzLatn: ['savdo markazi', 'mall'], uzCyrl: ['савдо маркази'], kk: ['сауда орталығы', 'сауда үйі'] }),
  group('Supermarket', { ru: ['супермаркет', 'гипермаркет'], en: ['supermarket', 'hypermarket'], uk: ['супермаркет', 'гіпермаркет'], ro: ['supermarket', 'hipermarket'], uzLatn: ['supermarket', 'gipermarket'], uzCyrl: ['супермаркет', 'гипермаркет'], kk: ['супермаркет', 'гипермаркет'] }),
  group('Market', { ru: ['рынок', 'базар'], en: ['market', 'bazaar'], uk: ['ринок', 'базар'], ro: ['piață', 'piata', 'bazar'], uzLatn: ['bozor', 'bazar'], uzCyrl: ['бозор', 'базар'], kk: ['базар', 'нарық'] }),
  group('Pharmacy', { ru: ['аптека'], en: ['pharmacy', 'drugstore'], uk: ['аптека'], ro: ['farmacie'], uzLatn: ['dorixona', 'apteka'], uzCyrl: ['дорихона', 'аптека'], kk: ['дәріхана', 'аптека'] }),
  group('Mosque', { ru: ['мечеть'], en: ['mosque'], uk: ['мечеть'], ro: ['moschee'], uzLatn: ['masjid'], uzCyrl: ['масжид'], kk: ['мешіт'] }),
  group('Church', { ru: ['церковь', 'храм'], en: ['church', 'cathedral'], uk: ['церква', 'храм', 'собор'], ro: ['biserică', 'biserica', 'catedrală', 'catedrala'], uzLatn: ['cherkov', 'ibodatxona'], uzCyrl: ['черков'], kk: ['шіркеу', 'собор'] }),
  group('Railway station', { ru: ['вокзал', 'железнодорожный вокзал'], en: ['railway station', 'train station'], uk: ['вокзал', 'залізничний вокзал'], ro: ['gară', 'gara', 'gară feroviară', 'gara feroviara'], uzLatn: ['vokzal', 'temir yol vokzali', "temir yo'l vokzali"], uzCyrl: ['вокзал', 'темир йўл вокзали'], kk: ['теміржол вокзалы', 'вокзал'] }),
  group('Airport', { ru: ['аэропорт'], en: ['airport'], uk: ['аеропорт'], ro: ['aeroport'], uzLatn: ['aeroport'], uzCyrl: ['аэропорт'], kk: ['әуежай', 'аэропорт'] }),
]);
