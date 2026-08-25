export interface SkillMeta {
  category: string;
  subcategory: string;
}
export interface SkillDefinition extends SkillMeta {
  name: string;
  aliases: string[];
}
export interface SkillDetail extends SkillMeta {
  name: string;
}
export const SKILL_CATALOG: SkillDefinition[];
export const SKILL_KEYWORDS: Readonly<Record<string, readonly string[]>>;
export const SKILL_META: Readonly<Record<string, SkillMeta>>;
export function normalizeSkillText(value: string): string;
export function escapeRegex(value: string): string;
export function buildSkillRegex(alias: string): RegExp;
export function canonicalSkillName(value: string): string | undefined;
export function extractSkillDetails(text: string): SkillDetail[];
export function extractSkillNames(text: string): string[];
export function getSkillMeta(name: string): SkillMeta | undefined;
