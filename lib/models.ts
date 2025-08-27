export type Tier = "Raid" | "M0" | "M+<10" | "M+10-14" | "M+15+";
export type Slot =
  | "Head" | "Neck" | "Shoulder" | "Back" | "Chest"
  | "Wrist" | "Hands" | "Waist" | "Legs" | "Feet"
  | "Ring1" | "Ring2" | "Trinket1" | "Trinket2"
  | "Weapon" | "OffHand" | "Ranged" | "Tabard";

export type Build = {
  id: string;
  title: string;
  realm: string;
  role: "Caster" | "Melee" | "Tank" | "Healer";
  classTag?: string;
  tiers: Tier[];
  createdAt: number;
  updatedAt: number;
  likes: number;
  isPublic: boolean;
  commentsEnabled: boolean;
};

export type BuildItem = {
  id: string;
  buildId: string;
  tier: Tier;
  slot: Slot;
  rank: number;
  name: string;
  stats?: Record<string, number>;
  source?: string;
  notes?: string;
  href?: string;
};

export type Rarity = "Rare" | "Epic" | "Legendary" | "Artifact";
export type Enchant = {
  id: string;
  buildId: string;
  name: string;
  rarity: Rarity;
  slot: string;
  tags: string[];
  cost?: number;
  notes?: string;
  href?: string;
};

export type Comment = {
  id: string;
  buildId: string;
  authorName: string;
  body: string;
  parentId?: string | null;
  createdAt: number;
};

export const DEFAULT_TIERS: Tier[] = ["Raid", "M0", "M+<10", "M+10-14", "M+15+"];
export const WOW_CLASSES = ["Warrior", "Paladin", "Hunter", "Rogue", "Priest", "Shaman", "Mage", "Warlock", "Druid", "Death Knight"];
