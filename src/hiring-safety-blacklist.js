// Time-sensitive curated data consumed by hiring-safety.js's classification
// logic. Kept in its own file so updating a blacklist/allowlist never means
// touching the (stable) regex classification code, and vice versa.

export const SCAM_CONTACTS = [
  ['telegram:valery_hr_36', /(?:^|[^a-z0-9_])@?valery_hr_36(?:$|[^a-z0-9_])/i],
  ['telegram:kris_mogelevich7', /(?:^|[^a-z0-9_])@?kris_mogelevich7(?:$|[^a-z0-9_])/i],
  ['telegram:gasgazz_07', /(?:^|[^a-z0-9_])@?gasgazz_07(?:$|[^a-z0-9_])/i],
  ['phone:+998992993435', /(?:\+?998[\s()-]*)99[\s()-]*299[\s()-]*34[\s()-]*35/],
  ['phone:+998992600344', /(?:\+?998[\s()-]*)99[\s()-]*260[\s()-]*03[\s()-]*44/],
  ['phone:+998931244802', /(?:\+?998[\s()-]*)93[\s()-]*124[\s()-]*48[\s()-]*02/],
];

// Exact Telegram handles from reviewed external blacklists. User comments / "please
// check" submissions are deliberately excluded; only the editorial/list body is used.
export const REPORTED_TELEGRAM_BY_SOURCE = {
  moshelovka: [
    'pitupishka', 'obnalmanua1', 'p2p_lab_processing', 'hoodmoneyp2p', 'p2prvt',
    'protsessing', 'protsessing0', 'dropovod01k_chat', 'processing_skupka', 'mamonts',
    'brown_bear0', 'mediap2p', 'proseccina', 'amanatniy', 'pitupitradersrf',
    'russiantradersclubs', 'vvaybit',
  ],
  vklader: [
    'dobro_ot_yana', 'senpaj_help', 'shinobi_help', 'daime_helper', 'ninja_inform',
    'ninja_invest', 'assistent_ninja', 'alex_resolution', 'alex_crypto_way',
    'joecopytrade_bot', 'kirill_onchain', 'cryptolnspect', 'ghostl1', 'slashl1',
    'alexandrzenin', 'seriy_crypt', 'airolejon', 'olekitka', 'poizonrider',
    'poizonriderrobot', 'riderfeedback', 'poizonridersupport', 'poizondaniel',
    'poizonfenix', 'poizonsector', 'poizonlevel', 'poizonline', 'poizongo',
    'poizonoffice', 'poizonnation', 'poizonstorm', 'poizonsystem', 'poizonaura',
    'islyam_t', 'ethio_adam', 'vitalikadminn', 'ilya_vias', 'taddypedy', 'happyroman',
    'maxhappyict', 'rrrrviprr_bot', 'artem1991v', 'samuray_new', 'gen_zemtsov',
    'shortist_owner', 'arbitrage_capital', 'vladimir_arbitrage', 'mkwaydq',
    'poslednii_chance', 'romantradee', 'white_voronbtc', 'white_crow_btc',
    'unilive_network', 'potokcash', 'cashflowfund', 'potokpoint', 'cash_potok',
    'cashflowtime', 'kate_559', 'capitalforward', 'allocation_ay', 'andraicrypto',
    'andraicrypto_manager', 'vladbelokrylov', 'mersedes1_1', 'vadim_hub', 'david_gg7',
    'konstantinpravda', 'marafondeadinrich_bot', 'maratwhale', 'marat_whale',
    'fadeev_trade', 'andreysrbrv', 'speculant_g', 'sniperusdt', 'ratner_official',
    'arthurratner', 'markglavnyy', 'savivoin', 'l1r1q', 'arturomega', 'rodioncrypt0',
    'vipbyrodion_bot', 'magistr_tr', 'maxcrypto_adm', 'snipervip0001_bot', 'denis_longist',
    'alexeyaltador', 'anton_manag', 'twotradeowner', 'alexey_maker', 'alex_profitmaker',
    'hivetrader', 'robert_crypto98', 'neesmshnyi_bot', 'crypto_compass_btc', 'ska1pgod',
    'ternov_alexi', 'ternovhellobot', 'rafael_markov', 'cap_scalperr', 'dmitrukotov',
    'dmitrukot', 'crypto_partners_bot', 'learnarb_crypto', 'alinnainvest', 'speculyantt',
    'alex1trader', 'alexodessa_invest', 'alexodessa', 'maxbrotrd', 'mbro_pocket',
    'sergosnova', 'seedwalletshop_bot', 'seedpkultrasbot', 'arbitrageeproc', 'lebed_off',
    'cryptobotarbitrage_bot', 'youmentor_anna', 'kowalrenata', 'lunosupportstradebot',
    'nikicrypto_stre', 'exmonftmarket_bot', 'pr1vatee_roman', 'roman_pr1vat', 'rich_dmitry',
    'rudi_dmitry', 'sd_0986_bot', 'igor_richman', 'alex_wise_trade', 'alex_wiseman',
    'brokertribunai', 'tradelab_bot', 'tradelab_channel', 'tradelab_community',
    'superrare_thebot', 'traderr_server', 'trader_serverr', 'trader_servers',
    'traderer_stock', 'tanyamikheeva_pro_dengi', 'tanyamikheeva', 'veraastroguide',
    'daryu_money', 'mur_anastasi_official', 'dengisvoim_bot', 'minaevosnova',
    'pumpdumpcrypto_bot', 'trader_servver', 'traderr_serverl', 'maximonchain',
    'crypro_objectt', 'litvinov_teach', 'andrey_onchain', 'bank_tbx_bot', 'crypto_objectt',
  ],
};

export const REPORTED_TELEGRAM_INVITES = [
  ['moshelovka:invite-hqnj', 't.me/+-hqnjkgsgha2zwm0'],
  ['moshelovka:invite-adhp', 't.me/+adhpbvvjddk2njfi'],
  ['vklader:penguin-protocol', 't.me/+jqffw2xgl04wytux'],
  ['vklader:velvethaze', 't.me/joinchat/57q3oqqv_ea2njhi'],
  ['vklader:pump', 't.me/+6ddntu5hsuo3ntmy'],
  ['vklader:bullvault', 't.me/joinchat/5ll_t_cthgbhytri'],
  ['vklader:lumencap', 't.me/joinchat/dbmlm5ieytezmwji'],
  ['vklader:cryptoosnova', 't.me/joinchat/zylzt2q8gmc1mjyy'],
];

// Current licensed private employment agencies in Uzbekistan.
// Snapshot of the official Migration Agency register, updated there on 2026-08-08.
// Absence is a SOFT signal only; direct foreign employers are not intermediaries.
export const UZ_LICENSED_FOREIGN_EMPLOYMENT_AGENCIES = [
  'reiwa', 'migo overseas consulting', 'turon world cooperation', 'specialist group',
  'naimix', 'common sense', 'dhaef global', 'job maker', 'the best-staff', 'mir power',
  'horizon work', 'world wide immigration', 'the kasb', 'best globalize',
  'gotalent international', 'globalhr', 'international migration line', 'work expert',
  'viza master', 'diamor', 'fairness japan', 'getwork', 'garant immigration',
  'youth globe', 'jobbridge', 'aimjob', 'worknet', 'gilen jobs', 'interwork', 'oukaway',
  'bestwill', 'world bridge', 'gate', 'immigration service', 'visacentrum',
  'resurs export group', 'imkon', 'trust migration', 'united careers', 'talantum group',
  'skd man power', 'qadam global', 'workline', 'meros job', 'hr job start',
  'mora work group', 'jobex',
];
