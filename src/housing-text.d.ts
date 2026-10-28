export declare function parseHousingRoomsFromText(value: unknown): number | null;
export declare function parseHousingResidentialComplex(value: unknown): string | null;
export declare function parseHousingAreaFromText(value: unknown): number | null;
/** Rooms of a euro-layout flat (the euro two-room is 1, the euro three-room is 2); null when the text names none. */
export declare function parseHousingEuroRooms(value: unknown): number | null;
export declare function parseHousingFloorFromText(value: unknown): { floor: number | null; totalFloors: number | null };
export declare function parseHousingAudience(value: unknown): 'family' | 'women' | 'men' | null;
export declare function parseHousingAmenities(value: unknown): readonly (
  | 'dishwasher'
  | 'separateRooms'
  | 'bed'
  | 'washingMachine'
  | 'refrigerator'
  | 'television'
  | 'airConditioner'
  | 'internet'
  | 'stove'
  | 'wardrobe'
  | 'furniture'
  | 'kitchenEquipment'
  | 'plasticWindows'
  | 'heatedFloor'
  | 'freeParking'
  | 'moveInReady'
  | 'bedLinen'
  | 'towels'
)[];
/** Months of rent a deposit stands for ("2 месяца" -> 2, "месячная оплата" -> 1); null when no count is stated. */
export declare function parseDepositMonths(value: unknown): number | null;
