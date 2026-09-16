export type BlockType = 'heading' | 'paragraph' | 'bullet' | 'key-value' | 'table-row';
export type VacancySection = 'requirements' | 'optional' | 'responsibilities' | 'benefits' | 'about' | 'noise';

export const BLOCK_TYPES: readonly BlockType[];
export const VACANCY_SECTIONS: readonly VacancySection[];
export const VACANCY_HEADINGS: Readonly<Record<VacancySection, readonly string[]>>;

export type DocumentBlock = Readonly<{
  type: BlockType;
  section?: VacancySection;
  start: number;
  end: number;
  /** Block text with any bullet glyph stripped; `start`/`end` still address
   * the full source segment. */
  text: string;
  label?: string;
  value?: string;
}>;

export function classifyVacancyHeading(value: unknown): VacancySection | null;
export function parseVacancyBlocks(value: unknown): readonly DocumentBlock[];
