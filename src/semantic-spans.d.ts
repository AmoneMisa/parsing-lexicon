export type NonAddressSpanType = 'contact' | 'money' | 'temporal';

export const NON_ADDRESS_SPAN_TYPE: Readonly<{
  CONTACT: 'contact';
  MONEY: 'money';
  TEMPORAL: 'temporal';
}>;

export type NonAddressSpan = Readonly<{
  type: NonAddressSpanType;
  start: number;
  end: number;
}>;

export function detectNonAddressSpans(
  value: unknown,
  context?: Readonly<Record<string, unknown>> & { types?: readonly NonAddressSpanType[] },
): readonly NonAddressSpan[];
export function overlapsAnySpan(start: number, end: number, spans: readonly NonAddressSpan[]): boolean;
