import type { Tier } from "./build.types";

export type Slot =
  | "Head"
  | "Neck"
  | "Shoulder"
  | "Back"
  | "Chest"
  | "Wrist"
  | "Hands"
  | "Waist"
  | "Legs"
  | "Feet"
  | "Ring1"
  | "Ring2"
  | "Trinket1"
  | "Trinket2"
  | "Weapon"
  | "OffHand"
  | "Ranged"
  | "Tabard";

export type BuildItem = {
  id: string;
  buildId: string;
  tier: Tier;
  slot: Slot;
  rank: number;
  name: string;
  source?: string;
  notes?: string;
  href?: string | null;
  itemId?: string | null;
};

export type DBItem = {
  id: string;
  name: string;
  slot: Slot;
  inventoryType: number;
  classID: number;
  subClassID: number;
  subClass: string;
  itemClass: string;
  itemSubClass: string;
  quality: number;
  qualityText: string;
  difficulty?: string;
  ilvl: number;
  reqLevel: number;
  icon: string;
  sellPrice?: number;
  stats: Record<string, number>;
};
