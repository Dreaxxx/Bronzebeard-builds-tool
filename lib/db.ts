"use client";
import { Dexie } from "dexie";

import type { Build, BuildComment } from "./types/build.types";
import type { BuildEnchant } from "./types/enchants.types";
import type { BuildItem } from "./types/items.types";
import type { Table } from "dexie";

export class BBRDatabase extends Dexie {
  builds!: Table<Build, string>;
  items!: Table<BuildItem, string>;
  enchants!: Table<BuildEnchant, string>;
  comments!: Table<BuildComment, string>;
  constructor() {
    super("bbr_ready_v0.8.6"); // bump name to avoid Dexie schema cache issues
    this.version(1).stores({
      builds: "id, title, updatedAt, createdAt, likes, classTag",
      items: "id, buildId, tier, slot, rank, name, notes, source, href, itemId",
      enchants: "id, buildId, rarity, type, name, slot, cost, notes, href, enchantId",
      comments: "id, buildId, createdAt",
    });
  }
}
export const db = new BBRDatabase();
