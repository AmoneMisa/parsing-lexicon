export type AddressGrammarLanguage = 'ru' | 'uk' | 'ro' | 'en' | 'kk' | 'ky' | 'uzLatn' | 'uzCyrl';
export type AddressGrammarMarker = Readonly<{ pattern: string; lang: AddressGrammarLanguage }>;

export const STREET_PREFIX_MARKERS: readonly AddressGrammarMarker[];
export const STREET_POSTFIX_MARKERS: readonly AddressGrammarMarker[];
export const STREET_TYPE_MARKERS: readonly AddressGrammarMarker[];
export const HOUSE_MARKERS: readonly AddressGrammarMarker[];
export const BUILDING_MARKERS: readonly AddressGrammarMarker[];

export const COUNTRY_ADDRESS_LANGUAGES: Readonly<Record<string, readonly AddressGrammarLanguage[]>>;

export function combinedMarkerPattern(markers: readonly AddressGrammarMarker[]): string;
export function matchesCountryAddressLanguage(text: unknown, country: unknown, markers: readonly AddressGrammarMarker[]): boolean;
