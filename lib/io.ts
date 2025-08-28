"use client";

import { getBuild, listItems, listEnchants, createBuild, upsertItem, upsertEnchant } from "@/lib/storage";
import type { Build, BuildItem, Enchant } from "@/lib/models";

export type BuildBundle = {
    version: 1;
    build: Build;
    items: BuildItem[];
    enchants: Enchant[];
};

const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto) ? crypto.randomUUID() : Math.random().toString(36).slice(2);

export async function exportBuildBundle(buildId: string): Promise<Blob> {
    const build = await getBuild(buildId);
    if (!build) throw new Error("Build not found");
    const [items, enchants] = await Promise.all([listItems(buildId, "all" as any), listEnchants(buildId)]);
    const bundle: BuildBundle = { version: 1, build, items, enchants };
    return new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
}

export async function importBuildBundleFile(file: File): Promise<string> {
    const text = await file.text();
    const data = JSON.parse(text) as BuildBundle;
    if (!data || data.version !== 1) throw new Error("Invalid bundle version");
    const src = data.build;

    // crée un nouveau build local (privé par défaut)
    const created = await createBuild({
        title: `${src.title} (import)`,
        realm: src.realm,
        role: src.role as any,
        classTag: src.classTag,
        tiers: src.tiers,
        isPublic: false,
        commentsEnabled: false,
        description: src.description ?? null,
    });

    // items
    for (const it of data.items) {
        await upsertItem({
            id: uid(),
            buildId: created.id,
            tier: it.tier,
            slot: it.slot as any,
            rank: it.rank ?? 1,
            name: it.name,
            stats: it.stats ?? {},
            source: it.source ?? "",
            notes: it.notes ?? "",
            href: it.href ?? null,
        } as any);
    }

    // enchants
    for (const en of data.enchants) {
        await upsertEnchant({
            id: uid(),
            buildId: created.id,
            name: en.name,
            rarity: en.rarity,
            slot: en.slot,
            cost: en.cost ?? 0,
            notes: en.notes ?? "",
            href: en.href ?? null,
        });
    }

    return created.id;
}

export function downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
}
