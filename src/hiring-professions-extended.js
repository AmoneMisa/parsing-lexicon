// Additional profession rows in the same tuple format as hiring-professions.js:
// [canonical, group, strongAliases, weakAliases?]. Russian and English are the
// reference forms; Ukrainian, Romanian, Uzbek, Kazakh and Kyrgyz heads reach
// these rows through PROFESSION_TERMS (hiring-profession-terms.js).

export const EXTENDED_ROWS = [
  // Generic roles that the translation table points at
  ['engineer', 'engineering', ['инженер', 'engineer']],
  ['specialist', 'general', ['специалист', 'specialist']],
  ['operator', 'operations', ['оператор', 'operator']],
  ['consultant', 'sales', ['консультант', 'consultant']],
  ['banker', 'finance', ['банкир', 'banker', 'bank manager']],
  ['locksmith', 'construction', ['слесарь', 'locksmith', 'слесарь-монтажник']],
  ['turner', 'manufacturing', ['токарь', 'turner', 'lathe operator', 'оператор токарного станка']],
  ['mason', 'construction', ['каменщик', 'mason', 'bricklayer', 'кладчик']],
  ['yard_cleaner', 'cleaning', ['дворник', 'дворник-уборщик', 'yard cleaner', 'street sweeper']],
  ['gardener', 'agriculture', ['садовник', 'gardener', 'садовод', 'садовник-озеленитель']],

  // Trades, construction and manufacturing
  ['glazier', 'construction', ['стекольщик', 'glazier', 'glass installer']],
  ['roofer', 'construction', ['кровельщик', 'roofer']],
  ['concrete_worker', 'construction', ['бетонщик', 'concrete worker']],
  ['excavator_operator', 'construction', ['экскаваторщик', 'машинист экскаватора', 'excavator operator']],
  ['elevator_mechanic', 'construction', ['лифтёр', 'лифтер', 'монтажник лифтов', 'elevator mechanic', 'elevator technician']],
  ['window_cleaner', 'cleaning', ['мойщик окон', 'window cleaner']],
  ['janitor', 'cleaning', ['техничка', 'janitor', 'custodian', 'caretaker']],
  ['butcher', 'retail', ['мясник', 'butcher', 'meat cutter']],
  ['kitchen_worker', 'hospitality', ['кухонный рабочий', 'кухонный работник', 'kitchen worker', 'kitchen helper']],
  ['car_detailer', 'transport', ['детейлер', 'автодетейлер', 'car detailer']],
  ['tire_fitter_helper', 'transport', ['помощник шиномонтажника']],

  // Warehouse, dispatch, transport
  ['warehouse_keeper', 'logistics', ['кладовщик', 'кладовщица', 'storekeeper', 'warehouse keeper']],
  ['order_picker', 'logistics', ['комплектовщик', 'сборщик заказов', 'order picker', 'picker']],
  ['train_driver', 'transport', ['машинист поезда', 'машинист электрички', 'train driver', 'locomotive driver']],
  ['bus_conductor', 'transport', ['кондуктор', 'bus conductor', 'conductor']],
  ['driving_instructor', 'education', ['инструктор по вождению', 'driving instructor']],
  ['pilot', 'transport', ['пилот', 'pilot', 'airline pilot']],
  ['flight_attendant', 'transport', ['бортпроводник', 'стюардесса', 'стюард', 'flight attendant', 'cabin crew']],

  // Health and care
  ['paramedic', 'emergency', ['фельдшер скорой помощи', 'фельдшер скорой', 'paramedic', 'парамедик']],
  ['midwife', 'medicine', ['акушерка', 'акушер', 'midwife']],
  ['anesthesiologist', 'medicine', ['анестезиолог', 'anesthesiologist', 'anaesthetist']],
  ['orthodontist', 'medicine', ['ортодонт', 'orthodontist']],
  ['optician', 'medicine', ['оптик', 'optician']],
  ['optometrist', 'medicine', ['оптометрист', 'optometrist']],
  ['physiotherapist', 'medicine', ['физиотерапевт', 'физиотерапевт-массажист', 'physiotherapist', 'physical therapist']],
  ['nutritionist', 'medicine', ['диетолог', 'нутрициолог', 'nutritionist', 'dietitian']],
  ['groomer', 'service', ['грумер', 'груммер', 'groomer', 'pet groomer']],

  // Hospitality, leisure and services
  ['tour_guide', 'hospitality', ['гид', 'экскурсовод', 'тур-гид', 'tour guide', 'guide']],
  ['tattoo_artist', 'beauty_wellness', ['тату-мастер', 'тату мастер', 'татуировщик', 'tattoo artist']],
  ['makeup_artist', 'beauty_wellness', ['визажист', 'визажистка', 'makeup artist', 'make-up artist']],
  ['animator', 'hospitality', ['аниматор', 'animator', 'entertainer']],

  // Media, creative and education
  ['videographer', 'media_content', ['видеограф', 'видеооператор', 'videographer', 'video operator']],
  ['sound_engineer', 'media_content', ['звукорежиссер', 'звукорежиссёр', 'sound engineer', 'audio engineer']],
  ['proofreader', 'media_content', ['корректор', 'proofreader', 'copy editor']],
  ['librarian', 'education', ['библиотекарь', 'библиотекарша', 'librarian']],
  ['archivist', 'administration', ['архивариус', 'архивист', 'archivist']],

]
