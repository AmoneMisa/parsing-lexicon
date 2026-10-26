export {
  KZ_CITY_ADDITIONS,
  KZ_CITY_CATALOG,
  KZ_LOCATION_TERMS,
  KZ_SEARCH_TARGETS,
  UZ_CITY_ADDITIONS,
  UZ_CITY_CATALOG,
  UZ_LOCATION_TERMS,
  UZ_SEARCH_TARGETS,
  canonicalCentralAsiaCity,
  canonicalKazakhstanCity,
  canonicalUzbekistanCity,
  centralAsiaCityAliases,
} from '../index.js';
import type { LexiconEntity } from '../index.js';
export const KG_CITY_CATALOG: readonly LexiconEntity[];
export const KG_LOCATION_TERMS: Readonly<Record<string, readonly string[]>>;
export function canonicalKyrgyzstanCity(value: unknown): string | null;
