import type { BlockType, VacancySection } from './vacancy-blocks.js';
import type { EvidenceLedger } from './evidence-ledger.js';

export type RequirementModality = 'required' | 'preferred' | 'bonus' | 'context' | 'negated';
export const REQUIREMENT_MODALITIES: readonly RequirementModality[];

export type RequirementProvenance = Readonly<{
  parser: string;
  /** Which signal decided the modality: in-text wording, the surrounding
   * section, an explicit negation, or the fallback default. */
  signal: 'wording' | 'section' | 'negation' | 'default';
  section?: VacancySection;
  blockType: BlockType;
}>;

export type VacancyRequirement = Readonly<{
  text: string;
  modality: RequirementModality;
  skills: readonly string[];
  section?: VacancySection;
  blockType: BlockType;
  start: number;
  end: number;
  provenance: RequirementProvenance;
  ledger: EvidenceLedger;
}>;

export function extractVacancyRequirements(value: unknown): readonly VacancyRequirement[];
export function vacancyRequirementBuckets(valueOrRequirements: unknown | readonly VacancyRequirement[]): Readonly<{
  required: readonly string[];
  niceToHave: readonly string[];
  excluded: readonly string[];
}>;
