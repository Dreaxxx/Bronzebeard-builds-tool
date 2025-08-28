"use client";
import Dexie, { Table } from "dexie";
import type { Build, BuildItem, Enchant, Comment } from "./models";

export class BBRDatabase extends Dexie {
  builds!: Table<Build, string>;
  items!: Table<BuildItem, string>;
  enchants!: Table<Enchant, string>;
  comments!: Table<Comment, string>;
  constructor() {
    super("bbr_ready_v0.8.3"); // bump name to avoid Dexie schema cache issues
    this.version(1).stores({
      builds: "id, title, updatedAt, createdAt, likes, classTag",
      items: "id, buildId, tier, slot, rank",
      enchants: "id, buildId, rarity",
      comments: "id, buildId, createdAt",
    });
  }
}
export const db = new BBRDatabase();
