import {
  KZ_CITY_ADDITIONS,
  UZ_CITY_ADDITIONS,
} from './geography-central-asia.js';
import { CITIES_BY_COUNTRY, canonicalCity } from './geography.js';
import { aliasesOf, normalizeForMatch } from './normalization.js';

export { KZ_CITY_ADDITIONS, UZ_CITY_ADDITIONS };

const freezeAliases = (aliases = {}) => Object.freeze(Object.fromEntries(
  Object.entries(aliases).map(([lang, values]) => {
    const seen = new Set();
    const deduped = (values || []).filter((alias) => {
      const key = normalizeForMatch(alias);
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    return [lang, Object.freeze(deduped)];
  }),
));

const city = (canonical, aliases, extra = {}) => Object.freeze({
  ...extra,
  canonical,
  aliases: freezeAliases(aliases),
});

/** @deprecated Use CITIES_BY_COUNTRY.KZ / canonicalCity(). */
export const KZ_CITY_CATALOG = CITIES_BY_COUNTRY.KZ;

export const KZ_SEARCH_TARGETS = Object.freeze([
  city('Burabay', { kk: ['Бурабай'], ru: ['Бурабай', 'Боровое'], en: ['Burabay', 'Borovoe'] }, { country: 'KZ', type: 'resort', priority: 'P4' }),
  city('Zerenda', { kk: ['Зеренді'], ru: ['Зеренда'], en: ['Zerenda'] }, { country: 'KZ', type: 'resort', priority: 'P4' }),
  city('Bayanaul', { kk: ['Баянауыл'], ru: ['Баянаул'], en: ['Bayanaul'] }, { country: 'KZ', type: 'resort', priority: 'P4' }),
]);

/** @deprecated Use CITIES_BY_COUNTRY.UZ / canonicalCity(). */
export const UZ_CITY_CATALOG = CITIES_BY_COUNTRY.UZ;

export const UZ_SEARCH_TARGETS = Object.freeze([
  city('Chorvoq', { uzLatn: ['Chorvoq', 'Charvak'], ru: ['Чарвак'], en: ['Chorvoq', 'Charvak'] }, { country: 'UZ', type: 'tourism_target', priority: 'P4' }),
  city('Beldersoy', { uzLatn: ['Beldersoy'], ru: ['Бельдерсай'], en: ['Beldersoy'] }, { country: 'UZ', type: 'tourism_target', priority: 'P4' }),
  city('Chimgan', { uzLatn: ['Chimgan'], ru: ['Чимган'], en: ['Chimgan'] }, { country: 'UZ', type: 'tourism_target', priority: 'P4' }),
  city('Zomin', { uzLatn: ['Zomin', 'Zaamin'], ru: ['Заамин', 'Зомин'], en: ['Zomin', 'Zaamin'] }, { country: 'UZ', type: 'tourism_target', priority: 'P4' }),
  city('Boysun', { uzLatn: ['Boysun'], ru: ['Байсун'], en: ['Boysun'] }, { country: 'UZ', type: 'tourism_target', priority: 'P4' }),
  city('Rishton', { uzLatn: ['Rishton'], ru: ['Риштан'], en: ['Rishton'] }, { country: 'UZ', type: 'tourism_target', priority: 'P4' }),
  city('Gijduvon', { uzLatn: ["G'ijduvon", 'Gijduvon'], ru: ['Гиждуван'], en: ['Gijduvan'] }, { country: 'UZ', type: 'search_target', priority: 'P4' }),
  city('Vobkent', { uzLatn: ['Vobkent'], ru: ['Вабкент'], en: ['Vobkent'] }, { country: 'UZ', type: 'search_target', priority: 'P4' }),
  city('Hazorasp', { uzLatn: ['Hazorasp'], ru: ['Хазарасп'], en: ['Hazorasp'] }, { country: 'UZ', type: 'search_target', priority: 'P4' }),
  city("Ellikqal'a", { uzLatn: ["Ellikqal'a", 'Ellikkala'], kaaLat: ['Elliqala'], ru: ['Элликкала'], en: ['Ellikkala'] }, { country: 'UZ', type: 'search_target', priority: 'P4', region: "Qoraqalpog'iston" }),
]);

/** Canonical Kyrgyzstan city catalog used by geography consumers. */
export const KG_CITY_CATALOG = CITIES_BY_COUNTRY.KG;

export const KZ_LOCATION_TERMS = Object.freeze({
  microdistrict: Object.freeze(['микрорайон', 'микр.', 'микр', 'мкр.', 'мкр', 'м-н', 'мкр-н', 'ықшамаудан', 'ықш.ауд.', 'ықш']),
  residentialArea: Object.freeze(['жилой массив', 'жилмассив', 'ж/м', 'ж.м.', 'тұрғын алабы', 'тұрғын массиві', 'массив']),
  district: Object.freeze(['район', 'р-н', 'рн', 'аудан', 'ауд.', 'district']),
  residentialComplex: Object.freeze(['ЖК', 'жк', 'жилой комплекс', 'тұрғын үй кешені', 'ТҮК', 'residence', 'residential complex', 'residential quarter']),
});

export const UZ_LOCATION_TERMS = Object.freeze({
  city: Object.freeze(['shahar', 'shahri', 'город', 'г.']),
  district: Object.freeze(['tuman', 'tumani', 'район', 'р-н']),
  mahalla: Object.freeze(['MFY', 'M.F.Y.', 'mfy', 'mahalla', "mahalla fuqarolar yig'ini", "mahalla fuqarolari yig'ini", 'маҳалла', 'маҳалла фуқаролар йиғини', 'махалля', 'махалла']),
  microdistrict: Object.freeze(['mikrorayon', 'микрорайон', 'мкр', 'мкр.']),
  residentialComplex: Object.freeze(['ЖК', 'жк', 'turar joy majmuasi', 'residential complex', 'residence']),
});

export const KG_LOCATION_TERMS = Object.freeze({
  city: Object.freeze(['шаар', 'шаары', 'город', 'г.', 'city']),
  district: Object.freeze(['район', 'району', 'р-н', 'district']),
  microdistrict: Object.freeze(['микрорайон', 'мкр', 'мкр.', 'кичирайон', 'кичи район']),
  residentialArea: Object.freeze(['жилмассив', 'жилой массив', 'массив', 'конуш', 'жаңы конуш']),
  residentialComplex: Object.freeze(['ЖК', 'жк', 'жилой комплекс', 'турак жай комплекси', 'residential complex', 'residence']),
});

export function canonicalKazakhstanCity(value) {
  return canonicalCity(value, 'KZ');
}

export function canonicalUzbekistanCity(value) {
  return canonicalCity(value, 'UZ');
}

export function canonicalKyrgyzstanCity(value) {
  return canonicalCity(value, 'KG');
}

export function canonicalCentralAsiaCity(value, country = null) {
  if (country === 'KZ') return canonicalKazakhstanCity(value);
  if (country === 'UZ') return canonicalUzbekistanCity(value);
  if (country === 'KG') return canonicalKyrgyzstanCity(value);
  return canonicalKazakhstanCity(value)
    || canonicalUzbekistanCity(value)
    || canonicalKyrgyzstanCity(value);
}

export function centralAsiaCityAliases(canonical, country) {
  const catalog = country === 'KZ'
    ? KZ_CITY_CATALOG
    : country === 'UZ'
      ? UZ_CITY_CATALOG
      : country === 'KG'
        ? KG_CITY_CATALOG
        : [...KZ_CITY_CATALOG, ...UZ_CITY_CATALOG, ...KG_CITY_CATALOG];
  const item = catalog.find((entry) => entry.canonical === canonical);
  return item ? Object.freeze([...new Set([item.canonical, ...aliasesOf(item)])]) : Object.freeze([]);
}
