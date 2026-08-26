import type { UkraineGeoPoint } from './ua-geo-coordinates.js';

export type UkraineLocationCoordinateDescriptor = Readonly<{
  city: string;
  type: string;
  canonical: string;
  aliases: readonly string[];
  coordinates: UkraineGeoPoint | null;
  source: 'static' | 'geocode';
  candidates: readonly string[];
}>;

export type UkraineResolvedLocationCoordinate = Readonly<Omit<UkraineLocationCoordinateDescriptor, 'source'> & {
  source: 'static' | 'geocode' | 'unresolved';
}>;

export type UkraineAdministrativeCoordinateDescriptor = Readonly<{
  code: string;
  name: string;
  canonical: string;
  aliases: readonly string[];
  type: string;
  parentCode: string | null;
  coordinates: UkraineGeoPoint | null;
  source: 'geocode';
  candidates: readonly string[];
}>;

export type UkraineResolvedAdministrativeCoordinate = Readonly<Omit<UkraineAdministrativeCoordinateDescriptor, 'source'> & {
  source: 'geocode' | 'unresolved';
}>;

export type UkraineCoordinateCoverage = Readonly<{
  total: number;
  static: number;
  resolvable: number;
  missing: number;
  byType: Readonly<Record<string, Readonly<{ total: number; static: number; resolvable: number }>>>;
}>;

export function ukraineLocationCoordinateDescriptors(): readonly UkraineLocationCoordinateDescriptor[];
export function ukraineLocationCoordinateCoverage(): UkraineCoordinateCoverage;
export function resolveUkraineLocationCoordinates(
  lookup: ((query: string, descriptor: UkraineLocationCoordinateDescriptor) => Promise<UkraineGeoPoint | null | undefined> | UkraineGeoPoint | null | undefined) | null | undefined,
  options?: Readonly<{ cities?: readonly string[]; types?: readonly string[]; maxLookups?: number }>,
): Promise<readonly UkraineResolvedLocationCoordinate[]>;
export function ukraineAdministrativeCoordinateDescriptors(
  options?: Readonly<{ types?: readonly string[]; parentCode?: string; limit?: number }>,
): readonly UkraineAdministrativeCoordinateDescriptor[];
export function resolveUkraineAdministrativeCoordinates(
  lookup: ((query: string, descriptor: UkraineAdministrativeCoordinateDescriptor) => Promise<UkraineGeoPoint | null | undefined> | UkraineGeoPoint | null | undefined) | null | undefined,
  options?: Readonly<{ types?: readonly string[]; parentCode?: string; limit?: number; maxLookups?: number }>,
): Promise<readonly UkraineResolvedAdministrativeCoordinate[]>;
export function staticUkraineLocationCoordinateCount(): number;
