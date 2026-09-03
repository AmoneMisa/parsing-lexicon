import { aliasesToRegex, normalizeForMatch } from './normalization.js';
import { ROMANIAN_GROUP_ALIASES, ROMANIAN_PROFESSION_ALIASES, ROMANIAN_SENIORITY_ALIASES } from './hiring-professions-ro.js';

const GROUP_DEFINITIONS = Object.freeze([
  ['software_development', 'engineering', ['software development', 'разработка', 'программирование', 'розробка', 'dasturlash', 'бағдарламалау']],
  ['quality_assurance', 'engineering', ['quality assurance', 'qa', 'тестирование', 'тестування']],
  ['infrastructure', 'engineering', ['infrastructure', 'devops', 'platform engineering', 'инфраструктура', 'системное администрирование']],
  ['data', 'engineering', ['data', 'analytics', 'данные', 'аналитика', 'ma’lumotlar', 'деректер']],
  ['information_security', 'engineering', ['information security', 'cybersecurity', 'информационная безопасность', 'кибербезопасность']],
  ['design', 'creative', ['design', 'дизайн', 'дизайн']],
  ['product', 'management', ['product', 'продукт', 'продакт']],
  ['project_management', 'management', ['project management', 'управление проектами', 'керування проєктами']],
  ['sales', 'commercial', ['sales', 'продажи', 'продажі', 'sotuv', 'сату']],
  ['marketing', 'commercial', ['marketing', 'маркетинг']],
  ['finance', 'business', ['finance', 'accounting', 'финансы', 'бухгалтерия', 'фінанси']],
  ['human_resources', 'business', ['human resources', 'hr', 'recruitment', 'персонал', 'рекрутинг']],
  ['customer_support', 'operations', ['customer support', 'support', 'поддержка', 'підтримка', 'qo‘llab-quvvatlash']],
  ['administration', 'operations', ['administration', 'office', 'администрация', 'офис']],
  ['logistics', 'operations', ['logistics', 'warehouse', 'логистика', 'склад']],
  ['retail', 'commercial', ['retail', 'магазин', 'розница', 'ритейл']],
  ['hospitality', 'service', ['hospitality', 'horeca', 'ресторан', 'кафе', 'отель']],
  ['medicine', 'healthcare', ['medicine', 'healthcare', 'медицина', 'медицина']],
  ['education', 'education', ['education', 'teaching', 'образование', 'освіта']],
  ['construction', 'trades', ['construction', 'строительство', 'будівництво']],
  ['manufacturing', 'trades', ['manufacturing', 'production', 'производство', 'виробництво']],
  ['transport', 'operations', ['transport', 'driving', 'транспорт', 'водители']],
  ['security', 'service', ['security', 'охрана', 'күзет']],
  ['legal', 'business', ['legal', 'law', 'юристы', 'право', 'юридический']],
  ['media_content', 'creative', ['media', 'content', 'контент', 'медиа']],
  ['beauty_wellness', 'service', ['beauty', 'wellness', 'красота', 'бьюти']],
  ['agriculture', 'trades', ['agriculture', 'farm', 'сельское хозяйство', 'агро']],
]);

const groupAliases = (canonical, aliases) => [...new Set([...aliases, ...(ROMANIAN_GROUP_ALIASES[canonical] || [])])];
const GROUP_META = new Map(GROUP_DEFINITIONS.map(([canonical, family, aliases]) => [canonical, { family, aliases: groupAliases(canonical, aliases) }]));

const rows = [
  // Software development
  ['software_developer','software_development',['software developer','software developers','software engineer','software engineers','programmer','programmers','программист','программисты','разработчик ПО','разработчики ПО','розробник ПЗ','розробники ПЗ','dasturchi','бағдарламашы'],['developer','developers','разработчик','разработчики','разработчиками']],
  ['frontend_developer','software_development',['frontend developer','front-end developer','frontend engineer','фронтенд разработчик','фронтендер','фронтенд розробник','frontend dasturchi','frontend әзірлеуші']],
  ['backend_developer','software_development',['backend developer','back-end developer','backend engineer','бэкенд разработчик','бекенд розробник','backend dasturchi','backend әзірлеуші']],
  ['fullstack_developer','software_development',['fullstack developer','full-stack developer','full stack developer','фулстек разработчик','фулстек розробник','fullstack dasturchi']],
  ['mobile_developer','software_development',['mobile developer','mobile engineer','мобильный разработчик','мобільний розробник']],
  ['ios_developer','software_development',['ios developer','ios engineer','swift developer','ios разработчик']],
  ['android_developer','software_development',['android developer','android engineer','kotlin android developer','android разработчик']],
  ['flutter_developer','software_development',['flutter developer','flutter engineer','flutter разработчик']],
  ['react_native_developer','software_development',['react native developer','react-native developer','react native engineer']],
  ['game_developer','software_development',['game developer','game programmer','разработчик игр','геймдев разработчик']],
  ['unity_developer','software_development',['unity developer','unity3d developer','unity разработчик']],
  ['unreal_developer','software_development',['unreal developer','unreal engine developer','ue developer']],
  ['embedded_developer','software_development',['embedded developer','embedded engineer','embedded software engineer','встраиваемые системы разработчик']],
  ['firmware_engineer','software_development',['firmware engineer','firmware developer','разработчик прошивок']],
  ['desktop_developer','software_development',['desktop developer','desktop application developer','разработчик desktop приложений']],
  ['blockchain_developer','software_development',['blockchain developer','web3 developer','smart contract developer','блокчейн разработчик']],
  ['solutions_architect','software_development',['solutions architect','solution architect','архитектор решений']],
  ['software_architect','software_development',['software architect','application architect','архитектор ПО']],
  ['integration_engineer','software_development',['integration engineer','integration developer','инженер по интеграциям']],
  ['api_developer','software_development',['api developer','api engineer','разработчик api']],
  ['crm_developer','software_development',['crm developer','crm разработчик']],
  ['erp_developer','software_development',['erp developer','erp разработчик']],

  // QA
  ['qa_engineer','quality_assurance',['qa engineer','quality assurance engineer','software tester','тестировщик','qa инженер','тестувальник','testchi'],['qa']],
  ['manual_qa_engineer','quality_assurance',['manual qa','manual qa engineer','manual tester','ручной тестировщик','мануальный тестировщик']],
  ['qa_automation_engineer','quality_assurance',['qa automation engineer','automation qa','test automation engineer','автоматизатор тестирования','qa automation']],
  ['performance_qa_engineer','quality_assurance',['performance test engineer','performance qa','load test engineer','инженер нагрузочного тестирования']],
  ['qa_lead','quality_assurance',['qa lead','test lead','руководитель qa','лид тестирования']],

  // Infrastructure
  ['devops_engineer','infrastructure',['devops engineer','devops','девопс инженер','devops muhandis']],
  ['sre_engineer','infrastructure',['site reliability engineer','sre engineer','sre','инженер надежности']],
  ['platform_engineer','infrastructure',['platform engineer','platform engineering','инженер платформы']],
  ['cloud_engineer','infrastructure',['cloud engineer','cloud infrastructure engineer','облачный инженер']],
  ['system_administrator','infrastructure',['system administrator','sysadmin','системный администратор','системний адміністратор']],
  ['network_engineer','infrastructure',['network engineer','network administrator','сетевой инженер','сетевой администратор']],
  ['database_administrator','infrastructure',['database administrator','dba','администратор баз данных']],
  ['linux_administrator','infrastructure',['linux administrator','linux sysadmin','администратор linux']],
  ['windows_administrator','infrastructure',['windows administrator','windows sysadmin','администратор windows']],

  // Data
  ['data_analyst','data',['data analyst','аналитик данных','аналітик даних','ma’lumotlar tahlilchisi']],
  ['business_analyst','data',['business analyst','бизнес аналитик','бизнес-аналитик','бізнес-аналітик']],
  ['system_analyst','data',['system analyst','systems analyst','системный аналитик','системний аналітик']],
  ['data_engineer','data',['data engineer','инженер данных','інженер даних']],
  ['analytics_engineer','data',['analytics engineer','инженер аналитики']],
  ['data_scientist','data',['data scientist','специалист по data science','дата-сайентист']],
  ['ml_engineer','data',['machine learning engineer','ml engineer','инженер машинного обучения']],
  ['ai_engineer','data',['ai engineer','artificial intelligence engineer','инженер искусственного интеллекта']],
  ['bi_analyst','data',['bi analyst','business intelligence analyst','bi аналитик']],
  ['bi_developer','data',['bi developer','business intelligence developer','bi разработчик']],
  ['database_developer','data',['database developer','sql developer','разработчик баз данных']],
  ['research_scientist','data',['research scientist','applied scientist','исследователь data science']],

  // Security
  ['security_engineer','information_security',['security engineer','cybersecurity engineer','инженер информационной безопасности','инженер иб']],
  ['security_analyst','information_security',['security analyst','soc analyst','аналитик информационной безопасности','аналитик иб']],
  ['penetration_tester','information_security',['penetration tester','pentester','пентестер','специалист по тестированию на проникновение']],
  ['application_security_engineer','information_security',['application security engineer','appsec engineer','appsec']],
  ['security_architect','information_security',['security architect','архитектор информационной безопасности']],
  ['soc_engineer','information_security',['soc engineer','siem engineer','инженер soc']],
  ['grc_specialist','information_security',['grc specialist','information security compliance specialist','специалист grc']],

  // Design
  ['product_designer','design',['product designer','продуктовый дизайнер','продуктовий дизайнер']],
  ['ui_designer','design',['ui designer','interface designer','дизайнер интерфейсов']],
  ['ux_designer','design',['ux designer','user experience designer','ux дизайнер']],
  ['ui_ux_designer','design',['ui ux designer','ux ui designer','ui/ux designer','ui ux дизайнер']],
  ['graphic_designer','design',['graphic designer','графический дизайнер','графічний дизайнер']],
  ['web_designer','design',['web designer','веб дизайнер','веб-дизайнер']],
  ['motion_designer','design',['motion designer','motion graphics designer','моушн дизайнер']],
  ['brand_designer','design',['brand designer','бренд дизайнер']],
  ['interior_designer','design',['interior designer','дизайнер интерьера','дизайнер інтер’єру']],

  // Product and projects
  ['product_manager','product',['product manager','продакт менеджер','продуктовый менеджер','өнім менеджері']],
  ['product_owner','product',['product owner','владелец продукта','власник продукту']],
  ['growth_product_manager','product',['growth product manager','growth pm','менеджер продукта growth']],
  ['product_analyst','product',['product analyst','продуктовый аналитик','продуктовий аналітик']],
  ['scrum_master','product',['scrum master','скрам мастер','скрам-мастер']],
  ['product_operations_manager','product',['product operations manager','product ops manager','product ops']],
  ['project_manager','project_management',['project manager','менеджер проектов','проектный менеджер','менеджер проєктів','loyiha menejeri']],
  ['program_manager','project_management',['program manager','менеджер программ','программный менеджер']],
  ['delivery_manager','project_management',['delivery manager','менеджер по поставке','delivery lead']],
  ['implementation_manager','project_management',['implementation manager','implementation project manager','менеджер внедрения']],
  ['pmo_manager','project_management',['pmo manager','pmo lead','руководитель pmo']],
  ['project_coordinator','project_management',['project coordinator','координатор проектов','координатор проєктів']],

  // Sales
  ['sales_manager','sales',['sales manager','менеджер по продажам','менеджер з продажів','sotuv menejeri','сату менеджері']],
  ['sales_representative','sales',['sales representative','sales rep','торговый представитель','торговий представник']],
  ['account_manager','sales',['account manager','аккаунт менеджер','менеджер по работе с клиентами']],
  ['key_account_manager','sales',['key account manager','kam','менеджер по ключевым клиентам']],
  ['business_development_manager','sales',['business development manager','bdm','менеджер по развитию бизнеса']],
  ['sales_development_representative','sales',['sales development representative','sdr','sales development rep']],
  ['business_development_representative','sales',['business development representative','bdr']],
  ['sales_director','sales',['sales director','director of sales','директор по продажам','руководитель отдела продаж']],
  ['real_estate_agent','sales',['real estate agent','realtor','риелтор','риэлтор','агент по недвижимости']],
  ['insurance_agent','sales',['insurance agent','страховой агент','страховий агент']],
  ['loan_officer','sales',['loan officer','credit specialist','кредитный специалист','кредитный менеджер']],
  ['telesales_specialist','sales',['telesales specialist','телемаркетолог продажи','оператор продаж']],
  ['pre_sales_engineer','sales',['pre-sales engineer','presales engineer','пресейл инженер']],
  ['sales_operations_manager','sales',['sales operations manager','sales ops manager','sales ops']],

  // Marketing
  ['marketing_manager','marketing',['marketing manager','менеджер по маркетингу','маркетолог менеджер']],
  ['digital_marketer','marketing',['digital marketer','digital marketing specialist','интернет маркетолог','диджитал маркетолог']],
  ['performance_marketer','marketing',['performance marketer','performance marketing manager','перформанс маркетолог']],
  ['seo_specialist','marketing',['seo specialist','seo manager','seo специалист']],
  ['ppc_specialist','marketing',['ppc specialist','paid search specialist','контекстолог','ppc специалист']],
  ['smm_specialist','marketing',['smm specialist','social media manager','smm менеджер','смм специалист']],
  ['content_marketer','marketing',['content marketer','content marketing manager','контент маркетолог']],
  ['brand_manager','marketing',['brand manager','бренд менеджер']],
  ['pr_manager','marketing',['pr manager','public relations manager','пиар менеджер','pr специалист']],
  ['crm_marketer','marketing',['crm marketer','crm marketing manager','crm маркетолог']],
  ['email_marketer','marketing',['email marketer','email marketing specialist','емейл маркетолог']],
  ['marketing_analyst','marketing',['marketing analyst','маркетинговый аналитик','аналитик маркетинга']],

  // Finance
  ['accountant','finance',['accountant','бухгалтер','бухгалтером','buxgalter','есепші']],
  ['chief_accountant','finance',['chief accountant','head accountant','главный бухгалтер','головний бухгалтер','bosh buxgalter']],
  ['payroll_accountant','finance',['payroll accountant','бухгалтер по заработной плате','бухгалтер по зарплате']],
  ['financial_analyst','finance',['financial analyst','финансовый аналитик','финансовым аналитиком','фінансовий аналітик']],
  ['financial_controller','finance',['financial controller','финансовый контролер','финансовый контроллер']],
  ['finance_manager','finance',['finance manager','financial manager','финансовый менеджер']],
  ['treasurer','finance',['treasurer','казначей','скарбник']],
  ['auditor','finance',['auditor','аудитор']],
  ['tax_specialist','finance',['tax specialist','tax accountant','налоговый специалист','налоговый бухгалтер']],
  ['economist','finance',['economist','экономист','економіст']],
  ['bank_teller','finance',['bank teller','операционист банка','кассир банка']],
  ['investment_analyst','finance',['investment analyst','инвестиционный аналитик']],

  // HR
  ['recruiter','human_resources',['recruiter','рекрутер','рекрутер','talent recruiter']],
  ['technical_recruiter','human_resources',['technical recruiter','it recruiter','tech recruiter','it рекрутер']],
  ['talent_acquisition_specialist','human_resources',['talent acquisition specialist','talent acquisition manager','ta specialist']],
  ['hr_manager','human_resources',['hr manager','human resources manager','hr менеджер','менеджер по персоналу']],
  ['hr_business_partner','human_resources',['hr business partner','hrbp','hr бизнес партнер']],
  ['hr_generalist','human_resources',['hr generalist','hr generalist specialist','hr дженералист']],
  ['people_partner','human_resources',['people partner','people operations partner','пипл партнер']],
  ['sourcer','human_resources',['talent sourcer','sourcer','сорсер']],
  ['learning_development_specialist','human_resources',['learning and development specialist','l&d specialist','специалист по обучению и развитию']],

  // Support/admin
  ['customer_support_specialist','customer_support',['customer support specialist','support specialist','специалист поддержки','специалист служби підтримки']],
  ['technical_support_specialist','customer_support',['technical support specialist','technical support engineer','специалист технической поддержки']],
  ['helpdesk_specialist','customer_support',['helpdesk specialist','help desk specialist','helpdesk engineer','специалист helpdesk']],
  ['call_center_operator','customer_support',['call center operator','call-center operator','оператор колл центра','оператор колл-центра','call markaz operatori']],
  ['chat_operator','customer_support',['chat operator','оператор чата','чат оператор']],
  ['customer_success_manager','customer_support',['customer success manager','csm','менеджер по успеху клиентов']],
  ['office_manager','administration',['office manager','офис менеджер','офіс менеджер']],
  ['administrator','administration',['administrator','администратор','администратором','адміністратор','адміністратором']],
  ['receptionist','administration',['receptionist','ресепшионист','ресепшн','рецепционист']],
  ['executive_assistant','administration',['executive assistant','personal assistant','ассистент руководителя','личный помощник']],
  ['secretary','administration',['secretary','секретарь','секретар']],
  ['data_entry_operator','administration',['data entry operator','data entry specialist','оператор ввода данных']],

  // Logistics / retail
  ['logistics_manager','logistics',['logistics manager','менеджер по логистике','логист']],
  ['logistics_coordinator','logistics',['logistics coordinator','координатор логистики']],
  ['dispatcher','logistics',['dispatcher','диспетчер','диспетчер']],
  ['warehouse_manager','logistics',['warehouse manager','заведующий складом','начальник склада']],
  ['warehouse_worker','logistics',['warehouse worker','складской работник','работник склада','склад працівник']],
  ['picker','logistics',['order picker','picker','комплектовщик','сборщик заказов']],
  ['packer','logistics',['packer','упаковщик','упаковщица','пакувальник']],
  ['loader','logistics',['loader','грузчик','вантажник']],
  ['supply_chain_manager','logistics',['supply chain manager','менеджер цепи поставок','supply chain specialist']],
  ['procurement_specialist','logistics',['procurement specialist','purchasing specialist','специалист по закупкам','закупщик']],
  ['customs_specialist','logistics',['customs specialist','customs broker','таможенный брокер','специалист вэд']],
  ['inventory_specialist','logistics',['inventory specialist','inventory controller','специалист по запасам']],
  ['cashier','retail',['cashier','кассир','касир','kassir']],
  ['sales_assistant','retail',['sales assistant','shop assistant','продавец консультант','продавец-консультант','сатушы кеңесші']],
  ['seller','retail',['seller','продавец','продавець','sotuvchi','сатушы']],
  ['merchandiser','retail',['merchandiser','мерчендайзер','мерчандайзер']],
  ['store_manager','retail',['store manager','управляющий магазином','заведующий магазином']],
  ['store_supervisor','retail',['store supervisor','супервайзер магазина','старший смены магазина']],
  ['promoter','retail',['promoter','промоутер']],
  ['visual_merchandiser','retail',['visual merchandiser','визуальный мерчендайзер']],

  // Hospitality
  ['waiter','hospitality',['waiter','waitress','официант','офіціант']],
  ['barista','hospitality',['barista','бариста']],
  ['bartender','hospitality',['bartender','barman','бармен']],
  ['cook','hospitality',['cook','повар','кухар','oshpaz','аспаз']],
  ['chef','hospitality',['chef','head chef','шеф повар','шеф-повар','шеф кухар']],
  ['sous_chef','hospitality',['sous chef','су шеф','су-шеф']],
  ['hostess','hospitality',['hostess','хостес']],
  ['restaurant_manager','hospitality',['restaurant manager','управляющий рестораном','менеджер ресторана']],
  ['hotel_receptionist','hospitality',['hotel receptionist','hotel front desk','администратор гостиницы','администратор отеля']],
  ['housekeeper','hospitality',['housekeeper','горничная','покоївка']],
  ['dishwasher_worker','hospitality',['dishwasher worker','kitchen porter','посудомойщик','посудомойщица']],
  ['baker','hospitality',['baker','пекарь','пекар']],
  ['confectioner','hospitality',['confectioner','pastry chef','кондитер']],

  // Medicine
  ['doctor','medicine',['doctor','physician','врач','лікар','shifokor','дәрігер']],
  ['nurse','medicine',['nurse','медсестра','медбрат','медична сестра','hamshira','медбике']],
  ['dentist','medicine',['dentist','стоматолог','tish shifokor']],
  ['pharmacist','medicine',['pharmacist','фармацевт','провизор']],
  ['medical_assistant','medicine',['medical assistant','фельдшер','медицинский ассистент']],
  ['surgeon','medicine',['surgeon','хирург','хірург']],
  ['therapist_doctor','medicine',['general practitioner','family doctor','терапевт врач','семейный врач']],
  ['pediatrician','medicine',['pediatrician','педиатр']],
  ['gynecologist','medicine',['gynecologist','gynaecologist','гинеколог']],
  ['laboratory_technician','medicine',['laboratory technician','lab technician','лаборант','медицинский лаборант']],
  ['radiologist','medicine',['radiologist','рентгенолог','врач радиолог']],
  ['psychologist','medicine',['psychologist','психолог','психолог']],
  ['veterinarian','medicine',['veterinarian','vet','ветеринар']],

  // Education
  ['teacher','education',['teacher','учитель','вчитель','o‘qituvchi','мұғалім']],
  ['english_teacher','education',['english teacher','english tutor','учитель английского','преподаватель английского','ingliz tili o‘qituvchi']],
  ['tutor','education',['tutor','репетитор']],
  ['kindergarten_teacher','education',['kindergarten teacher','воспитатель','вихователь','tarbiyachi']],
  ['nanny','education',['nanny','няня','enaga']],
  ['university_lecturer','education',['university lecturer','lecturer','преподаватель вуза','викладач університету']],
  ['school_principal','education',['school principal','директор школы','директор школи']],
  ['education_methodologist','education',['education methodologist','методист','методист образования']],
  ['speech_therapist','education',['speech therapist','логопед']],
  ['special_education_teacher','education',['special education teacher','дефектолог','коррекционный педагог']],

  // Construction / trades / manufacturing
  ['civil_engineer','construction',['civil engineer','инженер строитель','инженер-строитель']],
  ['architect','construction',['architect','архитектор','архітектор']],
  ['construction_manager','construction',['construction manager','руководитель строительства','прораб руководитель']],
  ['site_manager','construction',['site manager','прораб','начальник участка']],
  ['quantity_surveyor','construction',['quantity surveyor','сметчик','инженер сметчик']],
  ['electrician','construction',['electrician','электрик','електрик']],
  ['plumber','construction',['plumber','сантехник','сантехнік']],
  ['welder','construction',['welder','сварщик','зварювальник','payvandchi','дәнекерлеуші']],
  ['carpenter','construction',['carpenter','плотник','столяр','тесляр']],
  ['painter','construction',['construction painter','маляр','маляр штукатур']],
  ['tiler','construction',['tiler','плиточник','облицовщик']],
  ['crane_operator','construction',['crane operator','крановщик','машинист крана']],
  ['surveyor','construction',['surveyor','геодезист']],
  ['hvac_technician','construction',['hvac technician','hvac engineer','инженер овик','техник по вентиляции']],
  ['production_worker','manufacturing',['production worker','factory worker','рабочий производства','работник производства']],
  ['machine_operator','manufacturing',['machine operator','станочник','оператор станка']],
  ['cnc_operator','manufacturing',['cnc operator','cnc machinist','оператор чпу','оператор станка чпу']],
  ['mechanical_engineer','manufacturing',['mechanical engineer','инженер механик','инженер-механик']],
  ['electrical_engineer','manufacturing',['electrical engineer','инженер электрик','инженер-электрик']],
  ['maintenance_technician','manufacturing',['maintenance technician','техник по обслуживанию','ремонтный техник']],
  ['quality_control_inspector','manufacturing',['quality control inspector','qc inspector','контролер отк','инспектор качества']],
  ['process_engineer','manufacturing',['process engineer','инженер технолог','инженер-технолог']],
  ['industrial_engineer','manufacturing',['industrial engineer','инженер по производству']],
  ['seamstress','manufacturing',['seamstress','tailor','швея','портной','тігінші']],

  // Transport/security
  ['driver','transport',['driver','водитель','водій','haydovchi','жүргізуші']],
  ['truck_driver','transport',['truck driver','lorry driver','водитель грузовика','дальнобойщик','водитель категории ce']],
  ['taxi_driver','transport',['taxi driver','таксист','водитель такси']],
  ['bus_driver','transport',['bus driver','водитель автобуса']],
  ['courier','transport',['courier','delivery courier','курьер','кур’єр','kuryer']],
  ['forklift_operator','transport',['forklift operator','forklift driver','водитель погрузчика','карщик']],
  ['auto_mechanic','transport',['auto mechanic','car mechanic','автомеханик','автослесарь']],
  ['fleet_manager','transport',['fleet manager','менеджер автопарка','начальник автопарка']],
  ['security_guard','security',['security guard','guard','охранник','охоронець','qorovul','күзетші']],
  ['bodyguard','security',['bodyguard','телохранитель','охоронець особистий']],
  ['security_supervisor','security',['security supervisor','начальник охраны','руководитель службы безопасности']],
  ['loss_prevention_specialist','security',['loss prevention specialist','специалист по предотвращению потерь']],

  // Legal/media/beauty/agriculture
  ['lawyer','legal',['lawyer','attorney','юрист','юрист','адвокат']],
  ['legal_counsel','legal',['legal counsel','in-house counsel','юрисконсульт']],
  ['paralegal','legal',['paralegal','помощник юриста','асистент юриста']],
  ['compliance_specialist','legal',['compliance specialist','compliance officer','комплаенс специалист']],
  ['contract_specialist','legal',['contract specialist','contract manager','договорной юрист','специалист по договорам']],
  ['notary_assistant','legal',['notary assistant','помощник нотариуса']],
  ['copywriter','media_content',['copywriter','копирайтер','копірайтер']],
  ['content_manager','media_content',['content manager','контент менеджер']],
  ['content_creator','media_content',['content creator','creator','контент креатор','создатель контента']],
  ['editor','media_content',['editor','редактор','редактор']],
  ['journalist','media_content',['journalist','журналист','журналіст']],
  ['translator','media_content',['translator','interpreter','переводчик','перекладач','tarjimon']],
  ['video_editor','media_content',['video editor','видеомонтажер','монтажер видео']],
  ['photographer','media_content',['photographer','фотограф']],
  ['hairdresser','beauty_wellness',['hairdresser','hair stylist','парикмахер','стилист по волосам']],
  ['barber','beauty_wellness',['barber','барбер']],
  ['manicurist','beauty_wellness',['manicurist','nail technician','мастер маникюра','нейл мастер']],
  ['cosmetologist','beauty_wellness',['cosmetologist','косметолог']],
  ['massage_therapist','beauty_wellness',['massage therapist','masseur','массажист','массажистка']],
  ['fitness_trainer','beauty_wellness',['fitness trainer','personal trainer','фитнес тренер','персональный тренер']],
  ['farmer','agriculture',['farmer','фермер','фермер']],
  ['agronomist','agriculture',['agronomist','агроном']],
  ['tractor_driver','agriculture',['tractor driver','tractor operator','тракторист']],
  ['livestock_specialist','agriculture',['livestock specialist','зоотехник']],
  ['greenhouse_worker','agriculture',['greenhouse worker','работник теплицы']],
  ['farm_worker','agriculture',['farm worker','agricultural worker','сельхоз рабочий','работник фермы']],
];

function profession(canonical, group, strongAliases, weakAliases = []) {
  const meta = GROUP_META.get(group) || { family: 'other', aliases: [] };
  const strong = [...new Set([...strongAliases, ...(ROMANIAN_PROFESSION_ALIASES[canonical] || [])].filter(Boolean))];
  const weak = [...new Set(weakAliases.filter(Boolean))];
  return Object.freeze({
    id: canonical,
    taxonomyId: `profession.${group}.${canonical}`,
    canonical,
    group,
    family: meta.family,
    aliases: Object.freeze(strong),
    strongAliases: Object.freeze(strong),
    weakAliases: Object.freeze(weak),
    strongRe: aliasesToRegex(strong),
    weakRe: weak.length ? aliasesToRegex(weak) : null,
  });
}

export const PROFESSION_CATALOG = Object.freeze(rows.map((row) => profession(...row)));

export const PROFESSION_GROUPS = Object.freeze(GROUP_DEFINITIONS.map(([canonical, family, aliases]) => Object.freeze({
  id: `profession-group.${canonical}`,
  canonical,
  family,
  aliases: Object.freeze(groupAliases(canonical, aliases)),
  professions: Object.freeze(PROFESSION_CATALOG.filter((item) => item.group === canonical).map((item) => item.canonical)),
})));

export const SENIORITY_LEVELS = Object.freeze([
  { canonical: 'intern', aliases: ['intern','trainee','стажер','стажёр','інтерн','стажерка','stajyor','тағылымгер'], score: 1 },
  { canonical: 'junior', aliases: ['junior','jr','джуниор','джун','младший','молодший','junior level'], score: 1 },
  { canonical: 'middle', aliases: ['middle','mid-level','mid level','мидл','миддл','средний уровень','середній рівень'], score: 1 },
  { canonical: 'senior', aliases: ['senior','sr','сеньор','синьор','старший специалист','ведущий специалист','провідний спеціаліст'], score: 1 },
  { canonical: 'staff', aliases: ['staff','staff engineer','staff developer','staff-level','стафф','стафф инженер'], score: 1 },
  { canonical: 'principal', aliases: ['principal','principal engineer','principal developer','principal architect','principal-level','принципал инженер'], score: 1 },
  { canonical: 'lead', aliases: ['lead','team lead','teamlead','tech lead','lead developer','lead engineer','тимлид','техлид','лид разработчик','ведущий разработчик'], score: 1 },
  { canonical: 'head', aliases: ['head of','department head','руководитель отдела','начальник отдела','керівник відділу'], score: 0.95 },
  { canonical: 'director', aliases: ['director','директор','директор департамента','директор напряму'], score: 0.9 },
  { canonical: 'vp', aliases: ['vice president','vp of','вице-президент','віце-президент'], score: 1 },
  { canonical: 'chief', aliases: ['chief officer','chief executive','chief technology','chief product','chief financial','chief marketing','chief operating'], score: 1 },
].map((entry) => {
  const aliases = [...new Set([...entry.aliases, ...(ROMANIAN_SENIORITY_ALIASES[entry.canonical] || [])])];
  return Object.freeze({ ...entry, aliases: Object.freeze(aliases), re: aliasesToRegex(aliases) });
}));

export function matchProfessions(value, { limit = 5, allowWeak = true } = {}) {
  const text = String(value || '');
  if (!text) return [];
  const matches = [];
  for (const entry of PROFESSION_CATALOG) {
    const strong = text.match(entry.strongRe);
    if (strong) {
      matches.push({ entry, score: 1, matched: strong[0].trim(), index: strong.index ?? 0, strength: 'strong' });
      continue;
    }
    if (allowWeak && entry.weakRe) {
      const weak = text.match(entry.weakRe);
      if (weak) matches.push({ entry, score: 0.55, matched: weak[0].trim(), index: weak.index ?? 0, strength: 'weak' });
    }
  }
  matches.sort((a, b) => b.score - a.score || b.matched.length - a.matched.length || a.index - b.index);
  const seen = new Set();
  return matches.filter((match) => {
    if (seen.has(match.entry.canonical)) return false;
    seen.add(match.entry.canonical);
    return true;
  }).slice(0, limit).map((match) => Object.freeze({
    id: match.entry.id,
    canonical: match.entry.canonical,
    group: match.entry.group,
    family: match.entry.family,
    score: match.score,
    strength: match.strength,
    matched: match.matched,
  }));
}

export function matchProfession(value, options = {}) {
  return matchProfessions(value, { ...options, limit: 1 })[0] || null;
}

export function matchProfessionGroup(value) {
  const text = String(value || '');
  let best = null;
  for (const entry of PROFESSION_GROUPS) {
    const re = aliasesToRegex(entry.aliases);
    const match = text.match(re);
    if (!match) continue;
    const score = Math.min(0.9, 0.55 + normalizeForMatch(match[0]).length / 100);
    if (!best || score > best.score) best = { ...entry, score, matched: match[0].trim() };
  }
  return best ? Object.freeze(best) : null;
}

export function matchSeniority(value) {
  const text = String(value || '');
  const matches = [];
  for (const entry of SENIORITY_LEVELS) {
    const match = text.match(entry.re);
    if (match) matches.push({ canonical: entry.canonical, score: entry.score, matched: match[0].trim(), index: match.index ?? 0 });
  }
  matches.sort((a, b) => b.score - a.score || b.matched.length - a.matched.length || a.index - b.index);
  return matches[0] ? Object.freeze(matches[0]) : null;
}

export function professionByCanonical(canonical) {
  return PROFESSION_CATALOG.find((item) => item.canonical === canonical) || null;
}
