export type PhoneLikeSpan = Readonly<{
  start: number;
  end: number;
  raw: string;
  digits: string;
}>;

export type ParsedPhoneNumber = Readonly<{
  start: number;
  end: number;
  raw: string;
  digits: string;
  number: string;
  nationalNumber: string;
  country: string | null;
  countryCallingCode: string;
  extension: string | null;
  valid: boolean;
  possible: boolean;
}>;

export type ParsePhoneOptions = Readonly<{
  countryHint?: string | null;
  includePossible?: boolean;
}>;

export function findPhoneLikeSpans(value: unknown): readonly PhoneLikeSpan[];
export function maskPhoneLikeSpans(value: unknown, replacement?: string): string;
export function parsePhoneNumbers(value: unknown, options?: ParsePhoneOptions): readonly ParsedPhoneNumber[];
export function normalizePhone(value: unknown, options?: ParsePhoneOptions): ParsedPhoneNumber | null;
