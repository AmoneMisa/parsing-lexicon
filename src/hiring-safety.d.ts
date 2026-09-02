export type HiringRiskCategory = 'gambling' | 'adult' | 'scam';

export interface HiringSuspicionResult {
  riskCategory: HiringRiskCategory | null;
  riskReasons: string[];
  suspicious: boolean;
  suspicionReasons: string[];
}

export declare function classifySuspicion(input: {
  title?: string;
  company?: string;
  description?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
}): HiringSuspicionResult;
