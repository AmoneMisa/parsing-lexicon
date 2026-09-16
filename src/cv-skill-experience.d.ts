import type { EmploymentOptions, ParsedDate } from './cv-employment.js';
import type { EvidenceLedger } from './evidence-ledger.js';

export type SkillExperience = Readonly<{
  skill: string;
  /** Distinct evidence sites, not raw mentions: one job counts once however
   * many times it names the skill. */
  evidenceCount: number;
  commercialEvidence: boolean;
  projectEvidence: boolean;
  explicitSkillList: boolean;
  /** Absent when nothing dated demonstrates the skill. */
  durationMonths?: number;
  lastUsed?: ParsedDate;
  stillInUse?: boolean;
  ledger: EvidenceLedger;
}>;

export function attributeCvSkillExperience(value: unknown, options?: EmploymentOptions): readonly SkillExperience[];
