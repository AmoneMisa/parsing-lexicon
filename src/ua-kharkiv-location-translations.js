import { locationEntries } from './location-merge.js';

// Kharkiv-specific multilingual aliases that are useful in listing text and
// benefit from explicit UA/RU coverage. Canonicals intentionally match the
// major Ukraine location layer so mergeLocationEntries enriches one subject
// instead of creating parallel parser entities.
export const UA_KHARKIV_LOCATION_TRANSLATIONS = Object.freeze({
  residentialComplexes: locationEntries([
    ['Dim na Sumskii', 'Будинок на Сумській', 'Дім на Сумській', 'ЖК Будинок на Сумській', 'Дом на Сумской', 'ЖК Дом на Сумской'],
    ['Myronosytska', 'Мироносицька', 'ЖК Мироносицька', 'Мироносицкая', 'ЖК Мироносицкая'],
    ['Mlechnyi Shliakh', 'Млечний шлях', 'ЖК Млечний шлях', 'Млечный путь', 'ЖК Млечный путь'],
    ['Makiivska', 'Макіївська', 'ЖК Макіївська', 'Макеевская', 'ЖК Макеевская', 'ЖК на Макіївській', 'ЖК на Макеевской'],
  ]),
  landmarks: locationEntries([
    ['Sarzhyn Yar', 'Саржин Яр', 'Саржин яр'],
    ['Machine Builders Park', 'Парк Машинобудівників', 'Парк Машиностроителей', 'парк Артема', 'парк Артёма'],
    ['Zelenyi Hai', 'Зелений Гай', 'Зеленый Гай', 'Зелёный Гай'],
    ['Karpivskyi Garden', 'Карпівський сад', 'Карповский сад'],
    ['Pokrovskyi Square', 'Покровський сквер', 'Покровский сквер'],
    ['Derzhprom', 'Держпром', 'Госпром', 'Gosprom', 'Будинок державної промисловості', 'Дом государственной промышленности'],
    ['Pokrovskyi Monastery', 'Покровський монастир', 'Покровский монастырь'],
    ['Kharkiv Zoo', 'Харківський зоопарк', 'Харьковский зоопарк'],
    ['KhAI', 'ХАІ', 'ХАИ', 'Харківський авіаційний інститут', 'Харьковский авиационный институт'],
    ['KhPI', 'ХПІ', 'ХПИ', 'Харківський політехнічний інститут', 'Харьковский политехнический институт'],
    ['KhNURE', 'ХНУРЕ', 'ХНУРЭ', 'Харківський національний університет радіоелектроніки', 'Харьковский национальный университет радиоэлектроники'],
    ['French Boulevard', 'Французький бульвар', 'Французский бульвар', 'ТРЦ Французький бульвар', 'ТРЦ Французский бульвар'],
    ['Barabashovo Market', 'ринок Барабашово', 'ринок Барабашова', 'рынок Барабашово', 'Барабашово', 'Барабашова'],
  ]),
});
