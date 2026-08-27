export type HousingFeatures = Readonly<{
  internet: boolean | null;
  courtyard: boolean | null;
  gazebo: boolean | null;
  petsAllowed: boolean | null;
}>;

export function parseHousingFeatures(value: unknown): HousingFeatures;
