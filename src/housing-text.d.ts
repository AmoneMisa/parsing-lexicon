export declare function parseHousingRoomsFromText(value: unknown): number | null;
export declare function parseHousingResidentialComplex(value: unknown): string | null;
export declare function parseHousingAreaFromText(value: unknown): number | null;
export declare function parseHousingFloorFromText(value: unknown): { floor: number | null; totalFloors: number | null };
export declare function parseHousingAudience(value: unknown): 'family' | 'women' | 'men' | null;
export declare function parseHousingAmenities(value: unknown): readonly ('dishwasher' | 'separateRooms' | 'washingMachine' | 'television' | 'bedLinen' | 'towels')[];

