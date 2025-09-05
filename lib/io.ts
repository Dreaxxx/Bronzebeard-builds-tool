"use client";

import { db } from "@/lib/db";
import type { Build, BuildItem, Enchant, Tier } from "@/lib/models";
import { getBuild, listItems, listEnchants, createBuild } from "@/lib/storage";

export type BuildBundle = {
  version: 1;
  build: Build;
  items: BuildItem[];
  enchants: Enchant[];
};

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);

/** Exporte le build + TOUS les items + enchants */
export async function exportBuildBundle(buildId: string): Promise<Blob> {
  const build = await getBuild(buildId);
  if (!build) throw new Error("Build not found");

  // On essaie d’abord par tiers, puis fallback: tout le stock items pour ce build
  let itemsNow: BuildItem[] = [];
  if (build.tiers && build.tiers.length) {
    itemsNow = (await Promise.all(build.tiers.map((t) => listItems(build.id, t)))).flat();
  }
  if (!itemsNow.length) {
    // Récupère tout si build.tiers vide
    itemsNow = await db.items.where("buildId").equals(build.id).toArray();
  }

  const enchantsNow = await listEnchants(build.id);

  const bundle: BuildBundle = {
    version: 1,
    build,
    items: itemsNow,
    enchants: enchantsNow,
  };
  return new Blob([JSON.stringify(bundle, null, 2)], {
    type: "application/json",
  });
}

/** Importe un bundle : crée un NOUVEAU build local + bulkPut items/enchants */
export async function importBuildBundleFile(file: File): Promise<string> {
  const text = await file.text();
  const raw = JSON.parse(text) as Partial<BuildBundle>;
  if (!raw || raw.version !== 1 || !raw.build) {
    throw new Error("Invalid bundle version or payload");
  }

  const src = raw.build as Build;

  // 1) crée un nouveau build local (privé par défaut)
  const created = await createBuild({
    title: `${src.title} (import)`,
    realm: src.realm,
    role: src.role,
    classTag: src.classTag,
    tiers: src.tiers && src.tiers.length ? (src.tiers as Tier[]) : (["Raid"] as Tier[]),
    isPublic: false,
    commentsEnabled: false,
    description: src.description ?? null,
  });

  const tiers: Tier[] =
    created.tiers && created.tiers.length ? created.tiers : (["Raid"] as Tier[]);
  const now = Date.now();

  // 2) map items/enchants vers le NOUVEAU buildId + ids neufs
  const itemsToInsert: BuildItem[] = (raw.items ?? []).map((it) => ({
    ...it,
    id: uid(),
    buildId: created.id,
    tier: ((it.tier as any) ?? tiers[0]) as Tier,
    rank: it.rank ?? 1,
    stats: it.stats ?? {},
    source: it.source ?? "",
    notes: it.notes ?? "",
    href: it.href ?? null,
    createdAt: (it as any).createdAt ?? now,
    updatedAt: (it as any).updatedAt ?? now,
  }));

  const enchantsToInsert: Enchant[] = (raw.enchants ?? []).map((en) => ({
    ...en,
    id: uid(),
    buildId: created.id,
    cost: en.cost ?? 0,
    notes: en.notes ?? "",
    href: en.href ?? null,
    createdAt: (en as any).createdAt ?? now,
    updatedAt: (en as any).updatedAt ?? now,
  }));

  // 3) transaction atomique : bulkPut (bien plus sûr que upsert en boucle)
  await db.transaction("rw", db.items, db.enchants, async () => {
    if (itemsToInsert.length) await db.items.bulkPut(itemsToInsert as any);
    if (enchantsToInsert.length) await db.enchants.bulkPut(enchantsToInsert as any);
  });

  return created.id;
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
