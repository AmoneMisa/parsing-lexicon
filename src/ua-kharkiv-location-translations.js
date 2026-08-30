import { locationEntries } from './location-merge.js';

// Kharkiv-specific multilingual aliases that are useful in listing text and
// benefit from explicit UA/RU coverage. Canonicals intentionally match the
// major Ukraine location layer so mergeLocationEntries enriches one subject
// instead of creating parallel parser entities.
export const UA_KHARKIV_LOCATION_TRANSLATIONS = Object.freeze({
  landmarks: locationEntries([
    ['Pokrovskyi Square', 'Покровський сквер', 'Покровский сквер'],
    ['Pokrovskyi Monastery', 'Покровський монастир', 'Покровский монастырь'],
    ['Kharkiv Zoo', 'Харківський зоопарк', 'Харьковский зоопарк'],
    ['KhAI', 'ХАІ', 'ХАИ', 'Харківський авіаційний інститут', 'Харьковский авиационный институт'],
    ['KhPI', 'ХПІ', 'ХПИ', 'Харківський політехнічний інститут', 'Харьковский политехнический институт'],
    ['KhNURE', 'ХНУРЕ', 'ХНУРЭ', 'Харківський національний університет радіоелектроніки', 'Харьковский национальный университет радиоэлектроники'],
    ['Barabashovo Market', 'ринок Барабашово', 'ринок Барабашова', 'рынок Барабашово', 'Барабашово', 'Барабашова'],
  ]),
});
