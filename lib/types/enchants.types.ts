import type { Rarity, WowClass } from "./build.types";

export type BuildEnchant = {
  id: string;
  buildId: string;
  name: string;
  rarity: Rarity;
  slot: string;
  cost?: number;
  notes?: string;
  href?: string | null;
  enchantId?: string | null;
};

export type DBEnchants = {
  id: string;
  name: string;
  rarity: Rarity;
  description: string;
  class: WowClass;
  level: number | 1;
};
