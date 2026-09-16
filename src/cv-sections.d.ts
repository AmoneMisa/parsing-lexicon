export type CvSection = 'profile' | 'experience' | 'projects' | 'skills' | 'education' | 'languages' | 'certifications' | 'contact' | 'additional';
export const CV_SECTIONS: readonly CvSection[];

export type CvSectionSpan = Readonly<{
  section: CvSection | 'preamble';
  heading: string | null;
  headingRange: Readonly<{ start: number; end: number }> | null;
  start: number;
  contentStart: number;
  end: number;
}>;

export function classifyCvSectionHeading(value: unknown): CvSection | null;
export function detectCvSections(value: unknown): readonly CvSectionSpan[];
export function extractCvSectionText(value: unknown, wanted: CvSection): string;
