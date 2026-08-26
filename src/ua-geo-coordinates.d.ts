export type UkraineGeoPoint = Readonly<{ lat: number; lng: number }>;
export type UkraineCoordinateFallback = Readonly<UkraineGeoPoint & {
  accuracy: 'exact' | 'city';
  source: 'location' | 'city';
}>;

export const UA_CITY_COORDINATES: Readonly<Record<string, UkraineGeoPoint>>;
export const UA_LOCATION_COORDINATES: Readonly<Record<string, Readonly<Record<string, Readonly<Record<string, UkraineGeoPoint>>>>>>;

export function ukraineCityCoordinates(value: unknown): UkraineGeoPoint | null;
export function ukraineLocationCoordinates(cityValue: unknown, type: string, locationValue: unknown): UkraineGeoPoint | null;
export function ukraineLocationGeocodeCandidates(cityValue: unknown, type: string, locationValue: unknown): readonly string[];
export function ukraineCoordinateFallback(cityValue: unknown, type?: string | null, locationValue?: unknown): UkraineCoordinateFallback | null;
