export type HousingSafetySignals = Readonly<{
  roomOnly: boolean;
  singleFemaleTenantSought: boolean;
}>;

export function seeksSingleFemaleTenant(value: unknown): boolean;
export function parseHousingSafetySignals(value: unknown): HousingSafetySignals;
