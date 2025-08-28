// lib/classes.ts
import type { Role } from "@/lib/models";

/** Class options for each role */
export const ROLE_CLASS_OPTIONS: Record<Role, readonly string[]> = {
  "Caster/Range": ["Priest", "Mage", "Warlock", "Druid", "Shaman", "Hunter"],
  Melee: ["Rogue", "Druid", "Shaman", "Hunter", "Paladin", "Warrior"],
  Healer: ["Priest", "Druid", "Shaman", "Paladin"],
  Tank: ["Druid", "Shaman", "Paladin", "Warrior", "Warlock"],
} as const;

export function classOptionsForRole(role: Role): readonly string[] {
  return ROLE_CLASS_OPTIONS[role] ?? [];
}

export function isClassValidForRole(role: Role, classTag?: string | null): boolean {
  if (!classTag) return true; // classTag optionnal => always valide if not set
  return classOptionsForRole(role).includes(classTag);
}
