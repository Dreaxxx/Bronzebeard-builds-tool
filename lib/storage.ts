"use client";
import { deleteBuildInCloud } from "@/lib/remote";

import { db } from "./db";
import { uid } from "./id";

import type { Build, BuildItem, Enchant, Comment, Tier, Rarity, Slot } from "./models";

export async function createBuild(
  partial: Omit<Build, "id" | "createdAt" | "updatedAt" | "likes">,
): Promise<Build> {
  const now = Date.now();
  const build: Build = {
    id: uid(),
    createdAt: now,
    updatedAt: now,
    likes: 0,
    description: partial.description ?? null,
    ...partial,
  };
  await db.builds.add(build);
  return build;
}
export async function listBuilds(): Promise<Build[]> {
  return db.builds.orderBy("updatedAt").reverse().toArray();
}

export async function getBuild(id: string): Promise<Build | null> {
  const b = await db.builds.get(id);
  return b ?? null;
}

export async function updateBuild(id: string, patch: Partial<Build>) {
  await db.builds.update(id, { ...patch, updatedAt: Date.now() });
}

export async function deleteBuildLocal(buildId: string) {
  await db.transaction("rw", db.builds, db.items, db.enchants, async () => {
    await db.items.where("buildId").equals(buildId).delete();
    await db.enchants.where("buildId").equals(buildId).delete();
    await db.builds.delete(buildId);
  });
}

export async function deleteBuildEverywhere(buildId: string, alsoCloud: boolean) {
  let cloud = false;
  if (alsoCloud) {
    try {
      cloud = await deleteBuildInCloud(buildId);
    } catch (e) {
      /* we don't care, UI will handle it */
    }
  }
  await deleteBuildLocal(buildId);
  return cloud;
}

export async function listItems(buildId: string, tier?: Tier) {
  const q = db.items.where("buildId").equals(buildId);
  if (tier) return q.and((it) => it.tier === tier).sortBy("rank");
  return q.sortBy("rank");
}
export async function upsertItem(
  it: Partial<BuildItem> & { buildId: string; slot: Slot; tier: Tier; name: string },
) {
  const id = (it as any).id ?? uid();
  const record = { rank: 1, ...it, id } as BuildItem;
  await db.items.put(record);
  return record;
}
export async function removeItem(id: string) {
  await db.items.delete(id);
}

export async function listEnchants(buildId: string) {
  return db.enchants.where("buildId").equals(buildId).toArray();
}

export async function upsertEnchant(
  e: Partial<Enchant> & { buildId: string; name: string; rarity: Rarity; slot: string },
) {
  const id = (e as any).id ?? uid();
  const record = { ...e, id } as Enchant;
  await db.enchants.put(record);
  return record;
}
export async function removeEnchant(id: string) {
  await db.enchants.delete(id);
}

export async function listComments(buildId: string) {
  return db.comments.where("buildId").equals(buildId).sortBy("createdAt");
}

export async function addComment(
  buildId: string,
  authorName: string,
  body: string,
  parentId?: string,
) {
  const c: Comment = {
    id: uid(),
    buildId,
    authorName,
    body,
    parentId: parentId ?? null,
    createdAt: Date.now(),
  };
  await db.comments.add(c);
  return c;
}
export async function deleteComment(id: string) {
  await db.comments.delete(id);
}

export async function likeLocal(buildId: string) {
  const key = `liked_${buildId}`;
  if (typeof window !== "undefined" && localStorage.getItem(key))
    throw new Error("Already liked on this device");
  const b = await db.builds.get(buildId);
  if (!b) throw new Error("Build not found");
  await db.builds.update(buildId, { likes: (b.likes || 0) + 1, updatedAt: Date.now() });
  if (typeof window !== "undefined") localStorage.setItem(key, "1");
}

export async function markBuildSavedLocally(buildId: string) {
  await db.builds.update(buildId, { savedLocal: true, savedAt: Date.now() });
}

export async function unmarkBuildSavedLocally(buildId: string) {
  await db.builds.update(buildId, { savedLocal: false, savedAt: null });
}
