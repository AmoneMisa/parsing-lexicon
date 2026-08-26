export type HiringEmploymentType =
  | 'full_time'
  | 'part_time'
  | 'contract'
  | 'project'
  | 'freelance'
  | 'temporary'
  | 'internship'
  | 'volunteer'
  | 'seasonal';

export type HiringWorkMode = 'remote' | 'hybrid' | 'onsite';

export type HiringWorkSchedule =
  | 'fiveTwo'
  | 'twoTwo'
  | 'sixOne'
  | 'threeThree'
  | 'oneThree'
  | 'twentyFourFortyEight'
  | 'shift'
  | 'flexible'
  | 'day'
  | 'night'
  | 'rotational';

export type HiringProbationKind = 'probation' | 'noProbation' | 'paidProbation' | 'unpaidProbation';
export type HiringExperienceRequirement = 'noExperience' | 'experienceRequired';

export function detectEmploymentTypes(value: unknown): readonly HiringEmploymentType[];
export function detectWorkModes(value: unknown): readonly HiringWorkMode[];
export function detectWorkSchedules(value: unknown): readonly HiringWorkSchedule[];
export function detectProbation(value: unknown): HiringProbationKind | null;
export function detectExperienceRequirement(value: unknown): HiringExperienceRequirement | null;
