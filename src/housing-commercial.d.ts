export declare function looksCommercialHousing(value: unknown): boolean;
export declare function classifyHousingCommercialAdvertisement(value: unknown): Readonly<{ commercial: boolean; confidence: number; signals: readonly string[] }>;
export declare function looksParkingOnly(value: unknown): boolean;
export declare function isDirectOwner(value: unknown): boolean;
export declare function hasZeroCommissionSignal(value: unknown): boolean;
