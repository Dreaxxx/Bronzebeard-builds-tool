"use client";
import type { Build, BuildItem, Enchant } from "./models";
import { supabase } from "./supabaseClient";

export async function authGetUser() { const sb = supabase(); if (!sb) return null; const { data } = await sb.auth.getUser(); return data.user ?? null; }
export async function signInDiscord() { const sb = supabase(); if (!sb) throw new Error("Supabase not configured"); const { error } = await sb.auth.signInWithOAuth({ provider: "discord", options: { redirectTo: window.location.origin } }); if (error) throw error; }
export async function signOut() { const sb = supabase(); if (!sb) return; await sb.auth.signOut(); }

export async function likePublicBuild(buildId: string) {
  const sb = supabase(); if (!sb) throw new Error("Supabase not configured");
  const { data: b, error: e1 } = await sb.from("builds").select("id, likes").eq("id", buildId).single();
  if (e1) throw e1;
  const { error: e2 } = await sb.from("builds").update({ likes: (b.likes || 0) + 1, updated_at: new Date().toISOString() }).eq("id", buildId);
  if (e2) throw e2;
}

export async function uploadBuild(build: Build, items: BuildItem[], enchants: Enchant[]) {
  const sb = supabase(); if (!sb) throw new Error("Supabase not configured"); const { data: session } = await sb.auth.getSession(); if (!session.session) throw new Error("Sign in first"); const owner = session.session.user.id;
  let { error: e1 } = await sb.from("builds").upsert({ id: build.id, owner, title: build.title, realm: build.realm, role: build.role, class_tag: build.classTag ?? null, tier_order: build.tiers, is_public: build.isPublic, comments_enabled: build.commentsEnabled, description: build.description ?? null, likes: build.likes || 0, created_at: new Date(build.createdAt).toISOString(), updated_at: new Date(build.updatedAt).toISOString() }); if (e1) throw e1;
  const { error: eDelItems } = await sb.from("build_items").delete().eq("build_id", build.id); if (eDelItems) throw eDelItems;
  if (items.length) { const payload = items.map(it => ({ id: it.id, build_id: build.id, tier: it.tier, slot: it.slot, rank: it.rank, name: it.name, stats: it.stats ?? {}, source: it.source ?? null, notes: it.notes ?? null, href: it.href ?? null })); const { error: e2 } = await sb.from("build_items").insert(payload); if (e2) throw e2; }
  const { error: eDelEn } = await sb.from("build_enchants").delete().eq("build_id", build.id); if (eDelEn) throw eDelEn;
  if (enchants.length) { const payload = enchants.map(en => ({ id: en.id, build_id: build.id, name: en.name, rarity: en.rarity, slot: en.slot, cost: en.cost ?? null, notes: en.notes ?? null, href: en.href ?? null })); const { error: e3 } = await sb.from("build_enchants").insert(payload); if (e3) throw e3; }
}

export async function fetchBuildBundleFromCloud(buildId: string): Promise<{
  build: Build; items: BuildItem[]; enchants: Enchant[];
} | null> {
  const sb = supabase(); if (!sb) throw new Error("Supabase not configured");

  const { data: b, error: e1 } = await sb
    .from("builds")
    .select("id, owner, title, realm, role, class_tag, tier_order, is_public, comments_enabled, description, likes, created_at, updated_at")
    .eq("id", buildId).maybeSingle();

  if (e1) throw e1;
  if (!b) return null;

  const [{ data: items = [] }, { data: enchants = [] }] = await Promise.all([
    sb.from("build_items").select("*").eq("build_id", buildId).order("rank", { ascending: true }),
    sb.from("build_enchants").select("*").eq("build_id", buildId),
  ]);

  const build: Build = {
    id: b.id,
    title: b.title,
    realm: b.realm,
    role: b.role,
    classTag: b.class_tag ?? undefined,
    tiers: (b.tier_order as any) ?? [],
    isPublic: b.is_public,
    commentsEnabled: b.comments_enabled,
    description: b.description ?? null,
    likes: b.likes ?? 0,
    createdAt: Date.parse(b.created_at),
    updatedAt: Date.parse(b.updated_at),
  };

  const mappedItems: BuildItem[] = items!.map((it: any) => ({
    id: it.id,
    buildId: it.build_id,
    tier: it.tier,
    slot: it.slot,
    rank: it.rank,
    name: it.name,
    stats: it.stats ?? {},
    source: it.source ?? undefined,
    notes: it.notes ?? undefined,
    href: it.href ?? null,
  }));

  const mappedEnchants: Enchant[] = enchants!.map((en: any) => ({
    id: en.id,
    buildId: en.build_id,
    name: en.name,
    rarity: en.rarity,
    slot: en.slot,
    cost: en.cost ?? undefined,
    notes: en.notes ?? undefined,
    href: en.href ?? null,
  }));

  return { build, items: mappedItems, enchants: mappedEnchants };
}