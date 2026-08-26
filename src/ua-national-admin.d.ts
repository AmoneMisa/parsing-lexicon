export type UkraineAdministrativeType = 'region' | 'district' | 'community' | 'settlement' | 'city_district';
export type UkraineAdministrativePlace = Readonly<{
  id: string;
  name: string;
  nameFull: string;
  type: UkraineAdministrativeType;
  category: string;
  regionId: string | null;
  districtId: string | null;
  parentId: string | null;
  parentType: string | null;
}>;
export type UkraineAdministrativeCatalog = Readonly<{
  regions: readonly UkraineAdministrativePlace[];
  districts: readonly UkraineAdministrativePlace[];
  communities: readonly UkraineAdministrativePlace[];
  settlements: readonly UkraineAdministrativePlace[];
  cityDistricts: readonly UkraineAdministrativePlace[];
}>;

export const UA_NATIONAL_ADMIN_SOURCE: Readonly<{
  name: string;
  package: string;
  version: string;
  snapshot: string;
  authority: string;
}>;
export function ukraineNationalAdministrativeCatalog(): UkraineAdministrativeCatalog;
export function ukraineNationalAdministrativeStats(): Readonly<Record<'regions' | 'districts' | 'communities' | 'settlements' | 'cityDistricts' | 'total', number>>;
export function searchUkraineAdministrativePlaces(value: unknown, options?: { types?: readonly UkraineAdministrativeType[]; exact?: boolean; limit?: number }): readonly UkraineAdministrativePlace[];
export function ukraineAdministrativePlaceById(id: unknown): UkraineAdministrativePlace | null;
export function ukraineCityDistrictsByCityId(cityId: unknown): readonly UkraineAdministrativePlace[];
