export declare function parseHousingQuarterLabel(value: unknown): string | null;
export declare function parseHousingCardAmenities(value: unknown): readonly string[];
export declare function parseHousingNearbyMentions(value: unknown): readonly string[];
export declare function parseHousingNearbyShops(value: unknown): readonly string[];
export declare function dedupeHousingNearbyMentions(values: readonly unknown[] | null | undefined): string[];
export declare const HOUSING_LISTING_KEYWORD_TAGS: readonly (readonly [string, RegExp])[];
export declare function matchHousingListingKeywordTags(text: unknown): readonly string[];
