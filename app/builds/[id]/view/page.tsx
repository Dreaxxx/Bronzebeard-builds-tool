"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import CommentThread from "@/components/CommentThread";
import EnchantRow from "@/components/EnchantRow";
import { Card, Pill } from "@/components/ui";

import { useI18n } from "@/lib/i18n/store";
import { type Build, type BuildItem, type Enchant, type Tier } from "@/lib/models";
import { rarityRank } from "@/lib/rarity";
import { likePublicBuild, fetchBuildBundleFromCloud, putBuildDeep } from "@/lib/remote";
import { SLOTS } from "@/lib/slots";
import {
  getBuild,
  listItems,
  listEnchants,
  likeLocal,
  markBuildSavedLocally,
  unmarkBuildSavedLocally,
} from "@/lib/storage";

export default function ViewBuild() {
  const { t } = useI18n();
  const params = useParams<{ id: string }>();

  const [build, setBuild] = useState<Build | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tier, setTier] = useState<Tier | null>(null);
  const [items, setItems] = useState<BuildItem[]>([]);
  const [enchants, setEnchants] = useState<Enchant[]>([]);
  const [liking, setLiking] = useState(false);
  const [saving, setSaving] = useState(false);

  // Boot: local -> fallback cloud; définir le tier par défaut
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setError(null);
        const local = await getBuild(params.id);
        if (!cancelled && local) {
          setBuild(local);
          setTier(local.tiers?.[0] ?? null);
          return;
        }
        const bundle = await fetchBuildBundleFromCloud(params.id);
        if (!bundle) {
          if (!cancelled) setError("Build not found or not public.");
          return;
        }
        await putBuildDeep(bundle);
        if (cancelled) return;
        setBuild(bundle.build);
        setTier(bundle.build.tiers?.[0] ?? null);
      } catch (e: any) {
        if (!cancelled) setError(e.message || String(e));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  // Enchants dès que le build est connu
  useEffect(() => {
    if (!build) return;
    let cancelled = false;
    (async () => {
      const es = await listEnchants(build.id);
      if (!cancelled) setEnchants(es);
    })();
    return () => {
      cancelled = true;
    };
  }, [build, build?.id]);

  // Items quand tier choisi
  useEffect(() => {
    if (!build || !tier) return;
    let cancelled = false;
    (async () => {
      const its = await listItems(build.id, tier);
      if (!cancelled) setItems(its);
    })();
    return () => {
      cancelled = true;
    };
  }, [build, build?.id, tier]);

  const itemsBySlot = useMemo(() => {
    const m: Record<string, BuildItem[]> = {};
    SLOTS.forEach((s: string) => (m[s] = []));
    for (const it of items) (m[it.slot] = m[it.slot] || []).push(it);
    Object.keys(m).forEach((s) => m[s].sort((a, b) => (a.rank ?? 1) - (b.rank ?? 1)));
    return m;
  }, [items]);

  const sortedEnchants = useMemo(() => {
    const arr = [...enchants];
    arr.sort((a, b) => {
      const ra = rarityRank(a.rarity);
      const rb = rarityRank(b.rarity);
      if (ra !== rb) return ra - rb;
      return a.name.localeCompare(b.name);
    });
    return arr;
  }, [enchants]);

  if (error) return <p className="text-red-500">{error}</p>;
  if (!build) return <p>Loading…</p>;

  async function like() {
    if (!build?.isPublic) return;
    try {
      setLiking(true);
      await likeLocal(build.id);
      try {
        await likePublicBuild(build.id);
      } catch {}
      const updated = await getBuild(build.id);
      if (updated) setBuild(updated);
    } catch (e: any) {
      alert(e.message || String(e));
    } finally {
      setLiking(false);
    }
  }

  async function saveLocal() {
    try {
      setSaving(true);
      await markBuildSavedLocally(build!.id);
      setBuild({ ...build!, savedLocal: true, savedAt: Date.now() });
    } finally {
      setSaving(false);
    }
  }
  async function removeSaved() {
    if (!confirm("Remove from saved?")) return;
    await unmarkBuildSavedLocally(build!.id);
    setBuild({ ...build!, savedLocal: false, savedAt: null });
  }

  return (
    <div className="space-y-6">
      {/* HERO / HEADER */}
      <div className="relative overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-r from-[#0b0f1a] via-[#121826] to-[#0b0f1a]">
        <div className="absolute inset-0 opacity-20 [background:radial-gradient(80%_60%_at_50%_0%,#3b82f620,transparent_60%)]" />
        <div className="relative p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-4xl flex-1 md:pr-8 md:text-left md:leading-tight md:tracking-tight md:text-neutral-100">
              <div className="mb-2 flex flex-wrap gap-2 text-xs text-neutral-300">
                <span className="rounded-full bg-neutral-900/60 px-2 py-1 ring-1 ring-neutral-700">
                  {build.realm}
                </span>
                <span className="rounded-full bg-neutral-900/60 px-2 py-1 ring-1 ring-neutral-700">
                  {build.role}
                </span>
                {build.classTag && (
                  <span className="rounded-full bg-neutral-900/60 px-2 py-1 ring-1 ring-neutral-700">
                    {build.classTag}
                  </span>
                )}
              </div>
              <h1 className="mt-4 text-2xl font-bold leading-tight text-white md:text-3xl">
                {build.title}
              </h1>
              {build.description && (
                <p className="mt-4 max-w-3xl whitespace-pre-wrap text-sm text-neutral-300">
                  {build.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Pill className="px-3 py-5 text-2xl">❤️ {build.likes || 0}</Pill>
            </div>
          </div>

          {/* Tiers selector */}
          {build.tiers?.length > 0 && (
            <div className="mt-6">
              <div className="inline-flex overflow-hidden rounded-xl ring-1 ring-neutral-700">
                {build.tiers.map((ti) => {
                  const active = tier === ti;
                  return (
                    <button
                      key={ti}
                      onClick={() => setTier(ti)}
                      className={[
                        "px-3 py-1.5 text-sm font-medium transition-colors",
                        active
                          ? "bg-neutral-800 text-white"
                          : "bg-neutral-900/60 text-neutral-300 hover:bg-neutral-800/70",
                      ].join(" ")}
                    >
                      {ti}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* LAYOUT: CONTENT + SIDEBAR */}
      <div className="grid grid-cols-12 gap-6">
        {/* CONTENT */}
        <div className="col-span-12 space-y-6 lg:col-span-8">
          {/* ENCHANTS */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Mystic Enchants</h2>
            </div>
            <Card className="bg-neutral-900/60 p-4 ring-1 ring-neutral-800">
              {sortedEnchants.length === 0 ? (
                <p className="text-sm text-neutral-500">{t("empty.none")}</p>
              ) : (
                <div className="grid gap-2 md:grid-cols-2">
                  {sortedEnchants.map((en) => (
                    <EnchantRow
                      key={en.id}
                      name={en.name}
                      rarity={en.rarity}
                      url={en.href || undefined}
                      icon={(en as any).icon || undefined}
                      notes={en.notes || undefined}
                    />
                  ))}
                </div>
              )}
            </Card>
          </section>

          {/* ITEMS / BIS */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Best-in-Slot — {tier ?? "-"}</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {SLOTS.map((slot: string) => (
                <Card key={slot} className="bg-neutral-900/60 p-4 ring-1 ring-neutral-800">
                  <h3 className="mb-2 text-sm font-semibold tracking-wide text-neutral-200">
                    {slot}
                  </h3>
                  <div className="space-y-2">
                    {(itemsBySlot[slot] || []).map((it) => (
                      <li key={it.id} className="text-sm">
                        <span className="badge mr-2">
                          {it.rank === 1 ? "BiS" : `Alt ${it.rank}`}
                        </span>
                        <span className="font-medium">{it.name}</span>
                        {it.source && <span className="text-neutral-500"> — {it.source}</span>}
                        {it.notes && <div className="text-xs text-neutral-500">{it.notes}</div>}
                        {it.href && (
                          <div>
                            <a
                              className="text-xs underline"
                              href={it.href}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Ascension DB
                            </a>
                          </div>
                        )}
                      </li>
                    ))}
                    {(itemsBySlot[slot] || []).length === 0 && (
                      <p className="text-sm text-neutral-500">{t("empty.none")}</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* COMMENTS */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">{t("build.comments")}</h2>
              <span className="text-xs text-amber-400/90">Local-only — others can’t see them</span>
            </div>
            <Card className="bg-neutral-900/60 p-4 ring-1 ring-neutral-800">
              {build.isPublic && build.commentsEnabled ? (
                <CommentThread build={build} />
              ) : (
                <div className="text-sm text-neutral-500">{t("build.comments.disabled")}</div>
              )}
            </Card>
          </section>
        </div>

        {/* SIDEBAR */}
        <aside className="col-span-12 lg:col-span-4">
          <div className="sticky top-6 space-y-4">
            <Card className="bg-neutral-900/60 p-4 ring-1 ring-neutral-800">
              <h3 className="mb-2 text-sm font-semibold text-neutral-200">Overview</h3>
              <ul className="space-y-2 text-sm text-neutral-300">
                <li>
                  <span className="text-neutral-500">Realm:</span> {build.realm}
                </li>
                <li>
                  <span className="text-neutral-500">Role:</span> {build.role}
                </li>
                {build.classTag && (
                  <li>
                    <span className="text-neutral-500">Class:</span> {build.classTag}
                  </li>
                )}
                <li>
                  <span className="text-neutral-500">Visibility:</span>{" "}
                  {build.isPublic ? "Public" : "Private"}
                </li>
                <li>
                  <span className="text-neutral-500">Likes:</span> {build.likes ?? 0}
                </li>
              </ul>
            </Card>

            <Card className="bg-neutral-900/60 p-4 ring-1 ring-neutral-800">
              <h3 className="mb-3 text-sm font-semibold text-neutral-200">Actions</h3>
              <div className="flex flex-col gap-2">
                {build.isPublic && (
                  <button
                    disabled={liking}
                    onClick={like}
                    className="w-full rounded-md bg-emerald-600 px-3 py-1.5 text-center text-sm font-medium hover:bg-emerald-700"
                  >
                    {t("like.add")}
                  </button>
                )}
                {!build.savedLocal ? (
                  <button
                    onClick={saveLocal}
                    disabled={saving}
                    className="w-full rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white shadow hover:bg-indigo-700"
                    title="Save this build locally"
                  >
                    {saving ? "Saving…" : t("build.overview.save")}
                  </button>
                ) : (
                  <button
                    onClick={removeSaved}
                    className="w-full rounded-md bg-neutral-800 px-3 py-1.5 text-sm font-medium text-white ring-1 ring-neutral-700 hover:bg-neutral-700"
                    title="Remove from saved"
                  >
                    {t("build.overview.saved")}
                  </button>
                )}
                <Link
                  className="w-full rounded-md bg-neutral-900 px-3 py-1.5 text-center text-sm font-medium text-white ring-1 ring-neutral-700 hover:bg-neutral-800"
                  href={`/builds/${build.id}/edit`}
                >
                  {t("common.edit")}
                </Link>
              </div>
            </Card>
          </div>
        </aside>
      </div>
    </div>
  );
}
