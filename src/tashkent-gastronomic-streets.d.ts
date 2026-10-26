import type { LocationEntry } from '../index.js';
export type GastronomicStreet = Omit<LocationEntry, 'district'> & Readonly<{ category: 'gastronomic_street'; entityType: 'street'; country: 'UZ'; city: 'Tashkent'; district: string | null }>;
export const TASHKENT_GASTRONOMIC_STREETS: readonly GastronomicStreet[];
export function resolveTashkentGastronomicStreet(value: unknown): GastronomicStreet | null;
