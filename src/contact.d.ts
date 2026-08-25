export type PhoneLikeSpan = Readonly<{
  start: number;
  end: number;
  raw: string;
  digits: string;
}>;

export function findPhoneLikeSpans(value: unknown): readonly PhoneLikeSpan[];
export function maskPhoneLikeSpans(value: unknown, replacement?: string): string;
