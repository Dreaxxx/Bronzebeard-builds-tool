export type Tier = "All" | "Raid" | "M0" | "M+<10" | "M+10-14" | "M+15+";

export type WowClass =
  | "Warrior"
  | "Paladin"
  | "Hunter"
  | "Rogue"
  | "Priest"
  | "Shaman"
  | "Mage"
  | "Warlock"
  | "Druid";

export type Role = "Caster/Range" | "Melee" | "Tank" | "Healer";

export type Build = {
  id: string;
  title: string;
  realm: string;
  role: string;
  classTag?: string;
  tiers: Tier[];
  createdAt: number;
  updatedAt: number;
  likes: number;
  isPublic: boolean;
  commentsEnabled: boolean;
  description?: string | null;
  ownerId?: string | null;
  origin?: "local" | "cloud";
  savedLocal?: boolean;
  savedAt?: number | null;
};

export type Rarity = "Rare" | "Epic" | "Legendary" | "Artifact";

export type BuildComment = {
  id: string;
  buildId: string;
  authorName: string;
  body: string;
  parentId?: string | null;
  createdAt: number;
};

export const DEFAULT_TIERS: Tier[] = ["Raid", "M0", "M+<10", "M+10-14", "M+15+"];

export const WOW_CLASSES: WowClass[] = [
  "Warrior",
  "Paladin",
  "Hunter",
  "Rogue",
  "Priest",
  "Shaman",
  "Mage",
  "Warlock",
  "Druid",
  //"Death Knight",
];
